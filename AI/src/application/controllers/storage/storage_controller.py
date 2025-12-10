"""
MinIO Storage API Controller
Endpoints for bucket and file operations
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Optional
import io

from src.application.dtos.storage.minio_dto import (
    BucketCreateRequest,
    BucketResponse,
    BucketListResponse,
    FileUploadResponse,
    MultiFileUploadResponse,
    ListObjectsRequest,
    ListObjectsResponse,
    FileDeleteResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
    FileMetadata
)
from src.application.services.storage.minio_service import MinioStorageService
from src.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Initialize MinIO service
minio_service = MinioStorageService()


# ============================================================================
# Bucket Endpoints
# ============================================================================

@router.post("/buckets", response_model=BucketResponse, tags=["Buckets"])
async def create_bucket(request: BucketCreateRequest):
    """
    Create a new MinIO bucket
    
    - **bucket_name**: Bucket name (lowercase, alphanumeric, hyphens only, 3-63 chars)
    - **object_lock**: Enable object lock for compliance (optional)
    """
    try:
        result = minio_service.create_bucket(
            bucket_name=request.bucket_name,
            object_lock=request.object_lock
        )
        
        return BucketResponse(
            bucket_name=result["bucket_name"],
            message=result["message"],
            success=result["success"]
        )
        
    except Exception as e:
        logger.error(f"Failed to create bucket: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create bucket: {str(e)}")


@router.get("/buckets", response_model=BucketListResponse, tags=["Buckets"])
async def list_buckets():
    """
    List all MinIO buckets
    
    Returns a list of all available buckets with their metadata.
    """
    try:
        buckets = minio_service.list_buckets()
        
        return BucketListResponse(
            buckets=buckets,
            count=len(buckets),
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to list buckets: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list buckets: {str(e)}")


@router.get("/buckets/{bucket_name}/exists", tags=["Buckets"])
async def check_bucket_exists(bucket_name: str):
    """
    Check if a bucket exists
    
    - **bucket_name**: Name of the bucket to check
    """
    try:
        exists = minio_service.bucket_exists(bucket_name)
        
        return {
            "bucket_name": bucket_name,
            "exists": exists,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Failed to check bucket existence: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to check bucket: {str(e)}")


@router.delete("/buckets/{bucket_name}", tags=["Buckets"])
async def delete_bucket(bucket_name: str):
    """
    Delete a bucket (must be empty)
    
    - **bucket_name**: Name of the bucket to delete
    """
    try:
        result = minio_service.delete_bucket(bucket_name)
        
        return {
            "bucket_name": bucket_name,
            "message": result["message"],
            "success": result["success"]
        }
        
    except Exception as e:
        logger.error(f"Failed to delete bucket: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete bucket: {str(e)}")


# ============================================================================
# File/Object Endpoints
# ============================================================================

@router.post("/files/upload", response_model=FileUploadResponse, tags=["Files"])
async def upload_file(
    bucket_name: str = Form(..., description="Target bucket name"),
    object_name: str = Form(..., description="Object name/path in bucket"),
    file: UploadFile = File(..., description="File to upload")
):
    """
    Upload a single file to MinIO
    
    - **bucket_name**: Target bucket (will be created if doesn't exist)
    - **object_name**: Object path in bucket (e.g., 'images/photo.jpg')
    - **file**: File to upload
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        content_type = file.content_type or "application/octet-stream"
        
        # Upload to MinIO
        result = minio_service.upload_file(
            bucket_name=bucket_name,
            object_name=object_name,
            file_data=io.BytesIO(file_content),
            file_size=file_size,
            content_type=content_type
        )
        
        return FileUploadResponse(**result)
        
    except Exception as e:
        logger.error(f"Failed to upload file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")


@router.post("/files/upload-multiple", response_model=MultiFileUploadResponse, tags=["Files"])
async def upload_multiple_files(
    bucket_name: str = Form(..., description="Target bucket name"),
    prefix: str = Form("", description="Optional prefix/folder for all files"),
    files: List[UploadFile] = File(..., description="Files to upload")
):
    """
    Upload multiple files to MinIO
    
    - **bucket_name**: Target bucket (will be created if doesn't exist)
    - **prefix**: Optional prefix/folder path (e.g., 'images/')
    - **files**: List of files to upload
    """
    try:
        # Prepare files data
        files_data = []
        
        for file in files:
            file_content = await file.read()
            file_size = len(file_content)
            content_type = file.content_type or "application/octet-stream"
            
            files_data.append((
                file.filename,
                io.BytesIO(file_content),
                file_size,
                content_type
            ))
        
        # Upload to MinIO
        result = minio_service.upload_multiple_files(
            bucket_name=bucket_name,
            files_data=files_data,
            prefix=prefix
        )
        
        return MultiFileUploadResponse(**result)
        
    except Exception as e:
        logger.error(f"Failed to upload multiple files: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")


@router.get("/files/download", tags=["Files"])
async def download_file(
    bucket_name: str,
    object_name: str
):
    """
    Download a file from MinIO
    
    - **bucket_name**: Source bucket name
    - **object_name**: Object name/path to download
    
    Returns the file as a streaming response
    """
    try:
        # Get file content
        file_content = minio_service.download_file(bucket_name, object_name)
        
        # Get metadata to determine content type
        metadata = minio_service.get_object_metadata(bucket_name, object_name)
        content_type = metadata.get("content_type", "application/octet-stream")
        
        # Extract filename from object_name
        filename = object_name.split("/")[-1]
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to download file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")


@router.post("/files/list", response_model=ListObjectsResponse, tags=["Files"])
async def list_objects(request: ListObjectsRequest):
    """
    List objects in a bucket
    
    - **bucket_name**: Bucket to list objects from
    - **prefix**: Filter by prefix/folder (e.g., 'images/')
    - **recursive**: List recursively (true) or only top level (false)
    - **max_keys**: Maximum number of objects to return (max 10000)
    """
    try:
        objects = minio_service.list_objects(
            bucket_name=request.bucket_name,
            prefix=request.prefix,
            recursive=request.recursive,
            max_keys=request.max_keys
        )
        
        # Convert to FileMetadata models
        file_metadata_list = [FileMetadata(**obj) for obj in objects]
        
        return ListObjectsResponse(
            bucket_name=request.bucket_name,
            objects=file_metadata_list,
            count=len(file_metadata_list),
            prefix=request.prefix,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to list objects: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list objects: {str(e)}")


@router.delete("/files/delete", response_model=FileDeleteResponse, tags=["Files"])
async def delete_file(
    bucket_name: str,
    object_name: str
):
    """
    Delete a file from MinIO
    
    - **bucket_name**: Bucket containing the file
    - **object_name**: Object name/path to delete
    """
    try:
        result = minio_service.delete_file(bucket_name, object_name)
        
        return FileDeleteResponse(**result)
        
    except Exception as e:
        logger.error(f"Failed to delete file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")


@router.post("/files/presigned-url", response_model=PresignedUrlResponse, tags=["Files"])
async def generate_presigned_url(request: PresignedUrlRequest):
    """
    Generate a presigned URL for temporary file access
    
    - **bucket_name**: Bucket containing the file
    - **object_name**: Object name/path
    - **expiry_seconds**: URL validity duration (default: 3600s = 1 hour, max: 604800s = 7 days)
    
    Returns a temporary URL that can be used to access the file without authentication.
    """
    try:
        url = minio_service.get_presigned_url(
            bucket_name=request.bucket_name,
            object_name=request.object_name,
            expiry_seconds=request.expiry_seconds
        )
        
        return PresignedUrlResponse(
            bucket_name=request.bucket_name,
            object_name=request.object_name,
            presigned_url=url,
            expiry_seconds=request.expiry_seconds,
            message="Presigned URL generated successfully",
            success=True
        )
        
    except Exception as e:
        logger.error(f"Failed to generate presigned URL: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")


@router.get("/files/metadata", tags=["Files"])
async def get_file_metadata(
    bucket_name: str,
    object_name: str
):
    """
    Get metadata for a file
    
    - **bucket_name**: Bucket containing the file
    - **object_name**: Object name/path
    """
    try:
        metadata = minio_service.get_object_metadata(bucket_name, object_name)
        
        return {
            **metadata,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Failed to get file metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get metadata: {str(e)}")


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health", tags=["Health"])
async def storage_health_check():
    """
    Check MinIO storage service health
    """
    try:
        # Try to list buckets as a health check
        buckets = minio_service.list_buckets()
        
        return {
            "status": "healthy",
            "service": "minio-storage",
            "buckets_count": len(buckets),
            "success": True
        }
        
    except Exception as e:
        logger.error(f"MinIO health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "minio-storage",
            "error": str(e),
            "success": False
        }
