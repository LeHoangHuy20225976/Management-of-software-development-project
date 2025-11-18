# Service Connections Quick Reference

## 📊 Visual Service Map

```
┌────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SYSTEMS                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   PMS    │  │  Camera  │  │ WhatsApp │  │  Email   │              │
│  │  System  │  │  Stream  │  │   API    │  │  Server  │              │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘              │
└────────┼─────────────┼─────────────┼─────────────┼────────────────────┘
         │             │             │             │
         │             │             │             │
┌────────┼─────────────┼─────────────┼─────────────┼────────────────────┐
│        │             │             │             │                    │
│   ┌────▼─────────────▼─────────────▼─────────────▼─────┐             │
│   │         API Gateway (Kong / Traefik)                │             │
│   │         - Authentication (JWT)                      │             │
│   │         - Rate Limiting                             │             │
│   │         - Load Balancing                            │             │
│   └────┬─────────────┬──────────────┬──────────────┬───┘             │
│        │             │              │              │                  │
│   ┌────▼───┐    ┌───▼────┐    ┌────▼────┐    ┌───▼────┐             │
│   │   CV   │    │   ML   │    │   LLM   │    │Prefect │             │
│   │Service │    │Service │    │ Service │    │Service │             │
│   │ :8001  │    │ :8002  │    │  :8003  │    │ :8004  │             │
│   └────┬───┘    └───┬────┘    └────┬────┘    └───┬────┘             │
│        │            │              │             │                   │
│        └────────────┼──────────────┼─────────────┘                   │
│                     │              │                                 │
│        ┌────────────┼──────────────┼─────────────┐                   │
│        │            │              │             │                   │
│   ┌────▼────┐  ┌───▼────┐   ┌─────▼─────┐  ┌───▼────┐              │
│   │PostgreSQL  │ Milvus  │   │  Redis    │  │RabbitMQ│              │
│   │   :5432 │  │ :19530 │   │  :6379    │  │ :5672  │              │
│   └─────────┘  └────────┘   └───────────┘  └────────┘              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 🔄 Service-to-Service Communication Patterns

### 1. CV Service → Prefect Service
**Pattern:** Async Event Publishing
**Protocol:** RabbitMQ Message Queue
**Trigger:** When face recognized / room analyzed / anomaly detected

```
CV Service                                  Prefect Service
    │                                            │
    │  1. Face Recognized                       │
    ├──────────────────────────────────────────►│
    │     Queue: attendance.events               │
    │     Message: {employee_id, timestamp}      │
    │                                            │
    │                                       2. Consumes event
    │                                       3. Triggers workflow
    │                                       4. Updates DB
    │                                            │
```

**Example Events:**
- `attendance.checkin` - Employee check-in detected
- `room.analyzed` - Room status updated
- `anomaly.detected` - Safety hazard found
- `face.enrolled` - New face added to system

---

### 2. LLM Service → CV/ML Services
**Pattern:** Synchronous REST API Calls
**Protocol:** HTTP/REST
**Trigger:** When LLM agent needs to call tools

```
LLM Service                               CV/ML Service
    │                                          │
    │  1. User asks: "Is room 201 clean?"     │
    │                                          │
    │  2. LLM decides to call CV API          │
    ├─────────────────────────────────────────►│
    │     GET /api/v1/cv/room/status/201      │
    │                                          │
    │  3. CV returns status                   │
    │◄─────────────────────────────────────────┤
    │     {status: "clean", ready: true}      │
    │                                          │
    │  4. LLM formulates response             │
    │     "Room 201 is clean and ready"       │
    │                                          │
```

**Tool Endpoints LLM Calls:**
- `GET /api/v1/cv/room/status/{room_number}`
- `GET /api/v1/ml/pricing/current/{room_type}`
- `POST /api/v1/ml/recommend/services`
- `GET /api/v1/prefect/workflows/status/{id}`

---

### 3. Prefect Service → All Services
**Pattern:** Workflow Orchestration
**Protocol:** HTTP/REST + Database
**Trigger:** Scheduled jobs / Event-driven

```
Prefect Workflow: "Daily Pricing Update"
    │
    ├─► 1. Fetch occupancy data (PostgreSQL)
    │
    ├─► 2. Call ML Service
    │       POST /api/v1/ml/pricing/optimize
    │       Response: New pricing schedule
    │
    ├─► 3. Validate prices (Business logic)
    │
    ├─► 4. Update PMS System (External API)
    │
    ├─► 5. Call LLM Service
    │       POST /api/v1/llm/generate/email
    │       Generate summary report
    │
    └─► 6. Send report to manager (Email)
```

**Prefect Workflow Types:**
- **Scheduled:** Daily reports, nightly retraining, hourly sync
- **Event-driven:** Booking created, room cleaned, guest checked in
- **On-demand:** Manual triggers via API

---

### 4. All Services → PostgreSQL
**Pattern:** Direct Database Access
**Protocol:** PostgreSQL Protocol (asyncpg)
**Usage:** CRUD operations, transactions

```
Service Layer                           PostgreSQL
    │                                       │
    │  Read room status                    │
    ├──────────────────────────────────────►│
    │  SELECT * FROM rooms WHERE ...        │
    │                                       │
    │◄──────────────────────────────────────┤
    │  {room_number: "201", status: ...}   │
    │                                       │
    │  Update booking                       │
    ├──────────────────────────────────────►│
    │  UPDATE bookings SET ...              │
    │                                       │
```

**Read Access:**
- CV Service: Read employee data for face matching
- ML Service: Read historical data for training
- LLM Service: Read guest/room info for queries
- Prefect: Read workflow state

**Write Access:**
- CV Service: Write attendance logs, image metadata
- ML Service: Write predictions
- Prefect: Write workflow logs, ETL results

---

### 5. CV/ML Services → Vector DB (Milvus)
**Pattern:** Embedding Storage & Similarity Search
**Protocol:** gRPC (Milvus native protocol)
**Usage:** Face embeddings, image search, RAG

```
CV Service                              Milvus Vector DB
    │                                         │
    │  1. Enroll new face                    │
    │     - Generate embedding (512-dim)     │
    │                                         │
    │  2. Insert vector                      │
    ├────────────────────────────────────────►│
    │     collection: "face_embeddings"      │
    │     vector: [0.23, -0.45, ...]         │
    │     metadata: {employee_id: "EMP001"}  │
    │                                         │
    │  3. Search similar faces               │
    ├────────────────────────────────────────►│
    │     query_vector: [0.25, -0.43, ...]   │
    │     top_k: 1                            │
    │     threshold: 0.7                      │
    │                                         │
    │◄────────────────────────────────────────┤
    │  [{id: "EMP001", score: 0.95}]         │
    │                                         │
```

**Collections in Milvus:**
- `face_embeddings` - Employee face vectors (512-dim)
- `room_images` - Room image embeddings (768-dim, CLIP)
- `lost_found_images` - Lost & found item images
- `llm_knowledge_base` - Document embeddings for RAG (1536-dim)

---

### 6. All Services → Redis Cache
**Pattern:** Cache-Aside Pattern
**Protocol:** Redis Protocol
**Usage:** Performance optimization, session storage

```
Service                                  Redis Cache
    │                                         │
    │  1. Check cache                        │
    ├────────────────────────────────────────►│
    │     GET room:status:201                │
    │                                         │
    │◄────────────────────────────────────────┤
    │     NULL (cache miss)                  │
    │                                         │
    │  2. Fetch from DB                      │
    │     (PostgreSQL query)                 │
    │                                         │
    │  3. Write to cache                     │
    ├────────────────────────────────────────►│
    │     SETEX room:status:201 300 {...}    │
    │     (expire in 5 minutes)              │
    │                                         │
```

**Cache Keys:**
- `room:status:{room_number}` - TTL: 5 minutes
- `employee:{employee_id}` - TTL: 1 hour
- `ml:pricing:{room_type}:{date}` - TTL: 1 day
- `llm:response:{hash}` - TTL: 10 minutes (for repeated queries)

---

## 📋 Detailed Connection Matrix

### CV Service Connections

| Target | Protocol | Purpose | Example Endpoint |
|--------|----------|---------|------------------|
| PostgreSQL | asyncpg | Store attendance logs, image metadata | `INSERT INTO attendance_logs` |
| Milvus | gRPC | Store/search face embeddings, images | `collection.search(vector)` |
| Redis | redis-py | Cache recognition results | `SETEX face:cache:{hash}` |
| RabbitMQ | aio-pika | Publish events (attendance, anomaly) | Queue: `attendance.events` |
| Prefect | HTTP/REST | Trigger workflows (webhook) | `POST /api/v1/prefect/events` |

**Dependencies:**
```python
# requirements.txt for CV Service
fastapi==0.109.0
insightface==0.7.3
paddleocr==2.7.0
torch==2.1.2
asyncpg==0.29.0
pymilvus==2.3.5
redis==5.0.1
aio-pika==9.3.1
httpx==0.26.0
```

---

### ML Service Connections

| Target | Protocol | Purpose | Example Endpoint |
|--------|----------|---------|------------------|
| PostgreSQL | asyncpg | Read historical data, write predictions | `SELECT * FROM bookings` |
| Redis | redis-py | Cache model predictions | `SETEX ml:pred:{id}` |
| RabbitMQ | aio-pika | Publish prediction events | Queue: `ml.predictions` |
| Prefect | HTTP/REST | Notify when retraining complete | `POST /webhooks/retrain-complete` |

**Dependencies:**
```python
# requirements.txt for ML Service
fastapi==0.109.0
scikit-learn==1.4.0
xgboost==2.0.3
pandas==2.1.4
prophet==1.1.5
asyncpg==0.29.0
redis==5.0.1
mlflow==2.9.2
```

---

### LLM Service Connections

| Target | Protocol | Purpose | Example Endpoint |
|--------|----------|---------|------------------|
| PostgreSQL | asyncpg | Read guest/room data for context | `SELECT * FROM guests` |
| Redis | redis-py | Cache LLM responses | `SETEX llm:resp:{hash}` |
| Milvus | gRPC | RAG - retrieve relevant documents | `collection.search(query_embedding)` |
| CV Service | HTTP/REST | Tool calling - check room status | `GET /api/v1/cv/room/status/201` |
| ML Service | HTTP/REST | Tool calling - get recommendations | `POST /api/v1/ml/recommend/services` |
| Prefect | HTTP/REST | Trigger workflows | `POST /api/v1/prefect/workflows/trigger` |

**Dependencies:**
```python
# requirements.txt for LLM Service
fastapi==0.109.0
langchain==0.1.4
openai==1.10.0
anthropic==0.8.1
chromadb==0.4.22
asyncpg==0.29.0
redis==5.0.1
httpx==0.26.0
```

---

### Prefect Service Connections

| Target | Protocol | Purpose | Example Endpoint |
|--------|----------|---------|------------------|
| PostgreSQL | asyncpg | Workflow state, logs | `INSERT INTO workflow_logs` |
| Redis | redis-py | Task queue, result backend | Queue: `prefect:tasks` |
| RabbitMQ | aio-pika | Consume events from all services | All queues |
| CV Service | HTTP/REST | Call CV APIs in workflows | All CV endpoints |
| ML Service | HTTP/REST | Trigger model training | `POST /api/v1/ml/retrain` |
| LLM Service | HTTP/REST | Generate messages | `POST /api/v1/llm/generate/email` |
| External PMS | HTTP/REST | Sync bookings | Vendor-specific API |
| Email Server | SMTP | Send notifications | SMTP protocol |

**Dependencies:**
```python
# requirements.txt for Prefect Service
prefect==2.14.11
fastapi==0.109.0
asyncpg==0.29.0
redis==5.0.1
aio-pika==9.3.1
httpx==0.26.0
aiosmtplib==3.0.1
```

---

## 🔐 Authentication Flow

```
Client Request
    │
    │  1. Request with JWT token in header
    │     Authorization: Bearer eyJhbGc...
    │
    ▼
┌─────────────────┐
│  API Gateway    │
│  (Kong/Traefik) │
└────────┬────────┘
         │
         │  2. Validate JWT token
         │     - Check signature
         │     - Check expiration
         │     - Extract user claims
         │
         ├─► Valid: Forward to service with user context
         │
         └─► Invalid: Return 401 Unauthorized
```

**JWT Token Structure:**
```json
{
  "sub": "EMP001",
  "name": "Nguyen Van A",
  "role": "receptionist",
  "permissions": [
    "cv:read",
    "ml:read",
    "llm:query",
    "rooms:read",
    "guests:read"
  ],
  "exp": 1705507200,
  "iat": 1705420800
}
```

---

## 🔄 Event Flow Examples

### Example 1: Face Recognition → Attendance Logging

```
1. Camera Stream → CV Service
   POST /api/v1/cv/face/recognize

2. CV Service
   - Detects face
   - Generates embedding
   - Searches Milvus
   - Finds match: EMP001 (confidence: 0.95)

3. CV Service → RabbitMQ
   Publish to queue: "attendance.events"
   Message: {
     "employee_id": "EMP001",
     "timestamp": "2025-01-17T08:30:00Z",
     "camera_id": "cam_lobby_01",
     "confidence": 0.95,
     "action": "check_in"
   }

4. Prefect Service (Consumer)
   - Consumes from "attendance.events"
   - Validates data
   - Starts workflow: "process_attendance"

5. Prefect Workflow
   - Write to PostgreSQL: INSERT INTO attendance_logs
   - Check if employee is late
   - If late: Notify supervisor
     → LLM Service: Generate notification
     → Send to Slack/Email

6. Prefect → Redis
   Update cache: employee:EMP001:last_seen
```

---

### Example 2: Guest Request → Intelligent Routing

```
1. WhatsApp API → LLM Service
   POST /api/v1/llm/routing/classify
   Message: "I need extra towels in my room"

2. LLM Service
   - Analyzes message
   - Classifies: category=housekeeping
   - Extracts: room_number (from context/DB lookup)
   - Structures request

3. LLM Service → Prefect Service
   POST /api/v1/prefect/workflows/trigger
   Workflow: "housekeeping_request"
   Parameters: {
     "room_number": "201",
     "items": ["towel"],
     "quantity": 2
   }

4. Prefect Workflow
   - Creates task in DB
   - Finds available housekeeping staff
   - Sends notification to staff mobile app

5. Prefect → LLM Service
   POST /api/v1/llm/generate/message
   Generate confirmation message

6. Prefect → WhatsApp API
   Send: "We'll bring towels to your room in 10 minutes"
```

---

### Example 3: Daily Pricing Optimization

```
1. Prefect Scheduler (Cron: 0 3 * * *)
   Triggers workflow: "daily_pricing_optimization"

2. Prefect → PostgreSQL
   Query historical occupancy data

3. Prefect → External API
   Scrape competitor prices

4. Prefect → ML Service
   POST /api/v1/ml/pricing/optimize
   Send data: {
     "date_range": "2025-02-01 to 2025-02-28",
     "historical_data": [...],
     "competitor_prices": [...]
   }

5. ML Service
   - Runs pricing model
   - Generates optimized prices
   - Returns pricing schedule

6. Prefect Workflow
   - Validates prices (business rules)
   - Updates PostgreSQL: UPDATE room_prices
   - Calls PMS API to update system

7. Prefect → LLM Service
   POST /api/v1/llm/generate/email
   Generate summary report

8. Prefect → Email Server
   Send report to revenue manager

9. Prefect → Redis
   Cache new prices: pricing:{room_type}:{date}
```

---

## 🚨 Error Handling & Retry Logic

### Circuit Breaker Pattern

```python
# Example: LLM Service calling CV Service
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_cv_service(room_number: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://cv-service:8001/api/v1/cv/room/status/{room_number}",
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        # Circuit opens after 5 timeouts
        raise ServiceUnavailableError("CV Service timeout")
```

**When circuit opens:**
- Service marked as unavailable
- LLM returns cached data or fallback response
- Circuit retries after 60 seconds

---

### Retry with Exponential Backoff

```python
# Example: Prefect calling external PMS API
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def update_pms_pricing(pricing_data: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://pms-api.example.com/pricing",
            json=pricing_data,
            timeout=30.0
        )
        response.raise_for_status()
        return response.json()
```

**Retry schedule:**
- Attempt 1: Immediate
- Attempt 2: Wait 2 seconds
- Attempt 3: Wait 4 seconds
- After 3 failures: Log error, alert admin

---

## 📊 Message Queue Topics & Routing Keys

### RabbitMQ Exchange & Queue Structure

```
Exchange: hotel.events (topic exchange)
│
├─► Queue: attendance.events
│   Routing Key: cv.attendance.*
│   Consumer: Prefect Service
│   Messages: Employee check-in/out
│
├─► Queue: room.events
│   Routing Key: cv.room.*
│   Consumer: Prefect Service
│   Messages: Room status changes
│
├─► Queue: anomaly.events
│   Routing Key: cv.anomaly.*
│   Consumer: Prefect Service + LLM Service
│   Messages: Safety alerts
│
├─► Queue: ml.predictions
│   Routing Key: ml.prediction.*
│   Consumer: Prefect Service
│   Messages: Model predictions (churn, pricing)
│
└─► Queue: workflow.completion
    Routing Key: prefect.workflow.completed
    Consumer: LLM Monitoring Service
    Messages: Workflow status updates
```

---

## 🎯 Service Health Checks

```yaml
# Health check endpoints for all services
CV Service:
  GET /api/v1/cv/health
  Response:
    status: "healthy"
    checks:
      database: "ok"
      milvus: "ok"
      redis: "ok"
      gpu: "ok"

ML Service:
  GET /api/v1/ml/health
  Response:
    status: "healthy"
    models_loaded: ["pricing", "churn", "recommendation"]

LLM Service:
  GET /api/v1/llm/health
  Response:
    status: "healthy"
    llm_provider: "openai"
    token_limit_reached: false

Prefect Service:
  GET /api/v1/prefect/health
  Response:
    status: "healthy"
    active_workflows: 5
    queue_depth: 12
```

---

This document provides a comprehensive view of how all services communicate with each other. Use this as a reference when implementing integrations between services.
