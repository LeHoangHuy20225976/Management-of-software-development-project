"""
Optimized Image Search Service with Caching & Batch Processing

Performance optimizations:
1. Model caching - Load CLIP model once, reuse across requests
2. Embedding cache - Cache embeddings for frequently searched queries
3. Batch processing - Process multiple images in parallel
4. Connection pooling - Reuse database connections
5. Query result caching - Cache recent search results
"""

import numpy as np
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import asyncio
import logging
import time
from functools import lru_cache
import hashlib

# Caching
from cachetools import TTLCache, LRUCache
import threading

# Original service
from src.application.services.cv.image_search import (
    CLIPEmbeddingExtractor,
    ImageSearchService,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Caching Utilities
# ============================================================================


class EmbeddingCache:
    """
    Thread-safe cache for embeddings
    Stores embeddings for frequently searched queries
    """

    def __init__(self, maxsize: int = 1000, ttl_seconds: int = 3600):
        """
        Initialize embedding cache

        Args:
            maxsize: Maximum number of embeddings to cache
            ttl_seconds: Time-to-live for cached embeddings (1 hour default)
        """
        self.cache = TTLCache(maxsize=maxsize, ttl=ttl_seconds)
        self.lock = threading.RLock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[np.ndarray]:
        """Get embedding from cache"""
        with self.lock:
            if key in self.cache:
                self.hits += 1
                return self.cache[key]
            else:
                self.misses += 1
                return None

    def put(self, key: str, embedding: np.ndarray):
        """Store embedding in cache"""
        with self.lock:
            self.cache[key] = embedding

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.lock:
            total_requests = self.hits + self.misses
            hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0

            return {
                "size": len(self.cache),
                "maxsize": self.cache.maxsize,
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": f"{hit_rate:.2f}%",
            }

    def clear(self):
        """Clear cache"""
        with self.lock:
            self.cache.clear()
            self.hits = 0
            self.misses = 0


class QueryResultCache:
    """
    Cache for search query results
    """

    def __init__(self, maxsize: int = 500, ttl_seconds: int = 300):
        """
        Initialize query result cache

        Args:
            maxsize: Maximum number of results to cache
            ttl_seconds: Time-to-live (5 minutes default)
        """
        self.cache = TTLCache(maxsize=maxsize, ttl=ttl_seconds)
        self.lock = threading.RLock()

    def _make_key(self, query: str, **kwargs) -> str:
        """Create cache key from query and parameters"""
        # Sort kwargs for consistent key generation
        params_str = "_".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
        key_str = f"{query}_{params_str}"
        # Hash to fixed length
        return hashlib.md5(key_str.encode()).hexdigest()

    def get(self, query: str, **kwargs) -> Optional[Dict]:
        """Get cached result"""
        key = self._make_key(query, **kwargs)
        with self.lock:
            return self.cache.get(key)

    def put(self, query: str, result: Dict, **kwargs):
        """Store result in cache"""
        key = self._make_key(query, **kwargs)
        with self.lock:
            self.cache[key] = result


# ============================================================================
# Optimized CLIP Extractor
# ============================================================================


class OptimizedCLIPExtractor(CLIPEmbeddingExtractor):
    """
    Optimized CLIP extractor with caching and batch processing
    """

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32", device: str = "cpu"):
        super().__init__(model_name, device)

        # Initialize caches
        self.text_cache = EmbeddingCache(maxsize=1000, ttl_seconds=3600)
        self.image_cache = EmbeddingCache(maxsize=500, ttl_seconds=1800)

        logger.info("✅ Optimized CLIP extractor initialized with caching")

    def extract_text_embedding(self, text: str) -> np.ndarray:
        """Extract text embedding with caching"""
        # Check cache first
        cached = self.text_cache.get(text)
        if cached is not None:
            logger.debug(f"Cache hit for text query: '{text[:50]}'")
            return cached

        # Extract embedding
        embedding = super().extract_text_embedding(text)

        # Store in cache
        self.text_cache.put(text, embedding)

        return embedding

    def extract_image_embedding_cached(self, image_hash: str, image) -> np.ndarray:
        """
        Extract image embedding with caching
        Requires image hash for cache key
        """
        # Check cache
        cached = self.image_cache.get(image_hash)
        if cached is not None:
            logger.debug(f"Cache hit for image hash: {image_hash[:16]}")
            return cached

        # Extract embedding
        embedding = self.extract_image_embedding(image)

        # Store in cache
        self.image_cache.put(image_hash, embedding)

        return embedding

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "text_cache": self.text_cache.get_stats(),
            "image_cache": self.image_cache.get_stats(),
        }


# ============================================================================
# Optimized Image Search Service
# ============================================================================


class OptimizedImageSearchService(ImageSearchService):
    """
    Optimized image search service with caching and performance improvements
    """

    def __init__(self, settings=None):
        super().__init__(settings)

        # Replace CLIP extractor with optimized version (will be set in initialize)
        self.optimized_clip_extractor: Optional[OptimizedCLIPExtractor] = None

        # Query result cache
        self.query_cache = QueryResultCache(maxsize=500, ttl_seconds=300)

        # Batch processing queue
        self.batch_queue: List = []
        self.batch_lock = asyncio.Lock()
        self.batch_size = 32  # Process 32 images at once

    async def initialize(self):
        """Initialize with optimized components"""
        logger.info("Initializing Optimized Image Search Service...")

        # Initialize optimized CLIP model
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")

        self.optimized_clip_extractor = OptimizedCLIPExtractor(
            model_name="openai/clip-vit-base-patch32", device=device
        )

        # Use optimized extractor as the main one
        self.clip_extractor = self.optimized_clip_extractor

        # Initialize database connection pool with larger size
        logger.info("Connecting to PostgreSQL with optimized pool...")
        import asyncpg
        from pgvector.asyncpg import register_vector

        self.db_pool = await asyncpg.create_pool(
            self.settings.asyncpg_url,
            min_size=5,  # Increased from 2
            max_size=20,  # Increased from 10
            command_timeout=30,
        )

        # Register pgvector
        async with self.db_pool.acquire() as conn:
            await register_vector(conn)

        logger.info("✅ Database connected with optimized pool")

        logger.info("🚀 Optimized Image Search Service initialized!")

    async def search_by_text(
        self,
        query: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        limit: int = 10,
        min_similarity: float = 0.3,
    ) -> Dict[str, Any]:
        """
        Optimized text search with result caching
        """
        # Check cache first
        cache_key_params = {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "limit": limit,
            "min_similarity": min_similarity,
        }

        cached_result = self.query_cache.get(query, **cache_key_params)
        if cached_result is not None:
            logger.info(f"✅ Cache hit for query: '{query[:50]}'")
            # Update search_time_ms to indicate it was cached
            cached_result["search_time_ms"] = 0.0
            cached_result["cached"] = True
            return cached_result

        # Cache miss - perform actual search
        result = await super().search_by_text(
            query=query,
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
            min_similarity=min_similarity,
        )

        # Store in cache if successful
        if result.get("success"):
            self.query_cache.put(query, result, **cache_key_params)

        result["cached"] = False
        return result

    async def batch_upload_images(
        self,
        images_data: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Batch upload multiple images for better performance

        Args:
            images_data: List of dicts with keys:
                - image: PIL Image
                - image_url: str
                - hotel_id, room_id, destination_id (optional)
                - description, tags (optional)

        Returns:
            List of upload results
        """
        logger.info(f"Batch uploading {len(images_data)} images...")

        start_time = time.time()

        # Extract embeddings in batch
        images = [data["image"] for data in images_data]
        embeddings = self.clip_extractor.extract_batch_embeddings(images)

        # Prepare database inserts
        results = []
        async with self.db_pool.acquire() as conn:
            for i, (data, embedding) in enumerate(zip(images_data, embeddings)):
                try:
                    image = data["image"]
                    width, height = image.size
                    image_format = image.format or "UNKNOWN"

                    image_id = await conn.fetchval(
                        """
                        INSERT INTO Image (
                            hotel_id, room_id, destination_id,
                            image_url, image_description, image_tags,
                            is_primary, image_width, image_height,
                            image_format, image_embedding, embedding_model,
                            embedding_created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        RETURNING image_id
                        """,
                        data.get("hotel_id"),
                        data.get("room_id"),
                        data.get("destination_id"),
                        data["image_url"],
                        data.get("description"),
                        data.get("tags"),
                        data.get("is_primary", False),
                        width,
                        height,
                        image_format,
                        embedding.tolist(),
                        "clip-vit-base-patch32",
                        datetime.utcnow(),
                    )

                    results.append({
                        "success": True,
                        "image_id": image_id,
                        "index": i,
                    })

                except Exception as e:
                    logger.error(f"Error uploading image {i}: {e}")
                    results.append({
                        "success": False,
                        "error": str(e),
                        "index": i,
                    })

        elapsed = time.time() - start_time
        logger.info(
            f"✅ Batch uploaded {len(results)} images in {elapsed:.2f}s "
            f"({elapsed / len(results):.3f}s per image)"
        )

        return results

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        if self.optimized_clip_extractor:
            cache_stats = self.optimized_clip_extractor.get_cache_stats()
        else:
            cache_stats = {}

        pool_stats = {}
        if self.db_pool:
            pool_stats = {
                "size": self.db_pool.get_size(),
                "free": self.db_pool.get_idle_size(),
                "min_size": self.db_pool.get_min_size(),
                "max_size": self.db_pool.get_max_size(),
            }

        return {
            "cache_stats": cache_stats,
            "db_pool_stats": pool_stats,
            "query_cache_size": len(self.query_cache.cache),
        }

    async def warm_up_cache(self, common_queries: List[str]):
        """
        Warm up cache with common queries
        Useful on service startup
        """
        logger.info(f"Warming up cache with {len(common_queries)} queries...")

        for query in common_queries:
            try:
                await self.search_by_text(query, limit=10)
                logger.debug(f"Cached query: '{query}'")
            except Exception as e:
                logger.error(f"Error warming up cache for '{query}': {e}")

        logger.info("✅ Cache warm-up complete")
