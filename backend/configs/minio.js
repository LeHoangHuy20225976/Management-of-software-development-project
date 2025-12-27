const Minio = require("minio");

/**
 * MinIO Client Configuration
 * Used for object storage (images, files, etc.)
 */
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  // Public URL for frontend to access images
  publicEndPoint: process.env.MINIO_PUBLIC_ENDPOINT || "localhost",
  publicPort: parseInt(process.env.MINIO_PUBLIC_PORT || "9002", 10),
};

// Create MinIO client instance
const minioClient = new Minio.Client(minioConfig);

/**
 * Default bucket names for the application
 */
const buckets = {
  HOTEL_IMAGES: process.env.MINIO_BUCKET_HOTEL_IMAGES || "hotel-images",
  ROOM_IMAGES: process.env.MINIO_BUCKET_ROOM_IMAGES || "room-images",
  USER_PROFILES: process.env.MINIO_BUCKET_USER_PROFILES || "user-profiles",
  DESTINATION_IMAGES:
    process.env.MINIO_BUCKET_DESTINATION_IMAGES || "destination-images",
  DOCUMENTS: process.env.MINIO_BUCKET_DOCUMENTS || "documents",
};

/**
 * Initialize all required buckets
 * Creates buckets if they don't exist
 */
const initializeBuckets = async () => {
  try {
    for (const [key, bucketName] of Object.entries(buckets)) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
        console.log(`✅ Bucket created: ${bucketName}`);

        // Set public read policy for all buckets
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`✅ Public read policy set for: ${bucketName}`);
      } else {
        console.log(`✓ Bucket already exists: ${bucketName}`);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing MinIO buckets:", error);
    throw error;
  }
};

module.exports = {
  minioClient,
  minioConfig,
  buckets,
  initializeBuckets,
};
