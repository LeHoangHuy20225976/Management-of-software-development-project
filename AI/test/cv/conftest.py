"""
Pytest fixtures for CV (Face Recognition) tests
"""

import pytest
import numpy as np
from PIL import Image
import base64
from io import BytesIO
from unittest.mock import Mock, AsyncMock, MagicMock
import asyncpg

from src.application.services.cv.face_recognition import (
    FaceRecognitionService,
    FaceQualityChecker,
    LivenessDetector,
)
from src.infrastructure.config import Settings


# ============================================================================
# IMAGE FIXTURES
# ============================================================================


@pytest.fixture
def sample_face_image() -> np.ndarray:
    """
    Generate a sample face image (640x640 RGB)

    Returns:
        RGB numpy array
    """
    # Create a simple test image with a face-like pattern
    image = np.zeros((640, 640, 3), dtype=np.uint8)

    # Add some brightness variation to simulate a face
    # Face region (center)
    image[200:440, 200:440] = [200, 180, 170]  # Skin tone
    # Eyes
    image[280:300, 260:280] = [50, 50, 50]  # Left eye
    image[280:300, 360:380] = [50, 50, 50]  # Right eye
    # Mouth
    image[360:380, 290:350] = [150, 100, 100]  # Mouth

    # Add some noise for sharpness
    noise = np.random.randint(-10, 10, image.shape, dtype=np.int16)
    image = np.clip(image.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    return image


@pytest.fixture
def blurry_face_image() -> np.ndarray:
    """
    Generate a blurry face image (low sharpness)
    """
    from PIL import ImageFilter

    # Create base image
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    image[200:440, 200:440] = [200, 180, 170]

    # Convert to PIL and blur
    pil_image = Image.fromarray(image)
    blurred = pil_image.filter(ImageFilter.GaussianBlur(radius=10))

    return np.array(blurred)


@pytest.fixture
def dark_face_image() -> np.ndarray:
    """
    Generate a dark face image (low brightness)
    """
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    # Very dark face
    image[200:440, 200:440] = [30, 25, 20]

    return image


@pytest.fixture
def bright_face_image() -> np.ndarray:
    """
    Generate an overly bright face image
    """
    image = np.ones((640, 640, 3), dtype=np.uint8) * 250
    image[200:440, 200:440] = [255, 255, 255]

    return image


@pytest.fixture
def no_face_image() -> np.ndarray:
    """
    Generate an image with no face
    """
    # Random noise
    return np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)


@pytest.fixture
def multiple_faces_image() -> np.ndarray:
    """
    Generate an image with multiple face regions
    """
    image = np.zeros((640, 640, 3), dtype=np.uint8)

    # Face 1
    image[100:200, 100:200] = [200, 180, 170]
    # Face 2
    image[400:500, 400:500] = [200, 180, 170]

    return image


def image_to_base64(image: np.ndarray) -> str:
    """
    Convert numpy image to base64 string

    Args:
        image: RGB numpy array

    Returns:
        Base64 encoded string
    """
    pil_image = Image.fromarray(image)
    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG")
    img_bytes = buffer.getvalue()
    return base64.b64encode(img_bytes).decode("utf-8")


@pytest.fixture
def sample_face_base64(sample_face_image) -> str:
    """Base64 encoded sample face image"""
    return image_to_base64(sample_face_image)


# ============================================================================
# SERVICE FIXTURES
# ============================================================================


@pytest.fixture
def mock_settings() -> Settings:
    """
    Mock settings for testing
    """
    settings = Settings()
    # Override with test values
    settings.postgres_host = "localhost"
    settings.postgres_db = "test_hotel_db"
    settings.face_similarity_threshold = 0.7
    settings.face_liveness_threshold = 0.8
    settings.face_min_quality = 0.5

    return settings


@pytest.fixture
def mock_db_pool():
    """
    Mock asyncpg connection pool
    """
    pool = AsyncMock(spec=asyncpg.Pool)

    # Mock acquire context manager
    conn = AsyncMock()
    pool.acquire.return_value.__aenter__.return_value = conn
    pool.acquire.return_value.__aexit__.return_value = None

    return pool


@pytest.fixture
def mock_rabbitmq_connection():
    """
    Mock RabbitMQ connection
    """
    connection = AsyncMock()
    channel = AsyncMock()

    connection.channel.return_value = channel
    channel.declare_exchange = AsyncMock()

    return connection, channel


@pytest.fixture
def mock_insightface_app():
    """
    Mock InsightFace FaceAnalysis app
    """
    mock_app = Mock()

    # Mock face detection result
    mock_face = Mock()
    mock_face.bbox = np.array([200, 200, 440, 440])
    mock_face.det_score = 0.95
    # Mock embedding (512-dim)
    mock_face.embedding = np.random.randn(512).astype(np.float32)

    # Default: return one face
    mock_app.get.return_value = [mock_face]

    return mock_app


@pytest.fixture
async def mock_face_service(
    mock_settings, mock_db_pool, mock_rabbitmq_connection, mock_insightface_app
):
    """
    Mock FaceRecognitionService with all dependencies mocked
    """
    service = FaceRecognitionService(settings=mock_settings)

    # Inject mocks
    service.db_pool = mock_db_pool
    rabbitmq_conn, rabbitmq_channel = mock_rabbitmq_connection
    service.rabbitmq_connection = rabbitmq_conn
    service.rabbitmq_channel = rabbitmq_channel
    service.face_app = mock_insightface_app

    return service


# ============================================================================
# DATABASE FIXTURES
# ============================================================================


@pytest.fixture
def mock_face_record():
    """
    Mock employee_faces database record
    """
    return {
        "face_id": 123,
        "user_id": 456,
        "face_embedding": np.random.randn(512).astype(np.float32).tolist(),
        "face_quality_score": 0.85,
        "sharpness_score": 0.9,
        "brightness_score": 0.8,
        "is_liveness_verified": True,
        "liveness_score": 0.92,
        "is_active": True,
    }


@pytest.fixture
def mock_attendance_log():
    """
    Mock attendance_logs database record
    """
    from datetime import datetime

    return {
        "log_id": 789,
        "user_id": 456,
        "matched_face_id": 123,
        "recognition_confidence": 0.89,
        "event_type": "CHECK_IN",
        "location": "Main Entrance",
        "device_id": "kiosk-001",
        "liveness_verified": True,
        "liveness_score": 0.91,
        "event_timestamp": datetime.utcnow(),
    }


# ============================================================================
# COMPONENT FIXTURES
# ============================================================================


@pytest.fixture
def quality_checker():
    """FaceQualityChecker instance"""
    return FaceQualityChecker()


@pytest.fixture
def liveness_detector():
    """LivenessDetector instance"""
    return LivenessDetector()


# ============================================================================
# API FIXTURES
# ============================================================================


@pytest.fixture
def face_enroll_request_data(sample_face_base64):
    """
    Sample face enrollment request data
    """
    return {
        "user_id": 456,
        "image_base64": sample_face_base64,
        "device_id": "tablet-001",
        "location": "Front Desk",
        "notes": "Test enrollment",
        "require_liveness": True,
    }


@pytest.fixture
def face_recognition_request_data(sample_face_base64):
    """
    Sample face recognition request data
    """
    return {
        "image_base64": sample_face_base64,
        "event_type": "CHECK_IN",
        "device_id": "kiosk-entrance",
        "location": "Main Entrance",
    }
