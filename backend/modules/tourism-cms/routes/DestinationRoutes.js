const express = require("express");
const router = express.Router();
const multer = require("multer");

const DestinationController = require("../controller/DestinationController");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for destinations
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Destination Routes
 * Base path: /destinations
 */

// Public routes
router.get("/", DestinationController.getAllDestinations); // GET /destinations - Get all destinations
router.get("/search", DestinationController.searchDestinations); // GET /destinations/search?q= - Search destinations
router.get("/type/:type", DestinationController.getDestinationsByType); // GET /destinations/type/:type - Get by type
router.get("/:id", DestinationController.getDestinationById); // GET /destinations/:id - Get destination by ID

// Admin routes (có thể thêm authMiddleware sau)
router.post("/", DestinationController.createDestination); // POST /destinations - Create destination
router.put("/:id", DestinationController.updateDestination); // PUT /destinations/:id - Update destination
router.delete("/:id", DestinationController.deleteDestination); // DELETE /destinations/:id - Delete destination

// Review routes for destinations
router.post(
  "/:id/reviews",
  authMiddleware,
  DestinationController.addDestinationReview
); // POST /destinations/:id/reviews - Add review for destination

// Image upload routes
router.post(
  "/:id/thumbnail",
  upload.single("thumbnail"),
  DestinationController.uploadThumbnail
); // POST /destinations/:id/thumbnail - Upload thumbnail
router.delete("/:id/thumbnail", DestinationController.deleteThumbnail); // DELETE /destinations/:id/thumbnail - Delete thumbnail

router.get("/:id/images", DestinationController.getDestinationImages); // GET /destinations/:id/images - Get all images for destination
router.post(
  "/:id/images",
  upload.single("image"),
  DestinationController.uploadImage
); // POST /destinations/:id/images - Upload single image
router.delete(
  "/:id/images/:imageId",
  DestinationController.deleteDestinationImage
); // DELETE /destinations/:id/images/:imageId - Delete specific image

module.exports = router;
