const { minioClient, buckets } = require("../configs/minio");
const crypto = require("crypto");
const path = require("path");

/**
 * MinIO Utility Functions
 * Helper functions for file upload, download, and management
 */

const minioUtils = {
  /**
   * Generate unique filename with timestamp and random hash
   * @param {string} originalName - Original filename
   * @returns {string} Unique filename
   */
  generateUniqueFileName: (originalName) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${baseName}-${timestamp}-${randomString}${ext}`;
  },

  /**
   * Upload file to MinIO bucket
   * @param {string} bucketName - Target bucket name
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - File name
   * @param {object} metadata - Optional metadata
   * @returns {Promise<object>} Upload result with URL
   */
  uploadFile: async (bucketName, fileBuffer, fileName, metadata = {}) => {
    try {
      const uniqueFileName = minioUtils.generateUniqueFileName(fileName);

      await minioClient.putObject(
        bucketName,
        uniqueFileName,
        fileBuffer,
        fileBuffer.length,
        metadata
      );

      const url = await minioUtils.getFileUrl(bucketName, uniqueFileName);

      return {
        success: true,
        fileName: uniqueFileName,
        url,
        bucketName,
      };
    } catch (error) {
      console.error("MinIO upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  },

  /**
   * Get presigned URL for file access (expires in 7 days)
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @param {number} expiry - Expiry time in seconds (default: 7 days)
   * @returns {Promise<string>} Presigned URL
   */
  getFileUrl: async (bucketName, fileName, expiry = 7 * 24 * 60 * 60) => {
    try {
      const url = await minioClient.presignedGetObject(
        bucketName,
        fileName,
        expiry
      );
      return url;
    } catch (error) {
      console.error("MinIO get URL error:", error);
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  },

  /**
   * Download file from MinIO
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise<Buffer>} File buffer
   */
  downloadFile: async (bucketName, fileName) => {
    try {
      const chunks = [];
      const stream = await minioClient.getObject(bucketName, fileName);

      return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    } catch (error) {
      console.error("MinIO download error:", error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  },

  /**
   * Delete file from MinIO
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise<boolean>} Success status
   */
  deleteFile: async (bucketName, fileName) => {
    try {
      await minioClient.removeObject(bucketName, fileName);
      return true;
    } catch (error) {
      console.error("MinIO delete error:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },

  /**
   * List all files in a bucket
   * @param {string} bucketName - Bucket name
   * @param {string} prefix - Optional prefix filter
   * @returns {Promise<Array>} List of files
   */
  listFiles: async (bucketName, prefix = "") => {
    try {
      const files = [];
      const stream = minioClient.listObjects(bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on("data", (obj) => files.push(obj));
        stream.on("end", () => resolve(files));
        stream.on("error", reject);
      });
    } catch (error) {
      console.error("MinIO list files error:", error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  },

  /**
   * Check if file exists in bucket
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise<boolean>} File exists status
   */
  fileExists: async (bucketName, fileName) => {
    try {
      await minioClient.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  },

  /**
   * Get file metadata
   * @param {string} bucketName - Bucket name
   * @param {string} fileName - File name
   * @returns {Promise<object>} File metadata
   */
  getFileMetadata: async (bucketName, fileName) => {
    try {
      const stat = await minioClient.statObject(bucketName, fileName);
      return {
        size: stat.size,
        lastModified: stat.lastModified,
        etag: stat.etag,
        contentType: stat.metaData["content-type"],
      };
    } catch (error) {
      console.error("MinIO get metadata error:", error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  },

  /**
   * Buckets available in the application
   */
  buckets,
};

module.exports = minioUtils;
