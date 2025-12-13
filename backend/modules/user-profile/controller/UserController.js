const responseUtils = require("../../../utils/responseUtils");
const UserService = require("../services/UserService");
const minioUtils = require("../../../utils/minioUtils");

const UserController = {
  /**
   * Get all users
   * GET /users
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      return responseUtils.ok(res, users);
    } catch (error) {
      console.error("Get all users error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get current authenticated user's profile
   * GET /users/profile
   * Requires: authMiddleware
   */
  getUserById: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const user = await UserService.getUserById(userId);
      return responseUtils.ok(res, user);
    } catch (error) {
      console.error("Get user by ID error:", error);
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Create a new user
   * POST /users
   */

  // User profile first let to be null ,and will be updated later
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await UserService.createUser(userData);
      return responseUtils.ok(res, newUser);
    } catch (error) {
      console.error("Create user error:", error);
      if (error.message === "User with this email already exists") {
        return responseUtils.invalidated(res, [
          { field: "email", message: error.message },
        ]);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Update current authenticated user's profile
   * PUT /users/profile
   * Requires: authMiddleware
   */
  updateUser: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const userData = req.body;
      const updatedUser = await UserService.updateUser(userId, userData);
      return responseUtils.ok(res, updatedUser);
    } catch (error) {
      console.error("Update user error:", error);
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      if (error.message === "User with this email already exists") {
        return responseUtils.invalidated(res, [
          { field: "email", message: error.message },
        ]);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete current authenticated user's account
   * DELETE /users/profile
   * Requires: authMiddleware
   */
  deleteUser: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const result = await UserService.deleteUser(userId);
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Delete user error:", error);
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get all bookings for current authenticated user
   * GET /users/bookings
   * Requires: authMiddleware
   */
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const bookings = await UserService.getUserBookings(userId);
      return responseUtils.ok(res, bookings);
    } catch (error) {
      console.error("Get user bookings error:", error);
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Upload profile image for current authenticated user
   * POST /users/profile/image
   * Requires: authMiddleware, multer middleware
   *
   * Example route:
   * router.post('/profile/image', authMiddleware, upload.single('image'), UserController.uploadProfileImage);
   */
  uploadProfileImage: async (req, res) => {
    try {
      if (!req.file) {
        return responseUtils.error(res, "No image file provided");
      }

      const userId = req.user.user_id;
      const { buffer, originalname, mimetype } = req.file;

      // Validate file type
      if (!mimetype.startsWith("image/")) {
        return responseUtils.error(res, "Only image files are allowed");
      }

      // Upload to MinIO
      const result = await minioUtils.uploadFile(
        minioUtils.buckets.USER_PROFILES,
        buffer,
        originalname,
        { "Content-Type": mimetype }
      );

      // Update user profile with new image URL
      await UserService.updateUser(userId, {
        profile_image: result.url,
      });

      return responseUtils.ok(res, {
        message: "Profile image uploaded successfully",
        profile_image: result.url,
      });
    } catch (error) {
      console.error("Upload profile image error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Delete profile image for current authenticated user
   * DELETE /users/profile/image
   * Requires: authMiddleware
   */
  deleteProfileImage: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const user = await UserService.getUserById(userId);

      if (!user.profile_image) {
        return responseUtils.error(res, "No profile image to delete");
      }

      // Extract filename from URL
      const url = new URL(user.profile_image);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];

      // Delete from MinIO
      const exists = await minioUtils.fileExists(
        minioUtils.buckets.USER_PROFILES,
        fileName
      );

      if (exists) {
        await minioUtils.deleteFile(minioUtils.buckets.USER_PROFILES, fileName);
      }

      // Update user profile to remove image URL
      await UserService.updateUser(userId, { profile_image: null });

      return responseUtils.ok(res, {
        message: "Profile image deleted successfully",
      });
    } catch (error) {
      console.error("Delete profile image error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get profile image URL for current authenticated user
   * GET /users/profile/image
   * Requires: authMiddleware
   */
  getProfileImage: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const user = await UserService.getUserById(userId);

      if (!user.profile_image) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, {
        profile_image: user.profile_image,
      });
    } catch (error) {
      console.error("Get profile image error:", error);
      return responseUtils.error(res, error.message);
    }
  },
};

module.exports = UserController;
