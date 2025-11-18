# Prefect Service - Workflow Orchestration Service

## 📋 Table of Contents
1. [Service Overview](#service-overview)
2. [Responsibilities](#responsibilities)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [Workflow Definitions](#workflow-definitions)
7. [Event Handling](#event-handling)
8. [ETL Pipelines](#etl-pipelines)
9. [Scheduling](#scheduling)
10. [Implementation Guide](#implementation-guide)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)
13. [Monitoring & Observability](#monitoring--observability)

---

## 🎯 Service Overview

**Port:** 8004
**Framework:** Prefect 2.x + FastAPI
**Language:** Python 3.10+
**Purpose:** Orchestrate workflows, handle events, manage ETL pipelines, and coordinate activities across all services

### Key Features
- ✅ Event-driven workflow orchestration
- ✅ Scheduled job management (cron-based)
- ✅ ETL pipeline orchestration
- ✅ Cross-service coordination
- ✅ Retry logic and error handling
- ✅ Workflow state management
- ✅ Real-time monitoring and alerting

---

## 🎯 Responsibilities

### 1. Event Processing
- Consume events from RabbitMQ queues:
  - Face recognition attendance events
  - Room status change events
  - Booking events
  - ML prediction events
  - Anomaly detection alerts
- Trigger appropriate workflows based on events
- Maintain event audit trail

### 2. Workflow Orchestration
- **Attendance Processing**: Log employee check-ins, detect tardiness, notify supervisors
- **Room Management**: Update room status, assign housekeeping tasks
- **Guest Communication**: Generate and send automated messages
- **Report Generation**: Daily, weekly, monthly operational reports
- **Data Synchronization**: Sync with external PMS systems

### 3. Scheduled Jobs
- Daily pricing optimization (3:00 AM)
- Nightly ML model retraining (2:00 AM)
- Hourly data synchronization
- Weekly performance reports
- Monthly data archival

### 4. ETL Pipelines
- Extract data from PMS, booking systems
- Transform and clean data
- Load into data warehouse
- Aggregate metrics for analytics

### 5. Service Coordination
- Coordinate multi-service operations
- Handle distributed transactions
- Implement saga patterns for complex workflows
- Manage compensation logic for failures

---

## 🛠️ Technology Stack

### Core Framework
```yaml
Orchestration:
  - prefect 2.14.11
  - prefect-dask 0.2.6 (distributed execution)

API Framework:
  - fastapi 0.109.0
  - uvicorn 0.25.0

Task Queue:
  - prefect-redis 0.3.1
  - celery 5.3.4 (alternative)
```

### Databases & Storage
```yaml
Relational Database:
  - asyncpg 0.29.0 (PostgreSQL)
  - sqlalchemy 2.0.25
  - alembic 1.13.1 (migrations)

Cache:
  - redis 5.0.1
  - aioredis 2.0.1

Time Series:
  - influxdb-client 1.38.0 (metrics storage)
```

### Message Queue
```yaml
RabbitMQ:
  - aio-pika 9.3.1
  - pika 1.3.2
```

### HTTP Clients
```yaml
Service Clients:
  - httpx 0.26.0
  - aiohttp 3.9.1

Email:
  - aiosmtplib 3.0.1
  - jinja2 3.1.3 (email templates)

Notifications:
  - slack-sdk 3.26.2
  - twilio 8.11.0 (SMS, WhatsApp)
```

### Data Processing
```yaml
ETL:
  - pandas 2.1.4
  - polars 0.20.3 (fast processing)
  - pyarrow 14.0.2

Data Validation:
  - pydantic 2.5.3
  - great-expectations 0.18.8
```

### Monitoring
```yaml
Observability:
  - prometheus-client 0.19.0
  - opentelemetry-api 1.22.0
  - sentry-sdk 1.39.2

Logging:
  - structlog 24.1.0
```

---

## 🏗️ Architecture

### Directory Structure
```
prefect-service/
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
│   │   │   │   ├── workflows.py    # Workflow management
│   │   │   │   ├── events.py       # Event receivers
│   │   │   │   ├── schedules.py    # Schedule management
│   │   │   │   ├── pipelines.py    # ETL pipelines
│   │   │   │   └── monitoring.py   # Status & monitoring
│   │   │   └── router.py       # API router aggregation
│   │
│   ├── flows/                  # Prefect flow definitions
│   │   ├── __init__.py
│   │   ├── attendance/
│   │   │   ├── __init__.py
│   │   │   ├── process_attendance.py
│   │   │   └── generate_report.py
│   │   ├── rooms/
│   │   │   ├── __init__.py
│   │   │   ├── update_status.py
│   │   │   └── assign_cleaning.py
│   │   ├── guests/
│   │   │   ├── __init__.py
│   │   │   ├── handle_request.py
│   │   │   └── send_notification.py
│   │   ├── reports/
│   │   │   ├── __init__.py
│   │   │   ├── daily_report.py
│   │   │   ├── weekly_report.py
│   │   │   └── monthly_report.py
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── retrain_models.py
│   │   │   └── update_predictions.py
│   │   └── etl/
│   │       ├── __init__.py
│   │       ├── pms_sync.py
│   │       ├── analytics_etl.py
│   │       └── data_warehouse_load.py
│   │
│   ├── tasks/                  # Prefect task definitions
│   │   ├── __init__.py
│   │   ├── database_tasks.py
│   │   ├── notification_tasks.py
│   │   ├── validation_tasks.py
│   │   └── external_api_tasks.py
│   │
│   ├── consumers/              # Event consumers
│   │   ├── __init__.py
│   │   ├── attendance_consumer.py
│   │   ├── room_consumer.py
│   │   ├── anomaly_consumer.py
│   │   └── ml_consumer.py
│   │
│   ├── services/               # External service integrations
│   │   ├── __init__.py
│   │   ├── database.py         # PostgreSQL client
│   │   ├── cache.py            # Redis client
│   │   ├── message_queue.py    # RabbitMQ client
│   │   ├── cv_service.py       # CV Service client
│   │   ├── ml_service.py       # ML Service client
│   │   ├── llm_service.py      # LLM Service client
│   │   ├── email_service.py    # Email sending
│   │   ├── sms_service.py      # SMS/WhatsApp
│   │   ├── slack_service.py    # Slack notifications
│   │   └── pms_client.py       # External PMS API
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── workflows.py
│   │   ├── events.py
│   │   ├── schedules.py
│   │   └── pipelines.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── logging.py          # Logging setup
│       ├── metrics.py          # Prometheus metrics
│       ├── retry.py            # Retry utilities
│       └── validators.py       # Data validators
│
├── deployments/                # Prefect deployments
│   ├── attendance_flows.yaml
│   ├── room_flows.yaml
│   ├── report_flows.yaml
│   └── etl_flows.yaml
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_flows.py
│   │   ├── test_tasks.py
│   │   └── test_consumers.py
│   ├── integration/
│   │   ├── test_workflows.py
│   │   └── test_api.py
│   └── e2e/
│       └── test_end_to_end.py
│
├── scripts/
│   ├── deploy_flows.sh         # Deploy all flows
│   ├── start_workers.sh        # Start Prefect workers
│   └── cleanup_old_runs.py     # Clean up old flow runs
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
└── README.md
```

### Component Interaction
```
┌─────────────────────────────────────────────────┐
│           RabbitMQ Message Queues               │
│  attendance.events | room.events | ml.events   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Event Consumers (async)                 │
│  - Attendance Consumer                          │
│  - Room Consumer                                │
│  - Anomaly Consumer                             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Prefect Flow Orchestrator               │
│  - Parse event                                  │
│  - Trigger appropriate flow                     │
│  - Manage state                                 │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
    ┌──────┐  ┌──────┐  ┌──────┐
    │Task 1│  │Task 2│  │Task 3│
    └──┬───┘  └──┬───┘  └──┬───┘
       │         │         │
       └─────────┼─────────┘
                 ▼
       ┌─────────────────┐
       │  External APIs  │
       │  - Database     │
       │  - CV Service   │
       │  - ML Service   │
       │  - LLM Service  │
       │  - Email/SMS    │
       └─────────────────┘
```

---

## 🔌 API Endpoints

### Workflow Management

#### POST `/api/v1/prefect/workflows/trigger`
Manually trigger a workflow.

**Request:**
```json
{
  "workflow_name": "daily_report_generation",
  "parameters": {
    "date": "2025-01-17",
    "report_types": ["occupancy", "revenue", "housekeeping"],
    "recipients": ["manager@hotel.com"]
  },
  "scheduled_time": "2025-01-17T23:00:00Z",
  "idempotency_key": "report_2025_01_17"
}
```

**Response:**
```json
{
  "flow_run_id": "fr_abc123def456",
  "workflow_name": "daily_report_generation",
  "status": "scheduled",
  "scheduled_start": "2025-01-17T23:00:00Z",
  "estimated_duration_minutes": 15,
  "parameters": {
    "date": "2025-01-17",
    "report_types": ["occupancy", "revenue", "housekeeping"]
  },
  "created_at": "2025-01-17T10:00:00Z"
}
```

---

#### GET `/api/v1/prefect/workflows/status/{flow_run_id}`
Get workflow execution status.

**Response:**
```json
{
  "flow_run_id": "fr_abc123def456",
  "workflow_name": "daily_report_generation",
  "status": "completed",
  "state": "Completed",
  "started_at": "2025-01-17T23:00:00Z",
  "completed_at": "2025-01-17T23:12:34Z",
  "duration_seconds": 754,
  "parameters": {
    "date": "2025-01-17",
    "report_types": ["occupancy", "revenue", "housekeeping"]
  },
  "task_runs": [
    {
      "task_name": "fetch_occupancy_data",
      "status": "completed",
      "duration_seconds": 5.2,
      "retries": 0
    },
    {
      "task_name": "fetch_revenue_data",
      "status": "completed",
      "duration_seconds": 3.8,
      "retries": 0
    },
    {
      "task_name": "generate_pdf_report",
      "status": "completed",
      "duration_seconds": 12.5,
      "retries": 0
    },
    {
      "task_name": "send_email",
      "status": "completed",
      "duration_seconds": 1.2,
      "retries": 0
    }
  ],
  "result": {
    "report_generated": true,
    "report_url": "https://storage.hotel.com/reports/daily_2025_01_17.pdf",
    "email_sent": true,
    "recipients": ["manager@hotel.com"]
  }
}
```

---

#### POST `/api/v1/prefect/workflows/cancel/{flow_run_id}`
Cancel a running workflow.

**Response:**
```json
{
  "flow_run_id": "fr_abc123def456",
  "previous_status": "running",
  "new_status": "cancelled",
  "cancelled_at": "2025-01-17T10:05:00Z",
  "message": "Workflow cancelled by user request"
}
```

---

#### GET `/api/v1/prefect/workflows/list`
List recent workflow runs.

**Query Parameters:**
- `workflow_name` (optional): Filter by workflow name
- `status` (optional): Filter by status (scheduled, running, completed, failed)
- `limit` (default: 50): Number of results
- `offset` (default: 0): Pagination offset

**Response:**
```json
{
  "workflow_runs": [
    {
      "flow_run_id": "fr_abc123",
      "workflow_name": "daily_report_generation",
      "status": "completed",
      "started_at": "2025-01-17T23:00:00Z",
      "duration_seconds": 754
    },
    {
      "flow_run_id": "fr_xyz789",
      "workflow_name": "process_attendance",
      "status": "completed",
      "started_at": "2025-01-17T08:30:15Z",
      "duration_seconds": 2.3
    }
  ],
  "total": 156,
  "limit": 50,
  "offset": 0
}
```

---

### Event Handling

#### POST `/api/v1/prefect/events/attendance`
Receive attendance event from CV service.

**Request:**
```json
{
  "employee_id": "EMP001",
  "timestamp": "2025-01-17T08:30:00Z",
  "action": "check_in",
  "camera_id": "cam_lobby_01",
  "confidence": 0.98,
  "metadata": {
    "face_quality": 0.95,
    "liveness_check": true
  }
}
```

**Response:**
```json
{
  "event_id": "evt_12345",
  "status": "accepted",
  "workflow_triggered": "process_attendance",
  "flow_run_id": "fr_attendance_001",
  "message": "Attendance event received and workflow triggered"
}
```

---

#### POST `/api/v1/prefect/events/room_status`
Receive room status update event.

**Request:**
```json
{
  "room_number": "201",
  "old_status": "dirty",
  "new_status": "clean",
  "updated_by": "EMP005",
  "timestamp": "2025-01-17T11:00:00Z",
  "analysis_data": {
    "confidence": 0.92,
    "tags": ["bed_made", "bathroom_clean", "amenities_complete"]
  }
}
```

**Response:**
```json
{
  "event_id": "evt_67890",
  "status": "accepted",
  "workflows_triggered": [
    {
      "workflow": "update_room_status_db",
      "flow_run_id": "fr_room_001"
    },
    {
      "workflow": "check_guest_waiting",
      "flow_run_id": "fr_room_002"
    }
  ],
  "message": "Room status event received and workflows triggered"
}
```

---

#### POST `/api/v1/prefect/events/booking`
Receive booking event from PMS.

**Request:**
```json
{
  "booking_id": "BOOK001",
  "event_type": "new_booking",
  "guest_data": {
    "guest_id": "GUEST001",
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "+84-xxx-xxx-xxxx"
  },
  "room_data": {
    "room_number": "201",
    "room_type": "deluxe",
    "check_in": "2025-02-01",
    "check_out": "2025-02-03",
    "total_amount": 5000000
  },
  "timestamp": "2025-01-17T10:00:00Z"
}
```

**Response:**
```json
{
  "event_id": "evt_booking_001",
  "status": "accepted",
  "workflows_triggered": [
    {
      "workflow": "predict_churn_risk",
      "flow_run_id": "fr_churn_001"
    },
    {
      "workflow": "generate_confirmation_email",
      "flow_run_id": "fr_email_001"
    },
    {
      "workflow": "update_recommendations",
      "flow_run_id": "fr_rec_001"
    }
  ],
  "message": "New booking event processed"
}
```

---

### ETL Pipelines

#### POST `/api/v1/prefect/pipeline/sync`
Trigger data synchronization pipeline.

**Request:**
```json
{
  "source": "pms",
  "target": "warehouse",
  "data_type": "bookings",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-17"
  },
  "full_refresh": false
}
```

**Response:**
```json
{
  "pipeline_id": "pipe_sync_001",
  "flow_run_id": "fr_etl_001",
  "status": "running",
  "estimated_duration_minutes": 10,
  "records_to_process": 1250
}
```

---

#### GET `/api/v1/prefect/pipeline/status/{pipeline_id}`
Get ETL pipeline status.

**Response:**
```json
{
  "pipeline_id": "pipe_sync_001",
  "flow_run_id": "fr_etl_001",
  "status": "completed",
  "started_at": "2025-01-17T10:00:00Z",
  "completed_at": "2025-01-17T10:08:45Z",
  "duration_seconds": 525,
  "statistics": {
    "records_extracted": 1250,
    "records_transformed": 1250,
    "records_loaded": 1248,
    "records_failed": 2,
    "records_skipped": 0
  },
  "stages": [
    {
      "stage": "extract",
      "status": "completed",
      "duration_seconds": 120,
      "records": 1250
    },
    {
      "stage": "transform",
      "status": "completed",
      "duration_seconds": 300,
      "records": 1250
    },
    {
      "stage": "load",
      "status": "completed",
      "duration_seconds": 105,
      "records": 1248
    }
  ],
  "errors": [
    {
      "record_id": "BOOK999",
      "error": "Invalid date format",
      "stage": "load"
    }
  ]
}
```

---

### Scheduling

#### POST `/api/v1/prefect/schedule/create`
Create a new scheduled workflow.

**Request:**
```json
{
  "name": "nightly_ml_retrain",
  "workflow": "ml_model_retrain",
  "schedule": {
    "type": "cron",
    "cron": "0 2 * * *",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "parameters": {
    "model_name": "pricing_model",
    "training_days": 90
  },
  "active": true
}
```

**Response:**
```json
{
  "schedule_id": "sched_12345",
  "name": "nightly_ml_retrain",
  "workflow": "ml_model_retrain",
  "schedule": "0 2 * * * (Asia/Ho_Chi_Minh)",
  "next_run": "2025-01-18T02:00:00+07:00",
  "active": true,
  "created_at": "2025-01-17T10:00:00Z"
}
```

---

#### GET `/api/v1/prefect/schedule/list`
List all scheduled workflows.

**Response:**
```json
{
  "schedules": [
    {
      "schedule_id": "sched_001",
      "name": "daily_pricing_optimization",
      "workflow": "optimize_pricing",
      "cron": "0 3 * * *",
      "next_run": "2025-01-18T03:00:00+07:00",
      "active": true,
      "last_run": {
        "flow_run_id": "fr_price_001",
        "status": "completed",
        "completed_at": "2025-01-17T03:15:00Z"
      }
    },
    {
      "schedule_id": "sched_002",
      "name": "nightly_ml_retrain",
      "workflow": "ml_model_retrain",
      "cron": "0 2 * * *",
      "next_run": "2025-01-18T02:00:00+07:00",
      "active": true
    }
  ],
  "total": 12
}
```

---

#### DELETE `/api/v1/prefect/schedule/{schedule_id}`
Delete a scheduled workflow.

**Response:**
```json
{
  "schedule_id": "sched_12345",
  "status": "deleted",
  "message": "Schedule deleted successfully"
}
```

---

### Monitoring

#### GET `/api/v1/prefect/health`
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
    "redis": {
      "status": "ok",
      "latency_ms": 2
    },
    "rabbitmq": {
      "status": "ok",
      "queues": {
        "attendance.events": {
          "messages": 0,
          "consumers": 1
        },
        "room.events": {
          "messages": 2,
          "consumers": 1
        }
      }
    },
    "prefect_server": {
      "status": "ok",
      "latency_ms": 45
    }
  },
  "active_flow_runs": 5,
  "scheduled_flow_runs": 3,
  "worker_status": {
    "total_workers": 4,
    "active_workers": 4,
    "idle_workers": 2
  }
}
```

---

## 📊 Workflow Definitions

### 1. Attendance Processing Workflow

```python
# app/flows/attendance/process_attendance.py
from prefect import flow, task
from datetime import datetime, time
import asyncio

@task(retries=3, retry_delay_seconds=5)
async def validate_attendance_event(event: dict):
    """Validate attendance event data"""
    required_fields = ['employee_id', 'timestamp', 'action', 'confidence']

    for field in required_fields:
        if field not in event:
            raise ValueError(f"Missing required field: {field}")

    if event['confidence'] < 0.7:
        raise ValueError(f"Low confidence score: {event['confidence']}")

    return event

@task(retries=3)
async def log_attendance_to_db(event: dict):
    """Log attendance to PostgreSQL"""
    from app.services.database import get_db

    db = get_db()

    query = """
        INSERT INTO attendance_logs
        (employee_id, timestamp, action, camera_id, confidence)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """

    result = await db.fetch_one(
        query,
        event['employee_id'],
        event['timestamp'],
        event['action'],
        event['camera_id'],
        event['confidence']
    )

    return result['id']

@task
async def check_if_late(employee_id: str, check_in_time: datetime):
    """Check if employee is late"""
    from app.services.database import get_db

    db = get_db()

    # Get employee's shift schedule
    schedule = await db.fetch_one(
        "SELECT start_time FROM employee_schedules WHERE employee_id = $1 AND day_of_week = $2",
        employee_id,
        check_in_time.weekday()
    )

    if not schedule:
        return False

    shift_start = schedule['start_time']
    check_in_time_only = check_in_time.time()

    # Grace period: 5 minutes
    grace_period_seconds = 5 * 60

    if check_in_time_only > shift_start:
        late_seconds = (
            datetime.combine(datetime.min, check_in_time_only) -
            datetime.combine(datetime.min, shift_start)
        ).total_seconds()

        return late_seconds > grace_period_seconds

    return False

@task
async def notify_supervisor(employee_id: str, late_minutes: int):
    """Notify supervisor about late employee"""
    from app.services.slack_service import send_slack_message
    from app.services.database import get_db

    db = get_db()

    # Get employee and supervisor info
    employee = await db.fetch_one(
        "SELECT name, department FROM employees WHERE id = $1",
        employee_id
    )

    supervisor = await db.fetch_one(
        "SELECT slack_user_id FROM supervisors WHERE department = $1",
        employee['department']
    )

    if supervisor:
        message = f"⚠️ *Late Check-in Alert*\n\n" \
                  f"Employee: {employee['name']} ({employee_id})\n" \
                  f"Late by: {late_minutes} minutes\n" \
                  f"Department: {employee['department']}"

        await send_slack_message(
            supervisor['slack_user_id'],
            message
        )

@flow(name="process_attendance", log_prints=True)
async def process_attendance_flow(event: dict):
    """
    Main attendance processing workflow

    Steps:
    1. Validate event
    2. Log to database
    3. Check if employee is late
    4. Notify supervisor if late
    """
    print(f"Processing attendance for employee: {event['employee_id']}")

    # Validate
    validated_event = await validate_attendance_event(event)

    # Log to database
    log_id = await log_attendance_to_db(validated_event)
    print(f"Attendance logged with ID: {log_id}")

    # Check if late
    check_in_time = datetime.fromisoformat(validated_event['timestamp'])
    is_late = await check_if_late(validated_event['employee_id'], check_in_time)

    if is_late:
        print(f"Employee is late")

        # Calculate late minutes
        from app.services.database import get_db
        db = get_db()

        schedule = await db.fetch_one(
            "SELECT start_time FROM employee_schedules WHERE employee_id = $1",
            validated_event['employee_id']
        )

        if schedule:
            late_seconds = (
                datetime.combine(datetime.min, check_in_time.time()) -
                datetime.combine(datetime.min, schedule['start_time'])
            ).total_seconds()

            late_minutes = int(late_seconds / 60)

            # Notify supervisor
            await notify_supervisor(validated_event['employee_id'], late_minutes)

            print(f"Supervisor notified - Employee late by {late_minutes} minutes")
    else:
        print(f"Employee checked in on time")

    return {
        "log_id": log_id,
        "is_late": is_late,
        "status": "completed"
    }
```

---

### 2. Room Status Update Workflow

```python
# app/flows/rooms/update_status.py
from prefect import flow, task

@task(retries=3)
async def update_room_status_db(room_number: str, status: str, metadata: dict):
    """Update room status in database"""
    from app.services.database import get_db

    db = get_db()

    query = """
        UPDATE rooms
        SET
            status = $2,
            last_cleaned_at = CASE WHEN $2 = 'clean' THEN NOW() ELSE last_cleaned_at END,
            last_checked_by = $3,
            updated_at = NOW()
        WHERE room_number = $1
        RETURNING *
    """

    result = await db.fetch_one(
        query,
        room_number,
        status,
        metadata.get('updated_by')
    )

    return result

@task
async def check_guest_waiting_for_room(room_number: str):
    """Check if there's a guest waiting for this room"""
    from app.services.database import get_db

    db = get_db()

    # Find booking where guest is waiting for room
    booking = await db.fetch_one(
        """
        SELECT * FROM bookings
        WHERE room_number = $1
        AND check_in_date = CURRENT_DATE
        AND status = 'confirmed'
        AND guest_notified = FALSE
        """,
        room_number
    )

    return booking

@task
async def generate_checkin_ready_email(booking: dict):
    """Generate check-in ready email using LLM service"""
    from app.services.llm_service import llm_service_client

    email_content = await llm_service_client.generate_email(
        template_type="checkin_ready",
        variables={
            "guest_name": booking['guest_name'],
            "room_number": booking['room_number'],
            "check_in_time": "14:00"
        },
        language="vi"
    )

    return email_content

@task
async def send_email_to_guest(email: str, subject: str, body: str):
    """Send email to guest"""
    from app.services.email_service import send_email

    result = await send_email(
        to=email,
        subject=subject,
        body=body
    )

    return result

@task
async def mark_guest_notified(booking_id: str):
    """Mark guest as notified in database"""
    from app.services.database import get_db

    db = get_db()

    await db.execute(
        "UPDATE bookings SET guest_notified = TRUE, notification_sent_at = NOW() WHERE id = $1",
        booking_id
    )

@flow(name="update_room_status", log_prints=True)
async def update_room_status_flow(event: dict):
    """
    Room status update workflow

    Steps:
    1. Update room status in database
    2. Check if guest is waiting for this room
    3. If yes, generate and send check-in ready email
    """
    room_number = event['room_number']
    new_status = event['new_status']

    print(f"Updating room {room_number} to status: {new_status}")

    # Update database
    updated_room = await update_room_status_db(
        room_number,
        new_status,
        event.get('metadata', {})
    )

    print(f"Room status updated in database")

    # If room is now clean, check if guest is waiting
    if new_status == 'clean':
        booking = await check_guest_waiting_for_room(room_number)

        if booking:
            print(f"Guest waiting for room: {booking['guest_name']}")

            # Generate email
            email_content = await generate_checkin_ready_email(booking)

            # Send email
            await send_email_to_guest(
                booking['guest_email'],
                email_content['subject'],
                email_content['body']
            )

            # Mark as notified
            await mark_guest_notified(booking['id'])

            print(f"Check-in ready email sent to {booking['guest_email']}")

            return {
                "room_updated": True,
                "guest_notified": True,
                "booking_id": booking['id']
            }

    return {
        "room_updated": True,
        "guest_notified": False
    }
```

---

### 3. Daily Report Generation Workflow

```python
# app/flows/reports/daily_report.py
from prefect import flow, task
from datetime import datetime, timedelta
import pandas as pd
from io import BytesIO

@task
async def fetch_occupancy_data(date: str):
    """Fetch occupancy data for the date"""
    from app.services.database import get_db

    db = get_db()

    query = """
        SELECT
            COUNT(*) as total_rooms,
            SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
            SUM(CASE WHEN status = 'clean' THEN 1 ELSE 0 END) as clean_rooms,
            SUM(CASE WHEN status = 'dirty' THEN 1 ELSE 0 END) as dirty_rooms,
            ROUND(
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END)::numeric /
                COUNT(*)::numeric * 100,
                2
            ) as occupancy_rate
        FROM rooms
        WHERE date = $1
    """

    result = await db.fetch_one(query, date)
    return dict(result)

@task
async def fetch_revenue_data(date: str):
    """Fetch revenue data for the date"""
    from app.services.database import get_db

    db = get_db()

    query = """
        SELECT
            SUM(total_amount) as total_revenue,
            COUNT(*) as total_bookings,
            AVG(total_amount) as avg_booking_value,
            SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_revenue,
            SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
        FROM bookings
        WHERE check_in_date = $1 OR check_out_date = $1
    """

    result = await db.fetch_one(query, date)
    return dict(result)

@task
async def fetch_housekeeping_data(date: str):
    """Fetch housekeeping performance data"""
    from app.services.database import get_db

    db = get_db()

    query = """
        SELECT
            COUNT(*) as rooms_cleaned,
            AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) as avg_cleaning_time_minutes,
            COUNT(DISTINCT employee_id) as staff_count
        FROM housekeeping_logs
        WHERE DATE(started_at) = $1
        AND status = 'completed'
    """

    result = await db.fetch_one(query, date)
    return dict(result)

@task
async def generate_pdf_report(data: dict):
    """Generate PDF report from data"""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, 10 * inch, f"Daily Hotel Report - {data['date']}")

    # Occupancy section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1 * inch, 9 * inch, "Occupancy")

    c.setFont("Helvetica", 12)
    y = 8.7 * inch
    for key, value in data['occupancy'].items():
        c.drawString(1.2 * inch, y, f"{key}: {value}")
        y -= 0.2 * inch

    # Revenue section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1 * inch, y - 0.3 * inch, "Revenue")

    c.setFont("Helvetica", 12)
    y = y - 0.5 * inch
    for key, value in data['revenue'].items():
        c.drawString(1.2 * inch, y, f"{key}: {value:,.0f} VND" if isinstance(value, (int, float)) else f"{key}: {value}")
        y -= 0.2 * inch

    # Housekeeping section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1 * inch, y - 0.3 * inch, "Housekeeping")

    c.setFont("Helvetica", 12)
    y = y - 0.5 * inch
    for key, value in data['housekeeping'].items():
        c.drawString(1.2 * inch, y, f"{key}: {value}")
        y -= 0.2 * inch

    c.save()
    buffer.seek(0)

    return buffer

@task
async def upload_report_to_storage(pdf_buffer: BytesIO, filename: str):
    """Upload PDF report to object storage"""
    from app.services.storage import upload_file

    url = await upload_file(
        bucket="reports",
        filename=filename,
        data=pdf_buffer.read(),
        content_type="application/pdf"
    )

    return url

@task
async def send_report_email(recipients: list, report_url: str, date: str):
    """Send report via email"""
    from app.services.email_service import send_email

    subject = f"Daily Hotel Report - {date}"
    body = f"""
    Dear Management Team,

    Please find attached the daily hotel report for {date}.

    Report URL: {report_url}

    Best regards,
    Hotel Management System
    """

    for recipient in recipients:
        await send_email(
            to=recipient,
            subject=subject,
            body=body
        )

@flow(name="daily_report_generation", log_prints=True)
async def daily_report_generation_flow(date: str, recipients: list):
    """
    Daily report generation workflow

    Steps:
    1. Fetch occupancy data
    2. Fetch revenue data
    3. Fetch housekeeping data
    4. Generate PDF report
    5. Upload to storage
    6. Send via email
    """
    print(f"Generating daily report for {date}")

    # Fetch data in parallel
    occupancy_data = await fetch_occupancy_data(date)
    revenue_data = await fetch_revenue_data(date)
    housekeeping_data = await fetch_housekeeping_data(date)

    print("Data fetched successfully")

    # Combine data
    report_data = {
        "date": date,
        "occupancy": occupancy_data,
        "revenue": revenue_data,
        "housekeeping": housekeeping_data
    }

    # Generate PDF
    pdf_buffer = await generate_pdf_report(report_data)
    print("PDF report generated")

    # Upload to storage
    filename = f"daily_report_{date}.pdf"
    report_url = await upload_report_to_storage(pdf_buffer, filename)
    print(f"Report uploaded: {report_url}")

    # Send email
    await send_report_email(recipients, report_url, date)
    print(f"Report sent to {len(recipients)} recipients")

    return {
        "status": "completed",
        "report_url": report_url,
        "date": date
    }
```

---

## 🚀 Deployment

### Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY deployments/ ./deployments/
COPY scripts/ ./scripts/

EXPOSE 8004

# Start API server and workers
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 8004 & python scripts/start_workers.sh"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  prefect-service:
    build: .
    image: hotel-ai/prefect-service:latest
    ports:
      - "8004:8004"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/hoteldb
      - REDIS_URL=redis://redis:6379/2
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
      - PREFECT_API_URL=http://prefect-server:4200/api
    depends_on:
      - postgres
      - redis
      - rabbitmq
      - prefect-server
    restart: unless-stopped

  prefect-server:
    image: prefecthq/prefect:2-python3.10
    command: prefect server start --host 0.0.0.0
    ports:
      - "4200:4200"
    environment:
      - PREFECT_API_DATABASE_CONNECTION_URL=postgresql+asyncpg://user:pass@postgres:5432/prefect
      - PREFECT_SERVER_API_HOST=0.0.0.0
    depends_on:
      - postgres
```

---

## 📊 Monitoring & Observability

### Key Metrics

```python
# app/utils/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Workflow metrics
workflow_runs_total = Counter(
    'prefect_workflow_runs_total',
    'Total workflow runs',
    ['workflow_name', 'status']
)

workflow_duration_seconds = Histogram(
    'prefect_workflow_duration_seconds',
    'Workflow duration in seconds',
    ['workflow_name'],
    buckets=[1, 5, 10, 30, 60, 300, 600, 1800, 3600]
)

active_workflows = Gauge(
    'prefect_active_workflows',
    'Number of currently running workflows'
)

# Task metrics
task_retries_total = Counter(
    'prefect_task_retries_total',
    'Total task retries',
    ['task_name', 'workflow_name']
)

# Queue metrics
queue_depth = Gauge(
    'prefect_queue_depth',
    'RabbitMQ queue depth',
    ['queue_name']
)

# Event metrics
events_processed_total = Counter(
    'prefect_events_processed_total',
    'Total events processed',
    ['event_type', 'status']
)
```

---

Đây là file PREFECT_SERVICE.md hoàn chỉnh với đầy đủ workflows, API endpoints, event handling, và deployment guides!
