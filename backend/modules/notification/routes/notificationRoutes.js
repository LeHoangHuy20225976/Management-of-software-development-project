const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const authMiddleware = require("../../../kernels/middlewares/authMiddleware");

/**
 * Notification Routes
 * Base path: /notifications
 */

// Test email endpoint (can be protected with authMiddleware)
router.post("/test", notificationController.sendTestEmail);

// Notification endpoints (these would typically be called internally by other services)
router.post(
  "/booking-confirmation",
  notificationController.sendBookingConfirmation
);
router.post(
  "/booking-cancellation",
  notificationController.sendBookingCancellation
);
router.post("/password-reset", notificationController.sendPasswordReset);
router.post("/welcome", notificationController.sendWelcomeEmail);
router.post(
  "/payment-confirmation",
  notificationController.sendPaymentConfirmation
);

module.exports = router;
