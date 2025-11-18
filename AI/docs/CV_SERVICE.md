# CV Service - Computer Vision Service

## 📋 Table of Contents
1. [Service Overview](#service-overview)
2. [Responsibilities](#responsibilities)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Implementation Guide](#implementation-guide)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Monitoring & Metrics](#monitoring--metrics)

---

## 🎯 Service Overview

**Port:** 8001
**Framework:** FastAPI
**Language:** Python 3.10+
**Purpose:** Provide computer vision capabilities for face recognition, image analysis, OCR, and anomaly detection

### Key Features
- ✅ Face recognition for employee attendance (>95% accuracy)
- ✅ Liveness detection (anti-spoofing)
- ✅ Image similarity search (lost & found, room images)
- ✅ Room status analysis via image tagging
- ✅ OCR for invoices and ID documents
- ✅ Anomaly detection (fire, flood, intrusion)

---

## 🎯 Responsibilities

### 1. Face Recognition & Attendance
- Enroll new employee faces (multiple angles)
- Real-time face recognition from camera streams
- Liveness detection to prevent photo/video spoofing
- Store face embeddings in vector database
- Trigger attendance events to Prefect service

### 2. Image Search & Retrieval
- Index images with semantic embeddings (CLIP)
- Support similarity search across categories:
  - Room images
  - Lost & found items
  - Amenities
- Return top-k similar images with metadata

### 3. Room Vision Tagging
- Analyze room cleanliness status
- Detect specific elements:
  - Bed made/unmade
  - Towels present/missing
  - Amenities complete/incomplete
- Estimate cleaning time required
- Auto-update room status in database

### 4. OCR Services
- Invoice extraction (amount, date, items)
- ID card/passport reading
- Driver's license parsing
- Support Vietnamese and English text

### 5. Anomaly Detection
- Real-time monitoring via camera feeds
- Detect safety hazards:
  - Fire/smoke
  - Water leaks/flooding
  - Unauthorized intrusion
- Send immediate alerts

---

## 🛠️ Technology Stack

### Core Framework
```yaml
Framework: FastAPI 0.109.0
Language: Python 3.10+
ASGI Server: Uvicorn
API Docs: OpenAPI/Swagger
```

### ML/CV Libraries
```yaml
Face Recognition:
  - insightface 0.7.3 (ArcFace model)
  - onnxruntime-gpu 1.16.3
  - Silent-Face-Anti-Spoofing (liveness)

Image Models:
  - transformers 4.36.0 (CLIP)
  - torch 2.1.2
  - torchvision 0.16.2
  - timm 0.9.12 (vision models)

OCR:
  - paddleocr 2.7.0
  - easyocr 1.7.0 (fallback)

Object Detection:
  - ultralytics 8.1.0 (YOLOv8)
  - opencv-python 4.9.0
```

### Databases & Storage
```yaml
Vector Database:
  - pymilvus 2.3.5
  OR
  - qdrant-client 1.7.0

Relational Database:
  - asyncpg 0.29.0 (PostgreSQL async driver)

Cache:
  - redis 5.0.1
  - aioredis 2.0.1

Object Storage:
  - minio 7.2.0
  OR
  - boto3 1.34.0 (AWS S3)
```

### Message Queue
```yaml
RabbitMQ:
  - aio-pika 9.3.1
```

### Utilities
```yaml
HTTP Client:
  - httpx 0.26.0

Image Processing:
  - Pillow 10.2.0
  - albumentations 1.3.1

Async:
  - asyncio (built-in)
  - aiofiles 23.2.1

Monitoring:
  - prometheus-client 0.19.0
  - opentelemetry-api 1.22.0
```

---

## 🏗️ Architecture

### Directory Structure
```
cv-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── face.py     # Face recognition endpoints
│   │   │   │   ├── image.py    # Image search endpoints
│   │   │   │   ├── room.py     # Room analysis endpoints
│   │   │   │   ├── ocr.py      # OCR endpoints
│   │   │   │   └── anomaly.py  # Anomaly detection endpoints
│   │   │   └── router.py       # API router aggregation
│   │
│   ├── core/                   # Core business logic
│   │   ├── __init__.py
│   │   ├── face_recognition.py # Face detection & recognition
│   │   ├── liveness.py         # Anti-spoofing
│   │   ├── image_embedding.py  # CLIP embeddings
│   │   ├── room_analyzer.py    # Room status analysis
│   │   ├── ocr_engine.py       # OCR processing
│   │   └── anomaly_detector.py # Anomaly detection
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── face.py
│   │   ├── image.py
│   │   ├── room.py
│   │   ├── ocr.py
│   │   └── anomaly.py
│   │
│   ├── services/               # External service integrations
│   │   ├── __init__.py
│   │   ├── vector_db.py        # Milvus/Qdrant client
│   │   ├── database.py         # PostgreSQL client
│   │   ├── cache.py            # Redis client
│   │   ├── storage.py          # MinIO/S3 client
│   │   └── message_queue.py    # RabbitMQ client
│   │
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── image_processing.py # Image preprocessing
│   │   ├── logging.py          # Logging setup
│   │   └── metrics.py          # Prometheus metrics
│   │
│   └── ml_models/              # Model management
│       ├── __init__.py
│       ├── model_loader.py     # Load models on startup
│       └── weights/            # Model weights (gitignored)
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_face_recognition.py
│   │   ├── test_image_embedding.py
│   │   └── test_ocr.py
│   ├── integration/
│   │   ├── test_api_face.py
│   │   ├── test_api_image.py
│   │   └── test_vector_db.py
│   └── performance/
│       └── test_load.py
│
├── scripts/
│   ├── download_models.py      # Download pretrained models
│   ├── init_vector_db.py       # Initialize Milvus collections
│   └── benchmark.py            # Performance benchmarking
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── alembic.ini
└── README.md
```

### Component Interaction
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         FastAPI Router              │
│  /api/v1/cv/face/recognize          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Face Recognition Core           │
│  1. Preprocess image                │
│  2. Detect faces (MTCNN)            │
│  3. Check liveness                  │
│  4. Generate embedding (ArcFace)    │
└──────┬──────────────────────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ Vector DB   │    │ PostgreSQL  │
│ (Search)    │    │ (Metadata)  │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └────────┬─────────┘
                ▼
       ┌─────────────────┐
       │  RabbitMQ       │
       │  Publish Event  │
       └─────────────────┘
```

---

## 🔌 API Endpoints

### Face Recognition & Enrollment

#### POST `/api/v1/cv/face/recognize`
Recognize face from camera feed or uploaded image.

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "camera_id": "cam_lobby_01",
  "timestamp": "2025-01-17T08:30:00Z",
  "check_liveness": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "employee_name": "Nguyen Van A",
  "confidence": 0.98,
  "is_alive": true,
  "recognition_time_ms": 125,
  "face_location": {
    "x": 120,
    "y": 80,
    "width": 150,
    "height": 180
  },
  "timestamp": "2025-01-17T08:30:00.125Z"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "error": "face_not_found",
  "message": "No matching face found in database",
  "confidence": 0.0,
  "recognition_time_ms": 85
}
```

**Response (Liveness Failed):**
```json
{
  "success": false,
  "error": "liveness_check_failed",
  "message": "Photo/video spoofing detected",
  "liveness_score": 0.32,
  "recognition_time_ms": 95
}
```

---

#### POST `/api/v1/cv/face/enroll`
Enroll a new employee face into the system.

**Request:**
```json
{
  "employee_id": "EMP001",
  "images": [
    "base64_image_1_frontal",
    "base64_image_2_left",
    "base64_image_3_right"
  ],
  "metadata": {
    "name": "Nguyen Van A",
    "department": "reception",
    "position": "receptionist"
  },
  "replace_existing": false
}
```

**Response:**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "embeddings_created": 3,
  "average_quality_score": 0.92,
  "vector_ids": ["vec_001", "vec_002", "vec_003"],
  "warnings": []
}
```

---

#### GET `/api/v1/cv/face/embedding/{employee_id}`
Retrieve stored face embedding for an employee.

**Response:**
```json
{
  "employee_id": "EMP001",
  "embeddings": [
    {
      "vector_id": "vec_001",
      "created_at": "2025-01-10T10:00:00Z",
      "quality_score": 0.95
    }
  ],
  "total_count": 3
}
```

---

#### DELETE `/api/v1/cv/face/{employee_id}`
Remove employee face from system.

**Response:**
```json
{
  "success": true,
  "employee_id": "EMP001",
  "embeddings_deleted": 3
}
```

---

### Image Search & Retrieval

#### POST `/api/v1/cv/image/search`
Search for similar images using visual similarity.

**Request:**
```json
{
  "query_image": "base64_encoded_image",
  "category": "lost_found",
  "top_k": 10,
  "threshold": 0.7,
  "filters": {
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-01-17"
    }
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "image_id": "IMG_LF_001",
      "similarity": 0.95,
      "metadata": {
        "category": "lost_found",
        "upload_time": "2025-01-15T10:00:00Z",
        "location": "Floor 2 hallway",
        "item_type": "wallet",
        "description": "Black leather wallet"
      },
      "url": "https://storage.hotel.com/lost-found/IMG_LF_001.jpg",
      "thumbnail_url": "https://storage.hotel.com/lost-found/thumb_IMG_LF_001.jpg"
    }
  ],
  "total_found": 8,
  "search_time_ms": 45
}
```

---

#### POST `/api/v1/cv/image/index`
Index a new image for future similarity search.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "metadata": {
    "category": "room",
    "room_number": "201",
    "tags": ["clean", "ready", "deluxe"],
    "description": "Deluxe room ready for guest",
    "photographer": "EMP005"
  }
}
```

**Response:**
```json
{
  "success": true,
  "image_id": "IMG_ROOM_201_20250117",
  "vector_id": "vec_img_12345",
  "storage_url": "https://storage.hotel.com/rooms/201/IMG_ROOM_201_20250117.jpg",
  "indexed_at": "2025-01-17T11:30:00Z"
}
```

---

### Room Analysis

#### POST `/api/v1/cv/room/analyze`
Analyze room condition from image.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "room_number": "201",
  "analysis_depth": "detailed"
}
```

**Response:**
```json
{
  "room_number": "201",
  "overall_status": "dirty",
  "ready_for_guest": false,
  "confidence": 0.89,
  "tags": [
    {
      "label": "bed_unmade",
      "confidence": 0.92,
      "severity": "high"
    },
    {
      "label": "towel_missing",
      "confidence": 0.88,
      "severity": "medium"
    },
    {
      "label": "floor_needs_cleaning",
      "confidence": 0.75,
      "severity": "medium"
    }
  ],
  "estimated_cleaning_time_minutes": 25,
  "checklist": {
    "bed_made": false,
    "bathroom_clean": true,
    "towels_present": false,
    "amenities_complete": false,
    "floor_clean": false
  },
  "analysis_time_ms": 340
}
```

---

#### GET `/api/v1/cv/room/status/{room_number}`
Get cached room status from latest analysis.

**Response:**
```json
{
  "room_number": "201",
  "status": "clean",
  "last_analyzed_at": "2025-01-17T10:00:00Z",
  "analyzed_by": "EMP005",
  "ready_for_guest": true
}
```

---

### OCR Services

#### POST `/api/v1/cv/ocr/invoice`
Extract structured data from invoice image.

**Request:**
```json
{
  "image": "base64_encoded_invoice_image",
  "language": "vi"
}
```

**Response:**
```json
{
  "success": true,
  "invoice_number": "INV-2025-001",
  "date": "2025-01-17",
  "vendor": "ABC Supplies Co.",
  "total_amount": 1500000,
  "currency": "VND",
  "items": [
    {
      "description": "Bed linens",
      "quantity": 10,
      "unit_price": 100000,
      "amount": 1000000
    },
    {
      "description": "Cleaning supplies",
      "quantity": 1,
      "unit_price": 500000,
      "amount": 500000
    }
  ],
  "tax_amount": 0,
  "confidence": 0.94,
  "ocr_time_ms": 1200,
  "raw_text": "..."
}
```

---

#### POST `/api/v1/cv/ocr/id`
Extract information from ID card or passport.

**Request:**
```json
{
  "image": "base64_encoded_id_image",
  "document_type": "id_card",
  "country": "VN"
}
```

**Response:**
```json
{
  "success": true,
  "document_type": "id_card",
  "id_number": "001234567890",
  "full_name": "NGUYEN VAN A",
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "nationality": "Vietnamese",
  "address": "123 Nguyen Trai, District 1, Ho Chi Minh City",
  "issue_date": "2020-01-01",
  "expiry_date": "2030-01-01",
  "confidence": 0.96,
  "ocr_time_ms": 980
}
```

---

### Anomaly Detection

#### POST `/api/v1/cv/anomaly/detect`
Detect anomalies or safety hazards in real-time.

**Request:**
```json
{
  "image": "base64_encoded_camera_frame",
  "camera_id": "cam_hallway_03",
  "detection_types": ["fire", "flood", "intrusion"],
  "timestamp": "2025-01-17T14:30:00Z"
}
```

**Response:**
```json
{
  "anomalies_detected": true,
  "count": 1,
  "anomalies": [
    {
      "type": "flood",
      "confidence": 0.89,
      "location": {
        "x": 120,
        "y": 450,
        "width": 200,
        "height": 100
      },
      "severity": "high",
      "alert": true,
      "description": "Water pooling detected on floor"
    }
  ],
  "camera_id": "cam_hallway_03",
  "timestamp": "2025-01-17T14:30:00.234Z",
  "detection_time_ms": 280
}
```

---

### Health & Monitoring

#### GET `/api/v1/cv/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T15:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5
    },
    "vector_db": {
      "status": "ok",
      "latency_ms": 12
    },
    "redis": {
      "status": "ok",
      "latency_ms": 2
    },
    "gpu": {
      "status": "ok",
      "memory_used_mb": 4096,
      "memory_total_mb": 8192
    },
    "models": {
      "face_recognition": "loaded",
      "image_embedding": "loaded",
      "ocr": "loaded",
      "anomaly_detection": "loaded"
    }
  }
}
```

---

#### GET `/api/v1/cv/metrics`
Prometheus-compatible metrics endpoint.

**Response:**
```
# HELP cv_face_recognition_total Total face recognition requests
# TYPE cv_face_recognition_total counter
cv_face_recognition_total{status="success"} 1234
cv_face_recognition_total{status="failure"} 56

# HELP cv_face_recognition_duration_seconds Face recognition duration
# TYPE cv_face_recognition_duration_seconds histogram
cv_face_recognition_duration_seconds_bucket{le="0.1"} 890
cv_face_recognition_duration_seconds_bucket{le="0.2"} 1200
cv_face_recognition_duration_seconds_bucket{le="0.5"} 1280
cv_face_recognition_duration_seconds_bucket{le="+Inf"} 1290

# HELP cv_image_search_total Total image search requests
# TYPE cv_image_search_total counter
cv_image_search_total 567

# HELP cv_ocr_total Total OCR requests
# TYPE cv_ocr_total counter
cv_ocr_total{type="invoice"} 234
cv_ocr_total{type="id"} 89
```

---

## 📊 Data Models

### PostgreSQL Schema

```sql
-- Employee face metadata
CREATE TABLE employee_faces (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL REFERENCES employees(id),
    vector_id VARCHAR(100) NOT NULL,
    quality_score FLOAT,
    image_angle VARCHAR(20), -- frontal, left, right
    enrolled_at TIMESTAMP DEFAULT NOW(),
    enrolled_by VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(employee_id, vector_id)
);

CREATE INDEX idx_employee_faces_employee_id ON employee_faces(employee_id);
CREATE INDEX idx_employee_faces_active ON employee_faces(is_active);

-- Image metadata
CREATE TABLE image_metadata (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- room, lost_found, amenity
    room_number VARCHAR(10),
    vector_id VARCHAR(100) NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    upload_time TIMESTAMP DEFAULT NOW(),
    uploaded_by VARCHAR(20),
    tags JSONB,
    metadata JSONB,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_image_category ON image_metadata(category);
CREATE INDEX idx_image_room ON image_metadata(room_number);
CREATE INDEX idx_image_upload_time ON image_metadata(upload_time);
CREATE INDEX idx_image_tags ON image_metadata USING GIN(tags);

-- Room analysis logs
CREATE TABLE room_analysis_logs (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    image_id VARCHAR(100),
    overall_status VARCHAR(20), -- clean, dirty, maintenance
    ready_for_guest BOOLEAN,
    confidence FLOAT,
    tags JSONB,
    estimated_cleaning_time INT, -- minutes
    analyzed_at TIMESTAMP DEFAULT NOW(),
    analyzed_by VARCHAR(20)
);

CREATE INDEX idx_room_analysis_room ON room_analysis_logs(room_number);
CREATE INDEX idx_room_analysis_time ON room_analysis_logs(analyzed_at);

-- OCR results
CREATE TABLE ocr_results (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50), -- invoice, id_card, passport
    extracted_data JSONB NOT NULL,
    confidence FLOAT,
    raw_text TEXT,
    processed_at TIMESTAMP DEFAULT NOW(),
    processed_by VARCHAR(20)
);

CREATE INDEX idx_ocr_type ON ocr_results(document_type);
CREATE INDEX idx_ocr_time ON ocr_results(processed_at);

-- Anomaly detections
CREATE TABLE anomaly_detections (
    id SERIAL PRIMARY KEY,
    camera_id VARCHAR(50) NOT NULL,
    anomaly_type VARCHAR(50), -- fire, flood, intrusion
    confidence FLOAT,
    severity VARCHAR(20), -- low, medium, high
    location JSONB, -- bounding box
    image_url TEXT,
    detected_at TIMESTAMP DEFAULT NOW(),
    alert_sent BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(20)
);

CREATE INDEX idx_anomaly_camera ON anomaly_detections(camera_id);
CREATE INDEX idx_anomaly_time ON anomaly_detections(detected_at);
CREATE INDEX idx_anomaly_unresolved ON anomaly_detections(resolved_at) WHERE resolved_at IS NULL;
```

### Milvus Collections

#### Collection: `face_embeddings`
```python
from pymilvus import CollectionSchema, FieldSchema, DataType

face_collection_schema = CollectionSchema(
    fields=[
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="employee_id", dtype=DataType.VARCHAR, max_length=20),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=512),
        FieldSchema(name="quality_score", dtype=DataType.FLOAT),
        FieldSchema(name="enrolled_at", dtype=DataType.INT64)
    ],
    description="Employee face embeddings (ArcFace 512-dim)"
)

# Index: HNSW for fast similarity search
index_params = {
    "index_type": "HNSW",
    "metric_type": "COSINE",
    "params": {"M": 16, "efConstruction": 200}
}
```

#### Collection: `image_embeddings`
```python
image_collection_schema = CollectionSchema(
    fields=[
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="image_id", dtype=DataType.VARCHAR, max_length=100),
        FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=50),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=768),  # CLIP ViT-L/14
        FieldSchema(name="upload_time", dtype=DataType.INT64)
    ],
    description="Image embeddings for similarity search (CLIP 768-dim)"
)
```

---

## 💻 Implementation Guide

### 1. Setup Environment

```bash
# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download pre-trained models
python scripts/download_models.py
```

### 2. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "CV Service"
    VERSION: str = "1.0.0"
    PORT: int = 8001
    DEBUG: bool = False

    # Database
    DATABASE_URL: str
    POSTGRES_POOL_SIZE: int = 20
    POSTGRES_MAX_OVERFLOW: int = 10

    # Vector DB (Milvus)
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530
    MILVUS_USER: str = ""
    MILVUS_PASSWORD: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 300  # 5 minutes

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Storage
    STORAGE_TYPE: str = "minio"  # minio or s3
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "hotel-images"

    # Face Recognition
    FACE_RECOGNITION_THRESHOLD: float = 0.7
    FACE_DETECTION_THRESHOLD: float = 0.9
    LIVENESS_THRESHOLD: float = 0.5

    # Image Search
    IMAGE_SEARCH_TOP_K: int = 10
    IMAGE_SIMILARITY_THRESHOLD: float = 0.7

    # OCR
    OCR_LANGUAGES: str = "vi,en"

    # Performance
    MAX_WORKERS: int = 4
    GPU_DEVICE_ID: int = 0

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 3. Face Recognition Core (`app/core/face_recognition.py`)

```python
import cv2
import numpy as np
from insightface.app import FaceAnalysis
from typing import Optional, Tuple, List
import onnxruntime as ort

class FaceRecognitionEngine:
    def __init__(self, config):
        self.config = config

        # Initialize InsightFace
        self.app = FaceAnalysis(
            name='buffalo_l',
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        self.app.prepare(ctx_id=config.GPU_DEVICE_ID, det_size=(640, 640))

    def detect_faces(self, image: np.ndarray) -> List[dict]:
        """
        Detect all faces in image
        Returns: List of face dictionaries with bbox, landmarks, embedding
        """
        faces = self.app.get(image)
        return [
            {
                "bbox": face.bbox.tolist(),
                "det_score": float(face.det_score),
                "landmark": face.landmark.tolist(),
                "embedding": face.embedding,
                "age": int(face.age),
                "gender": "M" if face.gender == 1 else "F"
            }
            for face in faces
        ]

    def extract_embedding(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract face embedding from image
        Returns: 512-dimensional embedding vector or None if no face found
        """
        faces = self.detect_faces(image)

        if not faces:
            return None

        # Return embedding of the largest face
        largest_face = max(faces, key=lambda f: self._calculate_bbox_area(f["bbox"]))
        return largest_face["embedding"]

    def compare_embeddings(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two embeddings
        Returns: Similarity score (0-1)
        """
        return float(np.dot(embedding1, embedding2) /
                    (np.linalg.norm(embedding1) * np.linalg.norm(embedding2)))

    def _calculate_bbox_area(self, bbox: List[float]) -> float:
        """Calculate bounding box area"""
        x1, y1, x2, y2 = bbox
        return (x2 - x1) * (y2 - y1)

# Singleton instance
_engine: Optional[FaceRecognitionEngine] = None

def get_face_engine() -> FaceRecognitionEngine:
    global _engine
    if _engine is None:
        from app.config import get_settings
        _engine = FaceRecognitionEngine(get_settings())
    return _engine
```

### 4. Liveness Detection (`app/core/liveness.py`)

```python
import cv2
import numpy as np
from typing import Tuple
import onnxruntime as ort

class LivenessDetector:
    """
    Silent Face Anti-Spoofing
    Detects photo/video attacks
    """

    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(
            model_path,
            providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
        )
        self.input_size = (256, 256)

    def check_liveness(self, image: np.ndarray, face_bbox: list) -> Tuple[bool, float]:
        """
        Check if face is real (not photo/video)
        Returns: (is_alive: bool, confidence: float)
        """
        # Crop face region
        x1, y1, x2, y2 = map(int, face_bbox)
        face_img = image[y1:y2, x1:x2]

        # Preprocess
        face_img = cv2.resize(face_img, self.input_size)
        face_img = face_img.astype(np.float32) / 255.0
        face_img = np.transpose(face_img, (2, 0, 1))
        face_img = np.expand_dims(face_img, 0)

        # Inference
        outputs = self.session.run(None, {"input": face_img})
        score = float(outputs[0][0][1])  # Probability of real face

        return score > 0.5, score

# Singleton
_liveness_detector: Optional[LivenessDetector] = None

def get_liveness_detector() -> LivenessDetector:
    global _liveness_detector
    if _liveness_detector is None:
        model_path = "app/ml_models/weights/anti_spoofing_model.onnx"
        _liveness_detector = LivenessDetector(model_path)
    return _liveness_detector
```

### 5. Vector Database Service (`app/services/vector_db.py`)

```python
from pymilvus import connections, Collection, utility
from typing import List, Tuple
import numpy as np

class VectorDBService:
    def __init__(self, config):
        self.config = config
        connections.connect(
            alias="default",
            host=config.MILVUS_HOST,
            port=config.MILVUS_PORT,
            user=config.MILVUS_USER,
            password=config.MILVUS_PASSWORD
        )

        self.face_collection = Collection("face_embeddings")
        self.image_collection = Collection("image_embeddings")

        # Load collections into memory
        self.face_collection.load()
        self.image_collection.load()

    async def insert_face_embedding(
        self,
        employee_id: str,
        embedding: np.ndarray,
        quality_score: float
    ) -> str:
        """Insert face embedding and return vector_id"""
        import time

        data = [
            [employee_id],
            [embedding.tolist()],
            [quality_score],
            [int(time.time())]
        ]

        result = self.face_collection.insert(data)
        self.face_collection.flush()

        return str(result.primary_keys[0])

    async def search_face(
        self,
        query_embedding: np.ndarray,
        top_k: int = 1
    ) -> List[Tuple[str, float]]:
        """
        Search for similar faces
        Returns: List of (employee_id, similarity_score)
        """
        search_params = {
            "metric_type": "COSINE",
            "params": {"ef": 100}
        }

        results = self.face_collection.search(
            data=[query_embedding.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["employee_id"]
        )

        matches = []
        for result in results[0]:
            employee_id = result.entity.get("employee_id")
            score = result.distance
            matches.append((employee_id, score))

        return matches

    async def delete_face_embeddings(self, employee_id: str):
        """Delete all embeddings for an employee"""
        expr = f'employee_id == "{employee_id}"'
        self.face_collection.delete(expr)
        self.face_collection.flush()

    async def insert_image_embedding(
        self,
        image_id: str,
        category: str,
        embedding: np.ndarray
    ) -> str:
        """Insert image embedding for similarity search"""
        import time

        data = [
            [image_id],
            [category],
            [embedding.tolist()],
            [int(time.time())]
        ]

        result = self.image_collection.insert(data)
        self.image_collection.flush()

        return str(result.primary_keys[0])

    async def search_similar_images(
        self,
        query_embedding: np.ndarray,
        category: Optional[str] = None,
        top_k: int = 10
    ) -> List[Tuple[str, float]]:
        """Search for similar images"""
        search_params = {
            "metric_type": "COSINE",
            "params": {"ef": 100}
        }

        expr = f'category == "{category}"' if category else None

        results = self.image_collection.search(
            data=[query_embedding.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            expr=expr,
            output_fields=["image_id"]
        )

        matches = []
        for result in results[0]:
            image_id = result.entity.get("image_id")
            score = result.distance
            matches.append((image_id, score))

        return matches
```

### 6. API Endpoint Example (`app/api/v1/endpoints/face.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import base64
import cv2
import numpy as np
from typing import Optional

from app.core.face_recognition import get_face_engine
from app.core.liveness import get_liveness_detector
from app.services.vector_db import VectorDBService
from app.services.database import get_db
from app.services.message_queue import publish_event
from app.config import get_settings

router = APIRouter()

class FaceRecognitionRequest(BaseModel):
    image: str  # base64 encoded
    camera_id: str
    timestamp: str
    check_liveness: bool = True

class FaceRecognitionResponse(BaseModel):
    success: bool
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    confidence: float
    is_alive: Optional[bool] = None
    recognition_time_ms: int
    face_location: Optional[dict] = None
    timestamp: str
    error: Optional[str] = None
    message: Optional[str] = None

@router.post("/recognize", response_model=FaceRecognitionResponse)
async def recognize_face(
    request: FaceRecognitionRequest,
    face_engine = Depends(get_face_engine),
    liveness_detector = Depends(get_liveness_detector),
    vector_db: VectorDBService = Depends(),
    db = Depends(get_db),
    config = Depends(get_settings)
):
    """Recognize face from camera feed or uploaded image"""
    import time
    start_time = time.time()

    try:
        # Decode image
        image_bytes = base64.b64decode(request.image)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Detect faces
        faces = face_engine.detect_faces(image)

        if not faces:
            return FaceRecognitionResponse(
                success=False,
                confidence=0.0,
                recognition_time_ms=int((time.time() - start_time) * 1000),
                timestamp=request.timestamp,
                error="no_face_detected",
                message="No face detected in image"
            )

        # Use largest face
        face = max(faces, key=lambda f:
                  (f["bbox"][2] - f["bbox"][0]) * (f["bbox"][3] - f["bbox"][1]))

        # Liveness check
        if request.check_liveness:
            is_alive, liveness_score = liveness_detector.check_liveness(
                image, face["bbox"]
            )

            if not is_alive:
                return FaceRecognitionResponse(
                    success=False,
                    confidence=0.0,
                    is_alive=False,
                    recognition_time_ms=int((time.time() - start_time) * 1000),
                    timestamp=request.timestamp,
                    error="liveness_check_failed",
                    message="Photo/video spoofing detected"
                )

        # Search in vector database
        matches = await vector_db.search_face(face["embedding"], top_k=1)

        if not matches or matches[0][1] < config.FACE_RECOGNITION_THRESHOLD:
            return FaceRecognitionResponse(
                success=False,
                confidence=matches[0][1] if matches else 0.0,
                recognition_time_ms=int((time.time() - start_time) * 1000),
                timestamp=request.timestamp,
                error="face_not_found",
                message="No matching face found in database"
            )

        employee_id, confidence = matches[0]

        # Get employee info from database
        employee = await db.fetch_one(
            "SELECT name FROM employees WHERE id = $1",
            employee_id
        )

        # Publish attendance event to RabbitMQ
        await publish_event("attendance.events", {
            "employee_id": employee_id,
            "timestamp": request.timestamp,
            "camera_id": request.camera_id,
            "confidence": confidence,
            "action": "check_in"
        })

        recognition_time = int((time.time() - start_time) * 1000)

        return FaceRecognitionResponse(
            success=True,
            employee_id=employee_id,
            employee_name=employee["name"] if employee else None,
            confidence=confidence,
            is_alive=True if request.check_liveness else None,
            recognition_time_ms=recognition_time,
            face_location={
                "x": int(face["bbox"][0]),
                "y": int(face["bbox"][1]),
                "width": int(face["bbox"][2] - face["bbox"][0]),
                "height": int(face["bbox"][3] - face["bbox"][1])
            },
            timestamp=request.timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
```

---

## 🧪 Testing Strategy

### Unit Tests

```python
# tests/unit/test_face_recognition.py
import pytest
import numpy as np
from app.core.face_recognition import FaceRecognitionEngine

@pytest.fixture
def face_engine():
    from app.config import get_settings
    return FaceRecognitionEngine(get_settings())

def test_extract_embedding(face_engine):
    # Load test image
    image = cv2.imread("tests/fixtures/test_face.jpg")

    # Extract embedding
    embedding = face_engine.extract_embedding(image)

    assert embedding is not None
    assert embedding.shape == (512,)
    assert np.linalg.norm(embedding) > 0

def test_compare_embeddings(face_engine):
    emb1 = np.random.rand(512).astype(np.float32)
    emb2 = emb1 + np.random.rand(512) * 0.01  # Similar
    emb3 = np.random.rand(512).astype(np.float32)  # Different

    sim12 = face_engine.compare_embeddings(emb1, emb2)
    sim13 = face_engine.compare_embeddings(emb1, emb3)

    assert sim12 > sim13
    assert 0 <= sim12 <= 1
```

### Integration Tests

```python
# tests/integration/test_api_face.py
from fastapi.testclient import TestClient
import base64

def test_face_recognition_success(client: TestClient):
    # Load test image
    with open("tests/fixtures/known_face.jpg", "rb") as f:
        image_bytes = f.read()
    image_b64 = base64.b64encode(image_bytes).decode()

    response = client.post("/api/v1/cv/face/recognize", json={
        "image": image_b64,
        "camera_id": "test_cam",
        "timestamp": "2025-01-17T10:00:00Z",
        "check_liveness": False
    })

    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["employee_id"] is not None
    assert data["confidence"] > 0.7

def test_face_recognition_no_face(client: TestClient):
    # Load image without face
    with open("tests/fixtures/no_face.jpg", "rb") as f:
        image_bytes = f.read()
    image_b64 = base64.b64encode(image_bytes).decode()

    response = client.post("/api/v1/cv/face/recognize", json={
        "image": image_b64,
        "camera_id": "test_cam",
        "timestamp": "2025-01-17T10:00:00Z"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert data["error"] == "no_face_detected"
```

### Performance Tests

```python
# tests/performance/test_load.py
import pytest
from locust import HttpUser, task, between

class CVServiceUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def recognize_face(self):
        with open("tests/fixtures/test_face.jpg", "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode()

        self.client.post("/api/v1/cv/face/recognize", json={
            "image": image_b64,
            "camera_id": "load_test",
            "timestamp": "2025-01-17T10:00:00Z"
        })

# Run: locust -f tests/performance/test_load.py --host=http://localhost:8001
```

---

## 🚀 Deployment

### Dockerfile

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# Install Python
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY scripts/ ./scripts/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Download models
RUN python3 scripts/download_models.py

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/api/v1/cv/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  cv-service:
    build: .
    image: hotel-ai/cv-service:latest
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/hoteldb
      - MILVUS_HOST=milvus
      - MILVUS_PORT=19530
      - REDIS_URL=redis://redis:6379/0
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
      - GPU_DEVICE_ID=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    depends_on:
      - postgres
      - milvus
      - redis
      - rabbitmq
    restart: unless-stopped
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-service
  namespace: hotel-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cv-service
  template:
    metadata:
      labels:
        app: cv-service
    spec:
      containers:
      - name: cv-service
        image: hotel-ai/cv-service:v1.0.0
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
        - name: MILVUS_HOST
          value: "milvus.hotel-ai.svc.cluster.local"
        - name: REDIS_URL
          value: "redis://redis.hotel-ai.svc.cluster.local:6379/0"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
        livenessProbe:
          httpGet:
            path: /api/v1/cv/health
            port: 8001
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/v1/cv/health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: cv-service
  namespace: hotel-ai
spec:
  selector:
    app: cv-service
  ports:
  - port: 8001
    targetPort: 8001
  type: ClusterIP
```

---

## 📊 Monitoring & Metrics

### Prometheus Metrics

```python
# app/utils/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Face recognition metrics
face_recognition_total = Counter(
    'cv_face_recognition_total',
    'Total face recognition requests',
    ['status']  # success, failure, no_face, liveness_failed
)

face_recognition_duration = Histogram(
    'cv_face_recognition_duration_seconds',
    'Face recognition duration',
    buckets=[0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0]
)

face_recognition_confidence = Histogram(
    'cv_face_recognition_confidence',
    'Face recognition confidence score',
    buckets=[0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0]
)

# Image search metrics
image_search_total = Counter(
    'cv_image_search_total',
    'Total image search requests',
    ['category']
)

image_search_duration = Histogram(
    'cv_image_search_duration_seconds',
    'Image search duration'
)

# OCR metrics
ocr_requests_total = Counter(
    'cv_ocr_requests_total',
    'Total OCR requests',
    ['document_type']
)

# System metrics
gpu_memory_usage = Gauge(
    'cv_gpu_memory_usage_bytes',
    'GPU memory usage in bytes'
)

model_loaded = Gauge(
    'cv_model_loaded',
    'Model loaded status (1=loaded, 0=not loaded)',
    ['model_name']
)
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "CV Service Monitoring",
    "panels": [
      {
        "title": "Face Recognition Rate",
        "targets": [
          {
            "expr": "rate(cv_face_recognition_total{status='success'}[5m])"
          }
        ]
      },
      {
        "title": "Recognition Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, cv_face_recognition_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "GPU Memory Usage",
        "targets": [
          {
            "expr": "cv_gpu_memory_usage_bytes / 1024 / 1024 / 1024"
          }
        ]
      }
    ]
  }
}
```

### Logging

```python
# app/utils/logging.py
import logging
import sys
from loguru import logger

def setup_logging():
    # Remove default handler
    logger.remove()

    # Add custom handler
    logger.add(
        sys.stdout,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
        level="INFO",
        serialize=False
    )

    # Add file handler
    logger.add(
        "logs/cv_service_{time:YYYY-MM-DD}.log",
        rotation="500 MB",
        retention="30 days",
        level="DEBUG"
    )

    return logger
```

---

## 🎯 Performance Targets

- **Face Recognition:** < 200ms per request (p95)
- **Image Search:** < 500ms per request (p95)
- **OCR Processing:** < 2s per document (p95)
- **Throughput:** 50 requests/second per instance
- **Accuracy:**
  - Face recognition: > 95%
  - Room tagging: > 90%
  - OCR extraction: > 93%
- **Uptime:** 99.5% (excluding planned maintenance)

---

This comprehensive guide provides everything needed to build, deploy, and operate the CV Service for the hotel management AI system.
