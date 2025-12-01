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

    async def llm_node(state: ChatState) -> ChatState:
        """
        Node call API and get response
        """

        messages = state["messages"]

        user_message = messages[-1].content

        history = []
        for msg in messages[:-1]:
            if isinstance(msg, HumanMessage):
                history.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                history.append({"role": "assistant", "content": msg.content})

        history = history if history else None

        client = get_gpt_client()
        response = client.chat(
            message=user_message,
            history=history
        )

        return {
            "messages": [AIMessage(content=response)],
            "conversation_id": state["conversation_id"]
        }
    
    graph.add_node("llm", llm_node)

    graph.set_entry_point("llm")
    graph.add_edge("llm", END)

    return graph.compile(checkpointer=get_checkpointer())

chat_graph = create_chat_graph()