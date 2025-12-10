"""
Test script for MinIO Storage API
Demonstrates bucket creation and file operations
"""
import requests
import io
from pathlib import Path

# API Base URL
BASE_URL = "http://localhost:8004"


def test_storage_api():
    """Test MinIO storage API endpoints"""
    
    print("=" * 80)
    print("🧪 Testing MinIO Storage API")
    print("=" * 80)
    
    # ========== Health Check ==========
    print("\n1️⃣ Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # ========== Create Bucket ==========
    print("\n2️⃣ Creating bucket 'hotel-images'...")
    response = requests.post(
        f"{BASE_URL}/storage/buckets",
        json={
            "bucket_name": "hotel-images",
            "object_lock": False
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # ========== List Buckets ==========
    print("\n3️⃣ Listing all buckets...")
    response = requests.get(f"{BASE_URL}/storage/buckets")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Found {data['count']} buckets:")
    for bucket in data['buckets']:
        print(f"      - {bucket['name']}")
    
    # ========== Upload Single File ==========
    print("\n4️⃣ Uploading single file...")
    
    # Create a test file
    test_content = b"This is a test image file for hotel room 101"
    test_file = io.BytesIO(test_content)
    
    files = {
        'file': ('room-101.jpg', test_file, 'image/jpeg')
    }
    data = {
        'bucket_name': 'hotel-images',
        'object_name': 'rooms/deluxe/room-101.jpg'
    }
    
    response = requests.post(
        f"{BASE_URL}/storage/files/upload",
        files=files,
        data=data
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # ========== Upload Multiple Files ==========
    print("\n5️⃣ Uploading multiple files...")
    
    files_to_upload = [
        ('files', ('room-102.jpg', io.BytesIO(b"Room 102 image"), 'image/jpeg')),
        ('files', ('room-103.jpg', io.BytesIO(b"Room 103 image"), 'image/jpeg')),
        ('files', ('room-104.jpg', io.BytesIO(b"Room 104 image"), 'image/jpeg')),
    ]
    data = {
        'bucket_name': 'hotel-images',
        'prefix': 'rooms/deluxe/'
    }
    
    response = requests.post(
        f"{BASE_URL}/storage/files/upload-multiple",
        files=files_to_upload,
        data=data
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Uploaded: {result['successful_uploads']}/{result['total_files']} files")
    for file in result['uploaded_files']:
        print(f"      - {file['object_name']} ({file['file_size']} bytes)")
    
    # ========== List Objects in Bucket ==========
    print("\n6️⃣ Listing objects in bucket...")
    response = requests.post(
        f"{BASE_URL}/storage/files/list",
        json={
            "bucket_name": "hotel-images",
            "prefix": "rooms/",
            "recursive": True,
            "max_keys": 100
        }
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Found {data['count']} objects:")
    for obj in data['objects']:
        print(f"      - {obj['object_name']} ({obj['size']} bytes)")
    
    # ========== Get File Metadata ==========
    print("\n7️⃣ Getting file metadata...")
    response = requests.get(
        f"{BASE_URL}/storage/files/metadata",
        params={
            "bucket_name": "hotel-images",
            "object_name": "rooms/deluxe/room-101.jpg"
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   Metadata: {response.json()}")
    
    # ========== Generate Presigned URL ==========
    print("\n8️⃣ Generating presigned URL...")
    response = requests.post(
        f"{BASE_URL}/storage/files/presigned-url",
        json={
            "bucket_name": "hotel-images",
            "object_name": "rooms/deluxe/room-101.jpg",
            "expiry_seconds": 3600
        }
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   URL: {data['presigned_url'][:100]}...")
    print(f"   Expires in: {data['expiry_seconds']} seconds")
    
    # ========== Download File ==========
    print("\n9️⃣ Downloading file...")
    response = requests.get(
        f"{BASE_URL}/storage/files/download",
        params={
            "bucket_name": "hotel-images",
            "object_name": "rooms/deluxe/room-101.jpg"
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   Downloaded {len(response.content)} bytes")
    print(f"   Content: {response.content[:50]}...")
    
    # ========== Delete File ==========
    print("\n🔟 Deleting file...")
    response = requests.delete(
        f"{BASE_URL}/storage/files/delete",
        params={
            "bucket_name": "hotel-images",
            "object_name": "rooms/deluxe/room-104.jpg"
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    print("\n" + "=" * 80)
    print("✅ All tests completed!")
    print("=" * 80)


def create_test_bucket_with_sample_data():
    """
    Create a test bucket with sample hotel data
    """
    print("\n📦 Creating sample hotel data bucket...")
    
    # Create bucket
    requests.post(
        f"{BASE_URL}/storage/buckets",
        json={"bucket_name": "hotel-documents"}
    )
    
    # Upload sample documents
    samples = [
        ("policies/check-in-policy.txt", "Check-in time is 3:00 PM. Early check-in subject to availability."),
        ("policies/check-out-policy.txt", "Check-out time is 11:00 AM. Late check-out available for fee."),
        ("policies/cancellation-policy.txt", "Free cancellation up to 24 hours before arrival."),
        ("menus/breakfast-menu.txt", "Continental breakfast: 7:00 AM - 10:00 AM daily."),
        ("menus/room-service-menu.txt", "24/7 room service available. Order through phone ext. 9."),
    ]
    
    for object_name, content in samples:
        files = {
            'file': (object_name, io.BytesIO(content.encode()), 'text/plain')
        }
        data = {
            'bucket_name': 'hotel-documents',
            'object_name': object_name
        }
        
        response = requests.post(
            f"{BASE_URL}/storage/files/upload",
            files=files,
            data=data
        )
        print(f"   ✅ Uploaded: {object_name}")
    
    print("   📄 Sample data uploaded successfully!")


if __name__ == "__main__":
    try:
        # Run main tests
        test_storage_api()
        
        # Create sample data
        create_test_bucket_with_sample_data()
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to storage service")
        print("   Make sure the service is running on http://localhost:8004")
        print("\n   Start the service with:")
        print("   uvicorn src.application.controllers.storage.main:app --reload --port 8004")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
