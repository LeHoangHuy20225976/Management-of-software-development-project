"""
MinIO Storage DTOs for bucket and file operations
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================================================
# Bucket DTOs
# ============================================================================

class BucketCreateRequest(BaseModel):
    """Request model for creating a bucket"""
    bucket_name: str = Field(
        ...,
        description="Bucket name (lowercase, alphanumeric, hyphens only)",
        pattern="^[a-z0-9][a-z0-9-]*[a-z0-9]$",
        min_length=3,
        max_length=63
    )
    object_lock: bool = Field(
        default=False,
        description="Enable object lock for compliance"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_lock": False
            }
        }


class BucketResponse(BaseModel):
    """Response model for bucket operations"""
    bucket_name: str
    creation_date: Optional[datetime] = None
    message: str
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "creation_date": "2025-12-10T10:30:00Z",
                "message": "Bucket created successfully",
                "success": True
            }
        }


class BucketListResponse(BaseModel):
    """Response model for listing buckets"""
    buckets: List[dict]
    count: int
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "buckets": [
                    {
                        "name": "hotel-images",
                        "creation_date": "2025-12-10T10:30:00Z"
                    },
                    {
                        "name": "guest-documents",
                        "creation_date": "2025-12-09T14:20:00Z"
                    }
                ],
                "count": 2,
                "success": True
            }
        }


# ============================================================================
# File/Object DTOs
# ============================================================================

class FileUploadResponse(BaseModel):
    """Response model for file upload"""
    bucket_name: str
    object_name: str
    file_size: int
    content_type: str
    etag: Optional[str] = None
    version_id: Optional[str] = None
    message: str
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg",
                "file_size": 1024567,
                "content_type": "image/jpeg",
                "etag": "d41d8cd98f00b204e9800998ecf8427e",
                "version_id": None,
                "message": "File uploaded successfully",
                "success": True
            }
        }


class MultiFileUploadRequest(BaseModel):
    """Request model for multiple file uploads"""
    bucket_name: str = Field(..., description="Target bucket name")
    prefix: Optional[str] = Field(
        default="",
        description="Optional prefix/folder path for objects"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "prefix": "rooms/"
            }
        }


class MultiFileUploadResponse(BaseModel):
    """Response model for multiple file uploads"""
    bucket_name: str
    uploaded_files: List[dict]
    failed_files: List[dict] = []
    total_files: int
    successful_uploads: int
    failed_uploads: int
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "uploaded_files": [
                    {
                        "object_name": "rooms/deluxe-101.jpg",
                        "file_size": 1024567,
                        "etag": "d41d8cd98f00b204e9800998ecf8427e"
                    }
                ],
                "failed_files": [],
                "total_files": 1,
                "successful_uploads": 1,
                "failed_uploads": 0,
                "success": True
            }
        }


class FileDownloadRequest(BaseModel):
    """Request model for file download"""
    bucket_name: str
    object_name: str

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg"
            }
        }


class FileMetadata(BaseModel):
    """File metadata model"""
    object_name: str
    size: int
    last_modified: datetime
    etag: str
    content_type: Optional[str] = None
    version_id: Optional[str] = None
    is_dir: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "object_name": "rooms/deluxe-101.jpg",
                "size": 1024567,
                "last_modified": "2025-12-10T10:30:00Z",
                "etag": "d41d8cd98f00b204e9800998ecf8427e",
                "content_type": "image/jpeg",
                "version_id": None,
                "is_dir": False
            }
        }


class ListObjectsRequest(BaseModel):
    """Request model for listing objects in a bucket"""
    bucket_name: str
    prefix: Optional[str] = Field(default="", description="Filter by prefix/folder")
    recursive: bool = Field(default=True, description="List recursively")
    max_keys: int = Field(default=1000, le=10000, description="Maximum objects to return")

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "prefix": "rooms/",
                "recursive": True,
                "max_keys": 100
            }
        }


class ListObjectsResponse(BaseModel):
    """Response model for listing objects"""
    bucket_name: str
    objects: List[FileMetadata]
    count: int
    prefix: str = ""
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "objects": [
                    {
                        "object_name": "rooms/deluxe-101.jpg",
                        "size": 1024567,
                        "last_modified": "2025-12-10T10:30:00Z",
                        "etag": "d41d8cd98f00b204e9800998ecf8427e",
                        "content_type": "image/jpeg",
                        "is_dir": False
                    }
                ],
                "count": 1,
                "prefix": "rooms/",
                "success": True
            }
        }


class FileDeleteRequest(BaseModel):
    """Request model for deleting a file"""
    bucket_name: str
    object_name: str

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg"
            }
        }


class FileDeleteResponse(BaseModel):
    """Response model for file deletion"""
    bucket_name: str
    object_name: str
    message: str
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg",
                "message": "File deleted successfully",
                "success": True
            }
        }


class PresignedUrlRequest(BaseModel):
    """Request model for generating presigned URL"""
    bucket_name: str
    object_name: str
    expiry_seconds: int = Field(
        default=3600,
        ge=1,
        le=604800,
        description="URL expiry time in seconds (max 7 days)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg",
                "expiry_seconds": 3600
            }
        }


class PresignedUrlResponse(BaseModel):
    """Response model for presigned URL"""
    bucket_name: str
    object_name: str
    presigned_url: str
    expiry_seconds: int
    message: str
    success: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "bucket_name": "hotel-images",
                "object_name": "rooms/deluxe-101.jpg",
                "presigned_url": "http://minio:9000/hotel-images/rooms/deluxe-101.jpg?X-Amz-Algorithm=...",
                "expiry_seconds": 3600,
                "message": "Presigned URL generated successfully",
                "success": True
            }
        }
