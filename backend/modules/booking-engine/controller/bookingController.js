const bookingService = require('../services/bookingService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Booking Controller
 * Handles HTTP requests for booking operations
 * 
 * Note: req.user is set by authMiddleware and contains the authenticated user
 */
class BookingController {
  /**
   * Create a new booking
   * POST /bookings
   * Requires: booking:create permission (customer)
   */
  async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { room_id, check_in_date, check_out_date, people } = req.body;
      // Use authenticated user's ID from auth middleware
      const userId = req.user.user_id;

      const result = await bookingService.createBooking({
        user_id: userId,
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
   * GET /bookings/:id
   * Requires: booking:view_own, booking:view_for_hotel, or booking:view_all
   */
  async getBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;

      const booking = await bookingService.getBookingById(parseInt(id));

      if (!booking) {
        return responseUtils.notFound(res);
      }

      // Authorization: customer can only view own bookings
      if (userRole === 'customer' && booking.user_id !== userId) {
        return responseUtils.unauthorized(res, 'You can only view your own bookings');
      }

      // Authorization: hotel_manager can only view bookings for their hotels
      if (userRole === 'hotel owner' || userRole === 'hotel_manager') {
        const hotelOwnerId = booking.Room?.RoomType?.Hotel?.hotel_owner;
        if (hotelOwnerId !== userId) {
          return responseUtils.unauthorized(res, 'You can only view bookings for your hotels');
        }
      }

      // Transform booking for frontend
      const transformedBooking = bookingService.transformBookingForFrontend(booking);

      return responseUtils.ok(res, { booking: transformedBooking });
    } catch (error) {
      console.error('Get booking error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get all bookings with optional filters
   * GET /bookings
   * Query params: room_id, hotel_id, status, check_in_from, check_in_to, limit, offset
   * 
   * Authorization:
   * - customer: can only see own bookings
   * - hotel_manager: can see bookings for their hotels
   * - admin: can see all bookings
   */
  async getBookings(req, res) {
    try {
      const userId = req.user.user_id;
      const userRole = req.user.role;

      const filters = {
        room_id: req.query.room_id ? parseInt(req.query.room_id) : undefined,
        hotel_id: req.query.hotel_id ? parseInt(req.query.hotel_id) : undefined,
        status: req.query.status,
        check_in_from: req.query.check_in_from,
        check_in_to: req.query.check_in_to,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      // Role-based filtering
      if (userRole === 'customer') {
        // Customer can only see their own bookings
        filters.user_id = userId;
      } else if (userRole === 'hotel owner' || userRole === 'hotel_manager') {
        // Hotel manager can only see bookings for their hotels
        filters.hotel_owner_id = userId;
      }
      // Admin can see all bookings (no additional filter)

      const result = await bookingService.getBookings(filters);

      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get bookings error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Update booking status
   * PATCH /bookings/:id/status
   * Requires: booking:update_status permission (hotel_manager, admin)
   */
  async updateBookingStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.user_id;
      const userRole = req.user.role;

      // Hotel manager can only update status for their hotel's bookings
      if (userRole === 'hotel owner' || userRole === 'hotel_manager') {
        const existingBooking = await bookingService.getBookingById(parseInt(id));
        if (!existingBooking) {
          return responseUtils.notFound(res);
        }
        const hotelOwnerId = existingBooking.Room?.RoomType?.Hotel?.hotel_owner;
        if (hotelOwnerId !== userId) {
          return responseUtils.unauthorized(res, 'You can only update bookings for your hotels');
        }
      }

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
   * POST /bookings/:id/cancel
   * Requires: booking:cancel_own (customer) or booking:cancel_any (admin)
   */
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;

      const booking = await bookingService.cancelBooking(
        parseInt(id),
        userId,
        userRole
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
   * PUT /bookings/:id
   * Requires: booking:update_own permission (customer can update own booking)
   */
  async updateBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { check_in_date, check_out_date, people } = req.body;
      const userId = req.user.user_id;

      // Verify ownership before updating
      const existingBooking = await bookingService.getBookingById(parseInt(id));
      if (!existingBooking) {
        return responseUtils.notFound(res);
      }
      if (existingBooking.user_id !== userId) {
        return responseUtils.unauthorized(res, 'You can only update your own bookings');
      }

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
   * POST /bookings/:id/checkin
   * Requires: booking:checkin permission (hotel_manager)
   */
  async checkInBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;

      // Hotel manager can only check-in bookings for their hotels
      if (userRole === 'hotel owner' || userRole === 'hotel_manager') {
        const existingBooking = await bookingService.getBookingById(parseInt(id));
        if (!existingBooking) {
          return responseUtils.notFound(res);
        }
        const hotelOwnerId = existingBooking.Room?.RoomType?.Hotel?.hotel_owner;
        if (hotelOwnerId !== userId) {
          return responseUtils.unauthorized(res, 'You can only check-in guests at your hotels');
        }
      }

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
   * POST /bookings/:id/checkout
   * Requires: booking:checkout permission (hotel_manager)
   */
  async checkOutBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const userRole = req.user.role;

      // Hotel manager can only check-out bookings for their hotels
      if (userRole === 'hotel owner' || userRole === 'hotel_manager') {
        const existingBooking = await bookingService.getBookingById(parseInt(id));
        if (!existingBooking) {
          return responseUtils.notFound(res);
        }
        const hotelOwnerId = existingBooking.Room?.RoomType?.Hotel?.hotel_owner;
        if (hotelOwnerId !== userId) {
          return responseUtils.unauthorized(res, 'You can only check-out guests at your hotels');
        }
      }

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

