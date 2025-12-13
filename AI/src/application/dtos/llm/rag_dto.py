"""
DTO for RAG (Retrieval-Augmented Generation) endpoint
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class RAGChatRequest(BaseModel):
    """Request for RAG chat endpoint"""
    message: str = Field(..., description="Câu hỏi từ user", min_length=1)
    conversation_id: Optional[str] = Field(None, description="ID của conversation (optional)")
    top_k: Optional[int] = Field(3, description="Số lượng chunks để retrieve", ge=1, le=10)
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is Android?",
                "conversation_id": "rag-conv-123",
                "top_k": 3
            }
        }


class RAGSource(BaseModel):
    """Source document từ RAG"""
    text: str = Field(..., description="Preview của source text")
    score: float = Field(..., description="Similarity score")
    file_name: Optional[str] = Field(None, description="Tên file PDF")
    page: Optional[int] = Field(None, description="Số trang")


class RAGChatResponse(BaseModel):
    """Response từ RAG chat endpoint"""
    response: str = Field(..., description="Response từ AI với context từ PDF")
    conversation_id: str = Field(..., description="ID của conversation")
    sources: List[RAGSource] = Field(default=[], description="Danh sách sources được sử dụng")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Android is a mobile operating system developed by Google...",
                "conversation_id": "rag-conv-123",
                "sources": [
                    {
                        "text": "Android is a mobile operating system based on Linux...",
                        "score": 0.8234,
                        "file_name": "Lesson 1.2 - Android Introduction.pdf",
                        "page": 1
                    }
                ]
            }
        }
