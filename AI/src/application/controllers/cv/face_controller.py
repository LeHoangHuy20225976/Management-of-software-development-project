"""
Face Recognition API Controller
Handles HTTP requests for face enrollment and recognition
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
import base64
import numpy as np
from io import BytesIO
from PIL import Image
import logging

# DTOs
from src.application.dtos.cv import (
    FaceEnrollRequest,
    FaceRecognitionRequest,
    FaceEnrollResponse,
    FaceRecognitionResponse,
    ListFacesResponse,
    DeleteFaceResponse,
    FaceInfo,
)

# Service
from src.application.services.cv.face_recognition import FaceRecognitionService

# Config
from src.infrastructure.config import get_settings

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/cv/face",
    tags=["Face Recognition"],
)

# Service instance (will be initialized on startup)
face_service: FaceRecognitionService | None = None


async def get_face_service() -> FaceRecognitionService:
    """
    Dependency to get face recognition service instance

    Raises:
        HTTPException: If service not initialized
    """
    if face_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Face recognition service not initialized",
        )
    return face_service


def decode_image(base64_str: str) -> np.ndarray:
    """
    Decode base64 image string to numpy array

    Args:
        base64_str: Base64 encoded image (with or without data URI prefix)

    Returns:
        RGB numpy array

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

        # Convert to numpy array
        image_array = np.array(image)

        return image_array

    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================


@router.post(
    "/enroll",
    response_model=FaceEnrollResponse,
    summary="Enroll Employee Face",
    description="Enroll a new employee face for attendance recognition",
    status_code=status.HTTP_201_CREATED,
)
async def enroll_face(
    request: FaceEnrollRequest,
    service: FaceRecognitionService = Depends(get_face_service),
) -> FaceEnrollResponse:
    """
    Enroll a new employee face

    **Process:**
    1. Decode base64 image
    2. Detect face in image
    3. Check face quality (sharpness, brightness)
    4. Optional: Perform liveness check
    5. Extract face embedding (512-dim vector)
    6. Store in database with pgvector

    **Quality Requirements:**
    - Face must be clearly visible
    - Good lighting (not too bright/dark)
    - Sharp image (not blurry)
    - Only one face in image
    - Optional: Must pass liveness check (not a photo/video)

    **Returns:**
    - Success status
    - Face ID (if enrolled)
    - Quality scores
    - Liveness score
    """
    try:
        # Decode image
        image_array = decode_image(request.image_base64)

        # Call service
        result = await service.enroll_face(
            user_id=request.user_id,
            image=image_array,
            device_id=request.device_id,
            location=request.location,
            notes=request.notes,
            require_liveness=request.require_liveness,
        )

        # Convert quality_scores dict to QualityScores model if present
        if result.get("quality_scores"):
            from src.application.dtos.cv import QualityScores

            result["quality_scores"] = QualityScores(**result["quality_scores"])

        return FaceEnrollResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in enroll_face: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.post(
    "/recognize",
    response_model=FaceRecognitionResponse,
    summary="Recognize Face",
    description="Recognize employee face and log attendance",
)
async def recognize_face(
    request: FaceRecognitionRequest,
    service: FaceRecognitionService = Depends(get_face_service),
) -> FaceRecognitionResponse:
    """
    Recognize employee face and log attendance

    **Process:**
    1. Decode base64 image
    2. Detect face in image
    3. Extract face embedding
    4. Search similar faces in database (pgvector cosine similarity)
    5. If match found (similarity > threshold):
       - Log attendance event
       - Publish event to RabbitMQ
       - Return user info
    6. If no match:
       - Log failed attempt
       - Return error

    **Event Types:**
    - `CHECK_IN`: Employee arriving
    - `CHECK_OUT`: Employee leaving

    **Returns:**
    - Success status
    - User ID (if recognized)
    - Confidence score
    - Attendance log ID
    """
    try:
        # Decode image
        image_array = decode_image(request.image_base64)

        # Call service
        result = await service.recognize_face(
            image=image_array,
            event_type=request.event_type,
            device_id=request.device_id,
            location=request.location,
        )

        return FaceRecognitionResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error in recognize_face: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.get(
    "/user/{user_id}",
    response_model=ListFacesResponse,
    summary="Get User Faces",
    description="Get all enrolled faces for a specific user",
)
async def get_user_faces(
    user_id: int,
    service: FaceRecognitionService = Depends(get_face_service),
) -> ListFacesResponse:
    """
    Get all enrolled face samples for a user

    Useful for:
    - Viewing enrollment history
    - Checking face quality
    - Managing multiple face samples per user
    """
    try:
        async with service.db_pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    face_id, user_id, face_quality_score,
                    sharpness_score, brightness_score,
                    is_liveness_verified, liveness_score,
                    enrollment_device, enrollment_location, enrollment_notes,
                    is_active, created_at, updated_at
                FROM employee_faces
                WHERE user_id = $1
                ORDER BY created_at DESC
                """,
                user_id,
            )

        faces = [FaceInfo(**dict(row)) for row in rows]

        return ListFacesResponse(success=True, faces=faces, total=len(faces))

    except Exception as e:
        logger.error(f"Error in get_user_faces: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


@router.delete(
    "/{face_id}",
    response_model=DeleteFaceResponse,
    summary="Delete Face",
    description="Soft delete an enrolled face (set is_active=false)",
)
async def delete_face(
    face_id: int,
    service: FaceRecognitionService = Depends(get_face_service),
) -> DeleteFaceResponse:
    """
    Soft delete a face enrollment

    This sets `is_active = false` instead of actually deleting the record.
    This allows keeping history while preventing the face from being used
    for recognition.

    **Use cases:**
    - Employee left the company
    - Poor quality enrollment needs replacement
    - Security: Face was compromised
    """
    try:
        async with service.db_pool.acquire() as conn:
            result = await conn.execute(
                """
                UPDATE employee_faces
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE face_id = $1
                """,
                face_id,
            )

        if result == "UPDATE 0":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Face ID {face_id} not found",
            )

        return DeleteFaceResponse(
            success=True,
            message=f"Face {face_id} deactivated successfully",
            face_id=face_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_face: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )


# ============================================================================
# LIFECYCLE MANAGEMENT
# ============================================================================


async def initialize_face_service():
    """Initialize face recognition service on startup"""
    global face_service

    logger.info("Initializing Face Recognition Service...")
    settings = get_settings()
    face_service = FaceRecognitionService(settings=settings)
    await face_service.initialize()
    logger.info("✅ Face Recognition Service ready")


async def shutdown_face_service():
    """Cleanup face recognition service on shutdown"""
    global face_service

    if face_service:
        await face_service.shutdown()
        face_service = None
