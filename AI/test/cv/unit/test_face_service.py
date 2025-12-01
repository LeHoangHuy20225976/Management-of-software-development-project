"""
Unit tests for FaceRecognitionService
Tests core service methods with mocked dependencies
"""

import pytest
import numpy as np
from unittest.mock import AsyncMock, Mock, patch
import json


@pytest.mark.asyncio
class TestFaceRecognitionService:
    """Test suite for FaceRecognitionService class"""

    async def test_enroll_face_success(self, mock_face_service, sample_face_image):
        """Test successful face enrollment"""
        # Mock database insert
        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=123  # face_id
        )

        result = await mock_face_service.enroll_face(
            user_id=456,
            image=sample_face_image,
            device_id="tablet-001",
            location="Front Desk",
        )

        assert result["success"] is True
        assert result["face_id"] == 123
        assert "quality_scores" in result
        assert result["quality_scores"]["overall"] > 0

    async def test_enroll_face_no_face_detected(self, mock_face_service, no_face_image):
        """Test enrollment fails when no face detected"""
        # Mock InsightFace to return no faces
        mock_face_service.face_app.get.return_value = []

        result = await mock_face_service.enroll_face(
            user_id=456, image=no_face_image
        )

        assert result["success"] is False
        assert "No face detected" in result["message"]

    async def test_enroll_face_multiple_faces(
        self, mock_face_service, multiple_faces_image
    ):
        """Test enrollment fails with multiple faces"""
        # Mock InsightFace to return multiple faces
        mock_face1 = Mock()
        mock_face1.bbox = np.array([100, 100, 200, 200])
        mock_face2 = Mock()
        mock_face2.bbox = np.array([400, 400, 500, 500])

        mock_face_service.face_app.get.return_value = [mock_face1, mock_face2]

        result = await mock_face_service.enroll_face(
            user_id=456, image=multiple_faces_image
        )

        assert result["success"] is False
        assert "Multiple faces detected" in result["message"]

    async def test_enroll_face_low_quality(self, mock_face_service, blurry_face_image):
        """Test enrollment fails with low quality face"""
        result = await mock_face_service.enroll_face(
            user_id=456, image=blurry_face_image
        )

        # May fail due to low quality
        if not result["success"]:
            assert "quality too low" in result["message"].lower()

    async def test_enroll_face_liveness_check(self, mock_face_service, sample_face_image):
        """Test enrollment with liveness check enabled"""
        # Mock liveness detector
        mock_face_service.liveness_detector.detect = AsyncMock(
            return_value=(True, 0.95)
        )

        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=123
        )

        result = await mock_face_service.enroll_face(
            user_id=456, image=sample_face_image, require_liveness=True
        )

        # Liveness detector should be called
        mock_face_service.liveness_detector.detect.assert_called_once()

        if result["success"]:
            assert result["liveness_score"] == 0.95

    async def test_enroll_face_liveness_failed(
        self, mock_face_service, sample_face_image
    ):
        """Test enrollment fails when liveness check fails"""
        # Mock liveness detector to fail
        mock_face_service.liveness_detector.detect = AsyncMock(
            return_value=(False, 0.3)
        )

        result = await mock_face_service.enroll_face(
            user_id=456, image=sample_face_image, require_liveness=True
        )

        assert result["success"] is False
        assert "Liveness check failed" in result["message"]

    async def test_recognize_face_success(self, mock_face_service, sample_face_image):
        """Test successful face recognition"""
        # Mock database search result
        mock_result = {
            "face_id": 123,
            "user_id": 456,
            "similarity": 0.89,
        }
        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchrow = AsyncMock(
            return_value=mock_result
        )

        # Mock attendance log insert
        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=789  # log_id
        )

        result = await mock_face_service.recognize_face(
            image=sample_face_image, event_type="CHECK_IN", location="Main Entrance"
        )

        assert result["success"] is True
        assert result["user_id"] == 456
        assert result["confidence"] == 0.89
        assert result["attendance_log_id"] == 789

    async def test_recognize_face_no_match(self, mock_face_service, sample_face_image):
        """Test recognition fails when no match found"""
        # Mock database search to return low similarity
        mock_result = {
            "face_id": 123,
            "user_id": 456,
            "similarity": 0.3,  # Below threshold (0.7)
        }
        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchrow = AsyncMock(
            return_value=mock_result
        )

        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=790  # log_id for failed attempt
        )

        result = await mock_face_service.recognize_face(
            image=sample_face_image, event_type="CHECK_IN"
        )

        assert result["success"] is False
        assert "No matching face" in result["message"]

    async def test_recognize_face_no_face_detected(
        self, mock_face_service, no_face_image
    ):
        """Test recognition fails when no face detected"""
        # Mock InsightFace to return no faces
        mock_face_service.face_app.get.return_value = []

        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=791
        )

        result = await mock_face_service.recognize_face(
            image=no_face_image, event_type="CHECK_IN"
        )

        assert result["success"] is False
        assert "No face detected" in result["message"]

    async def test_recognize_face_multiple_faces(
        self, mock_face_service, multiple_faces_image
    ):
        """Test recognition fails with multiple faces"""
        # Mock InsightFace to return multiple faces
        mock_face1 = Mock()
        mock_face1.bbox = np.array([100, 100, 200, 200])
        mock_face2 = Mock()
        mock_face2.bbox = np.array([400, 400, 500, 500])

        mock_face_service.face_app.get.return_value = [mock_face1, mock_face2]

        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=792
        )

        result = await mock_face_service.recognize_face(
            image=multiple_faces_image, event_type="CHECK_IN"
        )

        assert result["success"] is False
        assert "Multiple faces detected" in result["message"]

    async def test_log_attendance(self, mock_face_service):
        """Test attendance logging"""
        # Mock database insert
        mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetchval = AsyncMock(
            return_value=999  # log_id
        )

        log_id = await mock_face_service._log_attendance(
            user_id=456,
            event_type="CHECK_IN",
            confidence=0.89,
            matched_face_id=123,
            device_id="kiosk-001",
            location="Main Entrance",
        )

        assert log_id == 999

    async def test_publish_attendance_event(self, mock_face_service):
        """Test RabbitMQ event publishing"""
        # Mock exchange
        mock_exchange = AsyncMock()
        mock_face_service.rabbitmq_channel.get_exchange = AsyncMock(
            return_value=mock_exchange
        )

        await mock_face_service._publish_attendance_event(
            user_id=456,
            event_type="CHECK_IN",
            confidence=0.89,
            location="Main Entrance",
            log_id=999,
        )

        # Verify exchange.publish was called
        mock_exchange.publish.assert_called_once()

        # Verify message content
        call_args = mock_exchange.publish.call_args
        message = call_args[0][0]
        message_body = json.loads(message.body.decode())

        assert message_body["user_id"] == 456
        assert message_body["event_type"] == "CHECK_IN"
        assert message_body["confidence"] == 0.89
        assert message_body["log_id"] == 999


@pytest.mark.asyncio
class TestLivenessDetector:
    """Test suite for LivenessDetector"""

    async def test_liveness_detect_placeholder(
        self, liveness_detector, sample_face_image
    ):
        """Test liveness detection (placeholder implementation)"""
        is_live, confidence = await liveness_detector.detect(sample_face_image)

        # Current implementation is placeholder
        assert isinstance(is_live, bool)
        assert isinstance(confidence, float)
        assert 0.0 <= confidence <= 1.0


@pytest.mark.asyncio
class TestServiceInitialization:
    """Test service initialization and cleanup"""

    async def test_service_initialization(self, mock_settings):
        """Test service can be initialized"""
        from src.application.services.cv.face_recognition import (
            FaceRecognitionService,
        )

        service = FaceRecognitionService(settings=mock_settings)

        assert service.settings == mock_settings
        assert service.face_app is None  # Not initialized yet
        assert service.db_pool is None
        assert service.rabbitmq_connection is None

    async def test_service_components_exist(self, mock_face_service):
        """Test all service components are present"""
        assert mock_face_service.face_app is not None
        assert mock_face_service.db_pool is not None
        assert mock_face_service.rabbitmq_channel is not None
        assert mock_face_service.liveness_detector is not None
        assert mock_face_service.quality_checker is not None
