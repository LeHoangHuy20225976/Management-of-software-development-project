const responseUtils = require("../../../utils/responseUtils");
const UserService = require("../services/UserService");

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
};

module.exports = UserController;
