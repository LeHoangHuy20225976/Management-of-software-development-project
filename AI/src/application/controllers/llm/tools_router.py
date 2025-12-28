"""
LLM Router với Tool Calling Support (Synchronous version)
API endpoint cho chat với database query tools
"""
from fastapi import APIRouter, HTTPException
from src.application.dtos.llm.chat_dto import ChatRequest, ChatResponse
from langchain_core.messages import HumanMessage
import uuid

router = APIRouter()


@router.post('/chat_with_tools', response_model=ChatResponse)
async def chat_with_tools(request: ChatRequest):
    """
    Chat với AI có khả năng query database
    
    AI có thể tự động gọi các functions sau:
    - get_user_info(user_id): Lấy thông tin user
    - search_user_by_email(email): Tìm user theo email
    - get_hotel_info(hotel_id): Lấy thông tin khách sạn
    - search_hotels(name, address, min_rating): Tìm kiếm khách sạn
    - get_user_bookings(user_id, status): Lấy bookings của user
    - get_booking_details(booking_id): Chi tiết booking
    - search_available_rooms(...): Tìm phòng available
    - get_room_details(room_id): Chi tiết phòng
    - get_hotel_statistics(hotel_id): Thống kê khách sạn
    - get_all_destinations(): Lấy danh sách điểm đến
    - get_hotels_in_destination(destination_id): Khách sạn theo điểm đến
    
    Example queries:
    - "Cho tôi thông tin của user có ID là 1"
    - "Tìm user có email john@example.com"
    - "Có khách sạn nào ở Quận 1 không?"
    - "User 5 có booking nào chưa?"
    - "Tìm phòng available từ 2024-01-01 đến 2024-01-05"
    """
    try:
        # Import graph with tools (sync version)
        from src.application.services.llm.graph_with_tools_sync import get_chat_graph_with_tools
        import asyncio
        
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        print(f"[Chat with Tools] Message: {request.message}")
        print(f"[Chat with Tools] Conversation ID: {conversation_id}")
        
        # Get graph
        graph = get_chat_graph_with_tools()
        
        # Invoke graph (sync trong thread)
        result = await asyncio.to_thread(
            graph.invoke,
            {
                "messages": [HumanMessage(content=request.message)],
                "conversation_id": conversation_id
            },
            config={
                "configurable": {
                    "thread_id": conversation_id
                },
                "recursion_limit": 50  # Increase limit for complex queries
            }
        )
        
        # Get final AI message
        ai_message = result["messages"][-1]
        
        return ChatResponse(
            response=ai_message.content,
            conversation_id=conversation_id
        )
        
    except Exception as e:
        print(f"[Chat with Tools] ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"LLM error: {str(e)}"
        )


@router.get('/tools')
async def list_tools():
    """
    Liệt kê các tools available cho AI
    """
    from src.application.services.llm.langchain_tools_sync import ALL_TOOLS
    
    tools_info = []
    for tool in ALL_TOOLS:
        tools_info.append({
            "name": tool.name,
            "description": tool.description,
            "args_schema": str(tool.args_schema.schema()) if hasattr(tool, 'args_schema') else None
        })
    
    return {
        "total_tools": len(tools_info),
        "tools": tools_info
    }
