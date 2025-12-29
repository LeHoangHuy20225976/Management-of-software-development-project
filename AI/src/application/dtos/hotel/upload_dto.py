"""
DTOs for Hotel Upload Endpoints
Handles image and document uploads for hotels
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# =============================================================================
# Image Upload DTOs
# =============================================================================

class HotelImageUploadResponse(BaseModel):
    """Response for single image upload"""
    success: bool = Field(..., description="Upload success status")
    image_id: int = Field(..., description="Generated image ID")
    image_url: str = Field(..., description="Accessible image URL")
    image_type: str = Field(..., description="Image category")
    hotel_id: int = Field(..., description="Hotel ID")
    message: str = Field(..., description="Success/error message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "image_id": 123,
                "image_url": "https://minio.../hotels/1/exterior_001.jpg",
                "image_type": "hotel_exterior",
                "hotel_id": 1,
                "message": "Image uploaded and indexed successfully"
            }
        }


class HotelImageBatchUploadResponse(BaseModel):
    """Response for batch image upload"""
    success: bool = Field(..., description="Overall success status")
    total_uploaded: int = Field(..., description="Number of images successfully uploaded")
    total_failed: int = Field(..., description="Number of failed uploads")
    images: List[HotelImageUploadResponse] = Field(..., description="List of uploaded images")
    errors: List[str] = Field(default_factory=list, description="List of errors if any")
    message: str = Field(..., description="Summary message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "total_uploaded": 5,
                "total_failed": 0,
                "images": [],
                "errors": [],
                "message": "5 images uploaded successfully"
            }
        }


class ImageListResponse(BaseModel):
    """Response for listing hotel images"""
    success: bool = Field(True, description="Success status")
    total: int = Field(..., description="Total number of images")
    images: List[dict] = Field(..., description="List of images with metadata")
    hotel_id: int = Field(..., description="Hotel ID")


# =============================================================================
# Document Upload DTOs
# =============================================================================

class HotelDocumentUploadResponse(BaseModel):
    """Response for document upload"""
    success: bool = Field(..., description="Upload success status")
    document_id: int = Field(..., description="Generated document ID")
    file_url: str = Field(..., description="Accessible file URL")
    document_type: str = Field(..., description="Document category")
    hotel_id: int = Field(..., description="Hotel ID")
    rag_status: str = Field("pending", description="RAG indexing status")
    message: str = Field(..., description="Success/error message")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "document_id": 45,
                "file_url": "https://minio.../hotels/1/brochure.pdf",
                "document_type": "brochure",
                "hotel_id": 1,
                "rag_status": "processing",
                "message": "Document uploaded, RAG indexing in progress"
            }
        }


class DocumentListResponse(BaseModel):
    """Response for listing hotel documents"""
    success: bool = Field(True, description="Success status")
    total: int = Field(..., description="Total number of documents")
    documents: List[dict] = Field(..., description="List of documents with metadata")
    hotel_id: int = Field(..., description="Hotel ID")


# =============================================================================
# Query DTOs
# =============================================================================

class HotelUploadStatsResponse(BaseModel):
    """Statistics about hotel uploads"""
    hotel_id: int
    total_images: int
    total_documents: int
    images_by_type: dict = Field(default_factory=dict, description="Image count by type")
    documents_by_type: dict = Field(default_factory=dict, description="Document count by type")
    rag_indexed_docs: int = Field(0, description="Number of RAG-indexed documents")
    last_upload: Optional[datetime] = Field(None, description="Last upload timestamp")
