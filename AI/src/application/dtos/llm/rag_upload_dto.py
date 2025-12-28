"""
DTO for RAG Upload và Search endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class RAGUploadResponse(BaseModel):
    """Response từ upload endpoint"""
    status: str = Field(..., description="Status: success/error")
    message: str = Field(..., description="Message")
    filename: str = Field(..., description="Tên file đã upload")
    total_chunks: int = Field(..., description="Số chunks đã index")
    table_name: str = Field(..., description="Tên table trong PGVector")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "message": "File indexed successfully",
                "filename": "document.pdf",
                "total_chunks": 45,
                "table_name": "rag_embeddings"
            }
        }


class RAGSearchRequest(BaseModel):
    """Request for search endpoint"""
    query: str = Field(..., description="Câu hỏi/query để search", min_length=1)
    top_k: Optional[int] = Field(5, description="Số lượng chunks relevant trả về", ge=1, le=20)
    table_name: Optional[str] = Field("rag_embeddings", description="Tên table để search")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is Android?",
                "top_k": 5,
                "table_name": "rag_embeddings"
            }
        }


class RAGSearchResult(BaseModel):
    """Single search result"""
    text: str = Field(..., description="Nội dung chunk")
    score: float = Field(..., description="Similarity score")
    metadata: dict = Field(default={}, description="Metadata của chunk")


class RAGSearchResponse(BaseModel):
    """Response từ search endpoint"""
    query: str = Field(..., description="Query đã search")
    results: List[RAGSearchResult] = Field(..., description="Danh sách kết quả")
    total_results: int = Field(..., description="Tổng số kết quả")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is Android?",
                "total_results": 5,
                "results": [
                    {
                        "text": "Android is a mobile operating system...",
                        "score": 0.8456,
                        "metadata": {
                            "file_name": "android_intro.pdf",
                            "page": 1
                        }
                    }
                ]
            }
        }
