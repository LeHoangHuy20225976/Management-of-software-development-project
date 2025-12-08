require("express-router-group");
const express = require("express");
const router = express.Router({ mergeParams: true });

const middlewares = require("../kernels/middlewares");
const authMiddleware = require("../kernels/middlewares/authMiddleware");
const rbacMiddleware = require("../kernels/middlewares/rbacMiddleware");
const authController = require("../modules/auth/controller/authController");
const manageTokenController = require("../modules/auth/controller/manageTokenController");
const hotelProfileController = require("../modules/hotel-profile/controller/hotelProfileController");
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
  router.post('/logout', middlewares([authMiddleware]),authController.logout);
  router.post('/verify-forget-password', authController.verifyResetForgetPassword);
  router.post('/reset-password', middlewares([authMiddleware]), authController.resetPassword);
  router.post('/reset-forget-password', authController.resetForgetPassword);
});

// Hotel Profile routes
router.group('/hotel-profile', (router) => {
  router.post('/add-hotel', middlewares([authMiddleware]), hotelProfileController.addNewHotel);
  router.post('/add-room-type', middlewares([authMiddleware, rbacMiddleware(['room:create'])]), hotelProfileController.addTypeForHotel);
  router.post('/add-room', middlewares([authMiddleware, rbacMiddleware(['room:create'])]), hotelProfileController.addRoom);
  router.get('/view-hotel/:hotel_id',  hotelProfileController.viewHotelProfile);
  router.put('/update-hotel/:hotel_id', middlewares([authMiddleware, rbacMiddleware(['hotel:update'])]), hotelProfileController.updateHotelProfile);
  router.delete('/delete-hotel/:hotel_id', middlewares([authMiddleware, rbacMiddleware(['hotel:update'])]), hotelProfileController.disableHotel);
});

// Booking Engine routes
router.use('/bookings', bookingRoutes);

module.exports = router;
