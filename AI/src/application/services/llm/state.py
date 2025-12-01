from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class ChatState(TypedDict):
    """
    State cho chat workflow

    Mỗi lần LangGraph chạy, state này sẽ được pass qua các nodes
    Sau mỗi node, state được update và persist vào PostgreSQL
    """

    messages: Annotated[Sequence[BaseMessage], add_messages]
    conversation_id: str
    user_id: str | None
    context: str