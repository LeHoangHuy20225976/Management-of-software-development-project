const express = require("express");
const router = express.Router();
const multer = require("multer");

const UserController = require("../controller/UserController");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
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

// Profile image routes
router.post(
  "/profile/image",
  authMiddleware,
  upload.single("image"),
  UserController.uploadProfileImage
); // POST /users/profile/image - Upload profile image
router.get("/profile/image", authMiddleware, UserController.getProfileImage); // GET /users/profile/image - Get profile image URL
router.delete(
  "/profile/image",
  authMiddleware,
  UserController.deleteProfileImage
); // DELETE /users/profile/image - Delete profile image

module.exports = router;
