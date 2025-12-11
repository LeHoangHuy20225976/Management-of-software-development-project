require("express-router-group");
const express = require("express");
const router = express.Router({ mergeParams: true });

const middlewares = require("../kernels/middlewares");
const authMiddleware = require("../kernels/middlewares/authMiddleware");
const rbacMiddleware = require("../kernels/middlewares/rbacMiddleware");
const { validate } = require("../kernels/validations");
const authValidation = require("../kernels/validations/authValidation");
const hotelProfileValidation = require("../kernels/validations/hotelProfileValidation");
const authController = require("../modules/auth/controller/authController");
const manageTokenController = require("../modules/auth/controller/manageTokenController");
const hotelProfileController = require("../modules/hotel-profile/controller/hotelProfileController");
const bookingRoutes = require("../modules/booking-engine/routes/bookingRoutes");
const adminRoutes = require("../modules/super-admin/routes/adminRoutes");


// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

// Auth routes
router.group('/auth', (router) => {
  router.post('/login', authValidation.login, authController.login);
  router.post('/register', authValidation.register, authController.register);
  router.post('/refresh-tokens', manageTokenController.refreshTokens);
  router.post('/logout', middlewares([authMiddleware]), authController.logout);
  router.post('/verify-forget-password', authValidation.verifyForgetPassword, authController.verifyResetForgetPassword);
  router.post('/reset-password', middlewares([authMiddleware]), authValidation.resetPassword, authController.resetPassword);
  router.post('/reset-forget-password', authValidation.resetForgetPassword, authController.resetForgetPassword);
});

// Hotel Profile routes
router.group('/hotel-profile', (router) => {
  router.post('/add-hotel', middlewares([authMiddleware]), hotelProfileValidation.addHotel, hotelProfileController.addNewHotel);
  router.post('/add-room-type', middlewares([authMiddleware, rbacMiddleware(['room:create'])]), hotelProfileValidation.addRoomType, hotelProfileController.addTypeForHotel);
  router.post('/add-room', middlewares([authMiddleware, rbacMiddleware(['room:create'])]), hotelProfileValidation.addRoom, hotelProfileController.addRoom);
  router.get('/view-hotel/:hotel_id', hotelProfileValidation.viewHotel, hotelProfileController.viewHotelProfile);
  router.put('/update-hotel/:hotel_id', middlewares([authMiddleware, rbacMiddleware(['hotel:update'])]), hotelProfileValidation.updateHotel, hotelProfileController.updateHotelProfile);
  router.delete('/delete-hotel/:hotel_id', middlewares([authMiddleware, rbacMiddleware(['hotel:update'])]), hotelProfileValidation.deleteHotel, hotelProfileController.disableHotel);
  router.post('/add-facility/:hotel_id', middlewares([authMiddleware, rbacMiddleware(['hotel:update'])]), hotelProfileValidation.addFacility, hotelProfileController.addFacilityForHotel);
  router.put('/update-price', middlewares([authMiddleware, rbacMiddleware(['room:update'])]), hotelProfileValidation.updatePrice, hotelProfileController.updatePriceForRoomType);
  router.get('/view-room-types/:hotel_id', hotelProfileValidation.viewRoomTypes, hotelProfileController.getAllTypeForHotel);
  router.get('/view-all-rooms/:hotel_id', hotelProfileValidation.viewAllRooms, hotelProfileController.getAllRoomsForHotel);
  router.get('/all-rooms', hotelProfileController.getAllRooms);
});

// Booking Engine routes
router.use('/bookings', bookingRoutes);

// Super Admin routes
router.use('/admin', adminRoutes);

module.exports = router;
