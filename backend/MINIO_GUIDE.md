# MinIO Configuration Guide

## What is MinIO?

MinIO is an object storage service (similar to Amazon S3) that you can run on your own servers. It's perfect for storing files like:

- Hotel images
- Room photos
- User profile pictures
- Documents and PDFs

## 🚀 Quick Start

### 1. Start MinIO with Docker

```powershell
# Start all services (including MinIO)
docker-compose up -d

# Check if MinIO is running
docker ps | findstr minio
```

### 2. Access MinIO Console

Open your browser and go to:

- **Console (Web UI)**: http://localhost:9001
- **API Endpoint**: http://localhost:9000

**Login credentials:**

- Username: `minioadmin`
- Password: `minioadmin`

### 3. Your Application Auto-Creates Buckets

When your backend starts, it automatically creates these buckets:

- `hotel-images` - For hotel photos
- `room-images` - For room photos
- `user-profiles` - For profile pictures
- `documents` - For documents/PDFs

## 📁 Project Structure

```
configs/
  └── minio.js          # MinIO client configuration
utils/
  └── minioUtils.js     # Helper functions for file operations
  └── uploadControllerExample.js  # Example upload controller
```

## 💻 How to Use MinIO in Your Code

### Upload a File

```javascript
const minioUtils = require("utils/minioUtils");

// In your controller
const uploadImage = async (req, res) => {
  const fileBuffer = req.file.buffer;
  const fileName = req.file.originalname;

  const result = await minioUtils.uploadFile(
    minioUtils.buckets.HOTEL_IMAGES, // bucket name
    fileBuffer, // file data
    fileName // original name
  );

  console.log("File URL:", result.url);
  // Save result.url to your database
};
```

### Get File URL

```javascript
const url = await minioUtils.getFileUrl("hotel-images", "my-photo-123456.jpg");
// URL is valid for 7 days by default
```

### Delete a File

```javascript
await minioUtils.deleteFile("hotel-images", "old-photo.jpg");
```

### List Files in Bucket

```javascript
const files = await minioUtils.listFiles("hotel-images");
files.forEach((file) => {
  console.log(file.name, file.size);
});
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### For Production

Change the credentials in production:

```env
MINIO_ACCESS_KEY=your-secure-access-key
MINIO_SECRET_KEY=your-secure-secret-key
MINIO_USE_SSL=true
```

## 🐳 Docker Commands

```powershell
# Start MinIO
docker-compose up -d minio

# Stop MinIO
docker-compose stop minio

# View MinIO logs
docker-compose logs -f minio

# Restart MinIO
docker-compose restart minio

# Remove MinIO (WARNING: deletes all files)
docker-compose down -v
```

## 📦 Available Buckets

| Bucket Name     | Purpose            | Auto-Created |
| --------------- | ------------------ | ------------ |
| `hotel-images`  | Hotel photos       | ✅ Yes       |
| `room-images`   | Room photos        | ✅ Yes       |
| `user-profiles` | Profile pictures   | ✅ Yes       |
| `documents`     | PDFs and documents | ✅ Yes       |

## 🛠️ Common Tasks

### Add File Upload to Your Route

1. Install multer (already in package.json):

```powershell
npm install multer
```

2. Create upload middleware:

```javascript
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Single file
router.post(
  "/hotels/:id/image",
  upload.single("image"),
  hotelController.uploadImage
);

// Multiple files
router.post(
  "/hotels/:id/images",
  upload.array("images", 10),
  hotelController.uploadImages
);
```

3. In your controller:

```javascript
const minioUtils = require("utils/minioUtils");

uploadImage: async (req, res) => {
  const result = await minioUtils.uploadFile(
    minioUtils.buckets.HOTEL_IMAGES,
    req.file.buffer,
    req.file.originalname
  );

  // Save result.url to database
  await Hotel.update(
    { image_url: result.url },
    { where: { id: req.params.id } }
  );

  return res.json({ success: true, url: result.url });
};
```

## 🔍 Troubleshooting

### MinIO not starting?

```powershell
# Check logs
docker-compose logs minio

# Check if port is already in use
netstat -an | findstr "9000"
netstat -an | findstr "9001"
```

### Can't access MinIO Console?

1. Check if container is running: `docker ps`
2. Try accessing: http://localhost:9001
3. Check firewall settings

### Files not uploading?

1. Check if buckets exist in MinIO Console
2. Verify environment variables in `.env`
3. Check backend logs for errors

## 📚 MinIO Utils API Reference

### `uploadFile(bucketName, fileBuffer, fileName, metadata)`

Uploads a file to MinIO

- Returns: `{ success, fileName, url, bucketName }`

### `getFileUrl(bucketName, fileName, expiry)`

Gets a presigned URL (default: 7 days)

- Returns: URL string

### `deleteFile(bucketName, fileName)`

Deletes a file

- Returns: boolean

### `listFiles(bucketName, prefix)`

Lists all files in bucket

- Returns: Array of file objects

### `fileExists(bucketName, fileName)`

Checks if file exists

- Returns: boolean

### `getFileMetadata(bucketName, fileName)`

Gets file info (size, date, etc.)

- Returns: metadata object

## 🌐 Access from Frontend

The presigned URLs work directly in the browser:

```javascript
// In your React/Angular/Vue app
<img src="http://localhost:9000/hotel-images/photo-1234.jpg?X-Amz-..." />
```

## 🔒 Security Notes

1. **Change default credentials in production**
2. **Use HTTPS (SSL) in production**
3. **Set proper bucket policies**
4. **Don't expose MinIO directly - use your backend API**

## 📖 Additional Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO JavaScript Client](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
