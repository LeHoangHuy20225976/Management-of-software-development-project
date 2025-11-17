# Hotel Management AI System - Architecture Proposal

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [API Endpoints](#api-endpoints)
4. [Data Flow](#data-flow)
5. [Technology Stack](#technology-stack)
6. [Database Schema](#database-schema)
7. [Integration Patterns](#integration-patterns)

---

## 🏗️ System Overview

### Core Services Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway / Load Balancer              │
│                     (Kong / Nginx / Traefik)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   CV Service   │  │   ML Service    │  │  LLM Service    │
│   (FastAPI)    │  │   (FastAPI)     │  │  (FastAPI)      │
└───────┬────────┘  └────────┬────────┘  └────────┬────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Prefect Server    │
                    │  (Orchestration)   │
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  PostgreSQL    │  │  Vector DB      │  │   Redis Cache   │
│  (Main DB)     │  │ (Milvus/Qdrant) │  │                 │
└────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🔌 API Endpoints

### 1. CV Service (Port: 8001)

#### Face Recognition & Attendance

**POST** `/api/v1/cv/face/recognize`
```json
{
  "image": "base64_encoded_image",
  "camera_id": "cam_lobby_01",
  "timestamp": "2025-01-17T08:30:00Z"
}
```
Response:
```json
{
  "success": true,
  "employee_id": "EMP001",
  "confidence": 0.98,
  "is_alive": true,
  "recognition_time_ms": 125
}
```

**POST** `/api/v1/cv/face/enroll`
```json
{
  "employee_id": "EMP001",
  "images": ["base64_1", "base64_2", "base64_3"],
  "metadata": {
    "name": "Nguyen Van A",
    "department": "reception"
  }
}
```

**GET** `/api/v1/cv/face/embedding/{employee_id}`

**DELETE** `/api/v1/cv/face/{employee_id}`

#### Image Search & Retrieval

**POST** `/api/v1/cv/image/search`
```json
{
  "query_image": "base64_encoded_image",
  "category": "room|lost_found|amenity",
  "top_k": 10,
  "threshold": 0.7
}
```
Response:
```json
{
  "results": [
    {
      "image_id": "IMG001",
      "similarity": 0.95,
      "metadata": {
        "room_number": "201",
        "category": "room",
        "upload_time": "2025-01-15T10:00:00Z"
      },
      "url": "https://storage.../IMG001.jpg"
    }
  ]
}
```

**POST** `/api/v1/cv/image/index`
```json
{
  "image": "base64_encoded_image",
  "metadata": {
    "category": "room",
    "room_number": "201",
    "tags": ["clean", "ready"]
  }
}
```

#### Room Vision Tagging

**POST** `/api/v1/cv/room/analyze`
```json
{
  "image": "base64_encoded_image",
  "room_number": "201"
}
```
Response:
```json
{
  "room_number": "201",
  "status": "dirty",
  "tags": [
    {"label": "bed_unmade", "confidence": 0.92},
    {"label": "towel_missing", "confidence": 0.88},
    {"label": "amenity_incomplete", "confidence": 0.75}
  ],
  "ready_for_guest": false,
  "estimated_cleaning_time_minutes": 25
}
```

#### OCR Services

**POST** `/api/v1/cv/ocr/invoice`
```json
{
  "image": "base64_encoded_image"
}
```
Response:
```json
{
  "invoice_number": "INV-2025-001",
  "date": "2025-01-17",
  "total_amount": 1500000,
  "currency": "VND",
  "items": [
    {"description": "Room 201", "amount": 1200000},
    {"description": "Breakfast", "amount": 300000}
  ],
  "confidence": 0.94
}
```

**POST** `/api/v1/cv/ocr/id`
```json
{
  "image": "base64_encoded_image",
  "document_type": "id_card|passport|driver_license"
}
```

#### Anomaly Detection

**POST** `/api/v1/cv/anomaly/detect`
```json
{
  "image": "base64_encoded_image",
  "camera_id": "cam_hallway_03",
  "detection_types": ["fire", "flood", "intrusion"]
}
```
Response:
```json
{
  "anomalies": [
    {
      "type": "flood",
      "confidence": 0.89,
      "location": {"x": 120, "y": 450, "w": 200, "h": 100},
      "severity": "high",
      "alert": true
    }
  ]
}
```

**GET** `/api/v1/cv/health`

**GET** `/api/v1/cv/metrics`

---

### 2. ML Service (Port: 8002)

#### Guest Recommendation

**POST** `/api/v1/ml/recommend/services`
```json
{
  "guest_id": "GUEST001",
  "top_k": 5,
  "context": {
    "current_room": "201",
    "check_in_date": "2025-01-15",
    "guest_segment": "business"
  }
}
```
Response:
```json
{
  "recommendations": [
    {
      "service_id": "SVC_SPA_001",
      "service_name": "Spa Package",
      "score": 0.87,
      "reason": "Popular with business travelers",
      "estimated_revenue": 500000
    }
  ]
}
```

**POST** `/api/v1/ml/recommend/rooms`
```json
{
  "guest_id": "GUEST001",
  "check_in": "2025-02-01",
  "check_out": "2025-02-03",
  "preferences": {
    "budget": "high",
    "view": "ocean"
  }
}
```

#### Dynamic Pricing

**POST** `/api/v1/ml/pricing/optimize`
```json
{
  "date_range": {
    "start": "2025-02-01",
    "end": "2025-02-28"
  },
  "room_types": ["deluxe", "suite", "standard"]
}
```
Response:
```json
{
  "pricing_schedule": [
    {
      "date": "2025-02-01",
      "room_type": "deluxe",
      "suggested_price": 2500000,
      "current_price": 2000000,
      "expected_occupancy": 0.85,
      "competitor_avg": 2300000,
      "confidence": 0.82
    }
  ]
}
```

**GET** `/api/v1/ml/pricing/current/{room_type}`

#### Churn Prediction

**POST** `/api/v1/ml/churn/predict`
```json
{
  "booking_id": "BOOK001",
  "guest_id": "GUEST001",
  "features": {
    "booking_lead_time_days": 30,
    "payment_method": "credit_card",
    "booking_source": "website",
    "total_amount": 5000000
  }
}
```
Response:
```json
{
  "booking_id": "BOOK001",
  "churn_probability": 0.35,
  "risk_level": "medium",
  "risk_factors": [
    {"factor": "long_lead_time", "impact": 0.15},
    {"factor": "high_cancellation_rate_segment", "impact": 0.20}
  ],
  "recommended_actions": [
    "send_confirmation_email",
    "offer_flexible_cancellation"
  ]
}
```

#### Forecasting

**POST** `/api/v1/ml/forecast/occupancy`
```json
{
  "forecast_days": 30,
  "room_type": "all"
}
```
Response:
```json
{
  "forecasts": [
    {
      "date": "2025-02-01",
      "predicted_occupancy": 0.78,
      "lower_bound": 0.70,
      "upper_bound": 0.85,
      "confidence": 0.88
    }
  ]
}
```

**POST** `/api/v1/ml/forecast/revenue`

**POST** `/api/v1/ml/forecast/housekeeping_demand`

#### Customer Lifetime Value

**POST** `/api/v1/ml/clv/predict`
```json
{
  "guest_id": "GUEST001"
}
```
Response:
```json
{
  "guest_id": "GUEST001",
  "predicted_clv": 50000000,
  "time_horizon_months": 12,
  "segment": "high_value",
  "retention_probability": 0.82
}
```

**GET** `/api/v1/ml/health`

**GET** `/api/v1/ml/metrics`

**POST** `/api/v1/ml/retrain/{model_name}`

---

### 3. LLM Service (Port: 8003)

#### Internal Assistant

**POST** `/api/v1/llm/assistant/query`
```json
{
  "user_id": "EMP001",
  "message": "What is the status of room 201?",
  "context": {
    "role": "receptionist",
    "department": "front_desk"
  },
  "stream": false
}
```
Response:
```json
{
  "response": "Room 201 is currently occupied. Guest: Mr. John Doe, Check-out: 2025-01-18. Last housekeeping: Today 10:00 AM. Status: Clean.",
  "sources": [
    {"type": "database", "table": "bookings"},
    {"type": "database", "table": "housekeeping_logs"}
  ],
  "confidence": 0.95,
  "tools_used": ["db_lookup", "room_status_check"]
}
```

**POST** `/api/v1/llm/assistant/query-stream` (SSE endpoint)

#### Monitoring & Alerting

**POST** `/api/v1/llm/monitoring/analyze`
```json
{
  "logs": [
    {"service": "cv", "level": "error", "message": "Recognition failed", "timestamp": "2025-01-17T08:30:00Z"},
    {"service": "cv", "level": "error", "message": "Recognition failed", "timestamp": "2025-01-17T08:31:00Z"}
  ]
}
```
Response:
```json
{
  "anomalies_detected": true,
  "issues": [
    {
      "type": "error_spike",
      "service": "cv",
      "severity": "high",
      "description": "Face recognition failure rate increased by 300% in the last 5 minutes",
      "recommended_action": "Check camera connectivity and lighting conditions"
    }
  ],
  "alert_sent": true,
  "alert_channels": ["slack", "email"]
}
```

**GET** `/api/v1/llm/monitoring/status`

#### Intelligent Routing

**POST** `/api/v1/llm/routing/classify`
```json
{
  "request": {
    "guest_id": "GUEST001",
    "message": "I need extra towels in my room",
    "channel": "whatsapp",
    "timestamp": "2025-01-17T08:30:00Z"
  }
}
```
Response:
```json
{
  "category": "housekeeping",
  "priority": "medium",
  "assigned_to": "housekeeping_team",
  "structured_request": {
    "type": "amenity_request",
    "room_number": "201",
    "items": ["towel"],
    "quantity": 2,
    "urgency": "normal"
  },
  "workflow_id": "WF_HOUSEKEEPING_001"
}
```

#### Message Generation

**POST** `/api/v1/llm/generate/email`
```json
{
  "template_type": "booking_confirmation",
  "variables": {
    "guest_name": "John Doe",
    "room_type": "Deluxe Ocean View",
    "check_in": "2025-02-01",
    "check_out": "2025-02-03",
    "total_amount": 5000000
  },
  "language": "vi"
}
```
Response:
```json
{
  "subject": "Xác nhận đặt phòng - Hotel ABC",
  "body": "Kính gửi Quý khách John Doe,\n\nChúng tôi xác nhận đã nhận được đặt phòng...",
  "html_body": "<html>...</html>"
}
```

**POST** `/api/v1/llm/generate/apology`

**POST** `/api/v1/llm/generate/checkin-instructions`

#### Tool Calling & Orchestration

**POST** `/api/v1/llm/execute/task`
```json
{
  "instruction": "Check if room 201 is clean and ready, then send confirmation email to guest",
  "context": {
    "booking_id": "BOOK001",
    "room_number": "201"
  }
}
```
Response:
```json
{
  "execution_plan": [
    {"step": 1, "action": "check_room_status", "service": "cv"},
    {"step": 2, "action": "update_room_status", "service": "prefect"},
    {"step": 3, "action": "generate_email", "service": "llm"},
    {"step": 4, "action": "send_email", "service": "prefect"}
  ],
  "results": [
    {"step": 1, "status": "completed", "result": {"room_ready": true}},
    {"step": 2, "status": "completed"},
    {"step": 3, "status": "completed", "result": {"email_id": "EMAIL001"}},
    {"step": 4, "status": "completed"}
  ],
  "overall_status": "success"
}
```

**GET** `/api/v1/llm/health`

**GET** `/api/v1/llm/metrics`

---

### 4. Prefect Service (Port: 8004)

#### Workflow Management

**POST** `/api/v1/prefect/workflows/trigger`
```json
{
  "workflow_name": "daily_report_generation",
  "parameters": {
    "date": "2025-01-17",
    "report_types": ["occupancy", "revenue", "housekeeping"]
  },
  "scheduled_time": "2025-01-17T23:00:00Z"
}
```
Response:
```json
{
  "flow_run_id": "fr_abc123",
  "workflow_name": "daily_report_generation",
  "status": "scheduled",
  "scheduled_start": "2025-01-17T23:00:00Z",
  "estimated_duration_minutes": 15
}
```

**GET** `/api/v1/prefect/workflows/status/{flow_run_id}`

**POST** `/api/v1/prefect/workflows/cancel/{flow_run_id}`

#### Event Handling

**POST** `/api/v1/prefect/events/attendance`
```json
{
  "employee_id": "EMP001",
  "timestamp": "2025-01-17T08:30:00Z",
  "action": "check_in",
  "location": "cam_lobby_01",
  "confidence": 0.98
}
```

**POST** `/api/v1/prefect/events/booking`
```json
{
  "booking_id": "BOOK001",
  "event_type": "new_booking",
  "guest_data": {...},
  "room_data": {...}
}
```

**POST** `/api/v1/prefect/events/room_status`
```json
{
  "room_number": "201",
  "old_status": "dirty",
  "new_status": "clean",
  "updated_by": "EMP005",
  "timestamp": "2025-01-17T11:00:00Z"
}
```

#### Data Pipeline

**POST** `/api/v1/prefect/pipeline/sync`
```json
{
  "source": "pms",
  "target": "warehouse",
  "data_type": "bookings",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-17"
  }
}
```

**POST** `/api/v1/prefect/pipeline/etl/{pipeline_name}`

**GET** `/api/v1/prefect/pipeline/status/{pipeline_id}`

#### Logging & Monitoring

**POST** `/api/v1/prefect/logs/ingest`
```json
{
  "service": "cv",
  "logs": [
    {
      "level": "info",
      "message": "Face recognized successfully",
      "metadata": {...},
      "timestamp": "2025-01-17T08:30:00Z"
    }
  ]
}
```

**GET** `/api/v1/prefect/logs/query`
```json
{
  "service": "cv|ml|llm|all",
  "level": "error",
  "start_time": "2025-01-17T00:00:00Z",
  "end_time": "2025-01-17T23:59:59Z",
  "limit": 100
}
```

#### Scheduling

**POST** `/api/v1/prefect/schedule/create`
```json
{
  "name": "nightly_ml_retrain",
  "workflow": "ml_model_retrain",
  "cron": "0 2 * * *",
  "parameters": {
    "model_name": "pricing_model"
  }
}
```

**GET** `/api/v1/prefect/schedule/list`

**DELETE** `/api/v1/prefect/schedule/{schedule_id}`

**GET** `/api/v1/prefect/health`

---

## 🔄 Data Flow Examples

### Example 1: Face Recognition Attendance Flow

```
1. Camera captures image
   ↓
2. CV Service receives image → /api/v1/cv/face/recognize
   ↓
3. CV returns employee_id + confidence
   ↓
4. CV Service triggers webhook → Prefect /api/v1/prefect/events/attendance
   ↓
5. Prefect workflow:
   - Logs attendance to PostgreSQL
   - Checks if employee is late
   - If late: Triggers LLM to generate notification
   - LLM generates message via /api/v1/llm/generate/notification
   - Prefect sends notification to supervisor
```

### Example 2: Room Cleaning Workflow

```
1. Housekeeping staff completes cleaning
   ↓
2. Staff takes photo of room
   ↓
3. CV Service analyzes → /api/v1/cv/room/analyze
   ↓
4. CV returns: {status: "clean", ready_for_guest: true}
   ↓
5. CV triggers Prefect → /api/v1/prefect/events/room_status
   ↓
6. Prefect workflow:
   - Updates room status in DB
   - Checks if guest is waiting for this room
   - If yes:
     → LLM generates check-in ready email
     → Prefect sends email to guest
```

### Example 3: Dynamic Pricing Daily Update

```
1. Prefect scheduled job (runs daily at 3 AM)
   ↓
2. Prefect triggers → /api/v1/ml/pricing/optimize
   ↓
3. ML Service:
   - Fetches occupancy data from PostgreSQL
   - Scrapes competitor prices
   - Runs pricing model
   - Returns optimized prices
   ↓
4. ML returns pricing schedule to Prefect
   ↓
5. Prefect workflow:
   - Validates prices (business rules)
   - Updates PMS system
   - Logs changes
   - Triggers LLM to generate summary report
   - Sends report to revenue manager
```

### Example 4: Guest Request Intelligent Routing

```
1. Guest sends message via WhatsApp: "I need extra towels"
   ↓
2. LLM Service receives → /api/v1/llm/routing/classify
   ↓
3. LLM:
   - Classifies: category=housekeeping
   - Extracts: room_number, items, urgency
   - Returns structured request
   ↓
4. LLM triggers Prefect → /api/v1/prefect/workflows/trigger
   ↓
5. Prefect workflow:
   - Creates housekeeping task
   - Assigns to available staff (from DB)
   - Sends task to staff mobile app
   - Triggers LLM to generate confirmation
   - LLM generates: "We'll bring towels to your room in 10 minutes"
   - Sends confirmation to guest
```

### Example 5: Lost & Found Image Search

```
1. Reception receives lost item photo from guest
   ↓
2. CV Service → /api/v1/cv/image/search
   ↓
3. CV:
   - Generates image embedding
   - Queries Milvus vector DB
   - Returns top 10 similar images
   ↓
4. Results show match in Lost & Found DB
   ↓
5. Reception confirms match
   ↓
6. Prefect triggered → /api/v1/prefect/workflows/trigger (lost_found_return)
   ↓
7. Prefect:
   - Updates lost & found status
   - Triggers LLM to generate return notification
   - Schedules item return to guest room
```

---

## 🛠️ Technology Stack

### CV Service
```yaml
Framework: FastAPI
ML Libraries:
  - Face Recognition: InsightFace / DeepFace
  - OCR: PaddleOCR / Tesseract
  - Image Models: CLIP, ViT, YOLOv8
  - Liveness Detection: Silent-Face-Anti-Spoofing
Vector DB: Milvus / Qdrant
Storage: MinIO / S3
Queue: Redis (for async processing)
```

### ML Service
```yaml
Framework: FastAPI
ML Libraries:
  - scikit-learn
  - XGBoost / LightGBM
  - PyTorch / TensorFlow
  - Prophet (forecasting)
  - Surprise (recommendation)
Model Serving: TorchServe / ONNX Runtime
Feature Store: Feast (optional)
Experiment Tracking: MLflow
Cache: Redis
```

### LLM Service
```yaml
Framework: FastAPI
LLM Framework:
  - LangChain / LlamaIndex
  - OpenAI API / Claude API
  - Local models: llama.cpp
Vector DB: ChromaDB / Qdrant (for RAG)
Message Queue: RabbitMQ / Redis Streams
Cache: Redis
Monitoring: LangSmith / Helicone
```

### Prefect Service
```yaml
Orchestration: Prefect 2.x
Database: PostgreSQL
Message Queue: Redis / RabbitMQ
API Framework: FastAPI (custom endpoints)
Monitoring: Prefect Cloud / Self-hosted UI
```

### Shared Infrastructure
```yaml
API Gateway: Kong / Traefik
Message Broker: RabbitMQ / Kafka
Cache: Redis Cluster
Main Database: PostgreSQL (with TimescaleDB extension)
Vector Database: Milvus / Qdrant
Object Storage: MinIO / S3
Monitoring: Prometheus + Grafana
Logging: Loki / ELK Stack
Tracing: Jaeger / Tempo
```

---

## 📊 Database Schema

### PostgreSQL Tables

#### employees
```sql
CREATE TABLE employees (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    role VARCHAR(50),
    face_embedding_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### attendance_logs
```sql
CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) REFERENCES employees(id),
    timestamp TIMESTAMP NOT NULL,
    action VARCHAR(20), -- check_in, check_out
    camera_id VARCHAR(50),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_attendance_employee_time ON attendance_logs(employee_id, timestamp);
```

#### rooms
```sql
CREATE TABLE rooms (
    room_number VARCHAR(10) PRIMARY KEY,
    room_type VARCHAR(50),
    floor INTEGER,
    status VARCHAR(20), -- clean, dirty, occupied, maintenance
    last_cleaned_at TIMESTAMP,
    last_checked_by VARCHAR(20) REFERENCES employees(id)
);
```

#### bookings
```sql
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    guest_id VARCHAR(50) REFERENCES guests(id),
    room_number VARCHAR(10) REFERENCES rooms(room_number),
    check_in_date DATE,
    check_out_date DATE,
    status VARCHAR(20), -- confirmed, cancelled, completed, no_show
    total_amount DECIMAL(12, 2),
    churn_probability FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### guests
```sql
CREATE TABLE guests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    segment VARCHAR(50), -- business, leisure, corporate
    clv_predicted DECIMAL(12, 2),
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### image_metadata
```sql
CREATE TABLE image_metadata (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50), -- room, lost_found, amenity
    room_number VARCHAR(10),
    upload_time TIMESTAMP DEFAULT NOW(),
    tags JSONB,
    vector_id VARCHAR(100), -- reference to Milvus
    storage_url TEXT
);
CREATE INDEX idx_image_category ON image_metadata(category);
CREATE INDEX idx_image_room ON image_metadata(room_number);
```

#### ml_predictions
```sql
CREATE TABLE ml_predictions (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(50),
    prediction_type VARCHAR(50), -- pricing, churn, forecast, recommendation
    input_data JSONB,
    output_data JSONB,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_predictions_model_time ON ml_predictions(model_name, created_at);
```

#### workflow_logs
```sql
CREATE TABLE workflow_logs (
    id SERIAL PRIMARY KEY,
    flow_run_id VARCHAR(100),
    workflow_name VARCHAR(100),
    status VARCHAR(20), -- scheduled, running, completed, failed
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    parameters JSONB
);
```

---

## 🔗 Integration Patterns

### 1. Synchronous REST API Calls

Used for: Real-time requests that need immediate response

```python
# Example: CV Service → Prefect Service
import httpx

async def trigger_attendance_workflow(employee_id: str, timestamp: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://prefect-service:8004/api/v1/prefect/events/attendance",
            json={
                "employee_id": employee_id,
                "timestamp": timestamp,
                "action": "check_in"
            },
            timeout=5.0
        )
    return response.json()
```

### 2. Asynchronous Message Queue

Used for: Fire-and-forget events, decoupling services

```python
# Producer (CV Service)
import aio_pika

async def publish_room_analysis(room_data: dict):
    connection = await aio_pika.connect_robust("amqp://rabbitmq:5672")
    async with connection:
        channel = await connection.channel()
        await channel.default_exchange.publish(
            aio_pika.Message(body=json.dumps(room_data).encode()),
            routing_key="room.analysis"
        )

# Consumer (Prefect Service)
async def consume_room_analysis():
    connection = await aio_pika.connect_robust("amqp://rabbitmq:5672")
    channel = await connection.channel()
    queue = await channel.declare_queue("room.analysis")

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                data = json.loads(message.body)
                await handle_room_analysis(data)
```

### 3. Webhook Callbacks

Used for: Event notifications, async job completion

```python
# Prefect → LLM Service (when workflow completes)
@flow
async def send_completion_webhook(workflow_result: dict):
    webhook_url = "http://llm-service:8003/api/v1/llm/webhooks/workflow-complete"
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=workflow_result)
```

### 4. Database-Driven Communication

Used for: Shared state, audit trails

```python
# ML Service writes prediction
async def save_prediction(prediction: dict):
    async with db.transaction():
        await db.execute(
            "INSERT INTO ml_predictions (model_name, output_data) VALUES ($1, $2)",
            "pricing_model", prediction
        )

# Prefect reads prediction
async def get_latest_pricing():
    result = await db.fetch_one(
        "SELECT output_data FROM ml_predictions WHERE model_name = 'pricing_model' ORDER BY created_at DESC LIMIT 1"
    )
    return result["output_data"]
```

### 5. Service Mesh / API Gateway

Used for: Routing, authentication, rate limiting

```yaml
# Kong API Gateway Configuration
services:
  - name: cv-service
    url: http://cv-service:8001
    routes:
      - paths: [/api/v1/cv]
    plugins:
      - name: rate-limiting
        config:
          minute: 100
      - name: jwt
      - name: prometheus

  - name: ml-service
    url: http://ml-service:8002
    routes:
      - paths: [/api/v1/ml]
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

```yaml
# docker-compose.yml (example)
services:
  cv-service:
    image: cv-service:latest
    deploy:
      replicas: 3
    environment:
      - WORKERS=4
      - REDIS_URL=redis://redis:6379

  ml-service:
    image: ml-service:latest
    deploy:
      replicas: 2

  llm-service:
    image: llm-service:latest
    deploy:
      replicas: 2
```

### Caching Strategy

```python
# Redis caching example
import aioredis

class CacheService:
    def __init__(self):
        self.redis = aioredis.from_url("redis://redis:6379")

    async def get_room_status(self, room_number: str):
        # Try cache first
        cached = await self.redis.get(f"room:status:{room_number}")
        if cached:
            return json.loads(cached)

        # Fetch from DB
        status = await db.fetch_room_status(room_number)

        # Cache for 5 minutes
        await self.redis.setex(
            f"room:status:{room_number}",
            300,
            json.dumps(status)
        )
        return status
```

### Load Balancing

```nginx
# Nginx configuration
upstream cv_backend {
    least_conn;
    server cv-service-1:8001;
    server cv-service-2:8001;
    server cv-service-3:8001;
}

server {
    listen 80;
    location /api/v1/cv {
        proxy_pass http://cv_backend;
    }
}
```

---

## 🔐 Security Considerations

### Authentication & Authorization

```python
# JWT-based authentication
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # Verify JWT token
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload

@app.post("/api/v1/cv/face/recognize")
async def recognize_face(
    request: FaceRecognitionRequest,
    user: dict = Depends(verify_token)
):
    # Check permissions
    if "cv:read" not in user["permissions"]:
        raise HTTPException(403, "Insufficient permissions")
    ...
```

### API Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/cv/face/recognize")
@limiter.limit("10/minute")
async def recognize_face(request: Request):
    ...
```

### Data Encryption

```python
# Encrypt sensitive data before storage
from cryptography.fernet import Fernet

def encrypt_guest_data(data: dict) -> str:
    f = Fernet(ENCRYPTION_KEY)
    return f.encrypt(json.dumps(data).encode()).decode()

def decrypt_guest_data(encrypted: str) -> dict:
    f = Fernet(ENCRYPTION_KEY)
    return json.loads(f.decrypt(encrypted.encode()).decode())
```

---

## 📝 Service Communication Matrix

| From ↓ / To → | CV Service | ML Service | LLM Service | Prefect Service | PostgreSQL | Vector DB | Redis |
|---------------|------------|------------|-------------|-----------------|------------|-----------|-------|
| **CV Service** | - | ❌ | ❌ | ✅ (events) | ✅ (read/write) | ✅ (read/write) | ✅ (cache) |
| **ML Service** | ❌ | - | ❌ | ✅ (events) | ✅ (read/write) | ❌ | ✅ (cache) |
| **LLM Service** | ✅ (API call) | ✅ (API call) | - | ✅ (trigger workflows) | ✅ (read/write) | ✅ (RAG) | ✅ (cache) |
| **Prefect Service** | ✅ (API call) | ✅ (API call) | ✅ (API call) | - | ✅ (read/write) | ❌ | ✅ (queue) |

---

## 🚀 Deployment Architecture

```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cv-service
spec:
  replicas: 3
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
        - name: REDIS_URL
          value: redis://redis:6379
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /api/v1/cv/health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## 📊 Monitoring & Observability

### Metrics to Track

**CV Service:**
- Recognition success rate
- Average inference time
- Face enrollment count
- False positive/negative rate

**ML Service:**
- Prediction latency
- Model accuracy metrics
- Recommendation CTR
- Pricing accuracy vs actual

**LLM Service:**
- Response time
- Token usage & cost
- Tool calling success rate
- User satisfaction score

**Prefect Service:**
- Workflow success rate
- Average execution time
- Queue depth
- Failed job count

### Example Prometheus Metrics

```python
from prometheus_client import Counter, Histogram

# CV Service metrics
face_recognition_total = Counter(
    'face_recognition_total',
    'Total face recognition attempts',
    ['status']  # success, failure
)

face_recognition_duration = Histogram(
    'face_recognition_duration_seconds',
    'Face recognition duration'
)

# Usage
@face_recognition_duration.time()
async def recognize_face(image):
    result = await model.predict(image)
    face_recognition_total.labels(status='success').inc()
    return result
```

---

## 🎯 Next Steps

1. **Phase 1: Core Infrastructure**
   - Set up PostgreSQL, Redis, RabbitMQ
   - Deploy API Gateway
   - Set up monitoring stack

2. **Phase 2: CV Service**
   - Implement face recognition
   - Build image search
   - Room tagging MVP

3. **Phase 3: ML Service**
   - Basic recommendation engine
   - Simple pricing model
   - Occupancy forecasting

4. **Phase 4: LLM Service**
   - Internal assistant
   - Message generation
   - Basic tool calling

5. **Phase 5: Prefect Integration**
   - Core workflows
   - Event handlers
   - Scheduled jobs

6. **Phase 6: Integration & Testing**
   - End-to-end testing
   - Performance optimization
   - Security hardening

---

## 📞 API Testing Examples

### Using cURL

```bash
# Face recognition
curl -X POST http://localhost:8001/api/v1/cv/face/recognize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "image": "base64_encoded_image",
    "camera_id": "cam_lobby_01"
  }'

# Get room recommendations
curl -X POST http://localhost:8002/api/v1/ml/recommend/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "guest_id": "GUEST001",
    "check_in": "2025-02-01",
    "check_out": "2025-02-03"
  }'

# LLM assistant query
curl -X POST http://localhost:8003/api/v1/llm/assistant/query \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "EMP001",
    "message": "What is the status of room 201?"
  }'
```

---

This architecture provides a solid foundation for your hotel management AI system. Each service is independently scalable, and the integration points are well-defined for smooth inter-service communication.
