"""
LLM Service API Router
"""

from fastapi import APIRouter, HTTPException
from src.application.dtos.llm.chat_dto import ChatRequest, ChatResponse
from src.application.services.llm.gpt_client import get_gpt_client
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
    - **history**: Lịch sử chat trước đó (optional)
    
    Returns response từ AI
    """

    try:
        client = get_gpt_client()

        history_dict = None
        if request.history:
            history_dict = [
                {"role": msg.role, "content": msg.content}
                for msg in request.history
            ]
        
        reponse = client.chat(
            message = request.message,
            history=history_dict
        )

        conversation_id =  request.conversation_id or str(uuid.uuid4())

        return ChatResponse(
            response=reponse,
            conversation_id= conversation_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code = 500,
            detail= f"LLM error: {str(e)}"
        )