"""
Integration tests for Image Search API
Tests actual HTTP endpoints with real database
"""

import pytest
import base64
from io import BytesIO
from PIL import Image
from httpx import AsyncClient
import asyncpg

from src.application.controllers.cv.main import app
from src.application.services.cv.image_search import ImageSearchService
from src.infrastructure.config import get_settings


# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def sample_image_base64():
    """Create a base64 encoded sample image"""
    # Create 224x224 RGB image
    img = Image.new("RGB", (224, 224), color=(100, 150, 200))

    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format="JPEG")
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    return f"data:image/jpeg;base64,{img_b64}"


@pytest.fixture
async def test_client():
    """Create test client for API"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.fixture
async def db_connection():
    """Create database connection for cleanup"""
    settings = get_settings()
    conn = await asyncpg.connect(settings.asyncpg_url)
    yield conn
    await conn.close()


# ============================================================================
# API Endpoint Tests
# ============================================================================


class TestImageSearchAPI:
    """Integration tests for image search endpoints"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_health_check(self, test_client):
        """Test health check endpoint"""
        response = await test_client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "cv-service"

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_upload_image(self, test_client, sample_image_base64):
        """Test image upload endpoint"""
        request_data = {
            "image_base64": sample_image_base64,
            "hotel_id": 1,
            "description": "Test hotel image",
            "tags": ["test", "hotel", "luxury"],
            "is_primary": True,
        }

        response = await test_client.post(
            "/api/cv/image-search/upload",
            json=request_data,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "image_id" in data
        assert data["embedding_generated"] is True

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_upload_image_invalid_base64(self, test_client):
        """Test upload with invalid base64"""
        request_data = {
            "image_base64": "invalid-base64-string",
            "hotel_id": 1,
        }

        response = await test_client.post(
            "/api/cv/image-search/upload",
            json=request_data,
        )

        assert response.status_code == 400
        data = response.json()
        assert "Invalid image data" in data["detail"]

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_search_by_text(self, test_client):
        """Test text search endpoint"""
        request_data = {
            "query": "luxury hotel with ocean view",
            "limit": 10,
            "min_similarity": 0.5,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "query" in data
        assert "results" in data
        assert "total" in data
        assert "search_time_ms" in data
        assert isinstance(data["results"], list)

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_search_by_text_with_filters(self, test_client):
        """Test text search with entity filters"""
        request_data = {
            "query": "pool",
            "entity_type": "hotel",
            "entity_id": 1,
            "limit": 5,
            "min_similarity": 0.3,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # If results exist, verify they match the filter
        if data["total"] > 0:
            for result in data["results"]:
                if result.get("hotel"):
                    assert result["hotel"]["hotel_id"] == 1

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_search_by_image(self, test_client, sample_image_base64):
        """Test image search endpoint"""
        request_data = {
            "image_base64": sample_image_base64,
            "limit": 10,
            "min_similarity": 0.6,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/image",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["results"], list)

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until CLIP model and database are available"
    )
    async def test_hybrid_search(self, test_client, sample_image_base64):
        """Test hybrid search endpoint"""
        request_data = {
            "text_query": "luxury hotel",
            "image_base64": sample_image_base64,
            "text_weight": 0.6,
            "image_weight": 0.4,
            "limit": 10,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/hybrid",
            json=request_data,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until database is available"
    )
    async def test_get_entity_images(self, test_client):
        """Test get images for entity endpoint"""
        response = await test_client.get(
            "/api/cv/image-search/images/hotel/1"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "images" in data
        assert "total" in data
        assert isinstance(data["images"], list)

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_get_entity_images_invalid_type(self, test_client):
        """Test get images with invalid entity type"""
        response = await test_client.get(
            "/api/cv/image-search/images/invalid_type/1"
        )

        # Should return 400 or 503 depending on service availability
        assert response.status_code in [400, 503]

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until database is available"
    )
    async def test_delete_image(self, test_client, sample_image_base64):
        """Test image deletion"""
        # First upload an image
        upload_data = {
            "image_base64": sample_image_base64,
            "hotel_id": 999,  # Use unique ID for test
        }

        upload_response = await test_client.post(
            "/api/cv/image-search/upload",
            json=upload_data,
        )

        if upload_response.status_code == 201:
            image_id = upload_response.json()["image_id"]

            # Delete the image
            delete_response = await test_client.delete(
                f"/api/cv/image-search/{image_id}"
            )

            assert delete_response.status_code == 200
            data = delete_response.json()
            assert data["success"] is True
            assert data["image_id"] == image_id

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until database is available"
    )
    async def test_delete_nonexistent_image(self, test_client):
        """Test deleting non-existent image"""
        response = await test_client.delete(
            "/api/cv/image-search/999999"
        )

        # Should return 404
        assert response.status_code in [404, 503]


# ============================================================================
# Request Validation Tests
# ============================================================================


class TestRequestValidation:
    """Test request validation"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_upload_missing_image(self, test_client):
        """Test upload without image_base64"""
        request_data = {
            "hotel_id": 1,
        }

        response = await test_client.post(
            "/api/cv/image-search/upload",
            json=request_data,
        )

        # Should return 422 (validation error)
        assert response.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_text_search_empty_query(self, test_client):
        """Test text search with empty query"""
        request_data = {
            "query": "",
            "limit": 10,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        # Should return 422 (validation error)
        assert response.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_text_search_invalid_limit(self, test_client):
        """Test text search with invalid limit"""
        request_data = {
            "query": "luxury hotel",
            "limit": 0,  # Should be >= 1
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        # Should return 422
        assert response.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_text_search_invalid_similarity(self, test_client):
        """Test text search with invalid similarity threshold"""
        request_data = {
            "query": "luxury hotel",
            "min_similarity": 1.5,  # Should be <= 1.0
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        # Should return 422
        assert response.status_code == 422


# ============================================================================
# Performance Tests
# ============================================================================


class TestPerformance:
    """Performance and load tests"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip performance tests in CI"
    )
    async def test_search_response_time(self, test_client):
        """Test search response time is acceptable"""
        import time

        request_data = {
            "query": "luxury hotel",
            "limit": 10,
        }

        start_time = time.time()
        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )
        elapsed = time.time() - start_time

        assert response.status_code in [200, 503]
        if response.status_code == 200:
            # Search should complete in < 1 second
            assert elapsed < 1.0

            data = response.json()
            # Reported search time should also be reasonable
            if "search_time_ms" in data:
                assert data["search_time_ms"] < 1000

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip concurrent tests in CI"
    )
    async def test_concurrent_searches(self, test_client):
        """Test handling multiple concurrent searches"""
        import asyncio

        request_data = {
            "query": "hotel",
            "limit": 5,
        }

        # Send 10 concurrent requests
        tasks = [
            test_client.post(
                "/api/cv/image-search/search/text",
                json=request_data,
            )
            for _ in range(10)
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # All should succeed or return service unavailable
        for response in responses:
            if not isinstance(response, Exception):
                assert response.status_code in [200, 503]


# ============================================================================
# Database Integration Tests
# ============================================================================


class TestDatabaseIntegration:
    """Test database integration"""

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until database is available"
    )
    async def test_image_persistence(
        self, test_client, db_connection, sample_image_base64
    ):
        """Test that uploaded images are persisted in database"""
        # Upload image
        upload_data = {
            "image_base64": sample_image_base64,
            "hotel_id": 1,
            "description": "Persistence test",
        }

        response = await test_client.post(
            "/api/cv/image-search/upload",
            json=upload_data,
        )

        if response.status_code == 201:
            image_id = response.json()["image_id"]

            # Verify in database
            row = await db_connection.fetchrow(
                "SELECT * FROM Image WHERE image_id = $1",
                image_id,
            )

            assert row is not None
            assert row["hotel_id"] == 1
            assert row["image_description"] == "Persistence test"
            assert row["image_embedding"] is not None

            # Cleanup
            await db_connection.execute(
                "DELETE FROM Image WHERE image_id = $1",
                image_id,
            )

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.skipif(
        True, reason="Skip until database is available"
    )
    async def test_search_uses_index(
        self, test_client, db_connection
    ):
        """Test that search queries use pgvector index"""
        request_data = {
            "query": "test",
            "limit": 10,
        }

        response = await test_client.post(
            "/api/cv/image-search/search/text",
            json=request_data,
        )

        # Check query plan uses index (requires EXPLAIN ANALYZE)
        # This is a placeholder - actual implementation would analyze query plan
        assert response.status_code in [200, 503]
