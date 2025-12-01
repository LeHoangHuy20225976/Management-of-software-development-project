"""
LLM Service API Router
"""

from fastapi import APIRouter, HTTPException
from src.application.dtos.llm.chat_dto import ChatRequest, ChatResponse
from src.application.services.llm.graph import chat_graph
from langchain_core.messages import HumanMessage
import uuid

router = APIRouter()

@router.get('/health')
async def llm_health():
    return {'status': 'ok', 'service': 'llm'}

@router.get('/')
async def llm_root():
    """ LLM service root endpoint"""
    return {
        'service': 'LLM',
        'version': '0.1.0',
        'status': 'running'
    }

@router.post('/chat', response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat với LLM AI
    
    - **message**: Tin nhắn từ user
    - **conversation_id**: ID của conversation (tự tạo nếu không có)
    - **history**: load from database
    
    Returns response từ AI
    """

    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        result = await chat_graph.ainvoke(
            {
                "messages": [HumanMessage(content=request.message)],
                "conversation_id": conversation_id
            },
            config= {
                "configurable": {
                    "thread_id": conversation_id
                }
            }
        )
        
        ai_message = result["messages"][-1]

        return ChatResponse(
            response=ai_message.content,
            conversation_id=conversation_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail= f"LLM error: {str(e)}"
        )