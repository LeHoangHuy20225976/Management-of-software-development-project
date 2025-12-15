const express = require("express");
const router = express.Router({ mergeParams: true });

const authRoutes = require("../modules/auth/routes/authRoutes");
const hotelProfileRoutes = require("../modules/hotel-profile/routes/hotelProfileRoutes");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");
const userProfileRoutes = require("../modules/user-profile/routes/UserProfileRoute");
const destinationRoutes = require("../modules/tourism-cms/routes/DestinationRoutes");
const roomInventoryRoutes = require("../modules/room-inventory/routes/roomInventoryRoutes");
const pricingEngineRoutes = require("../modules/pricing-engine/routes/pricingEngineRoutes");
const synchronizationRoutes = require("../modules/synchronization/routes/synchronizationRoutes");
const adminRoutes = require("../modules/super-admin/routes/adminRoutes");
const paymentRoutes = require("../modules/payment-gateway/routes/paymentRoutes");


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

// User Profile routes
router.use("/users", userProfileRoutes);

// Tourism CMS routes
router.use("/destinations", destinationRoutes);

// Room & Inventory routes
router.use('/rooms', roomInventoryRoutes);

// Pricing Engine routes
router.use('/pricing', pricingEngineRoutes);

// Synchronization routes
router.use('/sync', synchronizationRoutes);
// Super Admin routes
router.use('/admin', adminRoutes);

// Payment Gateway routes
router.use('/payments', paymentRoutes);

module.exports = router;
