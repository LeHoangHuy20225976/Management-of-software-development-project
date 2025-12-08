"""
Data Transfer Objects for Image Search & Retrieval API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# ============================================================================
# REQUEST DTOs
# ============================================================================


class ImageUploadRequest(BaseModel):
    """Request to upload and index a new image"""

    image_base64: str = Field(..., description="Base64 encoded image (JPEG/PNG)")
    hotel_id: Optional[int] = Field(None, description="Associated hotel ID", gt=0)
    room_id: Optional[int] = Field(None, description="Associated room ID", gt=0)
    destination_id: Optional[int] = Field(None, description="Associated destination ID", gt=0)
    description: Optional[str] = Field(None, description="Image description/caption")
    tags: Optional[List[str]] = Field(None, description="Image tags (e.g., ['pool', 'sunset'])")
    is_primary: bool = Field(False, description="Whether this is the primary/thumbnail image")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "image_base64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
                    "hotel_id": 123,
                    "description": "Luxury pool with ocean view",
                    "tags": ["pool", "ocean", "luxury"],
                    "is_primary": True,
                }
            ]
        }
    }


class TextSearchRequest(BaseModel):
    """Search images using text query"""

    query: str = Field(..., description="Text search query", min_length=1, max_length=500)
    entity_type: Optional[Literal["hotel", "room", "destination"]] = Field(
        None, description="Filter by entity type"
    )
    entity_id: Optional[int] = Field(None, description="Filter by specific entity ID", gt=0)
    limit: int = Field(10, description="Number of results to return", ge=1, le=100)
    min_similarity: float = Field(
        0.3, description="Minimum similarity threshold", ge=0.0, le=1.0
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "luxury hotel with ocean view and swimming pool",
                    "entity_type": "hotel",
                    "limit": 20,
                    "min_similarity": 0.5,
                }
            ]
        }
    }


class ImageSearchRequest(BaseModel):
    """Search similar images using an uploaded image"""

    image_base64: str = Field(..., description="Base64 encoded query image")
    entity_type: Optional[Literal["hotel", "room", "destination"]] = Field(
        None, description="Filter by entity type"
    )
    entity_id: Optional[int] = Field(None, description="Filter by specific entity ID", gt=0)
    limit: int = Field(10, description="Number of results to return", ge=1, le=100)
    min_similarity: float = Field(
        0.5, description="Minimum similarity threshold", ge=0.0, le=1.0
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "image_base64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
                    "entity_type": "hotel",
                    "limit": 10,
                    "min_similarity": 0.6,
                }
            ]
        }
    }


class HybridSearchRequest(BaseModel):
    """Hybrid search using both text and image"""

    text_query: Optional[str] = Field(None, description="Text search query")
    image_base64: Optional[str] = Field(None, description="Base64 encoded query image")
    text_weight: float = Field(0.5, description="Weight for text similarity", ge=0.0, le=1.0)
    image_weight: float = Field(0.5, description="Weight for image similarity", ge=0.0, le=1.0)
    entity_type: Optional[Literal["hotel", "room", "destination"]] = Field(
        None, description="Filter by entity type"
    )
    limit: int = Field(10, description="Number of results to return", ge=1, le=100)
    min_similarity: float = Field(
        0.3, description="Minimum similarity threshold", ge=0.0, le=1.0
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "text_query": "romantic sunset view",
                    "image_base64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
                    "text_weight": 0.6,
                    "image_weight": 0.4,
                    "limit": 15,
                }
            ]
        }
    }


# ============================================================================
# RESPONSE DTOs
# ============================================================================


class ImageMetadata(BaseModel):
    """Image metadata"""

    image_id: int
    image_url: str
    image_description: Optional[str]
    image_tags: Optional[List[str]]
    is_primary: bool
    image_width: Optional[int]
    image_height: Optional[int]
    embedding_model: Optional[str]
    created_at: datetime


class HotelInfo(BaseModel):
    """Associated hotel information"""

    hotel_id: int
    hotel_name: str
    hotel_rating: Optional[float]
    hotel_address: Optional[str]
    hotel_thumbnail: Optional[str]


class RoomInfo(BaseModel):
    """Associated room information"""

    room_id: int
    room_name: str
    room_status: Optional[str]


class DestinationInfo(BaseModel):
    """Associated destination information"""

    destination_id: int
    destination_name: str
    destination_location: Optional[str]
    destination_type: Optional[str]


class SearchResult(BaseModel):
    """Single search result with similarity score"""

    similarity: float = Field(..., description="Similarity score (0-1)", ge=0.0, le=1.0)
    image: ImageMetadata
    hotel: Optional[HotelInfo] = None
    room: Optional[RoomInfo] = None
    destination: Optional[DestinationInfo] = None


class ImageUploadResponse(BaseModel):
    """Response from image upload"""

    success: bool
    message: str
    image_id: Optional[int] = None
    embedding_generated: bool = False

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "message": "Image uploaded and indexed successfully",
                    "image_id": 456,
                    "embedding_generated": True,
                }
            ]
        }
    }


class SearchResponse(BaseModel):
    """Response from image/text search"""

    success: bool
    query: Optional[str] = Field(None, description="Original query (for text search)")
    results: List[SearchResult]
    total: int = Field(..., description="Total number of results returned")
    search_time_ms: float = Field(..., description="Search execution time in milliseconds")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "query": "luxury hotel with pool",
                    "results": [
                        {
                            "similarity": 0.89,
                            "image": {
                                "image_id": 123,
                                "image_url": "https://cdn.example.com/hotel123.jpg",
                                "image_description": "Infinity pool overlooking ocean",
                                "image_tags": ["pool", "ocean", "luxury"],
                                "is_primary": True,
                                "image_width": 1920,
                                "image_height": 1080,
                                "embedding_model": "clip-vit-base-patch32",
                                "created_at": "2024-01-01T12:00:00Z",
                            },
                            "hotel": {
                                "hotel_id": 42,
                                "hotel_name": "Ocean Paradise Resort",
                                "hotel_rating": 4.8,
                                "hotel_address": "123 Beach Road",
                                "hotel_thumbnail": "https://cdn.example.com/thumb.jpg",
                            },
                        }
                    ],
                    "total": 1,
                    "search_time_ms": 45.2,
                }
            ]
        }
    }


class ImageListResponse(BaseModel):
    """Response with list of images"""

    success: bool
    images: List[ImageMetadata]
    total: int


class ImageDeleteResponse(BaseModel):
    """Response from image deletion"""

    success: bool
    message: str
    image_id: int
