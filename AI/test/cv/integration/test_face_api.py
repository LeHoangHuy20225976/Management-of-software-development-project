"""
Integration tests for Face Recognition API endpoints
Tests full HTTP request/response cycle
"""

import pytest
from fastapi import status
from unittest.mock import AsyncMock, Mock, patch
import numpy as np


@pytest.mark.asyncio
class TestFaceEnrollmentAPI:
    """Test suite for /cv/face/enroll endpoint"""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client"""
        self.client = client

    def test_enroll_face_success(
        self, face_enroll_request_data, mock_face_service
    ):
        """Test successful face enrollment via API"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock successful enrollment
            mock_face_service.enroll_face = AsyncMock(
                return_value={
                    "success": True,
                    "face_id": 123,
                    "message": "Face enrolled successfully",
                    "quality_scores": {
                        "overall": 0.85,
                        "sharpness": 0.9,
                        "brightness": 0.8,
                        "face_score": 0.95,
                    },
                    "liveness_score": 0.92,
                }
            )

            response = self.client.post(
                "/api/cv/face/enroll", json=face_enroll_request_data
            )

            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["success"] is True
            assert data["face_id"] == 123
            assert "quality_scores" in data

    def test_enroll_face_invalid_base64(self):
        """Test enrollment with invalid base64 image"""
        invalid_request = {
            "user_id": 456,
            "image_base64": "not-valid-base64!!!",
            "require_liveness": False,
        }

        response = self.client.post("/api/cv/face/enroll", json=invalid_request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid image data" in response.json()["detail"]

    def test_enroll_face_missing_user_id(self, sample_face_base64):
        """Test enrollment without user_id"""
        invalid_request = {
            "image_base64": sample_face_base64,
            # user_id missing
        }

        response = self.client.post("/api/cv/face/enroll", json=invalid_request)

        # Should return 422 Unprocessable Entity (validation error)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_enroll_face_invalid_user_id(self, sample_face_base64):
        """Test enrollment with invalid user_id (negative)"""
        invalid_request = {
            "user_id": -1,  # Invalid
            "image_base64": sample_face_base64,
        }

        response = self.client.post("/api/cv/face/enroll", json=invalid_request)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_enroll_face_no_face_detected(
        self, face_enroll_request_data, mock_face_service
    ):
        """Test enrollment fails when no face detected"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            mock_face_service.enroll_face = AsyncMock(
                return_value={
                    "success": False,
                    "message": "No face detected in image",
                }
            )

            response = self.client.post(
                "/api/cv/face/enroll", json=face_enroll_request_data
            )

            assert response.status_code == status.HTTP_201_CREATED  # Still 201
            data = response.json()
            assert data["success"] is False
            assert "No face detected" in data["message"]

    def test_enroll_face_low_quality(
        self, face_enroll_request_data, mock_face_service
    ):
        """Test enrollment fails due to low quality"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            mock_face_service.enroll_face = AsyncMock(
                return_value={
                    "success": False,
                    "message": "Face quality too low (0.3 < 0.5)",
                    "quality_scores": {
                        "overall": 0.3,
                        "sharpness": 0.2,
                        "brightness": 0.4,
                        "face_score": 0.6,
                    },
                }
            )

            response = self.client.post(
                "/api/cv/face/enroll", json=face_enroll_request_data
            )

            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["success"] is False
            assert "quality too low" in data["message"]


@pytest.mark.asyncio
class TestFaceRecognitionAPI:
    """Test suite for /cv/face/recognize endpoint"""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client"""
        self.client = client

    def test_recognize_face_success(
        self, face_recognition_request_data, mock_face_service
    ):
        """Test successful face recognition via API"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            mock_face_service.recognize_face = AsyncMock(
                return_value={
                    "success": True,
                    "user_id": 456,
                    "confidence": 0.89,
                    "message": "Face recognized (CHECK_IN)",
                    "attendance_log_id": 789,
                }
            )

            response = self.client.post(
                "/api/cv/face/recognize", json=face_recognition_request_data
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is True
            assert data["user_id"] == 456
            assert data["confidence"] == 0.89
            assert data["attendance_log_id"] == 789

    def test_recognize_face_not_found(
        self, face_recognition_request_data, mock_face_service
    ):
        """Test recognition fails when face not found"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            mock_face_service.recognize_face = AsyncMock(
                return_value={
                    "success": False,
                    "message": "No matching face found (best: 0.45)",
                    "attendance_log_id": 790,
                }
            )

            response = self.client.post(
                "/api/cv/face/recognize", json=face_recognition_request_data
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is False
            assert "No matching face" in data["message"]

    def test_recognize_face_invalid_event_type(self, sample_face_base64):
        """Test recognition with invalid event type"""
        invalid_request = {
            "image_base64": sample_face_base64,
            "event_type": "INVALID_EVENT",  # Not CHECK_IN or CHECK_OUT
        }

        response = self.client.post("/api/cv/face/recognize", json=invalid_request)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_recognize_face_check_out(
        self, face_recognition_request_data, mock_face_service
    ):
        """Test CHECK_OUT event type"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            mock_face_service.recognize_face = AsyncMock(
                return_value={
                    "success": True,
                    "user_id": 456,
                    "confidence": 0.91,
                    "message": "Face recognized (CHECK_OUT)",
                    "attendance_log_id": 791,
                }
            )

            # Change to CHECK_OUT
            face_recognition_request_data["event_type"] = "CHECK_OUT"

            response = self.client.post(
                "/api/cv/face/recognize", json=face_recognition_request_data
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is True
            assert "CHECK_OUT" in data["message"]


@pytest.mark.asyncio
class TestFaceManagementAPI:
    """Test suite for face management endpoints"""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client"""
        self.client = client

    def test_get_user_faces(self, mock_face_service, mock_face_record):
        """Test getting all faces for a user"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock database query
            from datetime import datetime

            mock_rows = [
                {
                    "face_id": 123,
                    "user_id": 456,
                    "face_quality_score": 0.85,
                    "sharpness_score": 0.9,
                    "brightness_score": 0.8,
                    "is_liveness_verified": True,
                    "liveness_score": 0.92,
                    "enrollment_device": "tablet-001",
                    "enrollment_location": "Front Desk",
                    "enrollment_notes": "First enrollment",
                    "is_active": True,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
            ]

            mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetch = AsyncMock(
                return_value=mock_rows
            )

            response = self.client.get("/api/cv/face/user/456")

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is True
            assert data["total"] == 1
            assert len(data["faces"]) == 1
            assert data["faces"][0]["face_id"] == 123

    def test_get_user_faces_empty(self, mock_face_service):
        """Test getting faces for user with no enrollments"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock empty result
            mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.fetch = AsyncMock(
                return_value=[]
            )

            response = self.client.get("/api/cv/face/user/999")

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is True
            assert data["total"] == 0
            assert len(data["faces"]) == 0

    def test_delete_face_success(self, mock_face_service):
        """Test successful face deletion"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock successful update
            mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.execute = AsyncMock(
                return_value="UPDATE 1"
            )

            response = self.client.delete("/api/cv/face/123")

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["success"] is True
            assert data["face_id"] == 123
            assert "deactivated successfully" in data["message"]

    def test_delete_face_not_found(self, mock_face_service):
        """Test deleting non-existent face"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock no rows updated
            mock_face_service.db_pool.acquire.return_value.__aenter__.return_value.execute = AsyncMock(
                return_value="UPDATE 0"
            )

            response = self.client.delete("/api/cv/face/999")

            assert response.status_code == status.HTTP_404_NOT_FOUND
            assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
class TestAPIErrorHandling:
    """Test error handling in API endpoints"""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        """Setup test client"""
        self.client = client

    def test_service_not_initialized(self):
        """Test endpoints when service is not initialized"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service", None
        ):
            response = self.client.get("/api/cv/face/user/456")

            assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
            assert "not initialized" in response.json()["detail"]

    def test_internal_server_error(
        self, face_enroll_request_data, mock_face_service
    ):
        """Test internal server error handling"""
        with patch(
            "src.application.controllers.cv.face_controller.face_service",
            mock_face_service,
        ):
            # Mock service to raise exception
            mock_face_service.enroll_face = AsyncMock(
                side_effect=Exception("Database connection failed")
            )

            response = self.client.post(
                "/api/cv/face/enroll", json=face_enroll_request_data
            )

            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "Internal server error" in response.json()["detail"]
