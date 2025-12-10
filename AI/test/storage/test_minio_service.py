"""
Unit tests for MinIO Storage Service
Tests the MinioStorageService class methods
"""
import pytest
import io
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from minio.error import S3Error

from src.application.services.storage.minio_service import MinioStorageService


@pytest.fixture
def minio_service():
    """Fixture to create MinioStorageService with mocked client"""
    with patch('src.application.services.storage.minio_service.Minio') as mock_minio:
        service = MinioStorageService(
            endpoint="localhost:9000",
            access_key="test_access",
            secret_key="test_secret",
            secure=False
        )
        service.client = mock_minio.return_value
        yield service


@pytest.fixture
def mock_bucket():
    """Fixture for mock bucket object"""
    bucket = Mock()
    bucket.name = "test-bucket"
    bucket.creation_date = datetime(2025, 12, 10, 10, 0, 0)
    return bucket


@pytest.fixture
def mock_object():
    """Fixture for mock MinIO object"""
    obj = Mock()
    obj.object_name = "test/file.txt"
    obj.size = 1024
    obj.last_modified = datetime(2025, 12, 10, 10, 0, 0)
    obj.etag = "abc123"
    obj.content_type = "text/plain"
    obj.version_id = None
    obj.is_dir = False
    return obj


class TestMinioServiceInitialization:
    """Test MinioStorageService initialization"""
    
    def test_init_with_custom_params(self):
        """Test initialization with custom parameters"""
        with patch('src.application.services.storage.minio_service.Minio') as mock_minio:
            service = MinioStorageService(
                endpoint="custom:9000",
                access_key="custom_key",
                secret_key="custom_secret",
                secure=True
            )
            
            assert service.endpoint == "custom:9000"
            assert service.access_key == "custom_key"
            assert service.secret_key == "custom_secret"
            assert service.secure is True
            mock_minio.assert_called_once_with(
                endpoint="custom:9000",
                access_key="custom_key",
                secret_key="custom_secret",
                secure=True
            )
    
    def test_init_with_env_defaults(self):
        """Test initialization with environment variable defaults"""
        with patch('src.application.services.storage.minio_service.Minio'):
            with patch.dict('os.environ', {
                'MINIO_ENDPOINT': 'env:9000',
                'MINIO_ROOT_USER': 'env_user',
                'MINIO_ROOT_PASSWORD': 'env_pass'
            }):
                service = MinioStorageService()
                
                assert service.endpoint == "env:9000"
                assert service.access_key == "env_user"
                assert service.secret_key == "env_pass"
    
    def test_init_endpoint_parsing(self):
        """Test endpoint URL parsing removes protocol"""
        with patch('src.application.services.storage.minio_service.Minio'):
            service = MinioStorageService(endpoint="http://localhost:9000")
            assert service.endpoint == "localhost:9000"


class TestBucketOperations:
    """Test bucket-related operations"""
    
    def test_create_bucket_success(self, minio_service):
        """Test successful bucket creation"""
        minio_service.client.bucket_exists.return_value = False
        minio_service.client.make_bucket.return_value = None
        
        result = minio_service.create_bucket("test-bucket")
        
        assert result["success"] is True
        assert result["bucket_name"] == "test-bucket"
        assert result["message"] == "Bucket created successfully"
        assert result["already_exists"] is False
        minio_service.client.make_bucket.assert_called_once_with("test-bucket", object_lock=False)
    
    def test_create_bucket_already_exists(self, minio_service):
        """Test creating a bucket that already exists"""
        minio_service.client.bucket_exists.return_value = True
        
        result = minio_service.create_bucket("existing-bucket")
        
        assert result["success"] is True
        assert result["bucket_name"] == "existing-bucket"
        assert result["message"] == "Bucket already exists"
        assert result["already_exists"] is True
        minio_service.client.make_bucket.assert_not_called()
    
    def test_create_bucket_with_object_lock(self, minio_service):
        """Test creating bucket with object lock enabled"""
        minio_service.client.bucket_exists.return_value = False
        
        minio_service.create_bucket("locked-bucket", object_lock=True)
        
        minio_service.client.make_bucket.assert_called_once_with("locked-bucket", object_lock=True)
    
    def test_create_bucket_error(self, minio_service):
        """Test bucket creation error handling"""
        minio_service.client.bucket_exists.return_value = False
        minio_service.client.make_bucket.side_effect = S3Error(
            "BucketAlreadyOwnedByYou",
            "Bucket already owned by you",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        with pytest.raises(S3Error):
            minio_service.create_bucket("error-bucket")
    
    def test_list_buckets_success(self, minio_service, mock_bucket):
        """Test listing all buckets"""
        minio_service.client.list_buckets.return_value = [mock_bucket]
        
        result = minio_service.list_buckets()
        
        assert len(result) == 1
        assert result[0]["name"] == "test-bucket"
        assert "creation_date" in result[0]
        minio_service.client.list_buckets.assert_called_once()
    
    def test_list_buckets_empty(self, minio_service):
        """Test listing buckets when none exist"""
        minio_service.client.list_buckets.return_value = []
        
        result = minio_service.list_buckets()
        
        assert result == []
    
    def test_bucket_exists_true(self, minio_service):
        """Test checking if bucket exists - returns True"""
        minio_service.client.bucket_exists.return_value = True
        
        result = minio_service.bucket_exists("test-bucket")
        
        assert result is True
        minio_service.client.bucket_exists.assert_called_once_with("test-bucket")
    
    def test_bucket_exists_false(self, minio_service):
        """Test checking if bucket exists - returns False"""
        minio_service.client.bucket_exists.return_value = False
        
        result = minio_service.bucket_exists("nonexistent-bucket")
        
        assert result is False
    
    def test_bucket_exists_error(self, minio_service):
        """Test bucket exists with S3 error"""
        minio_service.client.bucket_exists.side_effect = S3Error(
            "NoSuchBucket",
            "Bucket does not exist",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        result = minio_service.bucket_exists("error-bucket")
        
        assert result is False
    
    def test_delete_bucket_success(self, minio_service):
        """Test successful bucket deletion"""
        minio_service.client.remove_bucket.return_value = None
        
        result = minio_service.delete_bucket("test-bucket")
        
        assert result["success"] is True
        assert result["bucket_name"] == "test-bucket"
        assert result["message"] == "Bucket deleted successfully"
        minio_service.client.remove_bucket.assert_called_once_with("test-bucket")
    
    def test_delete_bucket_error(self, minio_service):
        """Test bucket deletion error"""
        minio_service.client.remove_bucket.side_effect = S3Error(
            "BucketNotEmpty",
            "Bucket is not empty",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        with pytest.raises(S3Error):
            minio_service.delete_bucket("full-bucket")


class TestFileOperations:
    """Test file/object operations"""
    
    def test_upload_file_success(self, minio_service):
        """Test successful file upload"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        file_data = io.BytesIO(b"test content")
        file_size = 12
        
        result = minio_service.upload_file(
            bucket_name="test-bucket",
            object_name="test.txt",
            file_data=file_data,
            file_size=file_size,
            content_type="text/plain"
        )
        
        assert result["success"] is True
        assert result["bucket_name"] == "test-bucket"
        assert result["object_name"] == "test.txt"
        assert result["file_size"] == file_size
        assert result["content_type"] == "text/plain"
        assert result["etag"] == "abc123"
        minio_service.client.put_object.assert_called_once()
    
    def test_upload_file_creates_bucket_if_not_exists(self, minio_service):
        """Test upload creates bucket if it doesn't exist"""
        minio_service.client.bucket_exists.return_value = False
        minio_service.client.make_bucket.return_value = None
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        file_data = io.BytesIO(b"test")
        
        minio_service.upload_file(
            bucket_name="new-bucket",
            object_name="file.txt",
            file_data=file_data,
            file_size=4
        )
        
        minio_service.client.make_bucket.assert_called_once_with("new-bucket")
    
    def test_upload_file_with_metadata(self, minio_service):
        """Test file upload with custom metadata"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        file_data = io.BytesIO(b"test")
        metadata = {"user": "test_user", "department": "engineering"}
        
        minio_service.upload_file(
            bucket_name="test-bucket",
            object_name="file.txt",
            file_data=file_data,
            file_size=4,
            metadata=metadata
        )
        
        call_args = minio_service.client.put_object.call_args
        assert call_args.kwargs["metadata"] == metadata
    
    def test_upload_multiple_files_success(self, minio_service):
        """Test uploading multiple files"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        files_data = [
            ("file1.txt", io.BytesIO(b"content1"), 8, "text/plain"),
            ("file2.txt", io.BytesIO(b"content2"), 8, "text/plain"),
            ("file3.txt", io.BytesIO(b"content3"), 8, "text/plain"),
        ]
        
        result = minio_service.upload_multiple_files(
            bucket_name="test-bucket",
            files_data=files_data,
            prefix="docs/"
        )
        
        assert result["success"] is True
        assert result["total_files"] == 3
        assert result["successful_uploads"] == 3
        assert result["failed_uploads"] == 0
        assert len(result["uploaded_files"]) == 3
        assert result["uploaded_files"][0]["object_name"] == "docs/file1.txt"
    
    def test_upload_multiple_files_partial_failure(self, minio_service):
        """Test multiple file upload with some failures"""
        minio_service.client.bucket_exists.return_value = True
        
        # First upload succeeds, second fails, third succeeds
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        
        minio_service.client.put_object.side_effect = [
            mock_result,
            S3Error("Error", "Upload failed", "resource", "id", "host", Mock()),
            mock_result
        ]
        
        files_data = [
            ("file1.txt", io.BytesIO(b"content1"), 8, "text/plain"),
            ("file2.txt", io.BytesIO(b"content2"), 8, "text/plain"),
            ("file3.txt", io.BytesIO(b"content3"), 8, "text/plain"),
        ]
        
        result = minio_service.upload_multiple_files(
            bucket_name="test-bucket",
            files_data=files_data
        )
        
        assert result["success"] is False
        assert result["total_files"] == 3
        assert result["successful_uploads"] == 2
        assert result["failed_uploads"] == 1
        assert len(result["failed_files"]) == 1
        assert result["failed_files"][0]["object_name"] == "file2.txt"
    
    def test_download_file_success(self, minio_service):
        """Test successful file download"""
        mock_response = Mock()
        mock_response.read.return_value = b"file content"
        minio_service.client.get_object.return_value = mock_response
        
        result = minio_service.download_file("test-bucket", "file.txt")
        
        assert result == b"file content"
        minio_service.client.get_object.assert_called_once_with("test-bucket", "file.txt")
        mock_response.close.assert_called_once()
        mock_response.release_conn.assert_called_once()
    
    def test_download_file_not_found(self, minio_service):
        """Test downloading non-existent file"""
        minio_service.client.get_object.side_effect = S3Error(
            "NoSuchKey",
            "The specified key does not exist",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        with pytest.raises(S3Error):
            minio_service.download_file("test-bucket", "nonexistent.txt")
    
    def test_list_objects_success(self, minio_service, mock_object):
        """Test listing objects in bucket"""
        minio_service.client.list_objects.return_value = [mock_object]
        
        result = minio_service.list_objects(
            bucket_name="test-bucket",
            prefix="test/",
            recursive=True
        )
        
        assert len(result) == 1
        assert result[0]["object_name"] == "test/file.txt"
        assert result[0]["size"] == 1024
        assert result[0]["content_type"] == "text/plain"
        minio_service.client.list_objects.assert_called_once_with(
            bucket_name="test-bucket",
            prefix="test/",
            recursive=True
        )
    
    def test_list_objects_with_max_keys(self, minio_service, mock_object):
        """Test listing objects with max_keys limit"""
        # Create 5 mock objects
        objects = [mock_object for _ in range(5)]
        minio_service.client.list_objects.return_value = objects
        
        result = minio_service.list_objects(
            bucket_name="test-bucket",
            max_keys=3
        )
        
        assert len(result) == 3
    
    def test_list_objects_empty(self, minio_service):
        """Test listing objects in empty bucket"""
        minio_service.client.list_objects.return_value = []
        
        result = minio_service.list_objects("test-bucket")
        
        assert result == []
    
    def test_delete_file_success(self, minio_service):
        """Test successful file deletion"""
        minio_service.client.remove_object.return_value = None
        
        result = minio_service.delete_file("test-bucket", "file.txt")
        
        assert result["success"] is True
        assert result["bucket_name"] == "test-bucket"
        assert result["object_name"] == "file.txt"
        assert result["message"] == "File deleted successfully"
        minio_service.client.remove_object.assert_called_once_with("test-bucket", "file.txt")
    
    def test_delete_file_error(self, minio_service):
        """Test file deletion error"""
        minio_service.client.remove_object.side_effect = S3Error(
            "NoSuchKey",
            "The specified key does not exist",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        with pytest.raises(S3Error):
            minio_service.delete_file("test-bucket", "nonexistent.txt")
    
    def test_get_presigned_url_success(self, minio_service):
        """Test generating presigned URL"""
        expected_url = "http://localhost:9000/test-bucket/file.txt?signature=abc123"
        minio_service.client.presigned_get_object.return_value = expected_url
        
        result = minio_service.get_presigned_url(
            bucket_name="test-bucket",
            object_name="file.txt",
            expiry_seconds=3600
        )
        
        assert result == expected_url
        minio_service.client.presigned_get_object.assert_called_once()
    
    def test_get_presigned_url_max_expiry(self, minio_service):
        """Test presigned URL respects max expiry of 7 days"""
        minio_service.client.presigned_get_object.return_value = "http://url"
        
        # Try to set expiry to 10 days (864000 seconds)
        minio_service.get_presigned_url(
            bucket_name="test-bucket",
            object_name="file.txt",
            expiry_seconds=864000
        )
        
        # Should be capped at 7 days (604800 seconds)
        call_args = minio_service.client.presigned_get_object.call_args
        expiry_timedelta = call_args.kwargs["expires"]
        assert expiry_timedelta.total_seconds() == 604800
    
    def test_get_object_metadata_success(self, minio_service):
        """Test getting object metadata"""
        mock_stat = Mock()
        mock_stat.size = 1024
        mock_stat.last_modified = datetime(2025, 12, 10, 10, 0, 0)
        mock_stat.etag = "abc123"
        mock_stat.content_type = "text/plain"
        mock_stat.metadata = {"user": "test"}
        mock_stat.version_id = None
        
        minio_service.client.stat_object.return_value = mock_stat
        
        result = minio_service.get_object_metadata("test-bucket", "file.txt")
        
        assert result["object_name"] == "file.txt"
        assert result["size"] == 1024
        assert result["etag"] == "abc123"
        assert result["content_type"] == "text/plain"
        assert result["metadata"] == {"user": "test"}
        minio_service.client.stat_object.assert_called_once_with("test-bucket", "file.txt")
    
    def test_get_object_metadata_not_found(self, minio_service):
        """Test getting metadata for non-existent object"""
        minio_service.client.stat_object.side_effect = S3Error(
            "NoSuchKey",
            "The specified key does not exist",
            "resource",
            "request_id",
            "host_id",
            Mock()
        )
        
        with pytest.raises(S3Error):
            minio_service.get_object_metadata("test-bucket", "nonexistent.txt")


class TestEdgeCases:
    """Test edge cases and error conditions"""
    
    def test_upload_empty_file(self, minio_service):
        """Test uploading empty file"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "d41d8cd98f00b204e9800998ecf8427e"  # MD5 of empty string
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        file_data = io.BytesIO(b"")
        
        result = minio_service.upload_file(
            bucket_name="test-bucket",
            object_name="empty.txt",
            file_data=file_data,
            file_size=0
        )
        
        assert result["success"] is True
        assert result["file_size"] == 0
    
    def test_large_file_upload(self, minio_service):
        """Test uploading large file"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        # Simulate 100MB file
        large_size = 100 * 1024 * 1024
        file_data = io.BytesIO(b"x" * 1024)  # Just a small sample for testing
        
        result = minio_service.upload_file(
            bucket_name="test-bucket",
            object_name="large.bin",
            file_data=file_data,
            file_size=large_size
        )
        
        assert result["success"] is True
        assert result["file_size"] == large_size
    
    def test_special_characters_in_object_name(self, minio_service):
        """Test object names with special characters"""
        minio_service.client.bucket_exists.return_value = True
        
        mock_result = Mock()
        mock_result.etag = "abc123"
        mock_result.version_id = None
        minio_service.client.put_object.return_value = mock_result
        
        special_name = "folder/file with spaces & special-chars_123.txt"
        file_data = io.BytesIO(b"test")
        
        result = minio_service.upload_file(
            bucket_name="test-bucket",
            object_name=special_name,
            file_data=file_data,
            file_size=4
        )
        
        assert result["success"] is True
        assert result["object_name"] == special_name
