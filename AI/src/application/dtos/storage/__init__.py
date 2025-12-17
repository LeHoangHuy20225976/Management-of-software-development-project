"""
Storage DTOs - MinIO bucket and file operations
"""
from src.application.dtos.storage.minio_dto import (
    # Bucket DTOs
    BucketCreateRequest,
    BucketResponse,
    BucketListResponse,
    # File DTOs
    FileUploadResponse,
    MultiFileUploadRequest,
    MultiFileUploadResponse,
    FileDownloadRequest,
    FileMetadata,
    ListObjectsRequest,
    ListObjectsResponse,
    FileDeleteRequest,
    FileDeleteResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
)

__all__ = [
    # Bucket DTOs
    "BucketCreateRequest",
    "BucketResponse",
    "BucketListResponse",
    # File DTOs
    "FileUploadResponse",
    "MultiFileUploadRequest",
    "MultiFileUploadResponse",
    "FileDownloadRequest",
    "FileMetadata",
    "ListObjectsRequest",
    "ListObjectsResponse",
    "FileDeleteRequest",
    "FileDeleteResponse",
    "PresignedUrlRequest",
    "PresignedUrlResponse",
]
