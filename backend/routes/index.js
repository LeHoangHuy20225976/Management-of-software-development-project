const express = require("express");
const router = express.Router({ mergeParams: true });

const authRoutes = require("../modules/auth/routes/authRoutes");
const hotelProfileRoutes = require("../modules/hotel-profile/routes/hotelProfileRoutes");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");
const paymentRoutes = require("../modules/payment-gateway/routes/paymentRoutes");
const userProfileRoutes = require("../modules/user-profile/routes/UserProfileRoute");
const destinationRoutes = require("../modules/tourism-cms/routes/DestinationRoutes");
const notificationRoutes = require("../modules/notification/routes/notificationRoutes");
const pricingEngineRoutes = require("../modules/pricing-engine/routes/pricingEngineRoutes");
const roomInventoryRoutes = require("../modules/room-inventory/routes/roomInventoryRoutes");
const synchronizationRoutes = require("../modules/synchronization/routes/synchronizationRoutes");
const adminRoutes = require("../modules/super-admin/routes/adminRoutes");
// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// API v1 routes
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/hotel-profile", hotelProfileRoutes);
router.use("/api/v1/bookings", bookingRoutes);

// Payment Gateway routes
router.use("/payments", paymentRoutes);
router.use("/api/v1/users", userProfileRoutes);
router.use("/api/v1/destinations", destinationRoutes);
router.use("/api/v1/notifications", notificationRoutes);
router.use("/api/v1/pricing", pricingEngineRoutes);
router.use("/api/v1/rooms", roomInventoryRoutes);
router.use("/api/v1/sync", synchronizationRoutes);
router.use("/api/v1/admin", adminRoutes);

module.exports = router;
