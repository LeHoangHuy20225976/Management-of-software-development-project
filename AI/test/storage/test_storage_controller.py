"""
Unit tests for MinIO Storage Controller
Tests the FastAPI endpoints
"""
import pytest
import io
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from src.application.controllers.storage.main import app


@pytest.fixture
def client():
    """Fixture to create test client"""
    return TestClient(app)


@pytest.fixture
def mock_minio_service():
    """Fixture to mock MinioStorageService"""
    with patch('src.application.controllers.storage.storage_controller.minio_service') as mock:
        yield mock


class TestHealthEndpoints:
    """Test health check endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns service info"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Storage Service"
        assert data["status"] == "running"
        assert data["version"] == "1.0.0"
    
    def test_health_check_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "storage"
    
    def test_storage_health_check_success(self, client, mock_minio_service):
        """Test storage health check when MinIO is available"""
        mock_minio_service.list_buckets.return_value = [
            {"name": "bucket1"},
            {"name": "bucket2"}
        ]
        
        response = client.get("/storage/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "minio-storage"
        assert data["buckets_count"] == 2
    
    def test_storage_health_check_failure(self, client, mock_minio_service):
        """Test storage health check when MinIO is unavailable"""
        mock_minio_service.list_buckets.side_effect = Exception("Connection failed")
        
        response = client.get("/storage/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "error" in data


class TestBucketEndpoints:
    """Test bucket management endpoints"""
    
    def test_create_bucket_success(self, client, mock_minio_service):
        """Test successful bucket creation"""
        mock_minio_service.create_bucket.return_value = {
            "bucket_name": "test-bucket",
            "message": "Bucket created successfully",
            "success": True
        }
        
        response = client.post(
            "/storage/buckets",
            json={"bucket_name": "test-bucket", "object_lock": False}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["bucket_name"] == "test-bucket"
        assert data["success"] is True
    
    def test_create_bucket_invalid_name(self, client):
        """Test bucket creation with invalid name"""
        response = client.post(
            "/storage/buckets",
            json={"bucket_name": "INVALID_NAME", "object_lock": False}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_create_bucket_too_short_name(self, client):
        """Test bucket creation with name too short"""
        response = client.post(
            "/storage/buckets",
            json={"bucket_name": "ab", "object_lock": False}
        )
        
        assert response.status_code == 422
    
    def test_create_bucket_error(self, client, mock_minio_service):
        """Test bucket creation error handling"""
        mock_minio_service.create_bucket.side_effect = Exception("MinIO error")
        
        response = client.post(
            "/storage/buckets",
            json={"bucket_name": "test-bucket", "object_lock": False}
        )
        
        assert response.status_code == 500
    
    def test_list_buckets_success(self, client, mock_minio_service):
        """Test listing all buckets"""
        mock_minio_service.list_buckets.return_value = [
            {"name": "bucket1", "creation_date": "2025-12-10T10:00:00"},
            {"name": "bucket2", "creation_date": "2025-12-10T11:00:00"}
        ]
        
        response = client.get("/storage/buckets")
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["buckets"]) == 2
        assert data["success"] is True
    
    def test_list_buckets_empty(self, client, mock_minio_service):
        """Test listing buckets when none exist"""
        mock_minio_service.list_buckets.return_value = []
        
        response = client.get("/storage/buckets")
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert data["buckets"] == []
    
    def test_check_bucket_exists_true(self, client, mock_minio_service):
        """Test checking if bucket exists - returns True"""
        mock_minio_service.bucket_exists.return_value = True
        
        response = client.get("/storage/buckets/test-bucket/exists")
        
        assert response.status_code == 200
        data = response.json()
        assert data["bucket_name"] == "test-bucket"
        assert data["exists"] is True
    
    def test_check_bucket_exists_false(self, client, mock_minio_service):
        """Test checking if bucket exists - returns False"""
        mock_minio_service.bucket_exists.return_value = False
        
        response = client.get("/storage/buckets/nonexistent/exists")
        
        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is False
    
    def test_delete_bucket_success(self, client, mock_minio_service):
        """Test successful bucket deletion"""
        mock_minio_service.delete_bucket.return_value = {
            "bucket_name": "test-bucket",
            "message": "Bucket deleted successfully",
            "success": True
        }
        
        response = client.delete("/storage/buckets/test-bucket")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_delete_bucket_error(self, client, mock_minio_service):
        """Test bucket deletion error"""
        mock_minio_service.delete_bucket.side_effect = Exception("Bucket not empty")
        
        response = client.delete("/storage/buckets/test-bucket")
        
        assert response.status_code == 500


class TestFileUploadEndpoints:
    """Test file upload endpoints"""
    
    def test_upload_file_success(self, client, mock_minio_service):
        """Test successful single file upload"""
        mock_minio_service.upload_file.return_value = {
            "bucket_name": "test-bucket",
            "object_name": "test.txt",
            "file_size": 12,
            "content_type": "text/plain",
            "etag": "abc123",
            "version_id": None,
            "message": "File uploaded successfully",
            "success": True
        }
        
        files = {"file": ("test.txt", io.BytesIO(b"test content"), "text/plain")}
        data = {
            "bucket_name": "test-bucket",
            "object_name": "uploads/test.txt"
        }
        
        response = client.post("/storage/files/upload", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["object_name"] == "test.txt"
    
    def test_upload_file_missing_parameters(self, client):
        """Test file upload with missing parameters"""
        files = {"file": ("test.txt", io.BytesIO(b"test"), "text/plain")}
        
        # Missing bucket_name
        response = client.post("/storage/files/upload", files=files)
        
        assert response.status_code == 422
    
    def test_upload_multiple_files_success(self, client, mock_minio_service):
        """Test uploading multiple files"""
        mock_minio_service.upload_multiple_files.return_value = {
            "bucket_name": "test-bucket",
            "uploaded_files": [
                {"object_name": "prefix/file1.txt", "file_size": 10, "etag": "abc1"},
                {"object_name": "prefix/file2.txt", "file_size": 20, "etag": "abc2"}
            ],
            "failed_files": [],
            "total_files": 2,
            "successful_uploads": 2,
            "failed_uploads": 0,
            "success": True
        }
        
        files = [
            ("files", ("file1.txt", io.BytesIO(b"content1"), "text/plain")),
            ("files", ("file2.txt", io.BytesIO(b"content2"), "text/plain"))
        ]
        data = {
            "bucket_name": "test-bucket",
            "prefix": "prefix/"
        }
        
        response = client.post("/storage/files/upload-multiple", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["total_files"] == 2
        assert result["successful_uploads"] == 2
    
    def test_upload_multiple_files_partial_failure(self, client, mock_minio_service):
        """Test multiple file upload with some failures"""
        mock_minio_service.upload_multiple_files.return_value = {
            "bucket_name": "test-bucket",
            "uploaded_files": [{"object_name": "file1.txt", "file_size": 10, "etag": "abc1"}],
            "failed_files": [{"object_name": "file2.txt", "error": "Upload failed"}],
            "total_files": 2,
            "successful_uploads": 1,
            "failed_uploads": 1,
            "success": False
        }
        
        files = [
            ("files", ("file1.txt", io.BytesIO(b"content1"), "text/plain")),
            ("files", ("file2.txt", io.BytesIO(b"content2"), "text/plain"))
        ]
        data = {"bucket_name": "test-bucket"}
        
        response = client.post("/storage/files/upload-multiple", files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is False
        assert result["failed_uploads"] == 1


class TestFileDownloadEndpoints:
    """Test file download endpoints"""
    
    def test_download_file_success(self, client, mock_minio_service):
        """Test successful file download"""
        mock_minio_service.download_file.return_value = b"file content"
        mock_minio_service.get_object_metadata.return_value = {
            "content_type": "text/plain"
        }
        
        response = client.get(
            "/storage/files/download",
            params={"bucket_name": "test-bucket", "object_name": "test.txt"}
        )
        
        assert response.status_code == 200
        assert response.content == b"file content"
        assert "attachment" in response.headers["content-disposition"]
    
    def test_download_file_not_found(self, client, mock_minio_service):
        """Test downloading non-existent file"""
        mock_minio_service.download_file.side_effect = Exception("File not found")
        
        response = client.get(
            "/storage/files/download",
            params={"bucket_name": "test-bucket", "object_name": "nonexistent.txt"}
        )
        
        assert response.status_code == 500


class TestFileListingEndpoints:
    """Test file listing endpoints"""
    
    def test_list_objects_success(self, client, mock_minio_service):
        """Test listing objects in bucket"""
        mock_minio_service.list_objects.return_value = [
            {
                "object_name": "file1.txt",
                "size": 100,
                "last_modified": "2025-12-10T10:00:00",
                "etag": "abc1",
                "content_type": "text/plain",
                "version_id": None,
                "is_dir": False
            },
            {
                "object_name": "file2.txt",
                "size": 200,
                "last_modified": "2025-12-10T11:00:00",
                "etag": "abc2",
                "content_type": "text/plain",
                "version_id": None,
                "is_dir": False
            }
        ]
        
        response = client.post(
            "/storage/files/list",
            json={
                "bucket_name": "test-bucket",
                "prefix": "",
                "recursive": True,
                "max_keys": 100
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        assert len(data["objects"]) == 2
    
    def test_list_objects_with_prefix(self, client, mock_minio_service):
        """Test listing objects with prefix filter"""
        mock_minio_service.list_objects.return_value = [
            {
                "object_name": "images/photo.jpg",
                "size": 1000,
                "last_modified": "2025-12-10T10:00:00",
                "etag": "abc",
                "content_type": "image/jpeg",
                "version_id": None,
                "is_dir": False
            }
        ]
        
        response = client.post(
            "/storage/files/list",
            json={
                "bucket_name": "test-bucket",
                "prefix": "images/",
                "recursive": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["prefix"] == "images/"
        assert data["count"] == 1
    
    def test_list_objects_empty(self, client, mock_minio_service):
        """Test listing objects in empty bucket"""
        mock_minio_service.list_objects.return_value = []
        
        response = client.post(
            "/storage/files/list",
            json={"bucket_name": "empty-bucket"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert data["objects"] == []


class TestFileMetadataEndpoints:
    """Test file metadata endpoints"""
    
    def test_get_file_metadata_success(self, client, mock_minio_service):
        """Test getting file metadata"""
        mock_minio_service.get_object_metadata.return_value = {
            "object_name": "test.txt",
            "size": 100,
            "last_modified": "2025-12-10T10:00:00",
            "etag": "abc123",
            "content_type": "text/plain",
            "metadata": {"user": "test"},
            "version_id": None
        }
        
        response = client.get(
            "/storage/files/metadata",
            params={"bucket_name": "test-bucket", "object_name": "test.txt"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["object_name"] == "test.txt"
        assert data["size"] == 100
        assert data["success"] is True
    
    def test_generate_presigned_url_success(self, client, mock_minio_service):
        """Test generating presigned URL"""
        mock_minio_service.get_presigned_url.return_value = "http://localhost:9000/bucket/file?signature=abc"
        
        response = client.post(
            "/storage/files/presigned-url",
            json={
                "bucket_name": "test-bucket",
                "object_name": "file.txt",
                "expiry_seconds": 3600
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "presigned_url" in data
        assert data["expiry_seconds"] == 3600
    
    def test_generate_presigned_url_invalid_expiry(self, client):
        """Test presigned URL with invalid expiry time"""
        response = client.post(
            "/storage/files/presigned-url",
            json={
                "bucket_name": "test-bucket",
                "object_name": "file.txt",
                "expiry_seconds": 1000000  # More than 7 days
            }
        )
        
        assert response.status_code == 422


class TestFileDeletionEndpoints:
    """Test file deletion endpoints"""
    
    def test_delete_file_success(self, client, mock_minio_service):
        """Test successful file deletion"""
        mock_minio_service.delete_file.return_value = {
            "bucket_name": "test-bucket",
            "object_name": "file.txt",
            "message": "File deleted successfully",
            "success": True
        }
        
        response = client.delete(
            "/storage/files/delete",
            params={"bucket_name": "test-bucket", "object_name": "file.txt"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_delete_file_not_found(self, client, mock_minio_service):
        """Test deleting non-existent file"""
        mock_minio_service.delete_file.side_effect = Exception("File not found")
        
        response = client.delete(
            "/storage/files/delete",
            params={"bucket_name": "test-bucket", "object_name": "nonexistent.txt"}
        )
        
        assert response.status_code == 500
