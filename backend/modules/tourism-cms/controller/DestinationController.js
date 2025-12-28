const responseUtils = require("../../../utils/responseUtils");
const DestinationService = require("../services/DestinationService");
const minioUtils = require("../../../utils/minioUtils");

const DestinationController = {
  /**
   * Get all destinations
   * GET /destinations
   */
  getAllDestinations: async (req, res) => {
    try {
      const destinations = await DestinationService.getAllDestinations();
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Get all destinations error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get destination by ID
   * GET /destinations/:id
   */
  getDestinationById: async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await DestinationService.getDestinationById(id);
      return responseUtils.ok(res, destination);
    } catch (error) {
      console.error("Get destination by ID error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Create a new destination
   * POST /destinations
   */
  createDestination: async (req, res) => {
    try {
      const destinationData = req.body;
      const newDestination = await DestinationService.createDestination(
        destinationData
      );
      return responseUtils.ok(res, newDestination);
    } catch (error) {
      console.error("Create destination error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update destination by ID
   * PUT /destinations/:id
   */
  updateDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const destinationData = req.body;
      const updatedDestination = await DestinationService.updateDestination(
        id,
        destinationData
      );
      return responseUtils.ok(res, updatedDestination);
    } catch (error) {
      console.error("Update destination error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete destination by ID
   * DELETE /destinations/:id
   */
  deleteDestination: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await DestinationService.deleteDestination(id);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Delete destination error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Search destinations by name or location
   * GET /destinations/search?q=query
   */
  searchDestinations: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return responseUtils.invalidated(res, [
          { field: "q", message: "Search query is required" },
        ]);
      }
      const destinations = await DestinationService.searchDestinations(q);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Search destinations error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get destinations by type
   * GET /destinations/type/:type
   */
  getDestinationsByType: async (req, res) => {
    try {
      const { type } = req.params;
      const destinations = await DestinationService.getDestinationsByType(type);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Get destinations by type error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Upload thumbnail image for destination
   * POST /destinations/:id/thumbnail
   * Requires: multer middleware
   *
   * Example route:
   * router.post('/:id/thumbnail', upload.single('thumbnail'), DestinationController.uploadThumbnail);
   */
  uploadThumbnail: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.error(res, "No thumbnail image provided");
      }

      const { id } = req.params;
      const { buffer, originalname, mimetype } = req.file;

      // Validate file type
      if (!mimetype.startsWith("image/")) {
        return responseUtils.error(res, "Only image files are allowed");
      }

      // Upload to MinIO
      const result = await minioUtils.uploadFile(
        minioUtils.buckets.DESTINATION_IMAGES,
        buffer,
        originalname,
        { "Content-Type": mimetype }
      );

      // Update destination thumbnail URL
      await DestinationService.updateDestination(id, {
        thumbnail: result.url,
      });
      console.log(result.url);

      return responseUtils.ok(res, {
        message: "Thumbnail uploaded successfully",
        thumbnail: result.url,
      });
    } catch (error) {
      console.error("Upload thumbnail error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Upload a single image for destination
   * POST /destinations/:id/images
   * Requires: multer middleware
   *
   * Example route:
   * router.post('/:id/images', upload.single('image'), DestinationController.uploadImage);
   */
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.error(res, "No image provided");
      }

      const { id } = req.params;
      const { buffer, originalname, mimetype } = req.file;

      // Verify destination exists
      await DestinationService.getDestinationById(id);

      // Validate file type
      if (!mimetype.startsWith("image/")) {
        return responseUtils.error(res, "Only image files are allowed");
      }

      // Upload to MinIO
      const result = await minioUtils.uploadFile(
        minioUtils.buckets.DESTINATION_IMAGES,
        buffer,
        originalname,
        { "Content-Type": mimetype }
      );

      // Save image URL to Image table
      const image = await DestinationService.addDestinationImages(id, [
        result.url,
      ]);

      return responseUtils.ok(res, {
        message: "Image uploaded successfully",
        image: image[0],
      });
    } catch (error) {
      console.error("Upload image error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get all images for a destination
   * GET /destinations/:id/images
   */
  getDestinationImages: async (req, res) => {
    try {
      const { id } = req.params;

      // Verify destination exists
      await DestinationService.getDestinationById(id);

      // Get all images
      const images = await DestinationService.getDestinationImages(id);

      return responseUtils.ok(res, images);
    } catch (error) {
      console.error("Get destination images error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get all reviews for a destination
   * GET /destinations/:id/reviews
   */
  getDestinationReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await DestinationService.getDestinationReviews(id);
      return responseUtils.ok(res, reviews);
    } catch (error) {
      console.error("Get destination reviews error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Add a review for a destination
   * POST /destinations/:id/reviews
   * Body: { rating, comment }
   * destination_id is taken from params; user_id from auth (req.user); hotel_id and room_id are null
   */
  addDestinationReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (rating === undefined) {
        return responseUtils.invalidated(res, [
          { field: "rating", message: "rating is required" },
        ]);
      }

      const userId = req.user && req.user.user_id;

      if (!userId) {
        return responseUtils.unauthorized(res, "Authentication required");
      }

      const review = await DestinationService.addDestinationReview(id, {
        user_id: userId,
        rating,
        comment,
      });

      review.helpful = 0;
      review.verified = true;

      const result = { ...req.body, ...review };

      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Add destination review error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete destination thumbnail
   * DELETE /destinations/:id/thumbnail
   */
  deleteThumbnail: async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await DestinationService.getDestinationById(id);

      if (!destination.thumbnail) {
        return responseUtils.error(res, "No thumbnail to delete");
      }

      // Extract filename from URL
      const url = new URL(destination.thumbnail);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];

      // Delete from MinIO
      const exists = await minioUtils.fileExists(
        minioUtils.buckets.DESTINATION_IMAGES,
        fileName
      );

      if (exists) {
        await minioUtils.deleteFile(
          minioUtils.buckets.DESTINATION_IMAGES,
          fileName
        );
      }

      // Update destination to remove thumbnail URL
      await DestinationService.updateDestination(id, { thumbnail: null });

      return responseUtils.ok(res, {
        message: "Thumbnail deleted successfully",
      });
    } catch (error) {
      console.error("Delete thumbnail error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete a destination image
   * DELETE /destinations/:id/images/:imageId
   */
  deleteDestinationImage: async (req, res) => {
    try {
      const { id, imageId } = req.params;

      // Get image details
      const image = await DestinationService.getDestinationImage(id, imageId);

      // Extract filename from URL
      const url = new URL(image.image_url);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];

      // Delete from MinIO
      const exists = await minioUtils.fileExists(
        minioUtils.buckets.DESTINATION_IMAGES,
        fileName
      );

      if (exists) {
        await minioUtils.deleteFile(
          minioUtils.buckets.DESTINATION_IMAGES,
          fileName
        );
      }

      // Delete from database
      await DestinationService.deleteDestinationImage(id, imageId);

      return responseUtils.ok(res, {
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Delete image error:", error);
      if (
        error.message === "Destination not found" ||
        error.message === "Image not found"
      ) {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Add destination to user's loving list
   * POST /destinations/:id/loving-list
   * Requires: authMiddleware
   */
  addDestinationToLovingList: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const result = await DestinationService.addDestinationToLovingList(userId, id);
      return responseUtils.ok(res, {
        message: "Destination added to loving list successfully",
        data: result
      });
    } catch (error) {
      console.error("Add destination to loving list error:", error);
      if (error.message === "Destination not found") {
        return responseUtils.notFound(res);
      }
      if (error.message === "Destination already in loving list") {
        return responseUtils.invalidated(res, [
          { field: "destination", message: error.message },
        ]);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Remove destination from user's loving list
   * DELETE /destinations/:id/loving-list
   * Requires: authMiddleware
   */
  removeDestinationFromLovingList: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const result = await DestinationService.removeDestinationFromLovingList(userId, id);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Remove destination from loving list error:", error);
      if (error.message === "Destination not found in loving list") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get user's loving list destinations
   * GET /destinations/loving-list
   * Requires: authMiddleware
   */
  getUserLovingListDestinations: async (req, res) => {
    try {
      const userId = req.user.user_id;
      console.log(userId);
      const destinations = await DestinationService.getUserLovingListDestinations(userId);
      return responseUtils.ok(res, destinations);
    } catch (error) {
      console.error("Get user loving list destinations error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Check if destination is in user's loving list
   * GET /destinations/:id/loving-list/status
   * Requires: authMiddleware
   */
  checkDestinationInLovingList: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const isInList = await DestinationService.isDestinationInLovingList(userId, id);
      return responseUtils.ok(res, { isInLovingList: isInList });
    } catch (error) {
      console.error("Check destination in loving list error:", error);
      return responseUtils.error(res, error.message);
    }
  },
};

module.exports = DestinationController;
