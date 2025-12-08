#!/usr/bin/env python3
"""
Manual test script for Image Search API
Run this to test all image search endpoints
"""

import asyncio
import base64
import httpx
import json
from pathlib import Path
from PIL import Image
from io import BytesIO
import time


# ============================================================================
# Configuration
# ============================================================================

API_BASE_URL = "http://localhost:8001"
TIMEOUT = 30.0


# ============================================================================
# Helper Functions
# ============================================================================


def create_sample_image(width=640, height=480, color=(100, 150, 200)):
    """Create a sample image"""
    img = Image.new("RGB", (width, height), color=color)
    return img


def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{img_b64}"


def load_image_file(file_path: str) -> str:
    """Load image from file and convert to base64"""
    img = Image.open(file_path)
    # Convert to RGB if needed
    if img.mode != "RGB":
        img = img.convert("RGB")
    return image_to_base64(img)


def print_section(title: str):
    """Print formatted section header"""
    print(f"\n{'=' * 80}")
    print(f"  {title}")
    print(f"{'=' * 80}\n")


def print_result(success: bool, message: str):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")


def print_response(response: httpx.Response):
    """Print HTTP response details"""
    print(f"Status: {response.status_code}")
    if response.status_code < 400:
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, default=str)}")
        except:
            print(f"Response: {response.text[:500]}")
    else:
        print(f"Error: {response.text}")


# ============================================================================
# Test Functions
# ============================================================================


async def test_health_check(client: httpx.AsyncClient):
    """Test health check endpoint"""
    print_section("Test 1: Health Check")

    try:
        response = await client.get(f"{API_BASE_URL}/health")
        print_response(response)

        success = response.status_code == 200
        print_result(success, "Health check endpoint")
        return success
    except Exception as e:
        print_result(False, f"Health check failed: {e}")
        return False


async def test_upload_image(client: httpx.AsyncClient):
    """Test image upload endpoint"""
    print_section("Test 2: Upload Image")

    # Create sample image
    sample_img = create_sample_image(color=(255, 200, 100))
    img_b64 = image_to_base64(sample_img)

    request_data = {
        "image_base64": img_b64,
        "hotel_id": 1,
        "description": "Test luxury hotel lobby",
        "tags": ["test", "lobby", "luxury"],
        "is_primary": True,
    }

    try:
        response = await client.post(
            f"{API_BASE_URL}/api/cv/image-search/upload",
            json=request_data,
            timeout=TIMEOUT,
        )
        print_response(response)

        if response.status_code == 201:
            data = response.json()
            success = data.get("success", False) and "image_id" in data
            print_result(success, f"Upload image (ID: {data.get('image_id')})")
            return success, data.get("image_id")
        else:
            print_result(False, "Upload image")
            return False, None
    except Exception as e:
        print_result(False, f"Upload failed: {e}")
        return False, None


async def test_text_search(client: httpx.AsyncClient):
    """Test text search endpoint"""
    print_section("Test 3: Text Search")

    queries = [
        "luxury hotel with ocean view",
        "modern minimalist bedroom",
        "swimming pool at sunset",
        "elegant hotel lobby",
    ]

    results = []
    for query in queries:
        print(f"\n🔍 Query: '{query}'")

        request_data = {
            "query": query,
            "limit": 5,
            "min_similarity": 0.3,
        }

        try:
            start_time = time.time()
            response = await client.post(
                f"{API_BASE_URL}/api/cv/image-search/search/text",
                json=request_data,
                timeout=TIMEOUT,
            )
            elapsed = (time.time() - start_time) * 1000

            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                search_time = data.get("search_time_ms", elapsed)

                print(f"  Found: {total} results")
                print(f"  Search time: {search_time:.2f}ms")

                if total > 0:
                    print(f"  Top result similarity: {data['results'][0]['similarity']:.3f}")

                results.append(True)
            else:
                print(f"  ❌ Failed: {response.status_code}")
                results.append(False)

        except Exception as e:
            print(f"  ❌ Error: {e}")
            results.append(False)

    success = all(results)
    print_result(success, f"Text search ({len(results)} queries)")
    return success


async def test_image_search(client: httpx.AsyncClient):
    """Test image search endpoint"""
    print_section("Test 4: Image Search")

    # Create query image
    query_img = create_sample_image(color=(120, 180, 220))
    img_b64 = image_to_base64(query_img)

    request_data = {
        "image_base64": img_b64,
        "limit": 5,
        "min_similarity": 0.5,
    }

    try:
        start_time = time.time()
        response = await client.post(
            f"{API_BASE_URL}/api/cv/image-search/search/image",
            json=request_data,
            timeout=TIMEOUT,
        )
        elapsed = (time.time() - start_time) * 1000

        print_response(response)

        if response.status_code == 200:
            data = response.json()
            total = data.get("total", 0)
            print(f"\n  Found: {total} similar images")
            print(f"  Search time: {elapsed:.2f}ms")

            success = True
            print_result(success, "Image search")
            return success
        else:
            print_result(False, "Image search")
            return False

    except Exception as e:
        print_result(False, f"Image search failed: {e}")
        return False


async def test_hybrid_search(client: httpx.AsyncClient):
    """Test hybrid search endpoint"""
    print_section("Test 5: Hybrid Search (Text + Image)")

    # Create query image
    query_img = create_sample_image(color=(200, 150, 100))
    img_b64 = image_to_base64(query_img)

    request_data = {
        "text_query": "luxury beach resort",
        "image_base64": img_b64,
        "text_weight": 0.6,
        "image_weight": 0.4,
        "limit": 5,
    }

    try:
        response = await client.post(
            f"{API_BASE_URL}/api/cv/image-search/search/hybrid",
            json=request_data,
            timeout=TIMEOUT,
        )
        print_response(response)

        success = response.status_code == 200
        print_result(success, "Hybrid search")
        return success

    except Exception as e:
        print_result(False, f"Hybrid search failed: {e}")
        return False


async def test_get_entity_images(client: httpx.AsyncClient):
    """Test get images for entity"""
    print_section("Test 6: Get Entity Images")

    entity_types = ["hotel", "room", "destination"]
    entity_id = 1

    results = []
    for entity_type in entity_types:
        print(f"\n📂 Getting {entity_type} images (ID: {entity_id})")

        try:
            response = await client.get(
                f"{API_BASE_URL}/api/cv/image-search/images/{entity_type}/{entity_id}",
                timeout=TIMEOUT,
            )

            if response.status_code == 200:
                data = response.json()
                total = data.get("total", 0)
                print(f"  Found: {total} images")
                results.append(True)
            else:
                print(f"  ❌ Failed: {response.status_code}")
                results.append(False)

        except Exception as e:
            print(f"  ❌ Error: {e}")
            results.append(False)

    success = all(results)
    print_result(success, f"Get entity images ({len(results)} types)")
    return success


async def test_delete_image(client: httpx.AsyncClient, image_id: int = None):
    """Test delete image endpoint"""
    print_section("Test 7: Delete Image")

    if image_id is None:
        print("⚠️  No image ID provided, skipping delete test")
        return True

    try:
        response = await client.delete(
            f"{API_BASE_URL}/api/cv/image-search/{image_id}",
            timeout=TIMEOUT,
        )
        print_response(response)

        success = response.status_code == 200
        print_result(success, f"Delete image (ID: {image_id})")
        return success

    except Exception as e:
        print_result(False, f"Delete failed: {e}")
        return False


async def test_invalid_requests(client: httpx.AsyncClient):
    """Test request validation"""
    print_section("Test 8: Request Validation")

    tests = [
        {
            "name": "Empty text query",
            "endpoint": "/api/cv/image-search/search/text",
            "data": {"query": "", "limit": 10},
            "expect_fail": True,
        },
        {
            "name": "Invalid limit (0)",
            "endpoint": "/api/cv/image-search/search/text",
            "data": {"query": "test", "limit": 0},
            "expect_fail": True,
        },
        {
            "name": "Invalid similarity (> 1.0)",
            "endpoint": "/api/cv/image-search/search/text",
            "data": {"query": "test", "min_similarity": 1.5},
            "expect_fail": True,
        },
        {
            "name": "Missing image_base64",
            "endpoint": "/api/cv/image-search/upload",
            "data": {"hotel_id": 1},
            "expect_fail": True,
        },
    ]

    results = []
    for test in tests:
        print(f"\n🧪 {test['name']}")

        try:
            response = await client.post(
                f"{API_BASE_URL}{test['endpoint']}",
                json=test['data'],
                timeout=TIMEOUT,
            )

            # Should return 422 (validation error)
            success = response.status_code == 422 if test["expect_fail"] else response.status_code == 200
            print(f"  Status: {response.status_code} ({'Expected' if success else 'Unexpected'})")
            results.append(success)

        except Exception as e:
            print(f"  ❌ Error: {e}")
            results.append(False)

    success = all(results)
    print_result(success, f"Request validation ({len(results)} tests)")
    return success


# ============================================================================
# Main Test Runner
# ============================================================================


async def run_all_tests():
    """Run all manual tests"""
    print("\n" + "=" * 80)
    print("  IMAGE SEARCH API - MANUAL TEST SUITE")
    print("=" * 80)
    print(f"\nAPI Base URL: {API_BASE_URL}")
    print(f"Timeout: {TIMEOUT}s\n")

    async with httpx.AsyncClient() as client:
        results = []

        # Run tests
        results.append(await test_health_check(client))
        upload_success, image_id = await test_upload_image(client)
        results.append(upload_success)
        results.append(await test_text_search(client))
        results.append(await test_image_search(client))
        results.append(await test_hybrid_search(client))
        results.append(await test_get_entity_images(client))
        results.append(await test_delete_image(client, image_id))
        results.append(await test_invalid_requests(client))

        # Summary
        print_section("Test Summary")
        passed = sum(results)
        total = len(results)
        percentage = (passed / total * 100) if total > 0 else 0

        print(f"Total tests: {total}")
        print(f"Passed: {passed} ({percentage:.1f}%)")
        print(f"Failed: {total - passed}")

        if passed == total:
            print("\n🎉 All tests passed!")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed")

        print("\n" + "=" * 80 + "\n")

        return passed == total


if __name__ == "__main__":
    import sys

    print("\n🚀 Starting Image Search API Manual Tests...\n")

    # Check if service is running
    print("⏳ Checking if service is running...")

    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        sys.exit(1)
