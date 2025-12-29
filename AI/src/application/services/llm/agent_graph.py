"""
Agent Graph with Tool Calling
LLM agent có thể call database tools để query user/booking info
"""

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from typing import Literal, Optional
from .state import ChatState
from .checkpointer import get_checkpointer
from . import db_tools_sync
from src.infrastructure.config import get_settings
from pathlib import Path

settings = get_settings()

# Load system prompt
def load_system_prompt() -> str:
    """Load system prompt từ file system_prompt.txt"""
    prompt_file = Path(__file__).parent / "system_prompt.txt"
    if prompt_file.exists():
        return prompt_file.read_text(encoding='utf-8')
    return "You are a helpful hotel AI assistant."

SYSTEM_PROMPT = load_system_prompt()

# Wrap sync functions as LangChain tools
@tool
def get_user_info_sync(user_id: int) -> str:
    """
    Lấy thông tin chi tiết của người dùng theo ID.
    Sử dụng khi cần biết thông tin cá nhân của user (tên, email, số điện thoại, ngày sinh, giới tính).

    Args:
        user_id: ID của người dùng cần tra cứu

    Returns:
        JSON string chứa thông tin user hoặc lỗi nếu không tìm thấy
    """
    return db_tools_sync.get_user_by_id(user_id)

@tool
def get_user_bookings_sync(user_id: int, status: Optional[str] = None) -> str:
    """
    Lấy danh sách đặt phòng của người dùng.
    Sử dụng khi user hỏi về lịch sử đặt phòng, booking hiện tại, hoặc booking đã hủy/hoàn tất.

    Args:
        user_id: ID của người dùng
        status: Trạng thái booking (pending, accepted, rejected, cancelled). Bỏ trống để lấy tất cả.

    Returns:
        JSON string chứa danh sách bookings với thông tin phòng và khách sạn
    """
    return db_tools_sync.get_user_bookings(user_id, status)

@tool
def search_hotels_sync(name: Optional[str] = None, address: Optional[str] = None, min_rating: Optional[float] = None) -> str:
    """
    Tìm kiếm khách sạn theo tên, địa chỉ hoặc rating.
    Sử dụng khi user hỏi về khách sạn ở một khu vực, hoặc tìm khách sạn theo tiêu chí cụ thể.

    Args:
        name: Tên khách sạn (có thể tìm từng phần, ví dụ: "Hanoi" sẽ tìm "Hanoi Grand Hotel")
        address: Địa chỉ hoặc khu vực (ví dụ: "Da Nang", "Saigon", "Hoan Kiem")
        min_rating: Rating tối thiểu (từ 0 đến 5)

    Returns:
        JSON string chứa danh sách khách sạn phù hợp (tối đa 20 kết quả)
    """
    return db_tools_sync.search_hotels(name, address, min_rating)

@tool
def search_available_rooms_sync(
    hotel_id: Optional[int] = None,
    check_in_date: Optional[str] = None,
    check_out_date: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
) -> str:
    """
    Tìm kiếm phòng còn trống (available) với các tiêu chí.
    Sử dụng khi user hỏi về phòng còn trống, giá phòng, hoặc muốn đặt phòng.

    Args:
        hotel_id: ID của khách sạn (bỏ trống để tìm tất cả khách sạn)
        check_in_date: Ngày check-in (format: YYYY-MM-DD, ví dụ: "2025-12-30")
        check_out_date: Ngày check-out (format: YYYY-MM-DD)
        min_price: Giá tối thiểu mỗi đêm (VND)
        max_price: Giá tối đa mỗi đêm (VND)

    Returns:
        JSON string chứa danh sách phòng available với giá và thông tin khách sạn
    """
    return db_tools_sync.search_available_rooms(hotel_id, check_in_date, check_out_date, min_price, max_price)

@tool
def get_booking_details_sync(booking_id: int) -> str:
    """
    Lấy thông tin chi tiết của một booking theo ID.
    Sử dụng khi cần xem thông tin chi tiết về một đơn đặt phòng cụ thể.

    Args:
        booking_id: ID của booking cần tra cứu

    Returns:
        JSON string chứa chi tiết booking (user, room, hotel, ngày, giá, status)
    """
    return db_tools_sync.get_booking_by_id(booking_id)

# List of all tools
tools = [
    get_user_info_sync,
    get_user_bookings_sync,
    search_hotels_sync,
    search_available_rooms_sync,
    get_booking_details_sync
]

def create_agent_graph():
    """
    Create agent graph with tool calling capability
    """

    # Initialize LLM with tools
    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=settings.nvidia_api_key,
        model=settings.llm_model,
        temperature=0.7,
    ).bind_tools(tools)

    # Create tool node
    tool_node = ToolNode(tools)

    def should_continue(state: ChatState) -> Literal["tools", "end"]:
        """Decide whether to use tools or end"""
        messages = state["messages"]
        last_message = messages[-1]

        # If LLM makes tool calls, route to tools node
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "tools"
        # Otherwise end
        return "end"

    def call_model(state: ChatState) -> ChatState:
        """Call LLM with tool binding"""
        messages = state["messages"]

        # Add system message if not present
        if not any(isinstance(m, SystemMessage) for m in messages):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages

        response = llm.invoke(messages)

        return {
            "messages": [response],
            "conversation_id": state["conversation_id"]
        }

    # Build graph
    graph = StateGraph(ChatState)

    # Add nodes
    graph.add_node("agent", call_model)
    graph.add_node("tools", tool_node)

    # Set entry point
    graph.set_entry_point("agent")

    # Add conditional edges
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END
        }
    )

    # After tools, go back to agent
    graph.add_edge("tools", "agent")

    return graph.compile(checkpointer=get_checkpointer())

# Create singleton instance
agent_graph = create_agent_graph()
