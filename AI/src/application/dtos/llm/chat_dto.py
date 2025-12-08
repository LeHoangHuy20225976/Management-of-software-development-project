"""
DTO of the chat endpoint
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class ChatMessage(BaseModel):
    """Single message"""
    role: str = Field(..., description="Role: 'user' hoặc 'assistant'")
    content: str = Field(..., description="Nội dung tin nhắn")

class ChatRequest(BaseModel):
    """Request for the chat endpoint"""
    message: str = Field(..., description="Tin nhắn từ user", min_length=1)
    conversation_id: Optional[str] = Field(None, description="ID của conversation (optional)")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Xin chào, bạn là ai ?",
                "conversation_id": "conv-123",
                "history":[
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hi there!"}
                ]
            }
        }

class ChatResponse(BaseModel):
    """Response từ chat endpoint"""
    response: str = Field(..., description= "Response từ trợ lí AI")
    conversation_id: str = Field(..., description="ID của conversation")

    class Config:
        json_schema_extra = {
            "example": {
                "response": "Xin chào, tôi là trợ lí AI",
                "conversation_id": "conv-123"
            }
        }