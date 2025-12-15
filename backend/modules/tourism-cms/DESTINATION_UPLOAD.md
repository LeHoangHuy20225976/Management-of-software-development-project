# Destination Image Upload Feature

## Overview

Upload functionality for destination thumbnail and multiple images using MinIO storage.

---

## 📸 Endpoints

### 1. Upload Destination Thumbnail

**POST** `/destinations/:id/thumbnail`

Upload a single thumbnail image for a destination.

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `thumbnail` field

**Example:**

```bash
curl -X POST http://localhost:3000/destinations/1/thumbnail \
  -F "thumbnail=@./destination-thumb.jpg"
```

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Thumbnail uploaded successfully",
    "thumbnail": "http://localhost:9000/destination-images/thumb-123.jpg?..."
  }
}
```

---

### 2. Upload Multiple Destination Images

**POST** `/destinations/:id/images`

Upload multiple images for a destination (max 10 images).

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `images` field (multiple files)

**Example:**

```bash
curl -X POST http://localhost:3000/destinations/1/images \
  -F "images=@./image1.jpg" \
  -F "images=@./image2.jpg" \
  -F "images=@./image3.jpg"
```

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Images uploaded successfully",
    "images": [
      {
        "image_id": 1,
        "url": "http://localhost:9000/destination-images/image1-123.jpg?...",
        "destination_id": 1
      },
      {
        "image_id": 2,
        "url": "http://localhost:9000/destination-images/image2-456.jpg?...",
        "destination_id": 1
      }
    ]
  }
}
```

---

### 3. Delete Destination Thumbnail

**DELETE** `/destinations/:id/thumbnail`

Remove the thumbnail image.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Thumbnail deleted successfully"
  }
}
```

---

### 4. Delete Specific Destination Image

**DELETE** `/destinations/:id/images/:imageId`

Delete a specific image from the destination's gallery.

**Example:**

```bash
curl -X DELETE http://localhost:3000/destinations/1/images/5
```

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Image deleted successfully"
  }
}
```

---

## 🗂️ Database Structure

### Destination Model

- `thumbnail` (STRING) - URL to main thumbnail image

### Image Model (Separate Gallery)

- `image_id` (INTEGER, PK)
- `destination_id` (INTEGER, FK)
- `url` (STRING) - Full MinIO URL
- Supports multiple images per destination

---

## 📦 MinIO Bucket

- **Bucket:** `destination-images`
- **Access:** Public read
- **Max file size:** 10MB per image
- **Allowed types:** Images only

---

## 🧪 Testing with Postman

### Upload Thumbnail

1. Method: POST
2. URL: `http://localhost:3000/destinations/1/thumbnail`
3. Body → form-data
   - Key: `thumbnail` (type: File)
   - Value: Select image file

### Upload Multiple Images

1. Method: POST
2. URL: `http://localhost:3000/destinations/1/images`
3. Body → form-data
   - Key: `images` (type: File)
   - Select multiple files (Ctrl+Click)

---

## 💻 Frontend Integration

### React Example - Upload Thumbnail

```javascript
const uploadThumbnail = async (destinationId, file) => {
  const formData = new FormData();
  formData.append("thumbnail", file);

  const response = await fetch(`/destinations/${destinationId}/thumbnail`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

### React Example - Upload Multiple Images

```javascript
const uploadImages = async (destinationId, files) => {
  const formData = new FormData();

  // Add multiple files
  Array.from(files).forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch(`/destinations/${destinationId}/images`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};

// Usage
<input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => uploadImages(destinationId, e.target.files)}
/>;
```

---

## 🔄 Workflow

```
1. Create Destination
   POST /destinations
   { "name": "Paris", "location": "France", ... }

2. Upload Thumbnail
   POST /destinations/1/thumbnail
   (Main image for card display)

3. Upload Gallery Images
   POST /destinations/1/images
   (Multiple images for detail page)

4. Get Destination (includes all images)
   GET /destinations/1
   Returns destination with thumbnail + all gallery images
```

---

## 📋 Files Modified

1. `modules/tourism-cms/controller/DestinationController.js`

   - Added `uploadThumbnail()`
   - Added `uploadImages()`
   - Added `deleteThumbnail()`
   - Added `deleteDestinationImage()`

2. `modules/tourism-cms/services/DestinationService.js`

   - Added `addDestinationImages()`
   - Added `getDestinationImage()`
   - Added `deleteDestinationImage()`

3. `modules/tourism-cms/routes/DestinationRoutes.js`

   - Added multer configuration
   - Added image upload routes

4. `routes/index.js`
   - Registered destination routes

---

## 🎯 Key Differences from User Profile

| Feature             | User Profile          | Destination           |
| ------------------- | --------------------- | --------------------- |
| **Authentication**  | Required              | Not required (public) |
| **Bucket**          | `user-profiles`       | `destination-images`  |
| **Single Image**    | `profile_image` field | `thumbnail` field     |
| **Multiple Images** | No                    | Yes (Image model)     |
| **Max File Size**   | 5MB                   | 10MB                  |
| **User Context**    | `req.user.user_id`    | `req.params.id`       |

---

## 🚀 Ready to Use!

Start your server and test:

```bash
docker-compose up -d
npm run dev
```

Your destinations can now have beautiful images! 📸✨
