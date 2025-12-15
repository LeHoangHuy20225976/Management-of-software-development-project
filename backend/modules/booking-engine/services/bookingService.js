const { Booking, Room, RoomType, RoomPrice, Hotel, User, RoomLog } = require('../../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Booking Service
 * Handles all booking-related business logic
 */
class BookingService {
  /**
   * Check if a room is available for the given date range
   * @param {number} roomId - Room ID
   * @param {Date} checkInDate - Check-in date
   * @param {Date} checkOutDate - Check-out date
   * @param {number|null} excludeBookingId - Booking ID to exclude (for updates)
   * @returns {Promise<{available: boolean, reason?: string}>}
   */
  async checkRoomAvailability(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
    // 1. Check if room exists and is active
    const room = await Room.findByPk(roomId, {
      include: [{
        model: RoomType,
        include: [{ model: Hotel }]
      }]
    });

    if (!room) {
      return { available: false, reason: 'Room not found' };
    }

    if (room.status === 0) {
      return { available: false, reason: 'Room is currently closed/unavailable' };
    }

    // Check if room will be available by the check-in date
    if (room.estimated_available_time && new Date(room.estimated_available_time) > new Date(checkInDate)) {
      return { 
        available: false, 
        reason: `Room will not be available until ${room.estimated_available_time}` 
      };
    }

    // 2. Check if RoomType is available
    const roomType = room.RoomType;
    if (!roomType || !roomType.availability) {
      return { available: false, reason: 'Room type is not available for booking' };
    }

    // 3. Check if Hotel is active
    if (roomType.Hotel && roomType.Hotel.status !== 1) {
      return { available: false, reason: 'Hotel is currently not accepting bookings' };
    }

    // 4. Check for overlapping bookings
    const whereClause = {
      room_id: roomId,
      status: {
        [Op.in]: ['accepted', 'pending', 'maintained']
      },
      [Op.or]: [
        // New booking starts during existing booking
        {
          check_in_date: { [Op.lte]: checkInDate },
          check_out_date: { [Op.gt]: checkInDate }
        },
        // New booking ends during existing booking
        {
          check_in_date: { [Op.lt]: checkOutDate },
          check_out_date: { [Op.gte]: checkOutDate }
        },
        // New booking completely contains existing booking
        {
          check_in_date: { [Op.gte]: checkInDate },
          check_out_date: { [Op.lte]: checkOutDate }
        }
      ]
    };

    if (excludeBookingId) {
      whereClause.booking_id = { [Op.ne]: excludeBookingId };
    }

    const overlappingBookings = await Booking.findAll({
      where: whereClause
    });

    if (overlappingBookings.length > 0) {
      return { available: false, reason: 'Room is already booked for the selected dates' };
    }

    return { available: true };
  }

  /**
   * Calculate the total price for a booking
   * @param {number} typeId - Room type ID
   * @param {Date} checkInDate - Check-in date
   * @param {Date} checkOutDate - Check-out date
   * @returns {Promise<{totalPrice: number, breakdown: object}>}
   */
  async calculateBookingPrice(typeId, checkInDate, checkOutDate) {
    const roomPrice = await RoomPrice.findOne({
      where: { type_id: typeId }
    });

    if (!roomPrice) {
      throw new Error('Room price not found');
    }

    // Calculate number of nights
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      throw new Error('Check-out date must be after check-in date');
    }

    let pricePerNight = roomPrice.basic_price;
    let eventApplied = null;
    let discountApplied = 0;

    // Check if there's a special event price applicable
    if (roomPrice.start_date && roomPrice.end_date && roomPrice.special_price) {
      const startDate = new Date(roomPrice.start_date);
      const endDate = new Date(roomPrice.end_date);
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Check if booking period overlaps with event period
      if (checkIn <= endDate && checkOut >= startDate) {
        pricePerNight = roomPrice.special_price;
        eventApplied = roomPrice.event;
      }
    }

    // Apply discount if available
    if (roomPrice.discount && roomPrice.discount > 0) {
      discountApplied = roomPrice.discount;
    }

    const subtotal = pricePerNight * nights;
    const discountAmount = subtotal * discountApplied;
    const totalPrice = subtotal - discountAmount;

    return {
      totalPrice: Math.round(totalPrice),
      breakdown: {
        nights,
        pricePerNight,
        subtotal,
        discount: discountApplied,
        discountAmount: Math.round(discountAmount),
        eventApplied,
        finalTotal: Math.round(totalPrice)
      }
    };
  }

  /**
   * Create a new booking
   * @param {object} bookingData - Booking details
   * @returns {Promise<object>} Created booking
   */
  async createBooking(bookingData) {
    const { user_id, room_id, check_in_date, check_out_date, people } = bookingData;

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Get room details
    const room = await Room.findByPk(room_id, {
      include: [{ model: RoomType }]
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if number of people exceeds max guests
    if (people > room.RoomType.max_guests) {
      throw new Error(`Number of guests (${people}) exceeds maximum capacity (${room.RoomType.max_guests})`);
    }

    // Check availability
    const availability = await this.checkRoomAvailability(room_id, check_in_date, check_out_date);
    if (!availability.available) {
      throw new Error(availability.reason);
    }

    // Calculate price
    const pricing = await this.calculateBookingPrice(room.type_id, check_in_date, check_out_date);

    // Create booking within a transaction
    const transaction = await sequelize.transaction();

    try {
      const booking = await Booking.create({
        user_id,
        room_id,
        status: 'pending',
        total_price: pricing.totalPrice,
        check_in_date,
        check_out_date,
        created_at: new Date(),
        people
      }, { transaction });

      // Create room log entry
      await RoomLog.create({
        room_id,
        event_type: 'BOOK_CREATED',
        extra_context: `Booking #${booking.booking_id} created for ${check_in_date} to ${check_out_date}`,
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return {
        booking,
        pricing: pricing.breakdown
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get booking by ID with full details
   * @param {number} bookingId - Booking ID
   * @returns {Promise<object|null>} Booking details
   */
  async getBookingById(bookingId) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email', 'phone_number']
        },
        {
          model: Room,
          include: [
            {
              model: RoomType,
              include: [
                { model: Hotel },
                { model: RoomPrice }
              ]
            }
          ]
        }
      ]
    });

    return booking;
  }

  /**
   * Get all bookings with optional filters
   * @param {object} filters - Filter options
   * @returns {Promise<Array>} List of bookings
   */
  async getBookings(filters = {}) {
    const { user_id, room_id, hotel_id, hotel_owner_id, status, check_in_from, check_in_to, limit = 50, offset = 0 } = filters;

    const whereClause = {};
    const includeClause = [
      {
        model: User,
        attributes: ['user_id', 'name', 'email', 'phone_number']
      },
      {
        model: Room,
        include: [{
          model: RoomType,
          include: [{ model: Hotel }]
        }]
      }
    ];

    // Apply filters
    if (user_id) whereClause.user_id = user_id;
    if (room_id) whereClause.room_id = room_id;
    if (status) whereClause.status = status;
    
    if (check_in_from) {
      whereClause.check_in_date = { 
        ...whereClause.check_in_date, 
        [Op.gte]: check_in_from 
      };
    }
    
    if (check_in_to) {
      whereClause.check_in_date = { 
        ...whereClause.check_in_date, 
        [Op.lte]: check_in_to 
      };
    }

    // Filter by hotel_id through room relationship
    if (hotel_id) {
      includeClause[1].include[0].where = { hotel_id };
      includeClause[1].required = true;
    }

    // Filter by hotel_owner_id (for hotel managers to see their hotels' bookings)
    if (hotel_owner_id) {
      includeClause[1].include[0].include = [{ 
        model: Hotel, 
        where: { hotel_owner: hotel_owner_id } 
      }];
      includeClause[1].include[0].required = true;
      includeClause[1].required = true;
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      bookings: bookings.rows,
      total: bookings.count,
      limit,
      offset
    };
  }

  /**
   * Update booking status
   * @param {number} bookingId - Booking ID
   * @param {string} newStatus - New status
   * @param {number|null} userId - User ID (for authorization)
   * @returns {Promise<object>} Updated booking
   */
  async updateBookingStatus(bookingId, newStatus, userId = null) {
    const validStatuses = ['accepted', 'pending', 'rejected', 'cancel requested', 'cancelled', 'maintained'];
    
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate status transitions
    const currentStatus = booking.status;
    
    // Business rules for status transitions
    if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
      throw new Error('Cannot modify a cancelled or rejected booking');
    }

    if (newStatus === 'accepted' && currentStatus !== 'pending') {
      throw new Error('Only pending bookings can be accepted');
    }

    const transaction = await sequelize.transaction();

    try {
      booking.status = newStatus;
      await booking.save({ transaction });

      // Create room log entry based on status
      let eventType = 'BOOK_CREATED';
      if (newStatus === 'cancelled') {
        eventType = 'BOOK_CANCELLED';
      } else if (newStatus === 'accepted') {
        eventType = 'BOOK_CREATED';
      }

      await RoomLog.create({
        room_id: booking.room_id,
        event_type: eventType,
        extra_context: `Booking #${bookingId} status changed to ${newStatus}`,
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {number} bookingId - Booking ID
   * @param {number} userId - User ID (for authorization)
   * @param {string} role - User role
   * @returns {Promise<object>} Updated booking
   */
  async cancelBooking(bookingId, userId, role) {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Authorization check
    if (role === 'customer' && booking.user_id !== userId) {
      throw new Error('You can only cancel your own bookings');
    }

    // Cannot cancel already cancelled bookings
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      throw new Error('Booking is already cancelled or rejected');
    }

    // Customer requests cancellation, hotel owner/admin can directly cancel
    const newStatus = role === 'customer' ? 'cancel requested' : 'cancelled';

    return await this.updateBookingStatus(bookingId, newStatus, userId);
  }

  /**
   * Update booking dates (modify booking)
   * @param {number} bookingId - Booking ID
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Updated booking
   */
  async updateBooking(bookingId, updateData) {
    const { check_in_date, check_out_date, people } = updateData;

    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only pending or accepted bookings can be modified
    if (!['pending', 'accepted'].includes(booking.status)) {
      throw new Error('Only pending or accepted bookings can be modified');
    }

    // Check if trying to update past bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newCheckIn = check_in_date ? new Date(check_in_date) : new Date(booking.check_in_date);
    const newCheckOut = check_out_date ? new Date(check_out_date) : new Date(booking.check_out_date);

    if (newCheckIn < today) {
      throw new Error('Cannot modify booking to a past date');
    }

    if (newCheckOut <= newCheckIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Check guest capacity
    const newPeople = people || booking.people;
    if (newPeople > booking.Room.RoomType.max_guests) {
      throw new Error(`Number of guests (${newPeople}) exceeds maximum capacity (${booking.Room.RoomType.max_guests})`);
    }

    // Check availability for new dates
    if (check_in_date || check_out_date) {
      const availability = await this.checkRoomAvailability(
        booking.room_id, 
        newCheckIn, 
        newCheckOut,
        bookingId
      );

      if (!availability.available) {
        throw new Error(availability.reason);
      }
    }

    // Recalculate price if dates changed
    let newPrice = booking.total_price;
    if (check_in_date || check_out_date) {
      const pricing = await this.calculateBookingPrice(
        booking.Room.type_id, 
        newCheckIn, 
        newCheckOut
      );
      newPrice = pricing.totalPrice;
    }

    const transaction = await sequelize.transaction();

    try {
      // Update booking
      if (check_in_date) booking.check_in_date = check_in_date;
      if (check_out_date) booking.check_out_date = check_out_date;
      if (people) booking.people = people;
      booking.total_price = newPrice;

      await booking.save({ transaction });

      // Log the update
      await RoomLog.create({
        room_id: booking.room_id,
        event_type: 'BOOK_CREATED',
        extra_context: `Booking #${bookingId} updated: dates or guest count modified`,
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Check-in a booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise<object>} Updated booking
   */
  async checkInBooking(bookingId) {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'accepted') {
      throw new Error('Only accepted bookings can be checked in');
    }

    const transaction = await sequelize.transaction();

    try {
      await RoomLog.create({
        room_id: booking.room_id,
        event_type: 'BOOK_CHECKIN',
        extra_context: `Booking #${bookingId} checked in`,
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Check-out a booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise<object>} Updated booking
   */
  async checkOutBooking(bookingId) {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    const transaction = await sequelize.transaction();

    try {
      await RoomLog.create({
        room_id: booking.room_id,
        event_type: 'BOOK_CHECKOUT',
        extra_context: `Booking #${bookingId} checked out`,
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return await this.getBookingById(bookingId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get available rooms for a hotel within date range
   * @param {number} hotelId - Hotel ID
   * @param {Date} checkInDate - Check-in date
   * @param {Date} checkOutDate - Check-out date
   * @param {number} guests - Number of guests
   * @returns {Promise<Array>} Available rooms
   */
  async getAvailableRooms(hotelId, checkInDate, checkOutDate, guests = 1) {
    // Get all room types for this hotel
    const roomTypes = await RoomType.findAll({
      where: { 
        hotel_id: hotelId,
        availability: true,
        max_guests: { [Op.gte]: guests }
      },
      include: [
        { model: RoomPrice },
        { model: Hotel }
      ]
    });

    const availableRooms = [];

    for (const roomType of roomTypes) {
      // Get all rooms of this type
      const rooms = await Room.findAll({
        where: { 
          type_id: roomType.type_id,
          status: 1
        }
      });

      // Check availability for each room
      for (const room of rooms) {
        const availability = await this.checkRoomAvailability(
          room.room_id,
          checkInDate,
          checkOutDate
        );

        if (availability.available) {
          // Calculate price
          const pricing = await this.calculateBookingPrice(
            roomType.type_id,
            checkInDate,
            checkOutDate
          );

          availableRooms.push({
            room_id: room.room_id,
            room_name: room.name,
            room_location: room.location,
            room_type: roomType.type,
            room_type_id: roomType.type_id,
            description: roomType.description,
            max_guests: roomType.max_guests,
            room_view: room.room_view,
            room_size: room.room_size,
            beds: {
              single: room.number_of_single_beds,
              double: room.number_of_double_beds
            },
            pricing: pricing.breakdown
          });
        }
      }
    }

    return availableRooms;
  }
}

module.exports = new BookingService();

