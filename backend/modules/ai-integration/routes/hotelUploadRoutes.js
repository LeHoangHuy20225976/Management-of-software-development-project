const express = require('express');
const router = express.Router();
const multer = require('multer');
const hotelUploadController = require('../controller/hotelUploadController');
const authenticate = require('../../../kernels/middlewares/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 20 // Max 20 files at once
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Only images (JPG, PNG, WEBP) and documents (PDF, DOCX, DOC, TXT) are accepted.`));
    }
  }
});

/**
 * @route POST /api/v1/hotel/:hotel_id/images/upload
 * @desc Upload multiple images for a hotel (with CLIP embeddings)
 * @access Private (requires authentication)
 */
router.post(
  '/:hotel_id/images/upload',
  authenticate,
  upload.array('files', 20),
  hotelUploadController.uploadImages
);

/**
 * @route POST /api/v1/hotel/:hotel_id/documents/upload
 * @desc Upload a document for a hotel (for RAG indexing)
 * @access Private (requires authentication)
 */
router.post(
  '/:hotel_id/documents/upload',
  authenticate,
  upload.single('file'),
  hotelUploadController.uploadDocument
);

/**
 * @route GET /api/v1/hotel/:hotel_id/images
 * @desc List all images for a hotel
 * @access Public
 */
router.get(
  '/:hotel_id/images',
  hotelUploadController.listImages
);

/**
 * @route GET /api/v1/hotel/:hotel_id/documents
 * @desc List all documents for a hotel
 * @access Public
 */
router.get(
  '/:hotel_id/documents',
  hotelUploadController.listDocuments
);

/**
 * @route DELETE /api/v1/hotel/:hotel_id/images/:image_id
 * @desc Delete a hotel image
 * @access Private (requires authentication)
 */
router.delete(
  '/:hotel_id/images/:image_id',
  authenticate,
  hotelUploadController.deleteImage
);

/**
 * @route DELETE /api/v1/hotel/:hotel_id/documents/:document_id
 * @desc Delete a hotel document
 * @access Private (requires authentication)
 */
router.delete(
  '/:hotel_id/documents/:document_id',
  authenticate,
  hotelUploadController.deleteDocument
);

/**
 * @route GET /api/v1/hotel/:hotel_id/upload-stats
 * @desc Get upload statistics for a hotel
 * @access Public
 */
router.get(
  '/:hotel_id/upload-stats',
  hotelUploadController.getUploadStats
);

module.exports = router;
