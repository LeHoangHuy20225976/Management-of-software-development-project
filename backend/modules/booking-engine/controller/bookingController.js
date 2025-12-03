const bookingService = require('../services/bookingService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Booking Controller
 * Handles HTTP requests for booking operations
 */
class BookingController {
  /**
   * Create a new booking
   * POST /api/v1/bookings
   */
  async createBooking(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { user_id, room_id, check_in_date, check_out_date, people } = req.body;

      const result = await bookingService.createBooking({
        user_id,
        room_id,
        check_in_date,
        check_out_date,
        people
      });

      return responseUtils.ok(res, {
        message: 'Booking created successfully',
        booking: result.booking,
        pricing: result.pricing
      });
    } catch (error) {
      console.error('Create booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get booking by ID
   * GET /api/v1/bookings/:id
   */
  async getBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await bookingService.getBookingById(parseInt(id));

      if (!booking) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { booking });
    } catch (error) {
      console.error('Get booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get all bookings with optional filters
   * GET /api/v1/bookings
   * Query params: user_id, room_id, hotel_id, status, check_in_from, check_in_to, limit, offset
   */
  async getBookings(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
        room_id: req.query.room_id ? parseInt(req.query.room_id) : undefined,
        hotel_id: req.query.hotel_id ? parseInt(req.query.hotel_id) : undefined,
        status: req.query.status,
        check_in_from: req.query.check_in_from,
        check_in_to: req.query.check_in_to,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await bookingService.getBookings(filters);

      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get bookings error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Update booking status
   * PATCH /api/v1/bookings/:id/status
   */
  async updateBookingStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.user_id; // Assuming auth middleware sets req.user

      const booking = await bookingService.updateBookingStatus(
        parseInt(id),
        status,
        userId
      );

      return responseUtils.ok(res, {
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Cancel a booking
   * POST /api/v1/bookings/:id/cancel
   */
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.user_id || req.body.user_id; // Fallback for testing
      const role = req.user?.role || req.body.role || 'customer'; // Fallback for testing

      if (!userId) {
        return responseUtils.unauthorized(res, 'User authentication required');
      }

      const booking = await bookingService.cancelBooking(
        parseInt(id),
        userId,
        role
      );

      return responseUtils.ok(res, {
        message: 'Booking cancellation processed',
        booking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Update booking details (dates, guests)
   * PUT /api/v1/bookings/:id
   */
  async updateBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { check_in_date, check_out_date, people } = req.body;

      const booking = await bookingService.updateBooking(parseInt(id), {
        check_in_date,
        check_out_date,
        people
      });

      return responseUtils.ok(res, {
        message: 'Booking updated successfully',
        booking
      });
    } catch (error) {
      console.error('Update booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Check-in a booking
   * POST /api/v1/bookings/:id/checkin
   */
  async checkInBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await bookingService.checkInBooking(parseInt(id));

      return responseUtils.ok(res, {
        message: 'Booking checked in successfully',
        booking
      });
    } catch (error) {
      console.error('Check-in booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Check-out a booking
   * POST /api/v1/bookings/:id/checkout
   */
  async checkOutBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await bookingService.checkOutBooking(parseInt(id));

      return responseUtils.ok(res, {
        message: 'Booking checked out successfully',
        booking
      });
    } catch (error) {
      console.error('Check-out booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Check room availability
   * POST /api/v1/bookings/check-availability
   */
  async checkAvailability(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { room_id, check_in_date, check_out_date } = req.body;

      const availability = await bookingService.checkRoomAvailability(
        room_id,
        check_in_date,
        check_out_date
      );

      return responseUtils.ok(res, availability);
    } catch (error) {
      console.error('Check availability error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get available rooms for a hotel
   * GET /api/v1/bookings/available-rooms/:hotelId
   * Query params: check_in_date, check_out_date, guests
   */
  async getAvailableRooms(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { hotelId } = req.params;
      const { check_in_date, check_out_date, guests = 1 } = req.query;

      const availableRooms = await bookingService.getAvailableRooms(
        parseInt(hotelId),
        check_in_date,
        check_out_date,
        parseInt(guests)
      );

      return responseUtils.ok(res, {
        hotel_id: parseInt(hotelId),
        check_in_date,
        check_out_date,
        guests: parseInt(guests),
        available_rooms: availableRooms,
        count: availableRooms.length
      });
    } catch (error) {
      console.error('Get available rooms error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Calculate booking price
   * POST /api/v1/bookings/calculate-price
   */
  async calculatePrice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { type_id, check_in_date, check_out_date } = req.body;

      const pricing = await bookingService.calculateBookingPrice(
        type_id,
        check_in_date,
        check_out_date
      );

      return responseUtils.ok(res, pricing);
    } catch (error) {
      console.error('Calculate price error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new BookingController();

