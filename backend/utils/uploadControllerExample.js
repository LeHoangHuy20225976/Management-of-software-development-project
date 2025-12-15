const minioUtils = require("../../../utils/minioUtils");
const responseUtils = require("../../../utils/responseUtils");

/**
 * Example File Upload Controller
 * Demonstrates how to use MinIO for file uploads
 */
const uploadController = {
  /**
   * Upload a single file to MinIO
   * POST /upload/single
   *
   * Example with Multer middleware:
   * router.post('/single', upload.single('file'), uploadController.uploadSingle);
   */
  uploadSingle: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.error(res, "No file provided");
      }

      const { buffer, originalname, mimetype } = req.file;

      // Choose bucket based on file type or route
      const bucketName = minioUtils.buckets.HOTEL_IMAGES;

      const result = await minioUtils.uploadFile(
        bucketName,
        buffer,
        originalname,
        { "Content-Type": mimetype }
      );

      return responseUtils.ok(res, {
        message: "File uploaded successfully",
        file: result,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Upload multiple files to MinIO
   * POST /upload/multiple
   *
   * Example with Multer middleware:
   * router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);
   */
  uploadMultiple: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return responseUtils.error(res, "No files provided");
      }

      const bucketName = minioUtils.buckets.HOTEL_IMAGES;
      const uploadPromises = req.files.map((file) =>
        minioUtils.uploadFile(bucketName, file.buffer, file.originalname, {
          "Content-Type": file.mimetype,
        })
      );

      const results = await Promise.all(uploadPromises);

      return responseUtils.ok(res, {
        message: "Files uploaded successfully",
        files: results,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get file URL from MinIO
   * GET /upload/file/:bucket/:filename
   */
  getFileUrl: async (req, res) => {
    try {
      const { bucket, filename } = req.params;

      const exists = await minioUtils.fileExists(bucket, filename);
      if (!exists) {
        return responseUtils.notFound(res);
      }

      const url = await minioUtils.getFileUrl(bucket, filename);

      return responseUtils.ok(res, { url });
    } catch (error) {
      console.error("Get URL error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete file from MinIO
   * DELETE /upload/file/:bucket/:filename
   */
  deleteFile: async (req, res) => {
    try {
      const { bucket, filename } = req.params;

      const exists = await minioUtils.fileExists(bucket, filename);
      if (!exists) {
        return responseUtils.notFound(res);
      }

      await minioUtils.deleteFile(bucket, filename);

      return responseUtils.ok(res, { message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * List all files in a bucket
   * GET /upload/files/:bucket
   */
  listFiles: async (req, res) => {
    try {
      const { bucket } = req.params;
      const { prefix } = req.query;

      const files = await minioUtils.listFiles(bucket, prefix);

      return responseUtils.ok(res, { files });
    } catch (error) {
      console.error("List files error:", error);
      return responseUtils.error(res, error.message);
    }
  },
};

module.exports = uploadController;
