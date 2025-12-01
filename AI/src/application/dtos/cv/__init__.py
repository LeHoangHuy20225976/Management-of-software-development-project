"""CV Service DTOs"""

from .face_dto import (
    FaceEnrollRequest,
    FaceRecognitionRequest,
    FaceEnrollResponse,
    FaceRecognitionResponse,
    QualityScores,
    FaceInfo,
    ListFacesResponse,
    DeleteFaceResponse,
    AttendanceLogInfo,
    ListAttendanceLogsResponse,
)

__all__ = [
    "FaceEnrollRequest",
    "FaceRecognitionRequest",
    "FaceEnrollResponse",
    "FaceRecognitionResponse",
    "QualityScores",
    "FaceInfo",
    "ListFacesResponse",
    "DeleteFaceResponse",
    "AttendanceLogInfo",
    "ListAttendanceLogsResponse",
]
