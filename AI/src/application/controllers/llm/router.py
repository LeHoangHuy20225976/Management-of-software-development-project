"""
LLM Service API Router
"""

from fastapi import APIRouter, HTTPException
from src.application.dtos.llm.chat_dto import ChatRequest, ChatResponse
from src.application.dtos.llm.chat_image_dto import ChatWithImageSearchRequest, ChatWithImageSearchResponse
from src.utils.logger import app_logger
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
        # Lazy import to catch initialization errors
        from src.application.services.llm.graph import chat_graph
        import asyncio
        
        conversation_id = request.conversation_id or str(uuid.uuid4())

        # PostgresSaver doesn't support async, use sync invoke in thread
        result = await asyncio.to_thread(
            chat_graph.invoke,
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

@router.post('/chat2testEimg', response_model=ChatWithImageSearchResponse)
async def chat_with_image_search(request: ChatWithImageSearchRequest):
    """
    Chat với AI và tìm kiếm ảnh liên quan

    - **message**: Tin nhắn từ user
    - **hotel_id**: ID của hotel (optional, để filter ảnh)
    - **conversation_id**: ID của conversation (tự tạo nếu không có)
    - **include_images**: Có search ảnh không (default: true)
    - **max_images**: Số lượng ảnh tối đa (default: 5)
    - **image_similarity_threshold**: Ngưỡng similarity (default: 0.3)

    Returns response từ AI kèm ảnh liên quan
    """
    try:
        app_logger.info(f"📨 Chat2testEimg request: message={request.message[:50]}, hotel_id={request.hotel_id}, include_images={request.include_images}")

        from src.application.services.llm.chat_with_images import ChatWithImageSearchService

        service = ChatWithImageSearchService()
        result = await service.chat_with_images(
            message=request.message,
            user_id=request.user_id,
            hotel_id=request.hotel_id,
            conversation_id=request.conversation_id,
            include_images=request.include_images,
            max_images=request.max_images,
            similarity_threshold=request.image_similarity_threshold
        )

        app_logger.info(f"✅ Chat2testEimg response: images={len(result.get('images', []))}")
        return ChatWithImageSearchResponse(**result)

    except Exception as e:
        app_logger.error(f"❌ Chat with image search error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Chat with image search error: {str(e)}"
        )