require("express-router-group");
const express = require("express");
const router = express.Router({ mergeParams: true });

const authController = require("../modules/auth/controller/authController");
const manageTokenController = require("../modules/auth/controller/manageTokenController");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");

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

module.exports = router;
