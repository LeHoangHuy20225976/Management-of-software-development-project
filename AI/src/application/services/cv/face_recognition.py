"""
Face Recognition Service - Employee Attendance System

This service handles:
1. Face enrollment (storing employee face embeddings)
2. Face recognition (matching faces against database)
3. Liveness detection (anti-spoofing)
4. Attendance event triggering

Technology Stack:
- InsightFace 0.7.3 (ArcFace embeddings - 512 dimensions)
- pgvector for similarity search
- RabbitMQ for event messaging
"""

import numpy as np
from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime
import asyncio
from pathlib import Path
import logging

# Logging
logger = logging.getLogger(__name__)

# Config
from src.infrastructure.config import Settings, get_settings

# InsightFace imports
try:
    import insightface
    from insightface.app import FaceAnalysis
    from insightface.model_zoo import get_model
    INSIGHTFACE_AVAILABLE = True
except ImportError as e:
    INSIGHTFACE_AVAILABLE = False
    # Create mock classes for development
    class FaceAnalysis:
        pass
    insightface = None
    logger.warning(f"InsightFace not available: {e}. Face recognition will not work.")

# Database imports
import asyncpg
from pgvector.asyncpg import register_vector

# Messaging imports
import aio_pika
from aio_pika import Message, DeliveryMode


class LivenessDetector:
    """
    Liveness detection to prevent photo/video spoofing
    Uses Silent-Face-Anti-Spoofing or similar
    """

    def __init__(self):
        # TODO: Initialize liveness detection model
        # For now, placeholder implementation
        self.model = None
        logger.warning("Liveness detection not fully implemented yet")

    async def detect(self, face_image: np.ndarray) -> Tuple[bool, float]:
        """
        Detect if face is live or spoofed

        Args:
            face_image: Cropped face image (RGB)

        Returns:
            (is_live, confidence_score)
        """
        # TODO: Implement actual liveness detection
        # Placeholder: always return True with 0.9 confidence
        await asyncio.sleep(0.01)  # Simulate processing
        return True, 0.9


class FaceQualityChecker:
    """Check face image quality"""

    @staticmethod
    def check_sharpness(image: np.ndarray) -> float:
        """
        Calculate image sharpness using Laplacian variance

        Args:
            image: Face image (RGB or grayscale)

        Returns:
            Sharpness score (0-1, higher is sharper)
        """
        import cv2

        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        # Calculate Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        # Normalize to 0-1 range (empirical: good images have var > 100)
        sharpness = min(laplacian_var / 500.0, 1.0)
        return float(sharpness)

    @staticmethod
    def check_brightness(image: np.ndarray) -> float:
        """
        Check if image has good lighting

        Args:
            image: Face image (RGB)

        Returns:
            Brightness score (0-1, optimal around 0.5)
        """
        import cv2

        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image

        mean_brightness = gray.mean() / 255.0

        # Optimal brightness is around 0.4-0.6
        # Penalize too dark or too bright
        if 0.4 <= mean_brightness <= 0.6:
            brightness_score = 1.0
        elif mean_brightness < 0.4:
            brightness_score = mean_brightness / 0.4
        else:
            brightness_score = (1.0 - mean_brightness) / 0.4

        return float(max(0.0, min(1.0, brightness_score)))

    @staticmethod
    def calculate_overall_quality(
        sharpness: float, brightness: float, face_score: float
    ) -> float:
        """
        Calculate overall face quality score

        Args:
            sharpness: Sharpness score
            brightness: Brightness score
            face_score: Face detection confidence

        Returns:
            Overall quality score (0-1)
        """
        # Weighted average
        quality = (sharpness * 0.4 + brightness * 0.3 + face_score * 0.3)
        return float(quality)


class FaceRecognitionService:
    """Main face recognition service"""

    def __init__(
        self,
        settings: Optional[Settings] = None,
    ):
        """
        Initialize face recognition service

        Args:
            settings: Application settings (if None, will call get_settings())
        """
        self.settings = settings or get_settings()

        # Components
        self.face_app: Optional[FaceAnalysis] = None
        self.liveness_detector = LivenessDetector()
        self.quality_checker = FaceQualityChecker()

        # Connections
        self.db_pool: Optional[asyncpg.Pool] = None
        self.rabbitmq_connection: Optional[aio_pika.Connection] = None
        self.rabbitmq_channel: Optional[aio_pika.Channel] = None

    async def initialize(self):
        """Initialize all components"""
        logger.info("Initializing Face Recognition Service...")

        # 1. Initialize InsightFace
        logger.info(f"Loading InsightFace model: {self.settings.face_model_name}")
        self.face_app = FaceAnalysis(
            name=self.settings.face_model_name,
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
        )
        self.face_app.prepare(
            ctx_id=0, det_size=self.settings.face_detection_size
        )
        logger.info("✅ InsightFace model loaded")

        # 2. Initialize database connection pool
        logger.info("Connecting to PostgreSQL...")
        self.db_pool = await asyncpg.create_pool(
            self.settings.asyncpg_url,
            min_size=2,
            max_size=self.settings.face_max_db_connections,
        )
        # Register pgvector type
        async with self.db_pool.acquire() as conn:
            await register_vector(conn)
        logger.info("✅ Database connected")

        # 3. Initialize RabbitMQ connection
        logger.info("Connecting to RabbitMQ...")
        self.rabbitmq_connection = await aio_pika.connect_robust(
            self.settings.rabbitmq_url
        )
        self.rabbitmq_channel = await self.rabbitmq_connection.channel()
        # Declare exchange
        await self.rabbitmq_channel.declare_exchange(
            self.settings.face_rabbitmq_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )
        logger.info("✅ RabbitMQ connected")

        logger.info("🚀 Face Recognition Service initialized successfully!")

    async def shutdown(self):
        """Cleanup resources"""
        logger.info("Shutting down Face Recognition Service...")

        if self.db_pool:
            await self.db_pool.close()

        if self.rabbitmq_connection:
            await self.rabbitmq_connection.close()

        logger.info("✅ Service shutdown complete")

    async def enroll_face(
        self,
        user_id: int,
        image: np.ndarray,
        device_id: Optional[str] = None,
        location: Optional[str] = None,
        notes: Optional[str] = None,
        require_liveness: bool = True,
    ) -> Dict[str, Any]:
        """
        Enroll a new employee face

        Args:
            user_id: User ID from User table
            image: Face image (RGB numpy array)
            device_id: Enrollment device identifier
            location: Enrollment location
            notes: Additional notes
            require_liveness: Whether to check liveness

        Returns:
            {
                "success": bool,
                "face_id": int (if success),
                "message": str,
                "quality_scores": dict,
            }
        """
        try:
            # 1. Detect faces
            faces = self.face_app.get(image)

            if len(faces) == 0:
                return {
                    "success": False,
                    "message": "No face detected in image",
                }

            if len(faces) > 1:
                return {
                    "success": False,
                    "message": f"Multiple faces detected ({len(faces)}). Please provide image with single face.",
                }

            face = faces[0]

            # 2. Extract bbox and embedding
            bbox = face.bbox.astype(int).tolist()  # [x1, y1, x2, y2]
            embedding = face.embedding  # 512-dim vector
            face_score = float(face.det_score)

            # 3. Check face quality
            x1, y1, x2, y2 = bbox
            face_crop = image[y1:y2, x1:x2]

            sharpness = self.quality_checker.check_sharpness(face_crop)
            brightness = self.quality_checker.check_brightness(face_crop)
            overall_quality = self.quality_checker.calculate_overall_quality(
                sharpness, brightness, face_score
            )

            # Check if quality meets minimum requirements
            if overall_quality < self.settings.face_min_quality:
                return {
                    "success": False,
                    "message": f"Face quality too low ({overall_quality:.2f} < {self.settings.face_min_quality})",
                    "quality_scores": {
                        "overall": overall_quality,
                        "sharpness": sharpness,
                        "brightness": brightness,
                        "face_score": face_score,
                    },
                }

            # 4. Liveness detection
            is_live, liveness_score = True, 1.0
            if require_liveness:
                is_live, liveness_score = await self.liveness_detector.detect(
                    face_crop
                )

                if not is_live or liveness_score < self.settings.face_liveness_threshold:
                    return {
                        "success": False,
                        "message": f"Liveness check failed (score: {liveness_score:.2f})",
                        "liveness_score": liveness_score,
                    }

            # 5. Store in database
            async with self.db_pool.acquire() as conn:
                face_id = await conn.fetchval(
                    """
                    INSERT INTO employee_faces (
                        user_id, face_embedding,
                        face_quality_score, sharpness_score, brightness_score,
                        bbox_x1, bbox_y1, bbox_x2, bbox_y2,
                        is_liveness_verified, liveness_score,
                        enrollment_device, enrollment_location, enrollment_notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING face_id
                    """,
                    user_id,
                    embedding.tolist(),
                    overall_quality,
                    sharpness,
                    brightness,
                    bbox[0],
                    bbox[1],
                    bbox[2],
                    bbox[3],
                    is_live,
                    liveness_score,
                    device_id,
                    location,
                    notes,
                )

            logger.info(
                f"✅ Face enrolled: user_id={user_id}, face_id={face_id}, quality={overall_quality:.2f}"
            )

            return {
                "success": True,
                "face_id": face_id,
                "message": "Face enrolled successfully",
                "quality_scores": {
                    "overall": overall_quality,
                    "sharpness": sharpness,
                    "brightness": brightness,
                    "face_score": face_score,
                },
                "liveness_score": liveness_score,
            }

        except Exception as e:
            logger.error(f"Error enrolling face: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Enrollment error: {str(e)}",
            }

    async def recognize_face(
        self,
        image: np.ndarray,
        event_type: str = "CHECK_IN",
        device_id: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Recognize face and log attendance

        Args:
            image: Face image (RGB numpy array)
            event_type: "CHECK_IN" or "CHECK_OUT"
            device_id: Device identifier
            location: Location of recognition

        Returns:
            {
                "success": bool,
                "user_id": int (if recognized),
                "confidence": float,
                "message": str,
                "attendance_log_id": int,
            }
        """
        try:
            # 1. Detect face
            faces = self.face_app.get(image)

            if len(faces) == 0:
                # Log failed attempt
                await self._log_attendance(
                    user_id=None,
                    event_type="RECOGNITION_FAILED",
                    confidence=0.0,
                    device_id=device_id,
                    location=location,
                    metadata={"reason": "no_face_detected"},
                )
                return {
                    "success": False,
                    "message": "No face detected",
                }

            if len(faces) > 1:
                await self._log_attendance(
                    user_id=None,
                    event_type="RECOGNITION_FAILED",
                    confidence=0.0,
                    device_id=device_id,
                    location=location,
                    metadata={"reason": "multiple_faces", "count": len(faces)},
                )
                return {
                    "success": False,
                    "message": f"Multiple faces detected ({len(faces)})",
                }

            face = faces[0]
            query_embedding = face.embedding

            # 2. Search similar faces in database
            async with self.db_pool.acquire() as conn:
                # Use pgvector cosine similarity
                result = await conn.fetchrow(
                    """
                    SELECT
                        face_id,
                        user_id,
                        1 - (face_embedding <=> $1::vector) as similarity
                    FROM employee_faces
                    WHERE is_active = TRUE
                    ORDER BY face_embedding <=> $1::vector
                    LIMIT 1
                    """,
                    query_embedding.tolist(),
                )

            # 3. Check if match found
            if result is None or result["similarity"] < self.settings.face_similarity_threshold:
                confidence = result["similarity"] if result else 0.0
                log_id = await self._log_attendance(
                    user_id=None,
                    event_type="RECOGNITION_FAILED",
                    confidence=confidence,
                    device_id=device_id,
                    location=location,
                    metadata={"reason": "no_match_above_threshold"},
                )
                return {
                    "success": False,
                    "message": f"No matching face found (best: {confidence:.2f})",
                    "attendance_log_id": log_id,
                }

            # 4. Face recognized!
            user_id = result["user_id"]
            confidence = result["similarity"]
            matched_face_id = result["face_id"]

            # Log attendance
            log_id = await self._log_attendance(
                user_id=user_id,
                matched_face_id=matched_face_id,
                event_type=event_type,
                confidence=confidence,
                device_id=device_id,
                location=location,
            )

            # Publish event to RabbitMQ
            await self._publish_attendance_event(
                user_id=user_id,
                event_type=event_type,
                confidence=confidence,
                location=location,
                log_id=log_id,
            )

            logger.info(
                f"✅ Face recognized: user_id={user_id}, confidence={confidence:.3f}, event={event_type}"
            )

            return {
                "success": True,
                "user_id": user_id,
                "confidence": confidence,
                "message": f"Face recognized ({event_type})",
                "attendance_log_id": log_id,
            }

        except Exception as e:
            logger.error(f"Error recognizing face: {e}", exc_info=True)
            return {
                "success": False,
                "message": f"Recognition error: {str(e)}",
            }

    async def _log_attendance(
        self,
        user_id: Optional[int],
        event_type: str,
        confidence: float,
        matched_face_id: Optional[int] = None,
        device_id: Optional[str] = None,
        location: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> int:
        """
        Log attendance event to database

        Returns:
            log_id
        """
        import json

        async with self.db_pool.acquire() as conn:
            log_id = await conn.fetchval(
                """
                INSERT INTO attendance_logs (
                    user_id, matched_face_id, recognition_confidence,
                    event_type, location, device_id,
                    metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING log_id
                """,
                user_id,
                matched_face_id,
                confidence,
                event_type,
                location,
                device_id,
                json.dumps(metadata) if metadata else None,
            )

        return log_id

    async def _publish_attendance_event(
        self,
        user_id: int,
        event_type: str,
        confidence: float,
        location: Optional[str],
        log_id: int,
    ):
        """Publish attendance event to RabbitMQ for Prefect flow"""
        import json

        event_data = {
            "user_id": user_id,
            "event_type": event_type,
            "confidence": confidence,
            "location": location,
            "log_id": log_id,
            "timestamp": datetime.utcnow().isoformat(),
        }

        message = Message(
            body=json.dumps(event_data).encode(),
            delivery_mode=DeliveryMode.PERSISTENT,
            content_type="application/json",
        )

        exchange = await self.rabbitmq_channel.get_exchange(
            self.settings.face_rabbitmq_exchange
        )

        await exchange.publish(
            message,
            routing_key=self.settings.face_rabbitmq_routing_key,
        )

        logger.debug(
            f"📤 Published attendance event: user_id={user_id}, type={event_type}"
        )
