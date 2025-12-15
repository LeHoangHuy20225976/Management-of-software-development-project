# Computer Vision Service Tests

Comprehensive test suite for CV service including Face Recognition and Image Search/Retrieval.

## Test Structure

```
test/cv/
├── unit/                          # Unit tests (mocked dependencies)
│   ├── test_face_service.py
│   └── test_image_search_service.py
├── integration/                   # Integration tests (real database)
│   ├── test_face_api.py
│   └── test_image_search_api.py
├── manual/                        # Manual testing tools
│   ├── test_image_search_manual.py    # Full API test suite
│   └── search_images_cli.py           # CLI tool for search
└── performance/                   # Performance benchmarks
    └── benchmark_image_search.py
```

---

## Prerequisites

### 1. Install Dependencies

```bash
# Install CV service dependencies
cd AI
uv sync --extra cv --extra dev
```

### 2. Start Services

```bash
# Start PostgreSQL
docker compose up -d postgres

# Start CV service
docker compose up -d cv-service

# Or run locally for development
uv run uvicorn src.application.controllers.cv.main:app --port 8001
```

---

## Running Tests

### Unit Tests

Unit tests use mocked dependencies and don't require running services.

```bash
# Run all unit tests
pytest test/cv/unit/ -v

# Run specific test file
pytest test/cv/unit/test_image_search_service.py -v

# Run with coverage
pytest test/cv/unit/ --cov=src/application/services/cv --cov-report=html
```

### Integration Tests

Integration tests require running PostgreSQL and CV service.

```bash
# Run all integration tests
pytest test/cv/integration/ -v -m integration

# Run only if services are available
pytest test/cv/integration/ -v --tb=short

# Skip integration tests
pytest test/cv/ -v -m "not integration"
```

### Manual Tests

Manual tests provide interactive testing and CLI tools.

#### Full API Test Suite

```bash
# Run comprehensive manual tests
python test/cv/manual/test_image_search_manual.py
```

This will test:
- ✅ Health check
- ✅ Image upload & indexing
- ✅ Text search
- ✅ Image search
- ✅ Hybrid search
- ✅ Entity image retrieval
- ✅ Image deletion
- ✅ Request validation

#### CLI Search Tool

```bash
# Search by text
python test/cv/manual/search_images_cli.py text "luxury hotel with ocean view"

# Search by image
python test/cv/manual/search_images_cli.py image /path/to/image.jpg

# Hybrid search
python test/cv/manual/search_images_cli.py hybrid "beach resort" /path/to/image.jpg

# Upload image
python test/cv/manual/search_images_cli.py upload /path/to/image.jpg 42 "Pool view"
```

### Performance Benchmarks

```bash
# Run all benchmarks
python test/cv/performance/benchmark_image_search.py
```

Benchmarks include:
1. Model loading time
2. Embedding extraction speed
3. Batch processing throughput
4. Search query latency
5. Cache performance
6. Concurrent request handling
7. Memory usage

---

## Test Configuration

### Environment Variables

Create `.env` file in AI directory:

```bash
# Database
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=hotel_password
POSTGRES_DB=hotel_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# API
API_HOST=0.0.0.0
API_PORT=8001
API_RELOAD=true

# Logging
LOG_LEVEL=INFO
```

### pytest.ini Configuration

The project uses the following pytest configuration:

```ini
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["test"]
python_files = ["test_*.py", "*_test.py"]
markers = [
    "integration: marks tests as integration tests (deselect with '-m \"not integration\"')",
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
]
```

---

## Example Test Runs

### Quick smoke test (unit tests only)

```bash
pytest test/cv/unit/ -v --tb=short
```

### Full test suite

```bash
# Run everything
pytest test/cv/ -v

# With coverage report
pytest test/cv/ -v --cov=src/application/services/cv --cov-report=term-missing
```

### Test specific functionality

```bash
# Test only image search
pytest test/cv/ -k "image_search" -v

# Test only face recognition
pytest test/cv/ -k "face" -v

# Test text search functionality
pytest test/cv/ -k "text_search" -v
```

### Debug failed tests

```bash
# Show detailed output
pytest test/cv/ -vv --tb=long

# Stop on first failure
pytest test/cv/ -x

# Run last failed tests
pytest --lf
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: CV Service Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: ankane/pgvector:latest
        env:
          POSTGRES_PASSWORD: hotel_password
          POSTGRES_USER: hotel_user
          POSTGRES_DB: hotel_db
        ports:
          - 5433:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install uv
          uv sync --extra cv --extra dev

      - name: Run unit tests
        run: pytest test/cv/unit/ -v --cov

      - name: Run integration tests
        run: pytest test/cv/integration/ -v -m integration
```

---

## Troubleshooting

### Service not available (503)

```bash
# Check if CV service is running
curl http://localhost:8001/health

# Check Docker containers
docker ps | grep cv-service

# View logs
docker logs hotel-cv-service
```

### Database connection errors

```bash
# Check PostgreSQL
docker ps | grep postgres
docker logs hotel-postgres

# Test connection
docker exec hotel-postgres psql -U hotel_user -d hotel_db -c "SELECT 1"
```

### CLIP model loading errors

```bash
# Check if transformers/torch are installed
uv pip list | grep -E "torch|transformers"

# Clear HuggingFace cache
rm -rf ~/.cache/huggingface/

# Re-download model
python -c "from transformers import CLIPModel; CLIPModel.from_pretrained('openai/clip-vit-base-patch32')"
```

### Test data setup

```bash
# Apply database migrations
docker exec hotel-postgres psql -U hotel_user -d hotel_db -f /docker-entrypoint-initdb.d/06-image-search-schema.sql

# Verify schema
docker exec hotel-postgres psql -U hotel_user -d hotel_db -c "\d Image"
```

---

## Writing New Tests

### Unit Test Template

```python
import pytest
from unittest.mock import Mock, AsyncMock

class TestMyFeature:
    @pytest.fixture
    def mock_service(self):
        service = Mock()
        # Setup mocks
        return service

    @pytest.mark.asyncio
    async def test_my_feature(self, mock_service):
        # Arrange
        # Act
        result = await my_function(mock_service)
        # Assert
        assert result["success"] is True
```

### Integration Test Template

```python
import pytest
from httpx import AsyncClient

class TestMyAPI:
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_endpoint(self, test_client):
        response = await test_client.post("/api/endpoint", json={})
        assert response.status_code == 200
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Model loading | < 5s | ~3s (CPU) |
| Text embedding | < 50ms | ~30ms |
| Image embedding | < 100ms | ~80ms |
| Search query (10K images) | < 100ms | ~50ms |
| Batch (32 images) | < 2s | ~1.5s |
| Cache hit speedup | > 10x | ~15x |

---

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [CLIP Model Card](https://huggingface.co/openai/clip-vit-base-patch32)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
