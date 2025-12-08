require("express-router-group");
const express = require("express");
const router = express.Router({ mergeParams: true });

const authController = require("../modules/auth/controller/authController");
const manageTokenController = require("../modules/auth/controller/manageTokenController");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");
const roomInventoryRoutes = require("../modules/room-inventory/routes/roomInventoryRoutes");
const pricingEngineRoutes = require("../modules/pricing-engine/routes/pricingEngineRoutes");
const synchronizationRoutes = require("../modules/synchronization/routes/synchronizationRoutes");

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Auth routes
router.group('/auth', (router) => {
  router.post('/login', authController.login);
  router.post('/register', authController.register);
  router.post('/refresh-tokens', manageTokenController.refreshTokens);
});

// Booking Engine routes
router.use('/bookings', bookingRoutes);

// Room & Inventory routes
router.use('/rooms', roomInventoryRoutes);

// Pricing Engine routes
router.use('/pricing', pricingEngineRoutes);

// Synchronization routes
router.use('/sync', synchronizationRoutes);

module.exports = router;
