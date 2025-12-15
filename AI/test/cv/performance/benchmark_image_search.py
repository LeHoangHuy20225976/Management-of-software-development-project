#!/usr/bin/env python3
"""
Performance benchmark for Image Search Service

Tests:
1. Model loading time
2. Embedding extraction speed
3. Search query latency
4. Batch processing throughput
5. Cache hit rates
6. Concurrent request handling
"""

import asyncio
import time
import statistics
from typing import List, Dict
from PIL import Image
import numpy as np


# ============================================================================
# Utilities
# ============================================================================


def create_sample_image(width=640, height=480):
    """Create random sample image"""
    return Image.fromarray(np.random.randint(0, 255, (height, width, 3), dtype=np.uint8))


def print_section(title: str):
    """Print section header"""
    print(f"\n{'=' * 80}")
    print(f"  {title}")
    print(f"{'=' * 80}\n")


def print_stats(name: str, times: List[float]):
    """Print statistics for a list of times"""
    if not times:
        print(f"{name}: No data")
        return

    print(f"\n{name}:")
    print(f"  Count: {len(times)}")
    print(f"  Mean: {statistics.mean(times):.3f}s")
    print(f"  Median: {statistics.median(times):.3f}s")
    print(f"  Min: {min(times):.3f}s")
    print(f"  Max: {max(times):.3f}s")
    print(f"  Std Dev: {statistics.stdev(times) if len(times) > 1 else 0:.3f}s")


# ============================================================================
# Benchmark Tests
# ============================================================================


async def benchmark_model_loading():
    """Benchmark CLIP model loading time"""
    print_section("Benchmark 1: Model Loading")

    try:
        from src.application.services.cv.image_search import CLIPEmbeddingExtractor

        # Cold start
        start_time = time.time()
        extractor = CLIPEmbeddingExtractor(device="cpu")
        load_time = time.time() - start_time

        print(f"✅ Model loaded in {load_time:.3f}s")
        print(f"   Device: cpu")
        print(f"   Model: openai/clip-vit-base-patch32")

        return extractor

    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return None


async def benchmark_embedding_extraction(extractor, num_samples=100):
    """Benchmark embedding extraction speed"""
    print_section("Benchmark 2: Embedding Extraction")

    if extractor is None:
        print("⚠️  Skipping (model not loaded)")
        return

    # Text embeddings
    print("Text Embeddings:")
    text_queries = [
        "luxury hotel",
        "ocean view",
        "modern minimalist",
        "romantic sunset",
        "infinity pool",
    ] * (num_samples // 5)

    times = []
    for query in text_queries[:num_samples]:
        start_time = time.time()
        _ = extractor.extract_text_embedding(query)
        elapsed = time.time() - start_time
        times.append(elapsed)

    print_stats("Text Embedding", times)
    print(f"  Throughput: {num_samples / sum(times):.2f} embeddings/sec")

    # Image embeddings
    print("\nImage Embeddings:")
    images = [create_sample_image() for _ in range(min(num_samples, 50))]

    times = []
    for img in images:
        start_time = time.time()
        _ = extractor.extract_image_embedding(img)
        elapsed = time.time() - start_time
        times.append(elapsed)

    print_stats("Image Embedding", times)
    print(f"  Throughput: {len(images) / sum(times):.2f} embeddings/sec")


async def benchmark_batch_processing(extractor, batch_sizes=[1, 4, 8, 16, 32]):
    """Benchmark batch processing performance"""
    print_section("Benchmark 3: Batch Processing")

    if extractor is None:
        print("⚠️  Skipping (model not loaded)")
        return

    print("Testing different batch sizes:\n")

    for batch_size in batch_sizes:
        images = [create_sample_image() for _ in range(batch_size)]

        start_time = time.time()
        _ = extractor.extract_batch_embeddings(images)
        elapsed = time.time() - start_time

        throughput = batch_size / elapsed
        per_image = elapsed / batch_size

        print(f"Batch size {batch_size:2d}: {elapsed:.3f}s total, "
              f"{per_image:.4f}s/image, {throughput:.2f} images/sec")


async def benchmark_search_latency():
    """Benchmark search query latency"""
    print_section("Benchmark 4: Search Latency (requires running service)")

    try:
        import httpx

        client = httpx.AsyncClient(base_url="http://localhost:8001", timeout=30.0)

        queries = [
            "luxury hotel with ocean view",
            "modern minimalist bedroom",
            "romantic sunset pool",
            "elegant lobby",
            "beach resort",
        ]

        times = []
        for query in queries * 10:  # 50 queries total
            request_data = {"query": query, "limit": 10}

            try:
                start_time = time.time()
                response = await client.post(
                    "/api/cv/image-search/search/text",
                    json=request_data,
                )
                elapsed = time.time() - start_time

                if response.status_code == 200:
                    times.append(elapsed)
                    data = response.json()
                    search_time = data.get("search_time_ms", elapsed * 1000)
                    logger.debug(f"Query '{query[:30]}': {search_time:.2f}ms")

            except Exception as e:
                logger.error(f"Query failed: {e}")

        await client.aclose()

        if times:
            print_stats("Search Latency", times)
            print(f"  Throughput: {len(times) / sum(times):.2f} queries/sec")
        else:
            print("❌ No successful queries")

    except Exception as e:
        print(f"⚠️  Service not available: {e}")


async def benchmark_cache_performance():
    """Benchmark cache hit rates"""
    print_section("Benchmark 5: Cache Performance (requires optimized service)")

    try:
        from src.application.services.cv.image_search_optimized import OptimizedImageSearchService
        from src.infrastructure.config import get_settings

        settings = get_settings()
        service = OptimizedImageSearchService(settings=settings)

        # Initialize (this loads model into cache)
        await service.initialize()

        # Repeated queries (should hit cache)
        repeated_query = "luxury hotel with ocean view"

        # First query (cache miss)
        start_time = time.time()
        result1 = await service.search_by_text(repeated_query, limit=10)
        first_time = time.time() - start_time

        # Second query (cache hit)
        start_time = time.time()
        result2 = await service.search_by_text(repeated_query, limit=10)
        second_time = time.time() - start_time

        print(f"First query (cache miss): {first_time:.4f}s")
        print(f"Second query (cache hit): {second_time:.4f}s")
        print(f"Speedup: {first_time / second_time:.2f}x")

        # Get cache stats
        stats = service.get_performance_stats()
        print(f"\nCache Statistics:")
        print(f"  {stats}")

        await service.shutdown()

    except Exception as e:
        print(f"⚠️  Optimized service not available: {e}")


async def benchmark_concurrent_requests(num_concurrent=10, num_iterations=5):
    """Benchmark concurrent request handling"""
    print_section(f"Benchmark 6: Concurrent Requests ({num_concurrent} concurrent)")

    try:
        import httpx

        async def single_request(client, query_id):
            """Single search request"""
            request_data = {
                "query": f"test query {query_id}",
                "limit": 5,
            }

            start_time = time.time()
            response = await client.post(
                "/api/cv/image-search/search/text",
                json=request_data,
            )
            elapsed = time.time() - start_time

            return {
                "query_id": query_id,
                "status": response.status_code,
                "time": elapsed,
                "success": response.status_code == 200,
            }

        client = httpx.AsyncClient(base_url="http://localhost:8001", timeout=30.0)

        all_times = []
        for iteration in range(num_iterations):
            print(f"\nIteration {iteration + 1}:")

            # Launch concurrent requests
            tasks = [
                single_request(client, i)
                for i in range(num_concurrent)
            ]

            start_time = time.time()
            results = await asyncio.gather(*tasks, return_exceptions=True)
            total_time = time.time() - start_time

            # Analyze results
            successful = [r for r in results if not isinstance(r, Exception) and r.get("success")]
            failed = len(results) - len(successful)

            if successful:
                avg_time = statistics.mean([r["time"] for r in successful])
                all_times.extend([r["time"] for r in successful])

                print(f"  Successful: {len(successful)}/{num_concurrent}")
                print(f"  Total time: {total_time:.3f}s")
                print(f"  Avg latency: {avg_time:.3f}s")
                print(f"  Throughput: {len(successful) / total_time:.2f} req/sec")

                if failed > 0:
                    print(f"  Failed: {failed}")

        await client.aclose()

        if all_times:
            print("\nOverall Statistics:")
            print_stats("Concurrent Request Latency", all_times)

    except Exception as e:
        print(f"⚠️  Service not available: {e}")


async def benchmark_memory_usage():
    """Benchmark memory usage"""
    print_section("Benchmark 7: Memory Usage")

    try:
        import psutil
        import os

        process = psutil.Process(os.getpid())

        # Initial memory
        mem_before = process.memory_info().rss / 1024 / 1024  # MB

        # Load model
        from src.application.services.cv.image_search import CLIPEmbeddingExtractor

        extractor = CLIPEmbeddingExtractor(device="cpu")

        mem_after = process.memory_info().rss / 1024 / 1024  # MB

        print(f"Memory before model load: {mem_before:.2f} MB")
        print(f"Memory after model load: {mem_after:.2f} MB")
        print(f"Model memory usage: {mem_after - mem_before:.2f} MB")

        # Process 100 images
        images = [create_sample_image() for _ in range(100)]

        for img in images:
            _ = extractor.extract_image_embedding(img)

        mem_final = process.memory_info().rss / 1024 / 1024  # MB

        print(f"\nMemory after processing 100 images: {mem_final:.2f} MB")
        print(f"Memory increase: {mem_final - mem_after:.2f} MB")

    except ImportError:
        print("⚠️  psutil not installed, skipping memory benchmark")
    except Exception as e:
        print(f"❌ Error: {e}")


# ============================================================================
# Main Runner
# ============================================================================


async def run_all_benchmarks():
    """Run all benchmarks"""
    print("\n" + "=" * 80)
    print("  IMAGE SEARCH SERVICE - PERFORMANCE BENCHMARKS")
    print("=" * 80)

    # Run benchmarks
    extractor = await benchmark_model_loading()
    await benchmark_embedding_extraction(extractor, num_samples=100)
    await benchmark_batch_processing(extractor)
    await benchmark_search_latency()
    await benchmark_cache_performance()
    await benchmark_concurrent_requests(num_concurrent=10, num_iterations=3)
    await benchmark_memory_usage()

    print("\n" + "=" * 80)
    print("  Benchmarks Complete!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    import logging

    logging.basicConfig(level=logging.WARNING)
    logger = logging.getLogger(__name__)

    print("\n🚀 Starting Image Search Performance Benchmarks...\n")

    try:
        asyncio.run(run_all_benchmarks())
    except KeyboardInterrupt:
        print("\n\n⚠️  Benchmarks interrupted")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
