# Computer Vision Service - API Endpoints

**Base URL**: `http://localhost:8001` (Development)
**Service**: CV Service (Computer Vision)
**Port**: 8001

---

## 📋 Table of Contents

- [Face Recognition APIs](#face-recognition-apis)
  - [Enroll Face](#1-enroll-face)
  - [Recognize Face](#2-recognize-face)
  - [Get User Faces](#3-get-user-faces)
  - [Delete Face](#4-delete-face)
- [Image Search & Retrieval APIs](#image-search--retrieval-apis)
  - [Upload Image](#1-upload-image)
  - [Search by Text](#2-search-by-text)
  - [Search by Image](#3-search-by-image)
  - [Hybrid Search](#4-hybrid-search)
  - [Get Entity Images](#5-get-entity-images)
  - [Delete Image](#6-delete-image)
- [Common Models](#common-models)
- [Error Codes](#error-codes)

---

## 🔐 Authentication

Currently no authentication required (development).
**TODO**: Add JWT authentication before production.

---

## Face Recognition APIs

### 1. Enroll Face

Enroll a new employee face for attendance recognition.

**Endpoint**: `POST /cv/face/enroll`

**Request Body**:
```json
{
  "user_id": 123,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "device_id": "camera-01",
  "location": "Main Entrance",
  "notes": "Employee enrollment",
  "require_liveness": false
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | ✅ | Employee ID |
| `image_base64` | string | ✅ | Base64 encoded image (JPEG/PNG). Can include data URI prefix or just base64 string |
| `device_id` | string | ❌ | ID of capture device (for tracking) |
| `location` | string | ❌ | Location where photo was taken |
| `notes` | string | ❌ | Additional notes |
| `require_liveness` | boolean | ❌ | Enable liveness detection (default: false) |

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Face enrolled successfully",
  "face_id": 456,
  "user_id": 123,
  "quality_scores": {
    "overall": 0.92,
    "sharpness": 0.95,
    "brightness": 0.88,
    "face_score": 0.93
  },
  "liveness_score": 0.87,
  "is_liveness_verified": true
}
```

**Error Responses**:
- `400 Bad Request`: Invalid image data, poor image quality, multiple faces detected
- `500 Internal Server Error`: Service error

**Quality Requirements**:
- ✅ Face must be clearly visible
- ✅ Good lighting (not too bright/dark)
- ✅ Sharp image (not blurry)
- ✅ Only ONE face in image
- ✅ Face size: minimum 112x112 pixels

---

### 2. Recognize Face

Recognize employee face and log attendance.

**Endpoint**: `POST /cv/face/recognize`

**Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "event_type": "CHECK_IN",
  "device_id": "camera-01",
  "location": "Main Entrance"
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_base64` | string | ✅ | Base64 encoded image |
| `event_type` | string | ✅ | Event type: `"CHECK_IN"` or `"CHECK_OUT"` |
| `device_id` | string | ❌ | Capture device ID |
| `location` | string | ❌ | Location where photo was taken |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Face recognized successfully",
  "user_id": 123,
  "confidence": 0.94,
  "event_type": "CHECK_IN",
  "attendance_log_id": 789,
  "timestamp": "2025-12-08T10:30:00Z"
}
```

**Not Recognized Response** (200 OK):
```json
{
  "success": false,
  "message": "No matching face found",
  "user_id": null,
  "confidence": 0.0
}
```

**Process Flow**:
1. Extract face embedding from image
2. Search database using pgvector cosine similarity
3. If match found (similarity > 0.7):
   - Log attendance event to database
   - Publish event to RabbitMQ
   - Return user info
4. If no match: Return error

---

### 3. Get User Faces

Get all enrolled faces for a specific user.

**Endpoint**: `GET /cv/face/user/{user_id}`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | integer | Employee user ID |

**Success Response** (200 OK):
```json
{
  "success": true,
  "faces": [
    {
      "face_id": 456,
      "user_id": 123,
      "face_quality_score": 0.92,
      "sharpness_score": 0.95,
      "brightness_score": 0.88,
      "is_liveness_verified": true,
      "liveness_score": 0.87,
      "enrollment_device": "camera-01",
      "enrollment_location": "Main Entrance",
      "enrollment_notes": "Employee enrollment",
      "is_active": true,
      "created_at": "2025-12-01T08:00:00Z",
      "updated_at": "2025-12-01T08:00:00Z"
    }
  ],
  "total": 1
}
```

**Use Cases**:
- View enrollment history
- Check face quality scores
- Manage multiple face samples per user

---

### 4. Delete Face

Soft delete an enrolled face (deactivate).

**Endpoint**: `DELETE /cv/face/{face_id}`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `face_id` | integer | Face enrollment ID |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Face 456 deactivated successfully",
  "face_id": 456
}
```

**Error Responses**:
- `404 Not Found`: Face ID not found

**Note**: This is a SOFT delete (sets `is_active = false`). The record remains in database for history.

---

## Image Search & Retrieval APIs

### 1. Upload Image

Upload and index a new image for search.

**Endpoint**: `POST /cv/image-search/upload`

**Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "hotel_id": 42,
  "room_id": null,
  "destination_id": null,
  "description": "Luxury ocean view room",
  "tags": ["ocean", "luxury", "sunset"],
  "is_primary": true
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image_base64` | string | ✅ | Base64 encoded image |
| `hotel_id` | integer | ❌ | Hotel ID (one of hotel/room/destination must be set) |
| `room_id` | integer | ❌ | Room ID |
| `destination_id` | integer | ❌ | Destination ID |
| `description` | string | ❌ | Image description (searchable) |
| `tags` | array[string] | ❌ | Image tags for categorization |
| `is_primary` | boolean | ❌ | Is this the primary/thumbnail image? (default: false) |

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Image uploaded and indexed successfully",
  "image_id": 789,
  "embedding_generated": true
}
```

**Process**:
1. Decode base64 image
2. Extract CLIP embedding (512-dim vector)
3. Store metadata + embedding in PostgreSQL with pgvector
4. Image becomes searchable immediately

---

### 2. Search by Text

Search images using natural language text.

**Endpoint**: `POST /cv/image-search/search/text`

**Request Body**:
```json
{
  "query": "luxury hotel with ocean view",
  "entity_type": null,
  "entity_id": null,
  "limit": 20,
  "min_similarity": 0.6
}
```

**Request Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `query` | string | ✅ | - | Natural language search query |
| `entity_type` | string | ❌ | null | Filter by type: `"hotel"`, `"room"`, `"destination"` |
| `entity_id` | integer | ❌ | null | Filter by specific entity ID |
| `limit` | integer | ❌ | 20 | Max results (1-100) |
| `min_similarity` | float | ❌ | 0.5 | Minimum similarity score (0.0-1.0) |

**Success Response** (200 OK):
```json
{
  "success": true,
  "query": "luxury hotel with ocean view",
  "results": [
    {
      "similarity": 0.89,
      "image": {
        "image_id": 123,
        "image_url": "https://cdn.example.com/images/123.jpg",
        "image_description": "Ocean view luxury suite",
        "image_tags": ["ocean", "luxury", "suite"],
        "is_primary": true,
        "image_width": 1920,
        "image_height": 1080,
        "embedding_model": "clip-vit-base-patch32",
        "created_at": "2025-12-01T10:00:00Z"
      },
      "hotel": {
        "hotel_id": 42,
        "hotel_name": "Beachside Resort",
        "hotel_rating": 4.8,
        "hotel_address": "123 Ocean Drive",
        "hotel_thumbnail": "thumb.jpg"
      },
      "room": null,
      "destination": null
    }
  ],
  "total": 1,
  "search_time_ms": 45.2
}
```

**Example Queries**:
- `"luxury hotel with ocean view"`
- `"romantic bedroom with sunset"`
- `"swimming pool and beach"`
- `"modern minimalist lobby"`
- `"spa and wellness center"`

**How It Works**:
1. Convert text to CLIP text embedding (512-dim)
2. Search database using pgvector cosine similarity
3. Return ranked results with similarity scores
4. Uses HNSW index for fast search (< 50ms)

---

### 3. Search by Image

Find similar images using an uploaded image.

**Endpoint**: `POST /cv/image-search/search/image`

**Request Body**:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "entity_type": null,
  "entity_id": null,
  "limit": 20,
  "min_similarity": 0.7
}
```

**Request Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `image_base64` | string | ✅ | - | Base64 encoded query image |
| `entity_type` | string | ❌ | null | Filter by type |
| `entity_id` | integer | ❌ | null | Filter by entity |
| `limit` | integer | ❌ | 20 | Max results |
| `min_similarity` | float | ❌ | 0.6 | Minimum similarity |

**Success Response**: Same format as text search

**Use Cases**:
- Upload hotel photo → find similar hotels
- Upload room photo → find similar rooms
- Reverse image search
- Find duplicates

**How It Works**:
1. Convert uploaded image to CLIP image embedding
2. Search for visually similar images
3. Return ranked by visual similarity

---

### 4. Hybrid Search

Search using both text AND image (combined).

**Endpoint**: `POST /cv/image-search/search/hybrid`

**Request Body**:
```json
{
  "text_query": "luxury beach resort",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "text_weight": 0.6,
  "image_weight": 0.4,
  "entity_type": "hotel",
  "limit": 20,
  "min_similarity": 0.6
}
```

**Request Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `text_query` | string | ❌ | null | Text query (optional if image provided) |
| `image_base64` | string | ❌ | null | Image query (optional if text provided) |
| `text_weight` | float | ❌ | 0.5 | Weight for text similarity (0.0-1.0) |
| `image_weight` | float | ❌ | 0.5 | Weight for image similarity (0.0-1.0) |
| `entity_type` | string | ❌ | null | Filter by type |
| `limit` | integer | ❌ | 20 | Max results |
| `min_similarity` | float | ❌ | 0.5 | Minimum combined similarity |

**Success Response**: Same format as text/image search

**Use Cases**:
- Text: `"luxury hotel"` + Image: beach photo → luxury beach hotels
- More precise than text or image alone
- Combine semantic and visual search

**Best Practice**: `text_weight + image_weight` should equal 1.0

**Examples**:
```json
// Equal weights
{"text_weight": 0.5, "image_weight": 0.5}

// Prioritize text
{"text_weight": 0.7, "image_weight": 0.3}

// Prioritize image
{"text_weight": 0.3, "image_weight": 0.7}
```

---

### 5. Get Entity Images

Get all images for a specific hotel/room/destination.

**Endpoint**: `GET /cv/image-search/images/{entity_type}/{entity_id}`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `entity_type` | string | Type: `"hotel"`, `"room"`, or `"destination"` |
| `entity_id` | integer | ID of the entity |

**Example**: `GET /cv/image-search/images/hotel/42`

**Success Response** (200 OK):
```json
{
  "success": true,
  "images": [
    {
      "image_id": 123,
      "image_url": "https://cdn.example.com/images/123.jpg",
      "image_description": "Ocean view suite",
      "image_tags": ["ocean", "luxury"],
      "is_primary": true,
      "image_width": 1920,
      "image_height": 1080,
      "embedding_model": "clip-vit-base-patch32",
      "created_at": "2025-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

**Ordering**:
- Primary images first (`is_primary = true`)
- Then by `display_order` (ASC)
- Then by `created_at` (DESC)

---

### 6. Delete Image

Delete an image from the database.

**Endpoint**: `DELETE /cv/image-search/{image_id}`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `image_id` | integer | Image ID to delete |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Image 123 deleted successfully",
  "image_id": 123
}
```

**Error Responses**:
- `404 Not Found`: Image ID not found

**Note**: This is a HARD delete (permanent). Consider implementing soft delete if history is needed.

---

## Common Models

### Base64 Image Format

Images should be sent as base64-encoded strings. You can include the data URI prefix or just the base64 string:

**With data URI** (Recommended):
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgG...
```

**Without data URI**:
```
/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgG...
```

**Supported formats**:
- JPEG
- PNG
- WebP

**Size recommendations**:
- Face recognition: 640x480 to 1920x1080 pixels
- Image search: 512x512 to 2048x2048 pixels
- Max file size: 10MB

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | When it occurs |
|------|---------|----------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input data, poor image quality, validation error |
| `404` | Not Found | Resource not found (face_id, image_id, etc.) |
| `500` | Internal Server Error | Server error, database error |
| `503` | Service Unavailable | Service not initialized, model loading |

### Common Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Face Recognition Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No face detected` | Face not visible in image | Ensure face is clearly visible, good lighting |
| `Multiple faces detected` | More than 1 face found | Crop image to single person |
| `Poor image quality` | Blurry, dark, or low resolution | Use better quality image (min 640x480) |
| `No matching face found` | Face not enrolled | Enroll face first using `/cv/face/enroll` |
| `Liveness check failed` | Not a live person | Retake photo with real person (if `require_liveness = true`) |

### Image Search Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid image data` | Cannot decode base64 | Check base64 encoding is correct |
| `Invalid entity_type` | Wrong type value | Use `"hotel"`, `"room"`, or `"destination"` |
| `Query too short` | Text query < 3 characters | Provide meaningful query text |

---

## Frontend Integration Examples

### JavaScript/TypeScript Example

```typescript
// Face Enrollment
async function enrollFace(userId: number, imageBase64: string) {
  const response = await fetch('http://localhost:8001/cv/face/enroll', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      image_base64: imageBase64,
      device_id: 'web-app',
      location: 'Admin Panel',
      require_liveness: false
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Enrollment failed');
  }

  return data;
}

// Face Recognition
async function recognizeFace(imageBase64: string, eventType: 'CHECK_IN' | 'CHECK_OUT') {
  const response = await fetch('http://localhost:8001/cv/face/recognize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      event_type: eventType,
      device_id: 'web-app'
    })
  });

  return await response.json();
}

// Text Search
async function searchImagesByText(query: string, limit: number = 20) {
  const response = await fetch('http://localhost:8001/cv/image-search/search/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      limit: limit,
      min_similarity: 0.6
    })
  });

  return await response.json();
}

// Image Upload
async function uploadImage(imageBase64: string, hotelId: number, description: string) {
  const response = await fetch('http://localhost:8001/cv/image-search/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      hotel_id: hotelId,
      description: description,
      is_primary: false
    })
  });

  return await response.json();
}

// Get Hotel Images
async function getHotelImages(hotelId: number) {
  const response = await fetch(
    `http://localhost:8001/cv/image-search/images/hotel/${hotelId}`
  );

  return await response.json();
}
```

### Converting File to Base64

```typescript
// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Usage
const fileInput = document.getElementById('imageInput') as HTMLInputElement;
const file = fileInput.files[0];
const base64 = await fileToBase64(file);

// Now use base64 in API calls
await enrollFace(123, base64);
```

### React Hook Example

```typescript
import { useState } from 'react';

interface SearchResult {
  similarity: number;
  image: {
    image_id: number;
    image_url: string;
    image_description: string;
  };
  hotel: {
    hotel_id: number;
    hotel_name: string;
    hotel_rating: number;
  } | null;
}

export function useImageSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchByText = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/cv/image-search/search/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          limit: 20,
          min_similarity: 0.6
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { searchByText, results, loading, error };
}
```

---

## Performance Notes

### Search Performance

- **Text Search**: ~30-50ms
- **Image Search**: ~50-100ms
- **Hybrid Search**: ~80-150ms

Performance depends on:
- Database size (number of indexed images)
- `limit` parameter (more results = slower)
- HNSW index parameters (already optimized)

### Optimization Tips

1. **Use appropriate `min_similarity`**:
   - 0.5-0.6: More results, lower relevance
   - 0.7-0.8: Balanced
   - 0.9+: Very strict, fewer results

2. **Limit results**: Default is 20, max is 100

3. **Use entity filters** when possible:
   ```json
   {
     "query": "luxury room",
     "entity_type": "room",
     "entity_id": 42
   }
   ```

4. **Cache results** on frontend for common queries

---

## Database Schema Reference

### Face Recognition Tables

**Table**: `employee_faces`

| Column | Type | Description |
|--------|------|-------------|
| `face_id` | SERIAL | Primary key |
| `user_id` | INTEGER | Employee ID |
| `face_embedding` | vector(512) | InsightFace embedding |
| `face_quality_score` | FLOAT | Overall quality (0-1) |
| `sharpness_score` | FLOAT | Image sharpness |
| `brightness_score` | FLOAT | Image brightness |
| `is_liveness_verified` | BOOLEAN | Passed liveness check |
| `liveness_score` | FLOAT | Liveness confidence |
| `is_active` | BOOLEAN | Is this face active |
| `created_at` | TIMESTAMP | Enrollment time |

**Table**: `attendance_logs`

| Column | Type | Description |
|--------|------|-------------|
| `log_id` | SERIAL | Primary key |
| `user_id` | INTEGER | Employee ID |
| `event_type` | VARCHAR | CHECK_IN/CHECK_OUT |
| `timestamp` | TIMESTAMP | Event time |
| `confidence` | FLOAT | Recognition confidence |
| `device_id` | VARCHAR | Capture device |
| `location` | VARCHAR | Location |

### Image Search Tables

**Table**: `Image`

| Column | Type | Description |
|--------|------|-------------|
| `image_id` | SERIAL | Primary key |
| `hotel_id` | INTEGER | Associated hotel |
| `room_id` | INTEGER | Associated room |
| `destination_id` | INTEGER | Associated destination |
| `image_url` | VARCHAR | Image URL (MinIO/S3) |
| `image_embedding` | vector(512) | CLIP embedding |
| `image_description` | TEXT | Text description |
| `image_tags` | TEXT[] | Array of tags |
| `is_primary` | BOOLEAN | Is primary image |
| `display_order` | INTEGER | Display order |
| `embedding_model` | VARCHAR | Model: clip-vit-base-patch32 |
| `created_at` | TIMESTAMP | Upload time |

**Index**: HNSW index on `image_embedding` for fast similarity search

---

## Testing Endpoints

### Health Check

Check if service is running:

```bash
curl http://localhost:8001/health
```

Response:
```json
{
  "status": "healthy",
  "service": "cv-service",
  "version": "0.1.0"
}
```

### Interactive API Docs

FastAPI provides interactive docs:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

You can test all endpoints directly from the browser!

---

## Support & Questions

For questions or issues:
1. Check logs: `docker logs hotel-cv-service`
2. Review API docs: http://localhost:8001/docs
3. Check test suite: `test/cv/manual/test_image_search_manual.py`
4. See examples: `test/cv/manual/search_images_cli.py`

---

**Last Updated**: 2025-12-08
**API Version**: v1.0
**Service**: CV Service (Computer Vision)
