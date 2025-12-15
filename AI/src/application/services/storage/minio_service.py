"""
MinIO Storage Service for bucket and file operations
"""
from minio import Minio
from minio.error import S3Error
from typing import List, Optional, BinaryIO
import os
from datetime import timedelta
import io
from urllib.parse import urlparse

from src.utils.logger import get_logger

logger = get_logger(__name__)


class MinioStorageService:
    """
    MinIO storage service for managing buckets and objects.
    
    Features:
    - Create and manage buckets
    - Upload single or multiple files
    - Download files
    - List objects with filtering
    - Generate presigned URLs
    - Delete objects
    """
    
    def __init__(
        self,
        endpoint: str = None,
        access_key: str = None,
        secret_key: str = None,
        secure: bool = False
    ):
        """
        Initialize MinIO client
        
        Args:
            endpoint: MinIO server endpoint (default: from env MINIO_ENDPOINT)
            access_key: MinIO access key (default: from env MINIO_ACCESS_KEY)
            secret_key: MinIO secret key (default: from env MINIO_SECRET_KEY)
            secure: Use HTTPS (default: False for local development)
        """
        self.endpoint = endpoint or os.getenv("MINIO_ENDPOINT", "localhost:9000")
        self.access_key = access_key or os.getenv("MINIO_ROOT_USER", os.getenv("MINIO_ACCESS_KEY", "minio_admin"))
        self.secret_key = secret_key or os.getenv("MINIO_ROOT_PASSWORD", os.getenv("MINIO_SECRET_KEY", "minio_password_123"))
        self.secure = secure
        
        # Parse endpoint to remove protocol if present
        parsed = urlparse(self.endpoint if "://" in self.endpoint else f"http://{self.endpoint}")
        self.endpoint = parsed.netloc or parsed.path
        
        # Initialize MinIO client
        self.client = Minio(
            endpoint=self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure
        )
        
        logger.info(f"MinIO client initialized: {self.endpoint}")
    
    # ========================================================================
    # Bucket Operations
    # ========================================================================
    
    def create_bucket(self, bucket_name: str, object_lock: bool = False) -> dict:
        """
        Create a new bucket
        
        Args:
            bucket_name: Name of the bucket (must be DNS-compliant)
            object_lock: Enable object lock for compliance
            
        Returns:
            dict with bucket info
            
        Raises:
            S3Error: If bucket creation fails
        """
        try:
            # Check if bucket already exists
            if self.client.bucket_exists(bucket_name):
                logger.warning(f"Bucket already exists: {bucket_name}")
                return {
                    "bucket_name": bucket_name,
                    "message": "Bucket already exists",
                    "success": True,
                    "already_exists": True
                }
            
            # Create bucket
            self.client.make_bucket(bucket_name, object_lock=object_lock)
            logger.info(f"Bucket created: {bucket_name}")
            
            return {
                "bucket_name": bucket_name,
                "message": "Bucket created successfully",
                "success": True,
                "already_exists": False
            }
            
        except S3Error as e:
            logger.error(f"Failed to create bucket {bucket_name}: {e}")
            raise
    
    def list_buckets(self) -> List[dict]:
        """
        List all buckets
        
        Returns:
            List of bucket information dictionaries
        """
        try:
            buckets = self.client.list_buckets()
            result = [
                {
                    "name": bucket.name,
                    "creation_date": bucket.creation_date.isoformat() if bucket.creation_date else None
                }
                for bucket in buckets
            ]
            logger.info(f"Listed {len(result)} buckets")
            return result
            
        except S3Error as e:
            logger.error(f"Failed to list buckets: {e}")
            raise
    
    def bucket_exists(self, bucket_name: str) -> bool:
        """
        Check if bucket exists
        
        Args:
            bucket_name: Name of the bucket
            
        Returns:
            True if bucket exists, False otherwise
        """
        try:
            exists = self.client.bucket_exists(bucket_name)
            return exists
        except S3Error as e:
            logger.error(f"Error checking bucket existence: {e}")
            return False
    
    def delete_bucket(self, bucket_name: str) -> dict:
        """
        Delete a bucket (must be empty)
        
        Args:
            bucket_name: Name of the bucket to delete
            
        Returns:
            dict with deletion status
        """
        try:
            self.client.remove_bucket(bucket_name)
            logger.info(f"Bucket deleted: {bucket_name}")
            return {
                "bucket_name": bucket_name,
                "message": "Bucket deleted successfully",
                "success": True
            }
        except S3Error as e:
            logger.error(f"Failed to delete bucket {bucket_name}: {e}")
            raise
    
    # ========================================================================
    # Object/File Operations
    # ========================================================================
    
    def upload_file(
        self,
        bucket_name: str,
        object_name: str,
        file_data: BinaryIO,
        file_size: int,
        content_type: str = "application/octet-stream",
        metadata: dict = None
    ) -> dict:
        """
        Upload a file to MinIO
        
        Args:
            bucket_name: Target bucket name
            object_name: Object name (path) in bucket
            file_data: File-like object (binary mode)
            file_size: Size of the file in bytes
            content_type: MIME type of the file
            metadata: Optional metadata dictionary
            
        Returns:
            dict with upload result
        """
        try:
            # Ensure bucket exists
            if not self.bucket_exists(bucket_name):
                self.create_bucket(bucket_name)
            
            # Upload file
            result = self.client.put_object(
                bucket_name=bucket_name,
                object_name=object_name,
                data=file_data,
                length=file_size,
                content_type=content_type,
                metadata=metadata
            )
            
            logger.info(f"File uploaded: {bucket_name}/{object_name} ({file_size} bytes)")
            
            return {
                "bucket_name": bucket_name,
                "object_name": object_name,
                "file_size": file_size,
                "content_type": content_type,
                "etag": result.etag,
                "version_id": result.version_id,
                "message": "File uploaded successfully",
                "success": True
            }
            
        except S3Error as e:
            logger.error(f"Failed to upload file {object_name}: {e}")
            raise
    
    def upload_multiple_files(
        self,
        bucket_name: str,
        files_data: List[tuple],  # [(object_name, file_data, file_size, content_type), ...]
        prefix: str = ""
    ) -> dict:
        """
        Upload multiple files to MinIO
        
        Args:
            bucket_name: Target bucket name
            files_data: List of tuples (object_name, file_data, file_size, content_type)
            prefix: Optional prefix to prepend to all object names
            
        Returns:
            dict with upload results
        """
        uploaded_files = []
        failed_files = []
        
        # Ensure bucket exists
        if not self.bucket_exists(bucket_name):
            self.create_bucket(bucket_name)
        
        for object_name, file_data, file_size, content_type in files_data:
            try:
                # Add prefix if provided
                full_object_name = f"{prefix}{object_name}" if prefix else object_name
                
                result = self.upload_file(
                    bucket_name=bucket_name,
                    object_name=full_object_name,
                    file_data=file_data,
                    file_size=file_size,
                    content_type=content_type
                )
                
                uploaded_files.append({
                    "object_name": full_object_name,
                    "file_size": file_size,
                    "etag": result["etag"]
                })
                
            except Exception as e:
                logger.error(f"Failed to upload {object_name}: {e}")
                failed_files.append({
                    "object_name": object_name,
                    "error": str(e)
                })
        
        total_files = len(files_data)
        successful_uploads = len(uploaded_files)
        failed_uploads = len(failed_files)
        
        logger.info(f"Uploaded {successful_uploads}/{total_files} files to {bucket_name}")
        
        return {
            "bucket_name": bucket_name,
            "uploaded_files": uploaded_files,
            "failed_files": failed_files,
            "total_files": total_files,
            "successful_uploads": successful_uploads,
            "failed_uploads": failed_uploads,
            "success": failed_uploads == 0
        }
    
    def download_file(self, bucket_name: str, object_name: str) -> bytes:
        """
        Download a file from MinIO
        
        Args:
            bucket_name: Source bucket name
            object_name: Object name to download
            
        Returns:
            File content as bytes
        """
        try:
            response = self.client.get_object(bucket_name, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            
            logger.info(f"File downloaded: {bucket_name}/{object_name} ({len(data)} bytes)")
            return data
            
        except S3Error as e:
            logger.error(f"Failed to download file {object_name}: {e}")
            raise
    
    def list_objects(
        self,
        bucket_name: str,
        prefix: str = "",
        recursive: bool = True,
        max_keys: int = 1000
    ) -> List[dict]:
        """
        List objects in a bucket
        
        Args:
            bucket_name: Bucket name
            prefix: Filter by prefix (folder path)
            recursive: List recursively
            max_keys: Maximum number of objects to return
            
        Returns:
            List of object information dictionaries
        """
        try:
            objects = self.client.list_objects(
                bucket_name=bucket_name,
                prefix=prefix,
                recursive=recursive
            )
            
            result = []
            count = 0
            
            for obj in objects:
                if count >= max_keys:
                    break
                    
                result.append({
                    "object_name": obj.object_name,
                    "size": obj.size,
                    "last_modified": obj.last_modified.isoformat() if obj.last_modified else None,
                    "etag": obj.etag,
                    "content_type": obj.content_type,
                    "version_id": obj.version_id,
                    "is_dir": obj.is_dir
                })
                count += 1
            
            logger.info(f"Listed {len(result)} objects in {bucket_name}")
            return result
            
        except S3Error as e:
            logger.error(f"Failed to list objects in {bucket_name}: {e}")
            raise
    
    def delete_file(self, bucket_name: str, object_name: str) -> dict:
        """
        Delete a file from MinIO
        
        Args:
            bucket_name: Bucket name
            object_name: Object name to delete
            
        Returns:
            dict with deletion status
        """
        try:
            self.client.remove_object(bucket_name, object_name)
            logger.info(f"File deleted: {bucket_name}/{object_name}")
            
            return {
                "bucket_name": bucket_name,
                "object_name": object_name,
                "message": "File deleted successfully",
                "success": True
            }
            
        except S3Error as e:
            logger.error(f"Failed to delete file {object_name}: {e}")
            raise
    
    def get_presigned_url(
        self,
        bucket_name: str,
        object_name: str,
        expiry_seconds: int = 3600
    ) -> str:
        """
        Generate a presigned URL for temporary access to an object
        
        Args:
            bucket_name: Bucket name
            object_name: Object name
            expiry_seconds: URL expiry time in seconds (default: 1 hour, max: 7 days)
            
        Returns:
            Presigned URL string
        """
        try:
            # Limit expiry to 7 days
            expiry_seconds = min(expiry_seconds, 604800)
            
            url = self.client.presigned_get_object(
                bucket_name=bucket_name,
                object_name=object_name,
                expires=timedelta(seconds=expiry_seconds)
            )
            
            logger.info(f"Generated presigned URL for {bucket_name}/{object_name} (expires in {expiry_seconds}s)")
            return url
            
        except S3Error as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            raise
    
    def get_object_metadata(self, bucket_name: str, object_name: str) -> dict:
        """
        Get metadata for an object
        
        Args:
            bucket_name: Bucket name
            object_name: Object name
            
        Returns:
            Object metadata dictionary
        """
        try:
            stat = self.client.stat_object(bucket_name, object_name)
            
            return {
                "object_name": object_name,
                "size": stat.size,
                "last_modified": stat.last_modified.isoformat() if stat.last_modified else None,
                "etag": stat.etag,
                "content_type": stat.content_type,
                "metadata": stat.metadata,
                "version_id": stat.version_id
            }
            
        except S3Error as e:
            logger.error(f"Failed to get metadata for {object_name}: {e}")
            raise
