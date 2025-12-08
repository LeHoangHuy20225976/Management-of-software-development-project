"""
Image Search & Retrieval API Controller
Handles HTTP requests for image upload, text search, and image search
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import logging

# DTOs
from src.application.dtos.cv import (
    ImageUploadRequest,
    TextSearchRequest,
    ImageSearchRequest,
    HybridSearchRequest,
    ImageUploadResponse,
    SearchResponse,
    ImageListResponse,
    ImageDeleteResponse,
)

# Service
from src.application.services.cv.image_search import ImageSearchService

# Config
from src.infrastructure.config import get_settings

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/cv/image-search",
    tags=["Image Search & Retrieval"],
)

# Service instance (will be initialized on startup)
image_search_service: Optional[ImageSearchService] = None


async def get_image_search_service() -> ImageSearchService:
    """
    Dependency to get image search service instance

    Raises:
        HTTPException: If service not initialized
    """
    if image_search_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image search service not initialized",
        )
    return image_search_service


def decode_image(base64_str: str) -> Image.Image:
    """
    Decode base64 image string to PIL Image

    Args:
        base64_str: Base64 encoded image (with or without data URI prefix)

    Returns:
        PIL Image

    Raises:
        ValueError: If image cannot be decoded
    """
    try:
        # Remove data URI prefix if present
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]

        # Decode base64
        image_bytes = base64.b64decode(base64_str)

        # Open image with PIL
        image = Image.open(BytesIO(image_bytes))

        # Convert to RGB (in case it's RGBA or grayscale)
        if image.mode != "RGB":
            image = image.convert("RGB")

        return image

    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================


@router.post(
    "/upload",
    response_model=ImageUploadResponse,
    summary="Upload Image",
    description="Upload image and generate embedding for search",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    request: ImageUploadRequest,
    service: ImageSearchService = Depends(get_image_search_service),
) -> ImageUploadResponse:
    """
    Upload and index a new image

    **Process:**
    1. Decode base64 image
    2. Extract CLIP embedding (512-dim)
    3. Store image metadata + embedding in database
    4. Image becomes searchable

    **Use Cases:**
    - Upload hotel photos
    - Upload room photos
    - Upload destination images

    **Returns:**
    - Success status
    - Image ID
    - Whether embedding was generated
    """
    try:
        # Decode image
        image = decode_image(request.image_base64)

        # Call service (Note: image_url should come from MinIO/S3 upload)
        # For now, using placeholder URL
        image_url = f"https://cdn.example.com/images/{request.hotel_id or request.room_id or request.destination_id}.jpg"

        result = await service.upload_image(
            image=image,
            image_url=image_url,
            hotel_id=request.hotel_id,
            room_id=request.room_id,
            destination_id=request.destination_id,
            description=request.description,
            tags=request.tags,
            is_primary=request.is_primary,
        )

        return ImageUploadResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in upload_image: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.post(
    "/search/text",
    response_model=SearchResponse,
    summary="Search by Text",
    description="Search images using natural language text query",
)
async def search_by_text(
    request: TextSearchRequest,
    service: ImageSearchService = Depends(get_image_search_service),
) -> SearchResponse:
    """
    Search images using text query

    **How it works:**
    1. Convert text query to CLIP embedding
    2. Find images with similar embeddings (cosine similarity)
    3. Return ranked results

    **Example Queries:**
    - "luxury hotel with ocean view"
    - "romantic bedroom with sunset"
    - "swimming pool and beach"
    - "modern minimalist lobby"

    **Filters:**
    - entity_type: Filter by 'hotel', 'room', or 'destination'
    - entity_id: Filter by specific hotel/room/destination ID
    - min_similarity: Minimum similarity score (0-1)

    **Returns:**
    - Ranked list of images with similarity scores
    - Associated hotel/room/destination info
    - Search time in milliseconds
    """
    try:
        result = await service.search_by_text(
            query=request.query,
            entity_type=request.entity_type,
            entity_id=request.entity_id,
            limit=request.limit,
            min_similarity=request.min_similarity,
        )

        return SearchResponse(**result)

    except Exception as e:
        logger.error(f"Error in search_by_text: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.post(
    "/search/image",
    response_model=SearchResponse,
    summary="Search by Image",
    description="Find similar images using an uploaded image",
)
async def search_by_image(
    request: ImageSearchRequest,
    service: ImageSearchService = Depends(get_image_search_service),
) -> SearchResponse:
    """
    Search similar images using an uploaded image

    **How it works:**
    1. Convert uploaded image to CLIP embedding
    2. Find images with similar visual features
    3. Return ranked results

    **Use Cases:**
    - Upload hotel photo → find similar hotels
    - Upload room photo → find similar rooms
    - Reverse image search

    **Filters:**
    - Same as text search

    **Returns:**
    - Visually similar images ranked by similarity
    """
    try:
        # Decode query image
        query_image = decode_image(request.image_base64)

        result = await service.search_by_image(
            image=query_image,
            entity_type=request.entity_type,
            entity_id=request.entity_id,
            limit=request.limit,
            min_similarity=request.min_similarity,
        )

        return SearchResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in search_by_image: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.post(
    "/search/hybrid",
    response_model=SearchResponse,
    summary="Hybrid Search",
    description="Search using both text and image (combined)",
)
async def hybrid_search(
    request: HybridSearchRequest,
    service: ImageSearchService = Depends(get_image_search_service),
) -> SearchResponse:
    """
    Hybrid search combining text and image

    **How it works:**
    1. Extract embeddings from both text and image
    2. Combine embeddings with configurable weights
    3. Search using combined embedding

    **Use Cases:**
    - Text: "luxury hotel" + Image: beach photo → luxury beach hotels
    - More precise search than text or image alone

    **Parameters:**
    - text_weight: Weight for text similarity (0-1)
    - image_weight: Weight for image similarity (0-1)
    - Both weights should sum to 1.0 for best results

    **Returns:**
    - Images matching both text and visual criteria
    """
    try:
        query_image = None
        if request.image_base64:
            query_image = decode_image(request.image_base64)

        result = await service.hybrid_search(
            text_query=request.text_query,
            image=query_image,
            text_weight=request.text_weight,
            image_weight=request.image_weight,
            entity_type=request.entity_type,
            limit=request.limit,
            min_similarity=request.min_similarity,
        )

        return SearchResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in hybrid_search: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.get(
    "/images/{entity_type}/{entity_id}",
    response_model=ImageListResponse,
    summary="Get Entity Images",
    description="Get all images for a specific hotel/room/destination",
)
async def get_entity_images(
    entity_type: str,
    entity_id: int,
    service: ImageSearchService = Depends(get_image_search_service),
) -> ImageListResponse:
    """
    Get all images for a specific entity

    **Parameters:**
    - entity_type: 'hotel', 'room', or 'destination'
    - entity_id: ID of the entity

    **Returns:**
    - List of all images for the entity
    - Ordered by display_order and created_at
    """
    try:
        column_map = {
            "hotel": "hotel_id",
            "room": "room_id",
            "destination": "destination_id",
        }

        if entity_type not in column_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid entity_type. Must be one of: {list(column_map.keys())}",
            )

        column = column_map[entity_type]

        async with service.db_pool.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT
                    image_id, image_url, image_description, image_tags,
                    is_primary, image_width, image_height,
                    embedding_model, created_at
                FROM Image
                WHERE {column} = $1
                ORDER BY is_primary DESC, display_order ASC, created_at DESC
                """,
                entity_id,
            )

        from src.application.dtos.cv import ImageMetadata

        images = [ImageMetadata(**dict(row)) for row in rows]

        return ImageListResponse(success=True, images=images, total=len(images))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_entity_images: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.delete(
    "/{image_id}",
    response_model=ImageDeleteResponse,
    summary="Delete Image",
    description="Delete an image from the database",
)
async def delete_image(
    image_id: int,
    service: ImageSearchService = Depends(get_image_search_service),
) -> ImageDeleteResponse:
    """
    Delete an image

    **Note:** This is a hard delete. Consider implementing soft delete
    by adding an is_deleted column if you need to keep history.
    """
    try:
        async with service.db_pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM Image WHERE image_id = $1",
                image_id,
            )

        if result == "DELETE 0":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image ID {image_id} not found",
            )

        return ImageDeleteResponse(
            success=True,
            message=f"Image {image_id} deleted successfully",
            image_id=image_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_image: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


# ============================================================================
# LIFECYCLE MANAGEMENT
# ============================================================================


async def initialize_image_search_service():
    """Initialize image search service on startup"""
    global image_search_service

    logger.info("Initializing Image Search Service...")
    settings = get_settings()
    image_search_service = ImageSearchService(settings=settings)
    await image_search_service.initialize()
    logger.info("✅ Image Search Service ready")


async def shutdown_image_search_service():
    """Cleanup image search service on shutdown"""
    global image_search_service

    if image_search_service:
        await image_search_service.shutdown()
        image_search_service = None
