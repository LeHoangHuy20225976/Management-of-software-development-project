const express = require("express");
const router = express.Router({ mergeParams: true });

const authRoutes = require("../modules/auth/routes/authRoutes");
const hotelProfileRoutes = require("../modules/hotel-profile/routes/hotelProfileRoutes");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");
const paymentRoutes = require("../modules/payment-gateway/routes/paymentRoutes");
const userProfileRoutes = require("../modules/user-profile/routes/UserProfileRoute");
const destinationRoutes = require("../modules/tourism-cms/routes/DestinationRoutes");
const notificationRoutes = require("../modules/notification/routes/notificationRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Auth routes
router.use("/auth", authRoutes);

// Hotel Profile routes
router.use("/hotel-profile", hotelProfileRoutes);

// Booking Engine routes
router.use("/bookings", bookingRoutes);

// Payment Gateway routes
router.use("/payments", paymentRoutes);

// User Profile routes
router.use("/users", userProfileRoutes);

// Tourism CMS routes
router.use("/destinations", destinationRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

module.exports = router;
