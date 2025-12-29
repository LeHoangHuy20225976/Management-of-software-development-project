"""
DTOs for Chat with Image Search endpoint
"""

from pydantic import BaseModel, Field
from typing import Optional, List

class ImageResult(BaseModel):
    """Image search result"""
    image_id: int
    image_url: str
    similarity_score: float
    entity_type: Optional[str] = None  # hotel, room, destination
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    image_description: Optional[str] = None
    image_tags: Optional[List[str]] = None

class ChatWithImageSearchRequest(BaseModel):
    """Request for chat with image search capability"""
    message: str = Field(..., description="Chat message from user", min_length=1)
    user_id: Optional[int] = Field(None, description="User ID for personalized queries")
    hotel_id: Optional[int] = Field(None, description="Hotel ID to filter images")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for history")
    include_images: bool = Field(True, description="Whether to search and include images")
    max_images: int = Field(5, description="Maximum number of images to return", ge=1, le=20)
    image_similarity_threshold: float = Field(0.3, description="Minimum similarity score", ge=0.0, le=1.0)

class ChatWithImageSearchResponse(BaseModel):
    """Response with AI text and related images"""
    response: str = Field(..., description="AI generated response")
    conversation_id: str = Field(..., description="Conversation ID")
    images: List[ImageResult] = Field(default_factory=list, description="Related images found")
    sources: List[str] = Field(default_factory=list, description="RAG source chunks if used")
    total_images_found: int = Field(0, description="Total number of images found")
