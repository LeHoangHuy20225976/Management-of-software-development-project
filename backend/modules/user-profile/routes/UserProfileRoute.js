const express = require("express");
const router = express.Router();

const UserController = require("../controller/UserController");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");

/**
 * User Profile Routes
 * Base path: /users
 */

// Public routes
router.get("/", UserController.getAllUsers); // GET /users - Get all users
router.post("/", UserController.createUser); // POST /users - Create a new user

// Protected routes (require authentication)
router.get("/profile", authMiddleware, UserController.getUserById); // GET /users/profile - Get current user's profile
router.put("/profile", authMiddleware, UserController.updateUser); // PUT /users/profile - Update current user's profile
router.delete("/profile", authMiddleware, UserController.deleteUser); // DELETE /users/profile - Delete current user's account
router.get("/bookings", authMiddleware, UserController.getUserBookings); // GET /users/bookings - Get current user's bookings

module.exports = router;
