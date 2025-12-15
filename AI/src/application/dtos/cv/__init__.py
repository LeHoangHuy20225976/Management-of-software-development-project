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

from .image_search_dto import (
    ImageUploadRequest,
    TextSearchRequest,
    ImageSearchRequest,
    HybridSearchRequest,
    ImageUploadResponse,
    SearchResponse,
    SearchResult,
    ImageMetadata,
    HotelInfo,
    RoomInfo,
    DestinationInfo,
    ImageListResponse,
    ImageDeleteResponse,
)

__all__ = [
    # Face Recognition
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
    # Image Search
    "ImageUploadRequest",
    "TextSearchRequest",
    "ImageSearchRequest",
    "HybridSearchRequest",
    "ImageUploadResponse",
    "SearchResponse",
    "SearchResult",
    "ImageMetadata",
    "HotelInfo",
    "RoomInfo",
    "DestinationInfo",
    "ImageListResponse",
    "ImageDeleteResponse",
]
