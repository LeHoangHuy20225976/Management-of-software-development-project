"""
Pytest configuration for storage tests
"""
import pytest
import os


@pytest.fixture(autouse=True)
def setup_test_env():
    """Set up test environment variables"""
    os.environ["MINIO_ENDPOINT"] = "localhost:9000"
    os.environ["MINIO_ROOT_USER"] = "test_user"
    os.environ["MINIO_ROOT_PASSWORD"] = "test_password"
    yield
    # Cleanup if needed


@pytest.fixture
def sample_file_content():
    """Fixture for sample file content"""
    return b"This is test file content for storage testing"


@pytest.fixture
def sample_image_content():
    """Fixture for sample image content"""
    # Simple 1x1 pixel PNG
    return (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00'
        b'\x00\x0cIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4'
        b'\x00\x00\x00\x00IEND\xaeB`\x82'
    )
