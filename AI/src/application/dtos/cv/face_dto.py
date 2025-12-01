"""
Data Transfer Objects for Face Recognition API
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


# ============================================================================
# REQUEST DTOs
# ============================================================================


class FaceEnrollRequest(BaseModel):
    """Request to enroll a new employee face"""

    user_id: int = Field(..., description="User ID from User table", gt=0)
    image_base64: str = Field(..., description="Base64 encoded face image (JPEG/PNG)")
    device_id: Optional[str] = Field(None, description="Device identifier")
    location: Optional[str] = Field(None, description="Enrollment location")
    notes: Optional[str] = Field(None, description="Additional notes")
    require_liveness: bool = Field(
        True, description="Whether to perform liveness check"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_id": 123,
                    "image_base64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
                    "device_id": "tablet-001",
                    "location": "Front Desk",
                    "notes": "First enrollment",
                    "require_liveness": True,
                }
            ]
        }
    }


class FaceRecognitionRequest(BaseModel):
    """Request to recognize a face"""

    image_base64: str = Field(..., description="Base64 encoded face image")
    event_type: str = Field(
        default="CHECK_IN",
        description="Event type: CHECK_IN or CHECK_OUT",
        pattern="^(CHECK_IN|CHECK_OUT)$",
    )
    device_id: Optional[str] = Field(None, description="Device identifier")
    location: Optional[str] = Field(None, description="Recognition location")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "image_base64": "/9j/4AAQSkZJRgABAQEAYABgAAD...",
                    "event_type": "CHECK_IN",
                    "device_id": "kiosk-entrance",
                    "location": "Main Entrance",
                }
            ]
        }
    }


# ============================================================================
# RESPONSE DTOs
# ============================================================================


class QualityScores(BaseModel):
    """Face quality metrics"""

    overall: float = Field(..., ge=0, le=1, description="Overall quality score")
    sharpness: float = Field(..., ge=0, le=1, description="Image sharpness")
    brightness: float = Field(..., ge=0, le=1, description="Lighting quality")
    face_score: float = Field(..., ge=0, le=1, description="Face detection confidence")


class FaceEnrollResponse(BaseModel):
    """Response from face enrollment"""

    success: bool = Field(..., description="Whether enrollment succeeded")
    face_id: Optional[int] = Field(None, description="Assigned face ID (if success)")
    message: str = Field(..., description="Status message")
    quality_scores: Optional[QualityScores] = Field(
        None, description="Quality metrics"
    )
    liveness_score: Optional[float] = Field(
        None, ge=0, le=1, description="Liveness detection score"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "face_id": 456,
                    "message": "Face enrolled successfully",
                    "quality_scores": {
                        "overall": 0.85,
                        "sharpness": 0.92,
                        "brightness": 0.78,
                        "face_score": 0.95,
                    },
                    "liveness_score": 0.91,
                }
            ]
        }
    }


class FaceRecognitionResponse(BaseModel):
    """Response from face recognition"""

    success: bool = Field(..., description="Whether face was recognized")
    user_id: Optional[int] = Field(None, description="Recognized user ID")
    confidence: Optional[float] = Field(
        None, ge=0, le=1, description="Recognition confidence"
    )
    message: str = Field(..., description="Status message")
    attendance_log_id: Optional[int] = Field(
        None, description="Created attendance log ID"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "user_id": 123,
                    "confidence": 0.89,
                    "message": "Face recognized (CHECK_IN)",
                    "attendance_log_id": 789,
                }
            ]
        }
    }


class FaceInfo(BaseModel):
    """Information about an enrolled face"""

    face_id: int
    user_id: int
    face_quality_score: float
    sharpness_score: float
    brightness_score: float
    is_liveness_verified: bool
    liveness_score: Optional[float]
    enrollment_device: Optional[str]
    enrollment_location: Optional[str]
    enrollment_notes: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ListFacesResponse(BaseModel):
    """Response with list of faces"""

    success: bool
    faces: list[FaceInfo]
    total: int


class DeleteFaceResponse(BaseModel):
    """Response from face deletion"""

    success: bool
    message: str
    face_id: int


# ============================================================================
# ATTENDANCE DTOs
# ============================================================================


class AttendanceLogInfo(BaseModel):
    """Attendance log information"""

    log_id: int
    user_id: Optional[int]
    matched_face_id: Optional[int]
    recognition_confidence: Optional[float]
    event_type: str
    location: Optional[str]
    device_id: Optional[str]
    device_type: Optional[str]
    liveness_verified: bool
    liveness_score: Optional[float]
    event_timestamp: datetime
    metadata: Optional[Dict[str, Any]]


class ListAttendanceLogsResponse(BaseModel):
    """Response with attendance logs"""

    success: bool
    logs: list[AttendanceLogInfo]
    total: int
