"""
Unit tests for Image Search Service
Tests CLIP embedding extraction and search logic
"""

import pytest
import numpy as np
from PIL import Image
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime

from src.application.services.cv.image_search import (
    CLIPEmbeddingExtractor,
    ImageSearchService,
)


# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def mock_settings():
    """Mock settings"""
    settings = Mock()
    settings.asyncpg_url = "postgresql://user:pass@localhost/db"
    return settings


@pytest.fixture
def sample_image():
    """Create a sample PIL image"""
    # Create 224x224 RGB image
    img = Image.new("RGB", (224, 224), color=(73, 109, 137))
    return img


@pytest.fixture
def sample_embedding():
    """Create a sample 512-dim embedding"""
    # Normalized random embedding
    emb = np.random.randn(512).astype(np.float32)
    emb = emb / np.linalg.norm(emb)
    return emb


# ============================================================================
# CLIPEmbeddingExtractor Tests
# ============================================================================


class TestCLIPEmbeddingExtractor:
    """Test CLIP embedding extraction"""

    def test_embedding_normalization(self):
        """Test that embeddings are normalized"""
        # Random embedding
        emb = np.random.randn(512)
        # Normalize
        emb = emb / np.linalg.norm(emb)

        # Check L2 norm is 1
        assert np.isclose(np.linalg.norm(emb), 1.0, atol=1e-6)

    def test_embedding_similarity(self):
        """Test cosine similarity calculation"""
        # Create two similar embeddings
        emb1 = np.random.randn(512)
        emb1 = emb1 / np.linalg.norm(emb1)

        # Small perturbation
        emb2 = emb1 + np.random.randn(512) * 0.1
        emb2 = emb2 / np.linalg.norm(emb2)

        # Cosine similarity
        similarity = np.dot(emb1, emb2)

        # Similar embeddings should have high similarity
        assert similarity > 0.8

    def test_cosine_distance(self):
        """Test cosine distance metric"""
        # Identical embeddings
        emb1 = np.random.randn(512)
        emb1 = emb1 / np.linalg.norm(emb1)

        # Distance = 1 - similarity
        distance = 1 - np.dot(emb1, emb1)
        assert np.isclose(distance, 0.0, atol=1e-6)

        # Orthogonal embeddings
        emb2 = np.zeros(512)
        emb2[0] = 1.0
        emb3 = np.zeros(512)
        emb3[1] = 1.0

        distance = 1 - np.dot(emb2, emb3)
        assert np.isclose(distance, 1.0, atol=1e-6)


# ============================================================================
# ImageSearchService Tests (Mocked)
# ============================================================================


class TestImageSearchService:
    """Test image search service with mocked dependencies"""

    @pytest.fixture
    def mock_clip_extractor(self, sample_embedding):
        """Mock CLIP extractor"""
        extractor = Mock()
        extractor.extract_image_embedding.return_value = sample_embedding
        extractor.extract_text_embedding.return_value = sample_embedding
        extractor.extract_batch_embeddings.return_value = [sample_embedding]
        return extractor

    @pytest.fixture
    def mock_db_pool(self):
        """Mock database pool"""
        pool = AsyncMock()
        conn = AsyncMock()
        pool.acquire.return_value.__aenter__.return_value = conn
        pool.acquire.return_value.__aexit__.return_value = None
        return pool

    @pytest.fixture
    def image_search_service(self, mock_settings, mock_clip_extractor, mock_db_pool):
        """Create ImageSearchService with mocked dependencies"""
        service = ImageSearchService(settings=mock_settings)
        service.clip_extractor = mock_clip_extractor
        service.db_pool = mock_db_pool
        return service

    @pytest.mark.asyncio
    async def test_upload_image_success(
        self, image_search_service, sample_image, mock_db_pool
    ):
        """Test successful image upload"""
        # Mock database response
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetchval.return_value = 123  # image_id

        result = await image_search_service.upload_image(
            image=sample_image,
            image_url="https://example.com/image.jpg",
            hotel_id=42,
            description="Test image",
            tags=["test", "hotel"],
            is_primary=True,
        )

        # Assertions
        assert result["success"] is True
        assert result["image_id"] == 123
        assert result["embedding_generated"] is True
        assert "Image uploaded and indexed successfully" in result["message"]

        # Verify database was called
        conn.fetchval.assert_called_once()

    @pytest.mark.asyncio
    async def test_upload_image_db_error(
        self, image_search_service, sample_image, mock_db_pool
    ):
        """Test image upload with database error"""
        # Mock database error
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetchval.side_effect = Exception("Database error")

        result = await image_search_service.upload_image(
            image=sample_image,
            image_url="https://example.com/image.jpg",
            hotel_id=42,
        )

        # Should return error
        assert result["success"] is False
        assert "Database error" in result["message"]
        assert result["embedding_generated"] is False

    @pytest.mark.asyncio
    async def test_search_by_text(
        self, image_search_service, mock_db_pool, sample_embedding
    ):
        """Test text search"""
        # Mock database results
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetch.return_value = [
            {
                "image_id": 1,
                "image_url": "https://example.com/1.jpg",
                "image_description": "Ocean view",
                "image_tags": ["ocean", "luxury"],
                "is_primary": True,
                "image_width": 1920,
                "image_height": 1080,
                "embedding_model": "clip-vit-base-patch32",
                "created_at": datetime.now(),
                "similarity": 0.89,
                "hotel_id": 42,
                "hotel_name": "Beach Resort",
                "hotel_rating": 4.8,
                "hotel_address": "123 Beach Rd",
                "hotel_thumbnail": "thumb.jpg",
                "room_id": None,
                "room_name": None,
                "room_status": None,
                "destination_id": None,
                "destination_name": None,
                "destination_location": None,
                "destination_type": None,
            }
        ]

        result = await image_search_service.search_by_text(
            query="luxury ocean view hotel",
            limit=10,
            min_similarity=0.5,
        )

        # Assertions
        assert result["success"] is True
        assert result["query"] == "luxury ocean view hotel"
        assert result["total"] == 1
        assert len(result["results"]) == 1
        assert result["results"][0]["similarity"] == 0.89
        assert result["results"][0]["image"]["image_id"] == 1
        assert result["results"][0]["hotel"]["hotel_id"] == 42

        # Verify CLIP extractor was called
        image_search_service.clip_extractor.extract_text_embedding.assert_called_once_with(
            "luxury ocean view hotel"
        )

    @pytest.mark.asyncio
    async def test_search_by_text_no_results(
        self, image_search_service, mock_db_pool
    ):
        """Test text search with no results"""
        # Mock empty database results
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetch.return_value = []

        result = await image_search_service.search_by_text(
            query="non-existent query",
            limit=10,
        )

        # Assertions
        assert result["success"] is True
        assert result["total"] == 0
        assert len(result["results"]) == 0

    @pytest.mark.asyncio
    async def test_search_by_text_with_filters(
        self, image_search_service, mock_db_pool
    ):
        """Test text search with entity filters"""
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetch.return_value = []

        result = await image_search_service.search_by_text(
            query="luxury hotel",
            entity_type="hotel",
            entity_id=42,
            limit=5,
            min_similarity=0.7,
        )

        # Verify database query was called
        conn.fetch.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_by_image(
        self, image_search_service, sample_image, mock_db_pool
    ):
        """Test image search"""
        # Mock database results
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetch.return_value = [
            {
                "image_id": 2,
                "image_url": "https://example.com/2.jpg",
                "image_description": "Similar view",
                "image_tags": ["ocean"],
                "is_primary": False,
                "image_width": 1920,
                "image_height": 1080,
                "embedding_model": "clip-vit-base-patch32",
                "created_at": datetime.now(),
                "similarity": 0.95,
                "hotel_id": None,
                "hotel_name": None,
                "hotel_rating": None,
                "hotel_address": None,
                "hotel_thumbnail": None,
                "room_id": 10,
                "room_name": "Ocean Suite",
                "room_status": "available",
                "destination_id": None,
                "destination_name": None,
                "destination_location": None,
                "destination_type": None,
            }
        ]

        result = await image_search_service.search_by_image(
            image=sample_image,
            limit=10,
            min_similarity=0.6,
        )

        # Assertions
        assert result["success"] is True
        assert result["total"] == 1
        assert result["results"][0]["similarity"] == 0.95
        assert result["results"][0]["room"]["room_id"] == 10

        # Verify CLIP extractor was called
        image_search_service.clip_extractor.extract_image_embedding.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_error_handling(
        self, image_search_service, mock_db_pool
    ):
        """Test search error handling"""
        # Mock database error
        conn = await mock_db_pool.acquire().__aenter__()
        conn.fetch.side_effect = Exception("Connection timeout")

        result = await image_search_service.search_by_text(
            query="test query",
        )

        # Should return error gracefully
        assert result["success"] is False
        assert result["total"] == 0
        assert len(result["results"]) == 0

    @pytest.mark.asyncio
    async def test_hybrid_search_text_and_image(
        self, image_search_service, sample_image
    ):
        """Test hybrid search with both text and image"""
        result = await image_search_service.hybrid_search(
            text_query="luxury hotel",
            image=sample_image,
            text_weight=0.6,
            image_weight=0.4,
            limit=10,
        )

        # Verify both extractors were called
        image_search_service.clip_extractor.extract_text_embedding.assert_called_once()
        image_search_service.clip_extractor.extract_image_embedding.assert_called_once()

    @pytest.mark.asyncio
    async def test_hybrid_search_no_inputs(self, image_search_service):
        """Test hybrid search with no inputs"""
        result = await image_search_service.hybrid_search(
            text_query=None,
            image=None,
        )

        # Should return error
        assert result["success"] is False
