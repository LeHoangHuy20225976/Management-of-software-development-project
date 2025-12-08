# Hotel AI Management System

Hệ thống AI quản lý khách sạn với 4 services chính: Computer Vision, Machine Learning, LLM, và Prefect Orchestration.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy](#cài-đặt-và-chạy)
- [Services và Ports](#services-và-ports)
- [Quản lý Prefect Flows](#quản-lý-prefect-flows)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng quan

Hệ thống AI quản lý khách sạn được xây dựng với kiến trúc microservices, sử dụng:

- **Computer Vision Service**: Nhận diện khuôn mặt, OCR, phân tích camera
- **Machine Learning Service**: Dự đoán, recommendation, pricing
- **LLM Service**: Chatbot thông minh với RAG
- **Prefect Service**: Workflow orchestration và scheduling

**Tech Stack:**
- Docker & Docker Compose
- PostgreSQL với pgvector (Vector DB)
- Prefect 3.x (Workflow orchestration)
- FastAPI (API services)
- MLflow (ML experiment tracking)
- RabbitMQ (Message queue)
- MinIO (Object storage)
- Redis (Caching)
- Prometheus + Grafana (Monitoring)

### 🤖 RAG (Retrieval-Augmented Generation)

Hệ thống sử dụng **LlamaIndex + pgvector** cho LLM Service với RAG:

- **Vector Database**: PostgreSQL với pgvector extension (đã được setup)
- **Framework**: LlamaIndex cho indexing và retrieval
- **Use cases**:
  - Chatbot thông minh với knowledge base
  - Semantic search trong tài liệu khách sạn
  - Q&A về policies, procedures
  - Personalized recommendations

**Databases có pgvector enabled:**
- `vector_db` - Vector embeddings chính
- `hotel_db` - Application data với vector columns
- Tất cả databases đã có pgvector extension được enable tự động

**Example RAG workflow:**
```python
from llama_index import VectorStoreIndex, ServiceContext
from llama_index.vector_stores import PGVectorStore

# Connect to pgvector
vector_store = PGVectorStore.from_params(
    database="vector_db",
    host="postgres",
    password="hotel_password",
    port=5432,
    user="hotel_user",
    table_name="embeddings",
    embed_dim=1536  # OpenAI embedding dimension
)

# Create index and query
index = VectorStoreIndex.from_vector_store(vector_store)
query_engine = index.as_query_engine()
response = query_engine.query("What is the hotel check-in policy?")
```

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend/API Gateway                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│  CV Service  │  │ ML Service  │  │ LLM Service │
│  (Port 8001) │  │ (Port 8002) │  │ (Port 8003) │
└──────┬───────┘  └──────┬──────┘  └──────┬──────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Prefect Workflows  │
              │    (Port 4200)      │
              └──────────┬──────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────┐  ┌───────────▼────┐  ┌───────────▼────┐
│ Postgres│  │   RabbitMQ     │  │     MinIO      │
│ +Vector │  │  (Messages)    │  │   (Storage)    │
└─────────┘  └────────────────┘  └────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
AI/
├── README.md                      # File này
├── docker-compose.yml             # Orchestration tất cả services
├── Dockerfile.worker              # Prefect worker image
├── prefect.yaml                   # Prefect deployment config
├── pyproject.toml                 # Python dependencies (uv)
├── .python-version                # Python version
├── .env                           # Environment variables (không commit)
│
├── docs/                          # Documentation
│   ├── HOTEL_SYSTEM_ARCHITECTURE.md
│   ├── SERVICE_CONNECTIONS.md
│   ├── DEPLOYMENT_ROADMAP.md
│   ├── CV_SERVICE.md
│   ├── ML_SERVICE.md
│   ├── LLM_SERVICE.md
│   └── PREFECT_SERVICE.md
│
├── infrastructure/                # Config files cho services
│   ├── postgres/
│   │   ├── init-db.sql           # Tạo databases
│   │   └── init-pgvector.sql     # Enable pgvector extension
│   ├── monitoring/
│   │   ├── prometheus.yml        # Prometheus config
│   │   └── grafana/
│   │       ├── dashboards/
│   │       └── datasources/
│   ├── nginx/                     # Nginx config (future)
│   └── rabbitmq/                  # RabbitMQ config (future)
│
└── src/                           # Source code
    ├── __init__.py
    │
    ├── application/               # Business logic layer
    │   ├── __init__.py
    │   ├── main.py                # FastAPI application - tổng hợp tất cả routers
    │   │
    │   ├── controllers/           # API endpoints
    │   │   ├── __init__.py
    │   │   ├── cv/
    │   │   │   ├── __init__.py
    │   │   │   └── router.py      # CV API routes
    │   │   ├── ml/
    │   │   │   ├── __init__.py
    │   │   │   └── router.py      # ML API routes
    │   │   └── llm/
    │   │       ├── __init__.py
    │   │       └── router.py      # LLM API routes
    │   │
    │   ├── dtos/                  # Data Transfer Objects
    │   │   ├── __init__.py
    │   │   ├── cv/                # Request/Response models for CV
    │   │   ├── ml/                # Request/Response models for ML
    │   │   └── llm/               # Request/Response models for LLM
    │   │
    │   └── services/              # Core services logic
    │       ├── __init__.py
    │       ├── cv/                # Computer Vision logic
    │       ├── ml/                # Machine Learning logic
    │       └── llm/               # LLM & RAG logic
    │
    ├── flow/                      # ⭐ Prefect Flows (workflows)
    │   ├── __init__.py
    │   └── hello_flow.py          # Example flow
    │
    ├── infrastructure/            # Infrastructure code (Python)
    │   ├── __init__.py
    │   └── config.py              # Configuration management
    │
    └── utils/                     # Utilities
        ├── __init__.py
        └── logger.py              # Logging utilities
```

### 📝 Quy tắc đặt tên

- **`infrastructure/`** (root): Config files (YAML, SQL, conf)
- **`src/infrastructure/`**: Python code cho infrastructure (database, clients)
- **`src/flow/`**: Prefect flows (workflows)
- **`src/application/main.py`**: FastAPI app chính, tổng hợp tất cả routers từ CV, ML, LLM
- **`src/application/controllers/{service}/router.py`**: API routes cho từng service (cv, ml, llm)
- **`src/application/services/`**: Business logic cho từng service
- **`src/application/dtos/`**: Pydantic models cho request/response

---

## 💻 Yêu cầu hệ thống

### Chạy với Docker (Recommended)

- **Docker Desktop**: >= 20.x
- **Docker Compose**: >= 2.x
- **RAM**: >= 8GB (recommended 16GB)
- **Disk**: >= 20GB free space

### Chạy local với uv (Development)

- **Python**: 3.11+
- **uv**: Package manager (cài bên dưới)
- **PostgreSQL**: 16+ với pgvector extension
- **Redis**: 7+
- **RabbitMQ**: 3+

---

## 🚀 Cài đặt và chạy

### Phương án 1: Chạy với Docker (Recommended - Full Stack)

Đây là cách **đơn giản nhất**, chạy toàn bộ hệ thống với 1 lệnh.

### 1. Clone repository

```bash
cd AI/
```

### 2. Tạo file `.env`

```bash
# Tạo file .env từ template
cat > .env << 'EOF'
# Database
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=hotel_password
POSTGRES_DB=hotel_db

# Redis
REDIS_PASSWORD=redis_password

# RabbitMQ
RABBITMQ_USER=hotel_user
RABBITMQ_PASSWORD=rabbitmq_password

# MinIO
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=minio_password_123

# OpenAI (cho LLM service)
OPENAI_API_KEY=your-api-key-here

# Prefect
PREFECT_API_URL=http://prefect-server:4200/api
EOF
```

### 3. Khởi động tất cả services

```bash
# Build và start tất cả containers
docker compose up -d --build

# Xem logs
docker compose logs -f

# Chỉ xem logs của 1 service
docker compose logs -f prefect-worker
```

### 4. Kiểm tra services đã chạy

```bash
docker ps
```

Tất cả containers nên có status `Up` hoặc `Up (healthy)`.

---

### Phương án 2: Chạy local với uv (Development - Python Only)

Chạy Python code trực tiếp trên máy local, phù hợp cho development và testing code nhanh.

**⚠️ Lưu ý:** Phương án này chỉ chạy Python code, vẫn cần Docker cho databases (Postgres, Redis, RabbitMQ).

#### 1. Cài đặt uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Hoặc với Homebrew (macOS)
brew install uv

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Kiểm tra
uv --version
```

#### 2. Setup Python environment

```bash
cd AI/

# Tạo virtual environment và cài dependencies
uv sync

# Cài thêm dev dependencies (optional)
uv sync --extra dev

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# hoặc
.venv\Scripts\activate  # Windows
```

#### 3. Start infrastructure services (Docker)

```bash
# Chỉ start databases và infrastructure, KHÔNG start AI services
docker compose up -d postgres redis rabbitmq minio mlflow prometheus grafana

# Kiểm tra
docker ps
```

#### 4. Chạy Prefect flow locally

```bash
# Set environment variables
export PREFECT_API_URL=http://localhost:4200/api
export DATABASE_URL=postgresql://hotel_user:hotel_password@localhost:5433/hotel_db

# Chạy 1 flow trực tiếp
python src/flow/hello_flow.py

# Hoặc chạy qua Prefect
prefect flow run src/flow/hello_flow.py:hello_flow
```

#### 5. Chạy FastAPI application locally

```bash
# Chạy toàn bộ application (tất cả services: CV, ML, LLM)
uvicorn src.application.main:app --reload --port 8000

# Chạy từng service riêng lẻ (ví dụ ML service)
uvicorn src.application.controllers.ml.main:app --reload --port 8002

# Application sẽ tự động load tất cả routers:
# - /cv/*    -> CV service routes
# - /ml/*    -> ML service routes
# - /llm/*   -> LLM service routes

# Xem API docs
open http://localhost:8000/docs
```

#### 6. Test RAG với LlamaIndex

```bash
# Tạo test script
cat > test_rag.py << 'EOF'
from src.application.services.llm.vector_store import HotelVectorStore

# Test connection
store = HotelVectorStore()
print("✅ Connected to pgvector")

# Index sample documents
docs = ["Check-in time is 3:00 PM", "Free WiFi available"]
store.index_documents(docs)
print("✅ Indexed documents")

# Query
response = store.query("What time is check-in?")
print(f"📝 Response: {response}")
EOF

# Chạy test
python test_rag.py
```

#### 7. Quản lý dependencies với uv

```bash
# Thêm package mới
uv add <package-name>

# Ví dụ
uv add numpy pandas

# Xóa package
uv remove <package-name>

# Update tất cả packages
uv lock --upgrade

# Re-sync sau khi sửa pyproject.toml
uv sync

# Export requirements.txt (nếu cần)
uv pip compile pyproject.toml -o requirements.txt
```

#### 8. Development workflow với uv

```bash
# 1. Sửa code trong src/
vim src/flow/my_flow.py

# 2. Test ngay lập tức
python src/flow/my_flow.py

# 3. Không cần rebuild Docker!
# Code chạy trực tiếp trên máy local

# 4. Format code
uv run black src/
uv run ruff check src/

# 5. Run tests
uv run pytest tests/
```

#### 9. So sánh Docker vs uv

| Tiêu chí            | Docker (Full Stack) | uv (Local)               |
| ------------------- | ------------------- | ------------------------ |
| **Setup time**      | Lâu (build images)  | Nhanh (chỉ cài packages) |
| **Resource**        | Nhiều RAM/CPU       | Ít hơn                   |
| **Hot reload**      | Cần mount volumes   | Tự động                  |
| **Database**        | Tích hợp sẵn        | Cần Docker riêng         |
| **Production-like** | ✅ Giống production | ❌ Khác production       |
| **Best for**        | Integration testing | Quick prototyping        |

#### 10. Tips

**Khi nào dùng uv:**

- Đang develop/debug Python code
- Muốn test nhanh 1 flow
- Làm việc với Jupyter notebook
- Code completion trong IDE tốt hơn

**Khi nào dùng Docker:**

- Test toàn bộ hệ thống
- Deploy lên server
- Share với team (consistent environment)
- CI/CD pipeline

**Best practice:**

```bash
# Development: Code với uv
uv sync
python src/flow/my_flow.py

# Testing: Chạy integration test với Docker
docker compose up -d
pytest tests/integration/

# Production: Deploy với Docker
docker compose -f docker-compose.prod.yml up -d
```

---

## 🌐 Services và Ports

| Service        | URL                    | Credentials                    | Mô tả                            |
| -------------- | ---------------------- | ------------------------------ | -------------------------------- |
| **Prefect UI** | http://localhost:4200  | -                              | Workflow orchestration dashboard |
| **Grafana**    | http://localhost:3000  | admin/grafana_password         | Monitoring dashboards            |
| **MLflow**     | http://localhost:5000  | -                              | ML experiment tracking           |
| **RabbitMQ**   | http://localhost:15672 | hotel_user/rabbitmq_password   | Message queue management         |
| **MinIO**      | http://localhost:9001  | minio_admin/minio_password_123 | Object storage console           |
| **Prometheus** | http://localhost:9090  | -                              | Metrics collection               |
| **PostgreSQL** | localhost:5433         | hotel_user/hotel_password      | Main database                    |
| **Redis**      | localhost:6379         | redis_password                 | Cache & messaging                |

### Databases được tạo tự động

- `hotel_db` - Main application database
- `prefect_db` - Prefect orchestration
- `grafana_db` - Grafana dashboards
- `mlflow_db` - MLflow experiments
- `vector_db` - Vector embeddings (pgvector)

---

## 🔄 Quản lý Prefect Flows

### Auto-deploy khi container start

Mỗi khi `prefect-worker` container khởi động, nó sẽ **tự động deploy** tất cả flows được định nghĩa trong `prefect.yaml`.

### Thêm flow mới

**Bước 1:** Tạo file flow trong `src/flow/`

```python
# src/flow/example_flow.py
from prefect import flow, task
import time

@task(name="process_data", retries=2)
def process_data(data: dict):
    print(f"Processing: {data}")
    return {"status": "processed", "data": data}

@flow(name="example-flow", log_prints=True)
def example_flow(input_data: dict = {}):
    """Example Prefect flow"""
    print("🚀 Starting example flow")
    result = process_data(input_data)
    print(f"✅ Completed: {result}")
    return result

if __name__ == "__main__":
    example_flow({"test": "data"})
```

**Bước 2:** Thêm deployment vào `prefect.yaml`

```yaml
deployments:
  - name: hello-deployment
    entrypoint: src/flow/hello_flow.py:hello_flow
    work_pool:
      name: local-pool
      work_queue_name: default
    tags:
      - hotel
      - production

  # Thêm deployment mới
  - name: example-deployment
    entrypoint: src/flow/example_flow.py:example_flow
    work_pool:
      name: local-pool
    parameters:
      input_data: { "default": "value" }
    schedule:
      cron: "0 */2 * * *" # Chạy mỗi 2 giờ
    tags:
      - hotel
      - example
```

**Bước 3:** Restart worker để auto-deploy

```bash
docker compose restart prefect-worker

# Hoặc deploy manual (không cần restart)
docker exec hotel-prefect-worker prefect deploy --all
```

**Bước 4:** Chạy flow

```bash
# Chạy từ CLI
docker exec hotel-prefect-worker prefect deployment run 'example-flow/example-deployment'

# Hoặc từ Prefect UI: http://localhost:4200/deployments
```

### Test flow locally (không cần deploy)

```bash
docker exec hotel-prefect-worker python src/flow/example_flow.py
```

---

## 🛠️ Development Workflow

### 1. Cấu trúc FastAPI Routing

Hệ thống sử dụng pattern **centralized routing** với `main.py` làm entry point:

**`src/application/main.py`** - FastAPI app chính:

```python
from fastapi import FastAPI
from src.application.controllers.cv import router as cv_router
from src.application.controllers.ml import router as ml_router
from src.application.controllers.llm import router as llm_router

app = FastAPI(
    title="Hotel AI System",
    description="AI services for hotel management",
    version="1.0.0"
)

# Include all service routers
app.include_router(cv_router.router, prefix="/cv", tags=["Computer Vision"])
app.include_router(ml_router.router, prefix="/ml", tags=["Machine Learning"])
app.include_router(llm_router.router, prefix="/llm", tags=["LLM"])

@app.get("/")
def root():
    return {"message": "Hotel AI System", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**`src/application/controllers/cv/router.py`** - CV service routes:

```python
from fastapi import APIRouter, UploadFile
from src.application.dtos.cv import FaceRecognitionRequest, FaceRecognitionResponse
from src.application.services.cv import face_recognition_service

router = APIRouter()

@router.post("/face-recognition", response_model=FaceRecognitionResponse)
async def recognize_face(file: UploadFile):
    """Nhận diện khuôn mặt từ ảnh upload"""
    result = await face_recognition_service.recognize(file)
    return result

@router.post("/ocr")
async def extract_text(file: UploadFile):
    """Trích xuất text từ ảnh (OCR)"""
    # Implementation
    pass
```

**`src/application/controllers/ml/router.py`** - ML service routes:

```python
from fastapi import APIRouter
from src.application.dtos.ml import PricingRequest, PricingResponse
from src.application.services.ml import pricing_service

router = APIRouter()

@router.post("/pricing/predict", response_model=PricingResponse)
async def predict_price(request: PricingRequest):
    """Dự đoán giá phòng tối ưu"""
    result = await pricing_service.predict(request)
    return result

@router.post("/recommendation")
async def recommend_rooms(user_id: str):
    """Gợi ý phòng cho khách hàng"""
    # Implementation
    pass
```

**`src/application/controllers/llm/router.py`** - LLM service routes:

```python
from fastapi import APIRouter
from src.application.dtos.llm import ChatRequest, ChatResponse
from src.application.services.llm import chatbot_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chatbot với RAG"""
    result = await chatbot_service.query(request.message)
    return result

@router.post("/embeddings")
async def create_embeddings(texts: list[str]):
    """Tạo embeddings cho texts"""
    # Implementation
    pass
```

**Routing structure:**

```
GET  /                          → Root endpoint
GET  /health                    → Health check
GET  /docs                      → Swagger UI (auto-generated)

POST /cv/face-recognition       → CV service
POST /cv/ocr                    → CV service

POST /ml/pricing/predict        → ML service
POST /ml/recommendation         → ML service

POST /llm/chat                  → LLM service
POST /llm/embeddings            → LLM service
```

### 2. Sửa code flow

File flow được mount vào container qua volumes, nên **không cần rebuild** khi sửa code:

```bash
# Sửa file
vim src/flow/hello_flow.py

# Restart worker để deploy lại
docker compose restart prefect-worker
```

### 2. Thêm dependencies mới

**Bước 1:** Sửa `pyproject.toml`

```toml
[project]
dependencies = [
    "prefect>=3.0.0",
    "pandas>=2.0.0",      # Thêm dependency mới
]
```

**Bước 2:** Rebuild worker

```bash
docker compose up -d --build prefect-worker
```

### 3. Xem logs

```bash
# Tất cả logs
docker compose logs -f

# Chỉ Prefect worker
docker compose logs -f prefect-worker

# Logs của 1 flow run cụ thể
# Xem trong Prefect UI: http://localhost:4200/runs
```

### 4. Dọn dẹp

```bash
# Stop tất cả services
docker compose down

# Stop và xóa volumes (XÓA DỮ LIỆU!)
docker compose down -v

# Rebuild từ đầu
docker compose up -d --build --force-recreate
```

---

## 🤖 RAG Implementation với LlamaIndex

### Setup pgvector Vector Store

**Bước 1:** Thêm dependencies vào `pyproject.toml`

```toml
[project]
dependencies = [
    "prefect>=3.0.0",
    "llama-index>=0.10.0",
    "llama-index-vector-stores-postgres>=0.1.0",
    "psycopg2-binary>=2.9.0",
    "openai>=1.0.0",
]
```

**Bước 2:** Tạo vector store service

```python
# src/application/services/llm/vector_store.py
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core import Document

class HotelVectorStore:
    def __init__(self):
        self.vector_store = PGVectorStore.from_params(
            database="vector_db",
            host="postgres",
            password="hotel_password",
            port=5432,
            user="hotel_user",
            table_name="hotel_embeddings",
            embed_dim=1536,
        )

        self.storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store
        )

    def index_documents(self, documents: list[str]):
        """Index documents into vector store"""
        docs = [Document(text=text) for text in documents]
        index = VectorStoreIndex.from_documents(
            docs,
            storage_context=self.storage_context
        )
        return index

    def query(self, question: str, top_k: int = 5):
        """Query the vector store"""
        index = VectorStoreIndex.from_vector_store(
            self.vector_store,
            storage_context=self.storage_context
        )
        query_engine = index.as_query_engine(similarity_top_k=top_k)
        response = query_engine.query(question)
        return response
```

**Bước 3:** Tạo Prefect flow để index documents

```python
# src/flow/rag_indexing_flow.py
from prefect import flow, task
from src.application.services.llm.vector_store import HotelVectorStore

@task(name="load_hotel_documents", retries=2)
def load_documents():
    """Load hotel documents from database or files"""
    documents = [
        "Check-in time is 3:00 PM. Early check-in subject to availability.",
        "Check-out time is 11:00 AM. Late check-out available for extra fee.",
        "Free WiFi available in all rooms and common areas.",
        "Swimming pool open from 6:00 AM to 10:00 PM daily.",
    ]
    return documents

@task(name="index_to_vector_store")
def index_documents(documents: list[str]):
    """Index documents to pgvector"""
    vector_store = HotelVectorStore()
    index = vector_store.index_documents(documents)
    print(f"✅ Indexed {len(documents)} documents")
    return True

@flow(name="rag-indexing-flow", log_prints=True)
def rag_indexing_flow():
    """Index hotel documents for RAG"""
    print("🔄 Loading documents...")
    docs = load_documents()

    print("📚 Indexing to vector store...")
    index_documents(docs)

    print("✅ RAG indexing completed!")

if __name__ == "__main__":
    rag_indexing_flow()
```

**Bước 4:** Tạo RAG query flow

```python
# src/flow/rag_query_flow.py
from prefect import flow, task
from src.application.services.llm.vector_store import HotelVectorStore

@task(name="query_vector_store")
def query_rag(question: str):
    """Query RAG system"""
    vector_store = HotelVectorStore()
    response = vector_store.query(question)
    return str(response)

@flow(name="rag-query-flow", log_prints=True)
def rag_query_flow(question: str):
    """Query hotel information using RAG"""
    print(f"❓ Question: {question}")

    answer = query_rag(question)

    print(f"✅ Answer: {answer}")
    return answer

if __name__ == "__main__":
    rag_query_flow("What time is check-in?")
```

**Bước 5:** Deploy RAG flows

Thêm vào `prefect.yaml`:

```yaml
deployments:
  # ... existing deployments

  - name: rag-indexing
    entrypoint: src/flow/rag_indexing_flow.py:rag_indexing_flow
    work_pool:
      name: local-pool
    schedule:
      cron: "0 2 * * *" # Index mỗi ngày lúc 2 AM
    tags:
      - rag
      - indexing

  - name: rag-query
    entrypoint: src/flow/rag_query_flow.py:rag_query_flow
    work_pool:
      name: local-pool
    tags:
      - rag
      - query
```

### Kiểm tra pgvector tables

```bash
# Connect vào PostgreSQL
docker exec -it hotel-postgres psql -U hotel_user -d vector_db

# List tables
\dt

# View embeddings table structure
\d hotel_embeddings

# Query vectors
SELECT id, metadata, embedding FROM hotel_embeddings LIMIT 5;
```

### Monitoring RAG Performance

```python
# Thêm logging và metrics
from prefect import flow, task
import time

@task(name="query_with_metrics")
def query_with_metrics(question: str):
    start_time = time.time()

    vector_store = HotelVectorStore()
    response = vector_store.query(question)

    elapsed = time.time() - start_time
    print(f"⏱️  Query time: {elapsed:.2f}s")

    return {
        "answer": str(response),
        "query_time": elapsed,
        "question": question
    }
```

---

## 🔧 Troubleshooting

### ❌ Container restart liên tục

**Kiểm tra logs:**

```bash
docker logs hotel-prefect-worker --tail 50
```

**Nguyên nhân thường gặp:**

- Database chưa sẵn sàng → Đợi thêm vài giây
- Port conflict → Đổi port trong `docker-compose.yml`
- Thiếu dependencies → Rebuild image

### ❌ Port 5432 already in use

PostgreSQL local đang chạy. Hệ thống đã map port `5433:5432` để tránh conflict.

```bash
# Kết nối từ host
psql -h localhost -p 5433 -U hotel_user -d hotel_db

# Hoặc stop PostgreSQL local
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux
```

### ❌ Flow không tự động deploy

**Kiểm tra:**

```bash
# Xem logs deploy
docker logs hotel-prefect-worker | grep -A 10 "Deploying"

# Validate prefect.yaml
docker exec hotel-prefect-worker prefect deploy --all
```

**Lỗi thường gặp:**

- Sai format `entrypoint` trong `prefect.yaml`
- Flow import bị lỗi (syntax error)
- Work pool chưa tồn tại (tự tạo nếu chưa có)

### ❌ Cannot connect to Prefect server

**Kiểm tra:**

```bash
# Test từ host
curl http://localhost:4200/api/health

# Test từ worker container
docker exec hotel-prefect-worker curl http://prefect-server:4200/api/health
```

**Fix:**

```bash
# Restart Prefect server
docker compose restart prefect-server prefect-services

# Kiểm tra database connection
docker logs hotel-prefect-server | grep -i error
```

### ❌ MLflow: No module named 'psycopg2'

Đã fix bằng cách cài `psycopg2-binary` trong docker-compose command. Nếu vẫn lỗi:

```bash
docker compose down
docker compose up -d --build mlflow
```

### 🔍 Debug mode

Bật debug logs cho Prefect:

```bash
# Thêm vào docker-compose.yml > prefect-worker > environment
PREFECT_LOGGING_LEVEL=DEBUG
```

---

## 📚 Tài liệu thêm

- **Architecture**: `docs/HOTEL_SYSTEM_ARCHITECTURE.md`
- **CV Service**: `docs/CV_SERVICE.md`
- **ML Service**: `docs/ML_SERVICE.md`
- **LLM Service**: `docs/LLM_SERVICE.md`
- **Prefect Service**: `docs/PREFECT_SERVICE.md`
- **Deployment**: `docs/DEPLOYMENT_ROADMAP.md`

---

## 📝 Notes

- **.env file**: Không commit file này vào Git (đã có trong `.gitignore`)
- **Hot reload**: Code trong `src/` được mount vào container, sửa code không cần rebuild
- **Production**: Đổi tất cả passwords trong `.env` và `docker-compose.yml`
- **Security**: Trong production nên dùng secrets manager (AWS Secrets, Vault)

---

## 🤝 Contributing

1. Tạo branch mới: `git checkout -b feature/ten-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/ten-feature`
4. Tạo Pull Request

---

## 📄 License

Copyright © 2025 Hotel AI Management System
