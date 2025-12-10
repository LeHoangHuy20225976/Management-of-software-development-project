"""
Unit tests for Storage DTOs
Tests Pydantic models for validation
"""
import pytest
from pydantic import ValidationError
from datetime import datetime

from src.application.dtos.storage.minio_dto import (
    BucketCreateRequest,
    BucketResponse,
    FileUploadResponse,
    ListObjectsRequest,
    PresignedUrlRequest,
    FileMetadata
)


class TestBucketDTOs:
    """Test bucket-related DTOs"""
    
    def test_bucket_create_request_valid(self):
        """Test valid bucket creation request"""
        request = BucketCreateRequest(
            bucket_name="test-bucket",
            object_lock=False
        )
        
        assert request.bucket_name == "test-bucket"
        assert request.object_lock is False
    
    def test_bucket_create_request_uppercase_invalid(self):
        """Test bucket name with uppercase is invalid"""
        with pytest.raises(ValidationError) as exc_info:
            BucketCreateRequest(bucket_name="TEST-BUCKET")
        
        assert "bucket_name" in str(exc_info.value)
    
    def test_bucket_create_request_too_short(self):
        """Test bucket name too short"""
        with pytest.raises(ValidationError):
            BucketCreateRequest(bucket_name="ab")
    
    def test_bucket_create_request_too_long(self):
        """Test bucket name too long"""
        with pytest.raises(ValidationError):
            BucketCreateRequest(bucket_name="a" * 64)
    
    def test_bucket_create_request_special_chars_invalid(self):
        """Test bucket name with invalid special characters"""
        with pytest.raises(ValidationError):
            BucketCreateRequest(bucket_name="test_bucket")
    
    def test_bucket_create_request_valid_with_hyphens(self):
        """Test bucket name with hyphens is valid"""
        request = BucketCreateRequest(bucket_name="test-bucket-name")
        assert request.bucket_name == "test-bucket-name"
    
    def test_bucket_response_valid(self):
        """Test valid bucket response"""
        response = BucketResponse(
            bucket_name="test-bucket",
            creation_date=datetime(2025, 12, 10, 10, 0, 0),
            message="Bucket created",
            success=True
        )
        
        assert response.bucket_name == "test-bucket"
        assert response.success is True


class TestFileUploadDTOs:
    """Test file upload DTOs"""
    
    def test_file_upload_response_valid(self):
        """Test valid file upload response"""
        response = FileUploadResponse(
            bucket_name="test-bucket",
            object_name="file.txt",
            file_size=1024,
            content_type="text/plain",
            etag="abc123",
            version_id=None,
            message="Uploaded",
            success=True
        )
        
        assert response.file_size == 1024
        assert response.content_type == "text/plain"
    
    def test_file_upload_response_required_fields(self):
        """Test file upload response requires certain fields"""
        with pytest.raises(ValidationError):
            FileUploadResponse(
                bucket_name="test-bucket"
                # Missing required fields
            )


class TestListObjectsDTOs:
    """Test object listing DTOs"""
    
    def test_list_objects_request_valid(self):
        """Test valid list objects request"""
        request = ListObjectsRequest(
            bucket_name="test-bucket",
            prefix="images/",
            recursive=True,
            max_keys=100
        )
        
        assert request.bucket_name == "test-bucket"
        assert request.prefix == "images/"
        assert request.max_keys == 100
    
    def test_list_objects_request_defaults(self):
        """Test list objects request with default values"""
        request = ListObjectsRequest(bucket_name="test-bucket")
        
        assert request.prefix == ""
        assert request.recursive is True
        assert request.max_keys == 1000
    
    def test_list_objects_request_max_keys_limit(self):
        """Test max_keys cannot exceed limit"""
        with pytest.raises(ValidationError):
            ListObjectsRequest(
                bucket_name="test-bucket",
                max_keys=20000  # Exceeds limit of 10000
            )
    
    def test_file_metadata_valid(self):
        """Test valid file metadata"""
        metadata = FileMetadata(
            object_name="file.txt",
            size=1024,
            last_modified=datetime(2025, 12, 10, 10, 0, 0),
            etag="abc123",
            content_type="text/plain",
            version_id=None,
            is_dir=False
        )
        
        assert metadata.object_name == "file.txt"
        assert metadata.size == 1024
        assert metadata.is_dir is False


class TestPresignedUrlDTOs:
    """Test presigned URL DTOs"""
    
    def test_presigned_url_request_valid(self):
        """Test valid presigned URL request"""
        request = PresignedUrlRequest(
            bucket_name="test-bucket",
            object_name="file.txt",
            expiry_seconds=3600
        )
        
        assert request.expiry_seconds == 3600
    
    def test_presigned_url_request_default_expiry(self):
        """Test presigned URL request with default expiry"""
        request = PresignedUrlRequest(
            bucket_name="test-bucket",
            object_name="file.txt"
        )
        
        assert request.expiry_seconds == 3600  # Default 1 hour
    
    def test_presigned_url_request_min_expiry(self):
        """Test presigned URL with minimum expiry"""
        with pytest.raises(ValidationError):
            PresignedUrlRequest(
                bucket_name="test-bucket",
                object_name="file.txt",
                expiry_seconds=0
            )
    
    def test_presigned_url_request_max_expiry(self):
        """Test presigned URL with maximum expiry (7 days)"""
        with pytest.raises(ValidationError):
            PresignedUrlRequest(
                bucket_name="test-bucket",
                object_name="file.txt",
                expiry_seconds=604801  # 7 days + 1 second
            )
    
    def test_presigned_url_request_valid_max(self):
        """Test presigned URL with exactly 7 days expiry"""
        request = PresignedUrlRequest(
            bucket_name="test-bucket",
            object_name="file.txt",
            expiry_seconds=604800  # Exactly 7 days
        )
        
        assert request.expiry_seconds == 604800


class TestDTOSerialization:
    """Test DTO serialization and deserialization"""
    
    def test_bucket_response_to_dict(self):
        """Test converting BucketResponse to dict"""
        response = BucketResponse(
            bucket_name="test-bucket",
            message="Created",
            success=True
        )
        
        data = response.model_dump()
        assert data["bucket_name"] == "test-bucket"
        assert data["success"] is True
    
    def test_file_metadata_from_dict(self):
        """Test creating FileMetadata from dict"""
        data = {
            "object_name": "file.txt",
            "size": 1024,
            "last_modified": "2025-12-10T10:00:00",
            "etag": "abc123",
            "content_type": "text/plain"
        }
        
        metadata = FileMetadata(**data)
        assert metadata.object_name == "file.txt"
        assert metadata.size == 1024
    
    def test_dto_json_serialization(self):
        """Test JSON serialization of DTOs"""
        request = BucketCreateRequest(bucket_name="test-bucket")
        json_str = request.model_dump_json()
        
        assert "test-bucket" in json_str
        assert isinstance(json_str, str)
