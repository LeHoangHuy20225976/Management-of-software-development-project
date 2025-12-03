const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');
const bookingValidation = require('../../../kernels/validations/bookingValidation');

/**
 * Booking Engine Routes
 * Base path: /bookings
 */

// Get available rooms for a hotel
router.get(
  '/available-rooms/:hotelId',
  bookingValidation.getAvailableRooms,
  bookingController.getAvailableRooms
);

// Check room availability
router.post(
  '/check-availability',
  bookingValidation.checkAvailability,
  bookingController.checkAvailability
);

// Calculate booking price
router.post(
  '/calculate-price',
  bookingValidation.calculatePrice,
  bookingController.calculatePrice
);

// Create a new booking
router.post(
  '/',
  bookingValidation.createBooking,
  bookingController.createBooking
);

// Get all bookings (with filters)
router.get('/', bookingController.getBookings);

// Get specific booking by ID
router.get(
  '/:id',
  bookingValidation.bookingId,
  bookingController.getBooking
);

// Update booking (dates, guests)
router.put(
  '/:id',
  bookingValidation.updateBooking,
  bookingController.updateBooking
);

// Update booking status
router.patch(
  '/:id/status',
  bookingValidation.updateBookingStatus,
  bookingController.updateBookingStatus
);

// Cancel booking
router.post(
  '/:id/cancel',
  bookingValidation.bookingId,
  bookingController.cancelBooking
);

// Check-in booking
router.post(
  '/:id/checkin',
  bookingValidation.bookingId,
  bookingController.checkInBooking
);

// Check-out booking
router.post(
  '/:id/checkout',
  bookingValidation.bookingId,
  bookingController.checkOutBooking
);

module.exports = router;

