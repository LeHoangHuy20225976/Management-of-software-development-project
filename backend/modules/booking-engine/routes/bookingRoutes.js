const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');
const bookingValidation = require('../../../kernels/validations/bookingValidation');
const middlewares = require('../../../kernels/middlewares');
const authMiddleware = require('../../../kernels/middlewares/authMiddleware');
const rbacMiddleware = require('../../../kernels/middlewares/rbacMiddleware');

/**
 * Booking Engine Routes
 * Base path: /bookings
 * 
 * Permissions from rolePermissions.js:
 * - customer: booking:create, booking:view_own, booking:update_own, booking:cancel_own,
 *             booking:check_availability, booking:calculate_price, booking:view_available_rooms
 * - hotel_manager: booking:view_for_hotel, booking:update_status, booking:checkin, booking:checkout
 * - admin: booking:view_all, booking:update_status, booking:cancel_any
 */

// Get available rooms for a hotel (customer can search)
router.get(
  '/available-rooms/:hotelId',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_available_rooms'])]),
  bookingValidation.getAvailableRooms,
  bookingController.getAvailableRooms
);

// Check room availability (customer can check)
router.post(
  '/check-availability',
  middlewares([authMiddleware, rbacMiddleware(['booking:check_availability'])]),
  bookingValidation.checkAvailability,
  bookingController.checkAvailability
);

// Calculate booking price (customer can calculate)
router.post(
  '/calculate-price',
  middlewares([authMiddleware, rbacMiddleware(['booking:calculate_price'])]),
  bookingValidation.calculatePrice,
  bookingController.calculatePrice
);

// Create a new booking (customer only)
router.post(
  '/',
  middlewares([authMiddleware, rbacMiddleware(['booking:create'])]),
  bookingValidation.createBooking,
  bookingController.createBooking
);

// Get all bookings (admin: all, hotel_manager: their hotel, customer: own)
router.get(
  '/',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_own', 'booking:view_for_hotel', 'booking:view_all'])]),
  bookingController.getBookings
);

// Get specific booking by ID
router.get(
  '/:id',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_own', 'booking:view_for_hotel', 'booking:view_all'])]),
  bookingValidation.bookingId,
  bookingController.getBooking
);

// Update booking (dates, guests) - customer updates own booking
router.put(
  '/:id',
  middlewares([authMiddleware, rbacMiddleware(['booking:update_own'])]),
  bookingValidation.updateBooking,
  bookingController.updateBooking
);

// Update booking status (hotel_manager or admin)
router.patch(
  '/:id/status',
  middlewares([authMiddleware, rbacMiddleware(['booking:update_status'])]),
  bookingValidation.updateBookingStatus,
  bookingController.updateBookingStatus
);

// Cancel booking (customer: own, admin: any)
router.post(
  '/:id/cancel',
  middlewares([authMiddleware, rbacMiddleware(['booking:cancel_own', 'booking:cancel_any'])]),
  bookingValidation.bookingId,
  bookingController.cancelBooking
);

// Check-in booking (hotel_manager only)
router.post(
  '/:id/checkin',
  middlewares([authMiddleware, rbacMiddleware(['booking:checkin'])]),
  bookingValidation.bookingId,
  bookingController.checkInBooking
);

// Check-out booking (hotel_manager only)
router.post(
  '/:id/checkout',
  middlewares([authMiddleware, rbacMiddleware(['booking:checkout'])]),
  bookingValidation.bookingId,
  bookingController.checkOutBooking
);

module.exports = router;

