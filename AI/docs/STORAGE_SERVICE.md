# MinIO Storage API

Complete API for managing MinIO object storage buckets and files in the Hotel AI System.

## 🚀 Quick Start

### 1. Start the Storage Service

```bash
# Make sure MinIO is running
docker compose up -d minio

# Start the storage API service
uvicorn src.application.controllers.storage.main:app --reload --port 8004
```

### 2. Access API Documentation

- **Swagger UI**: http://localhost:8004/docs
- **ReDoc**: http://localhost:8004/redoc

### 3. Run Test Script

```bash
python test_minio_api.py
```

---

## 📋 API Endpoints

### Bucket Operations

#### Create Bucket
```bash
POST /storage/buckets
Content-Type: application/json

{
  "bucket_name": "hotel-images",
  "object_lock": false
}
```

#### List All Buckets
```bash
GET /storage/buckets
```

#### Check if Bucket Exists
```bash
GET /storage/buckets/{bucket_name}/exists
```

#### Delete Bucket
```bash
DELETE /storage/buckets/{bucket_name}
```

---

### File Operations

#### Upload Single File
```bash
POST /storage/files/upload
Content-Type: multipart/form-data

bucket_name: hotel-images
object_name: rooms/deluxe-101.jpg
file: <binary file data>
```

**Example with curl:**
```bash
curl -X POST "http://localhost:8004/storage/files/upload" \
  -F "bucket_name=hotel-images" \
  -F "object_name=rooms/deluxe-101.jpg" \
  -F "file=@/path/to/image.jpg"
```

#### Upload Multiple Files
```bash
POST /storage/files/upload-multiple
Content-Type: multipart/form-data

bucket_name: hotel-images
prefix: rooms/deluxe/
files: <file1>
files: <file2>
files: <file3>
```

**Example with curl:**
```bash
curl -X POST "http://localhost:8004/storage/files/upload-multiple" \
  -F "bucket_name=hotel-images" \
  -F "prefix=rooms/deluxe/" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

#### List Objects in Bucket
```bash
POST /storage/files/list
Content-Type: application/json

{
  "bucket_name": "hotel-images",
  "prefix": "rooms/",
  "recursive": true,
  "max_keys": 100
}
```

#### Download File
```bash
GET /storage/files/download?bucket_name=hotel-images&object_name=rooms/deluxe-101.jpg
```

**Example with curl:**
```bash
curl -X GET "http://localhost:8004/storage/files/download?bucket_name=hotel-images&object_name=rooms/deluxe-101.jpg" \
  -o downloaded-image.jpg
```

#### Get File Metadata
```bash
GET /storage/files/metadata?bucket_name=hotel-images&object_name=rooms/deluxe-101.jpg
```

#### Generate Presigned URL
```bash
POST /storage/files/presigned-url
Content-Type: application/json

{
  "bucket_name": "hotel-images",
  "object_name": "rooms/deluxe-101.jpg",
  "expiry_seconds": 3600
}
```

#### Delete File
```bash
DELETE /storage/files/delete?bucket_name=hotel-images&object_name=rooms/deluxe-101.jpg
```

---

## 🐍 Python Client Examples

### Initialize MinIO Service

```python
from src.application.services.storage.minio_service import MinioStorageService

# Initialize service (uses environment variables)
minio = MinioStorageService()

# Or with custom settings
minio = MinioStorageService(
    endpoint="localhost:9000",
    access_key="minio_admin",
    secret_key="minio_password_123",
    secure=False
)
```

### Create Bucket

```python
# Create a bucket
result = minio.create_bucket("hotel-images")
print(result)
# {'bucket_name': 'hotel-images', 'message': 'Bucket created successfully', 'success': True}

# List all buckets
buckets = minio.list_buckets()
for bucket in buckets:
    print(f"- {bucket['name']} (created: {bucket['creation_date']})")
```

### Upload Files

```python
import io

# Upload single file
with open("room-101.jpg", "rb") as f:
    file_size = f.seek(0, 2)  # Get file size
    f.seek(0)  # Reset to beginning
    
    result = minio.upload_file(
        bucket_name="hotel-images",
        object_name="rooms/deluxe/room-101.jpg",
        file_data=f,
        file_size=file_size,
        content_type="image/jpeg"
    )
    print(result)

# Upload multiple files
files_data = [
    ("room-102.jpg", io.BytesIO(b"..."), 1024, "image/jpeg"),
    ("room-103.jpg", io.BytesIO(b"..."), 2048, "image/jpeg"),
]

result = minio.upload_multiple_files(
    bucket_name="hotel-images",
    files_data=files_data,
    prefix="rooms/deluxe/"
)
print(f"Uploaded {result['successful_uploads']}/{result['total_files']} files")
```

### Download Files

```python
# Download file
file_content = minio.download_file(
    bucket_name="hotel-images",
    object_name="rooms/deluxe/room-101.jpg"
)

# Save to disk
with open("downloaded-room-101.jpg", "wb") as f:
    f.write(file_content)
```

### List Objects

```python
# List all objects in bucket
objects = minio.list_objects(
    bucket_name="hotel-images",
    prefix="rooms/deluxe/",
    recursive=True
)

for obj in objects:
    print(f"{obj['object_name']}: {obj['size']} bytes")
```

### Generate Presigned URLs

```python
# Generate temporary URL (expires in 1 hour)
url = minio.get_presigned_url(
    bucket_name="hotel-images",
    object_name="rooms/deluxe/room-101.jpg",
    expiry_seconds=3600
)

print(f"Share this URL: {url}")
# Anyone with this URL can download the file for 1 hour
```

### Delete Files

```python
# Delete single file
result = minio.delete_file(
    bucket_name="hotel-images",
    object_name="rooms/deluxe/room-101.jpg"
)
print(result)
```

---

## 🔧 FastAPI Integration Example

```python
from fastapi import FastAPI, UploadFile, File
from src.application.services.storage.minio_service import MinioStorageService

app = FastAPI()
minio = MinioStorageService()

@app.post("/upload-room-image")
async def upload_room_image(
    room_id: str,
    file: UploadFile = File(...)
):
    """Upload room image to MinIO"""
    
    # Read file
    content = await file.read()
    file_size = len(content)
    
    # Upload to MinIO
    result = minio.upload_file(
        bucket_name="hotel-images",
        object_name=f"rooms/{room_id}/{file.filename}",
        file_data=io.BytesIO(content),
        file_size=file_size,
        content_type=file.content_type
    )
    
    # Generate shareable URL
    url = minio.get_presigned_url(
        bucket_name="hotel-images",
        object_name=result["object_name"],
        expiry_seconds=86400  # 24 hours
    )
    
    return {
        "success": True,
        "room_id": room_id,
        "filename": file.filename,
        "size": file_size,
        "url": url
    }
```

---

## 🎯 Common Use Cases

### 1. Store Guest Documents

```python
# Upload guest ID document
with open("guest-id.pdf", "rb") as f:
    minio.upload_file(
        bucket_name="guest-documents",
        object_name=f"guests/{guest_id}/identification.pdf",
        file_data=f,
        file_size=os.path.getsize("guest-id.pdf"),
        content_type="application/pdf"
    )
```

### 2. Store Room Images

```python
# Upload room photos
for image_path in room_images:
    with open(image_path, "rb") as f:
        minio.upload_file(
            bucket_name="hotel-images",
            object_name=f"rooms/{room_id}/{image_path.name}",
            file_data=f,
            file_size=os.path.getsize(image_path),
            content_type="image/jpeg"
        )
```

### 3. Store ML Model Artifacts

```python
# Save trained model
import pickle

model_data = pickle.dumps(trained_model)
minio.upload_file(
    bucket_name="ml-models",
    object_name=f"models/churn-predictor-v{version}.pkl",
    file_data=io.BytesIO(model_data),
    file_size=len(model_data),
    content_type="application/octet-stream"
)
```

### 4. Store Face Recognition Embeddings

```python
# Save face embeddings
import numpy as np

embeddings = np.array([...])  # Face embeddings
embeddings_bytes = embeddings.tobytes()

minio.upload_file(
    bucket_name="face-embeddings",
    object_name=f"guests/{guest_id}/embedding.npy",
    file_data=io.BytesIO(embeddings_bytes),
    file_size=len(embeddings_bytes),
    content_type="application/octet-stream"
)
```

---

## 🌐 Environment Variables

Configure MinIO connection in `.env`:

```bash
# MinIO Configuration
MINIO_ENDPOINT=minio:9000        # or localhost:9000 for local
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password_123
MINIO_SECURE=false               # Use HTTPS
```

---

## 🔒 Security Best Practices

1. **Use Presigned URLs** for temporary public access instead of making buckets public
2. **Set appropriate expiry times** for presigned URLs (default: 1 hour, max: 7 days)
3. **Organize objects with prefixes** like `guests/{guest_id}/`, `rooms/{room_id}/`
4. **Validate file types** before uploading
5. **Implement file size limits** to prevent abuse
6. **Use object lock** for compliance requirements (immutable objects)

---

## 📊 Bucket Naming Conventions

Recommended bucket structure for hotel system:

```
hotel-images/           # Room photos, facility images
├── rooms/
│   ├── deluxe/
│   ├── suite/
│   └── standard/
├── facilities/
└── restaurant/

guest-documents/        # Guest uploaded documents
├── {guest_id}/
│   ├── identification.pdf
│   └── payment-proof.jpg

ml-models/             # Trained ML models
├── churn-predictor/
├── pricing-optimizer/
└── recommender/

face-embeddings/       # Face recognition data
└── {guest_id}/

hotel-backups/         # Database backups, logs
├── postgres/
└── logs/
```

---

## 🧪 Testing

Run the complete test suite:

```bash
# Run API tests
python test_minio_api.py

# Manual testing with curl
curl http://localhost:8004/health
curl http://localhost:8004/storage/buckets
```

---

## 📈 Performance Tips

1. **Use multipart upload** for large files (>5MB) - automatically handled by minio library
2. **Batch operations** when uploading multiple small files
3. **Enable caching** for frequently accessed objects
4. **Use CDN** for public images in production
5. **Set appropriate content types** for better browser handling

---

## 🐛 Troubleshooting

### Connection Refused

```bash
# Check if MinIO is running
docker ps | grep minio

# Start MinIO if not running
docker compose up -d minio

# Check MinIO logs
docker logs hotel-minio
```

### Bucket Already Exists Error

The API automatically handles this - if bucket exists, it returns success without error.

### Permission Denied

Check MinIO access credentials in `.env` file match docker-compose.yml.

### File Too Large

MinIO default max object size is 5TB. For smaller limits, implement validation in the API.

---

## 📚 Additional Resources

- [MinIO Python Client Documentation](https://min.io/docs/minio/linux/developers/python/minio-py.html)
- [MinIO Server Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO Docker Setup](https://min.io/docs/minio/container/index.html)

---

## 🎉 Summary

The MinIO Storage API provides complete object storage capabilities:

✅ **Bucket Management**: Create, list, check, delete buckets  
✅ **File Upload**: Single or multiple files with metadata  
✅ **File Download**: Stream files with proper content types  
✅ **File Listing**: Search and filter objects with prefix  
✅ **Presigned URLs**: Temporary public access without auth  
✅ **File Deletion**: Remove objects from storage  
✅ **Metadata**: Get detailed object information  

Perfect for storing hotel images, guest documents, ML models, and more! 🏨
