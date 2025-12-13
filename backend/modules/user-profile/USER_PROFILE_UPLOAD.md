# User Profile Upload Feature

## Overview

The upload functionality has been integrated into the user-profile module. Users can now upload, view, and delete their profile images.

## New Endpoints

### 1. Upload Profile Image

**POST** `/users/profile/image`

**Authentication:** Required (authMiddleware)

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field

**Example using curl:**

```bash
curl -X POST http://localhost:3000/users/profile/image \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Example using Postman:**

1. Select POST method
2. URL: `http://localhost:3000/users/profile/image`
3. Auth: Cookie with accessToken
4. Body: form-data
   - Key: `image` (type: File)
   - Value: Select your image file

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Profile image uploaded successfully",
    "profile_image": "http://localhost:9000/user-profiles/photo-1234567890-abc123.jpg?..."
  }
}
```

**Constraints:**

- Maximum file size: 5MB
- Allowed file types: Images only (image/\*)
- Automatically updates user's `profile_image` field in database

---

### 2. Get Profile Image URL

**GET** `/users/profile/image`

**Authentication:** Required (authMiddleware)

**Response:**

```json
{
  "status": "ok",
  "data": {
    "profile_image": "http://localhost:9000/user-profiles/photo-1234567890-abc123.jpg?..."
  }
}
```

---

### 3. Delete Profile Image

**DELETE** `/users/profile/image`

**Authentication:** Required (authMiddleware)

**Response:**

```json
{
  "status": "ok",
  "data": {
    "message": "Profile image deleted successfully"
  }
}
```

**Note:** This removes the image from MinIO and sets `profile_image` to `null` in the database.

---

## Updated UserController Methods

### `uploadProfileImage(req, res)`

- Validates file is an image
- Uploads to MinIO `user-profiles` bucket
- Updates user's `profile_image` field
- Returns the new image URL

### `getProfileImage(req, res)`

- Returns the current user's profile image URL
- Returns 404 if no image exists

### `deleteProfileImage(req, res)`

- Extracts filename from URL
- Deletes from MinIO
- Sets `profile_image` to null in database

---

## File Upload Configuration

**Location:** `modules/user-profile/routes/UserProfileRoute.js`

```javascript
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});
```

---

## MinIO Bucket

- **Bucket Name:** `user-profiles`
- **Auto-created:** Yes (on server startup)
- **Access:** Via presigned URLs (7-day expiry)

---

## Frontend Integration Example

### React/JavaScript Example

```javascript
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:3000/users/profile/image", {
    method: "POST",
    credentials: "include", // Important: includes cookies
    body: formData,
  });

  const result = await response.json();
  console.log("Image URL:", result.data.profile_image);
};

// Usage with file input
<input
  type="file"
  accept="image/*"
  onChange={(e) => uploadProfileImage(e.target.files[0])}
/>;
```

### Angular Example

```typescript
uploadProfileImage(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('image', file);

  return this.http.post(
    'http://localhost:3000/users/profile/image',
    formData,
    { withCredentials: true }
  );
}
```

---

## Testing with cURL

### Upload Image

```bash
# Login first to get cookie
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userData":{"email":"user@example.com","password":"password","role":"customer"}}' \
  -c cookies.txt

# Upload image
curl -X POST http://localhost:3000/users/profile/image \
  -b cookies.txt \
  -F "image=@./profile.jpg"
```

### Get Image URL

```bash
curl -X GET http://localhost:3000/users/profile/image \
  -b cookies.txt
```

### Delete Image

```bash
curl -X DELETE http://localhost:3000/users/profile/image \
  -b cookies.txt
```

---

## Error Handling

### Common Errors

1. **No file provided**

```json
{
  "status": "error",
  "message": "No image file provided"
}
```

2. **Invalid file type**

```json
{
  "status": "error",
  "message": "Only image files are allowed"
}
```

3. **File too large**

```json
{
  "status": "error",
  "message": "File too large"
}
```

4. **Not authenticated**

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

---

## Database Changes

The `profile_image` field in the `User` table now stores the full MinIO presigned URL:

```
Before: null or simple filename
After:  http://localhost:9000/user-profiles/image-123456-abc.jpg?X-Amz-Algorithm=...
```

---

## Security Features

✅ Authentication required for all operations  
✅ Users can only modify their own profile image  
✅ File type validation (images only)  
✅ File size limit (5MB)  
✅ Presigned URLs with expiration  
✅ Memory storage (no temp files on server)

---

## Files Modified

1. `modules/user-profile/controller/UserController.js` - Added 3 upload methods
2. `modules/user-profile/routes/UserProfileRoute.js` - Added multer config and routes
3. `routes/index.js` - Registered user-profile routes
4. `package.json` - Added multer dependency

---

## Next Steps

You can now:

1. Test the endpoints with Postman or curl
2. Integrate with your frontend application
3. View uploaded images in MinIO Console (http://localhost:9001)
4. Extend to other modules (hotels, rooms) following the same pattern
