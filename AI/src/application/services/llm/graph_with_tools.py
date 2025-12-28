"""
Enhanced Chat Graph with Tool Calling Support
Graph hỗ trợ AI gọi database tools
"""
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from .state import ChatState
from .checkpointer import get_checkpointer
from .langchain_tools import ALL_TOOLS
from src.infrastructure.config import get_settings
import json

settings = get_settings()


def create_chat_graph_with_tools():
    """
    Create chat graph with tool calling support
    """
    graph = StateGraph(ChatState)
    
    # Initialize LLM with tools
    llm = ChatOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=settings.nvidia_api_key,
        model=settings.llm_model,
        temperature=0.7
    )
    
    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(ALL_TOOLS)
    
    def llm_node(state: ChatState) -> ChatState:
        """
        Node that calls LLM (có thể trigger tool calls)
        """
        try:
            print(f"[LLM Node] Processing message...")
            
            messages = state["messages"]
            
            # Call LLM
            response = llm_with_tools.invoke(messages)
            
            print(f"[LLM Node] Response type: {type(response)}")
            
            # Check if LLM wants to call tools
            if hasattr(response, 'tool_calls') and response.tool_calls:
                print(f"[LLM Node] Tool calls requested: {len(response.tool_calls)}")
            
            return {
                "messages": [response],
                "conversation_id": state["conversation_id"]
            }
            
        except Exception as e:
            print(f"[LLM Node] ERROR: {e}")
            import traceback
            traceback.print_exc()
            # Return error message
            return {
                "messages": [AIMessage(content=f"Xin lỗi, đã xảy ra lỗi: {str(e)}")],
                "conversation_id": state["conversation_id"]
            }
    
    def tool_node(state: ChatState) -> ChatState:
        """
        Node that executes tool calls
        """
        try:
            print(f"[Tool Node] Executing tools...")
            
            messages = state["messages"]
            last_message = messages[-1]
            
            tool_results = []
            
            if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
                for tool_call in last_message.tool_calls:
                    tool_name = tool_call['name']
                    tool_args = tool_call['args']
                    tool_id = tool_call['id']
                    
                    print(f"[Tool Node] Calling: {tool_name}({tool_args})")
                    
                    # Find and execute tool
                    tool_func = None
                    for tool in ALL_TOOLS:
                        if tool.name == tool_name:
                            tool_func = tool
                            break
                    
                    if tool_func:
                        try:
                            # Execute tool (async)
                            import asyncio
                            result = asyncio.run(tool_func.ainvoke(tool_args))
                            print(f"[Tool Node] Result: {result[:100]}...")
                            
                            # Create tool message
                            tool_results.append(
                                ToolMessage(
                                    content=result,
                                    tool_call_id=tool_id,
                                    name=tool_name
                                )
                            )
                        except Exception as e:
                            print(f"[Tool Node] Error executing {tool_name}: {e}")
                            tool_results.append(
                                ToolMessage(
                                    content=f"Error: {str(e)}",
                                    tool_call_id=tool_id,
                                    name=tool_name
                                )
                            )
                    else:
                        print(f"[Tool Node] Tool not found: {tool_name}")
            
            return {
                "messages": tool_results,
                "conversation_id": state["conversation_id"]
            }
            
        except Exception as e:
            print(f"[Tool Node] ERROR: {e}")
            import traceback
            traceback.print_exc()
            return {
                "messages": [],
                "conversation_id": state["conversation_id"]
            }
    
    def should_continue(state: ChatState) -> str:
        """
        Decide whether to continue to tools or end
        """
        messages = state["messages"]
        last_message = messages[-1]
        
        # If LLM made tool calls, execute them
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            print(f"[Router] -> tools")
            return "tools"
        
        # Otherwise, end
        print(f"[Router] -> end")
        return "end"
    
    # Add nodes
    graph.add_node("llm", llm_node)
    graph.add_node("tools", tool_node)
    
    # Set entry point
    graph.set_entry_point("llm")
    
    # Add conditional edges
    graph.add_conditional_edges(
        "llm",
        should_continue,
        {
            "tools": "tools",
            "end": END
        }
    )
    
    # After tools, go back to LLM to generate final response
    graph.add_edge("tools", "llm")
    
    return graph.compile(checkpointer=get_checkpointer())


# Export both versions
chat_graph_with_tools = create_chat_graph_with_tools()
