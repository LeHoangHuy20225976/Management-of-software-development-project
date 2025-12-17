#!/usr/bin/env python3
"""
Simple CLI tool to search images using the Image Search API
Usage:
  python search_images.py text "luxury hotel with ocean view"
  python search_images.py image /path/to/query/image.jpg
  python search_images.py hybrid "beach resort" /path/to/image.jpg
"""

import asyncio
import base64
import httpx
import json
import sys
from pathlib import Path
from PIL import Image
from io import BytesIO


API_BASE_URL = "http://localhost:8001"


def image_to_base64(image_path: str) -> str:
    """Convert image file to base64"""
    img = Image.open(image_path)
    if img.mode != "RGB":
        img = img.convert("RGB")

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    img_bytes = buffer.getvalue()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{img_b64}"


async def search_by_text(query: str, limit: int = 10):
    """Search images by text query"""
    print(f"\n🔍 Searching for: '{query}'")

    request_data = {
        "query": query,
        "limit": limit,
        "min_similarity": 0.3,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_BASE_URL}/api/cv/image-search/search/text",
            json=request_data,
            timeout=30.0,
        )

        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ Found {data['total']} results in {data['search_time_ms']:.2f}ms\n")

            for i, result in enumerate(data["results"], 1):
                print(f"{i}. Similarity: {result['similarity']:.3f}")
                print(f"   Image ID: {result['image']['image_id']}")
                print(f"   URL: {result['image']['image_url']}")

                if result.get("hotel"):
                    hotel = result["hotel"]
                    print(f"   Hotel: {hotel['hotel_name']} (Rating: {hotel.get('hotel_rating', 'N/A')})")

                if result.get("room"):
                    room = result["room"]
                    print(f"   Room: {room['room_name']}")

                if result['image'].get('image_description'):
                    print(f"   Description: {result['image']['image_description']}")

                print()

        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)


async def search_by_image(image_path: str, limit: int = 10):
    """Search images by image file"""
    print(f"\n📷 Searching with image: {image_path}")

    try:
        img_b64 = image_to_base64(image_path)

        request_data = {
            "image_base64": img_b64,
            "limit": limit,
            "min_similarity": 0.5,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/api/cv/image-search/search/image",
                json=request_data,
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ Found {data['total']} similar images in {data['search_time_ms']:.2f}ms\n")

                for i, result in enumerate(data["results"], 1):
                    print(f"{i}. Similarity: {result['similarity']:.3f}")
                    print(f"   Image ID: {result['image']['image_id']}")
                    print(f"   URL: {result['image']['image_url']}")

                    if result.get("hotel"):
                        hotel = result["hotel"]
                        print(f"   Hotel: {hotel['hotel_name']}")

                    print()

            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)

    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
    except Exception as e:
        print(f"❌ Error: {e}")


async def hybrid_search(text_query: str, image_path: str, limit: int = 10):
    """Hybrid search with both text and image"""
    print(f"\n🔍+📷 Hybrid search")
    print(f"   Text: '{text_query}'")
    print(f"   Image: {image_path}")

    try:
        img_b64 = image_to_base64(image_path)

        request_data = {
            "text_query": text_query,
            "image_base64": img_b64,
            "text_weight": 0.6,
            "image_weight": 0.4,
            "limit": limit,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/api/cv/image-search/search/hybrid",
                json=request_data,
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ Found {data['total']} results in {data['search_time_ms']:.2f}ms\n")

                for i, result in enumerate(data["results"], 1):
                    print(f"{i}. Similarity: {result['similarity']:.3f}")
                    print(f"   Image ID: {result['image']['image_id']}")
                    print(f"   URL: {result['image']['image_url']}")
                    print()

            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)

    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
    except Exception as e:
        print(f"❌ Error: {e}")


async def upload_image(image_path: str, hotel_id: int = None, description: str = None):
    """Upload and index an image"""
    print(f"\n📤 Uploading image: {image_path}")

    try:
        img_b64 = image_to_base64(image_path)

        request_data = {
            "image_base64": img_b64,
            "hotel_id": hotel_id,
            "description": description or f"Uploaded from {Path(image_path).name}",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/api/cv/image-search/upload",
                json=request_data,
                timeout=30.0,
            )

            if response.status_code == 201:
                data = response.json()
                print(f"\n✅ Image uploaded successfully!")
                print(f"   Image ID: {data['image_id']}")
                print(f"   Embedding generated: {data['embedding_generated']}")

            else:
                print(f"❌ Error: {response.status_code}")
                print(response.text)

    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
    except Exception as e:
        print(f"❌ Error: {e}")


def print_usage():
    """Print usage information"""
    print("""
Image Search CLI Tool

Usage:
  python search_images.py text <query> [limit]
      Search images using text description

  python search_images.py image <image_path> [limit]
      Search similar images using an image file

  python search_images.py hybrid <query> <image_path> [limit]
      Hybrid search using both text and image

  python search_images.py upload <image_path> [hotel_id] [description]
      Upload and index an image

Examples:
  python search_images.py text "luxury beach hotel" 20
  python search_images.py image ./hotel.jpg
  python search_images.py hybrid "romantic sunset" ./beach.jpg
  python search_images.py upload ./pool.jpg 42 "Infinity pool with ocean view"
    """)


def main():
    """Main CLI entry point"""
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)

    command = sys.argv[1].lower()

    try:
        if command == "text":
            if len(sys.argv) < 3:
                print("❌ Error: Missing query argument")
                print_usage()
                sys.exit(1)

            query = sys.argv[2]
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            asyncio.run(search_by_text(query, limit))

        elif command == "image":
            if len(sys.argv) < 3:
                print("❌ Error: Missing image_path argument")
                print_usage()
                sys.exit(1)

            image_path = sys.argv[2]
            limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            asyncio.run(search_by_image(image_path, limit))

        elif command == "hybrid":
            if len(sys.argv) < 4:
                print("❌ Error: Missing query or image_path argument")
                print_usage()
                sys.exit(1)

            query = sys.argv[2]
            image_path = sys.argv[3]
            limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10
            asyncio.run(hybrid_search(query, image_path, limit))

        elif command == "upload":
            if len(sys.argv) < 3:
                print("❌ Error: Missing image_path argument")
                print_usage()
                sys.exit(1)

            image_path = sys.argv[2]
            hotel_id = int(sys.argv[3]) if len(sys.argv) > 3 else None
            description = sys.argv[4] if len(sys.argv) > 4 else None
            asyncio.run(upload_image(image_path, hotel_id, description))

        else:
            print(f"❌ Error: Unknown command '{command}'")
            print_usage()
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
