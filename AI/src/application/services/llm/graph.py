from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from .state import ChatState
from .checkpointer import get_checkpointer
from .gpt_client import get_gpt_client

def create_chat_graph():
    """
    Graph with PostgreSQL persistence
    """

    graph = StateGraph(ChatState)

    def llm_node(state: ChatState) -> ChatState:
        """
        Node call API and get response (SYNCHRONOUS for PostgresSaver compatibility)
        """
        try:
            print(f"[LLM Node] Starting with state: {state}")
            
            messages = state["messages"]
            user_message = messages[-1].content
            
            print(f"[LLM Node] User message: {user_message}")

            history = []
            for msg in messages[:-1]:
                if isinstance(msg, HumanMessage):
                    history.append({"role": "user", "content": msg.content})
                elif isinstance(msg, AIMessage):
                    history.append({"role": "assistant", "content": msg.content})

            history = history if history else None
            print(f"[LLM Node] History: {history}")

            # Sync client for sync node
            client = get_gpt_client()
            print(f"[LLM Node] Calling GPT client...")
            
            response = client.chat(
                message=user_message,
                history=history
            )
            
            print(f"[LLM Node] Got response: {response}")

            return {
                "messages": [AIMessage(content=response)],
                "conversation_id": state["conversation_id"]
            }
        except Exception as e:
            print(f"[LLM Node] ERROR: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    graph.add_node("llm", llm_node)

    graph.set_entry_point("llm")
    graph.add_edge("llm", END)

    return graph.compile(checkpointer=get_checkpointer())

chat_graph = create_chat_graph()