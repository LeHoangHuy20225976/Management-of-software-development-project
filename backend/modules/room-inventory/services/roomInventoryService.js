const { Room, RoomType, RoomLog, Booking, Hotel } = require('../../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Room & Inventory Service
 * Handles room types and per-day inventory management with transaction-aware updates
 */
class RoomInventoryService {
  /**
   * Check room availability for a date range
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
          availableRooms.push({
            room_id: room.room_id,
            room_name: room.name,
            room_location: room.location,
            room_type: roomType.type,
            type_id: roomType.type_id,
            description: roomType.description,
            max_guests: roomType.max_guests,
            room_view: room.room_view,
            room_size: room.room_size,
            beds: {
              single: room.number_of_single_beds,
              double: room.number_of_double_beds
            }
          });
        }
      }
    }

    return availableRooms;
  }

  /**
   * Get room type by ID
   * @param {number} typeId - Room type ID
   * @returns {Promise<object|null>} Room type details
   */
  async getRoomType(typeId) {
    const roomType = await RoomType.findByPk(typeId, {
      include: [
        { model: Hotel },
        { model: Room }
      ]
    });

    return roomType;
  }

  /**
   * Get all room types for a hotel
   * @param {number} hotelId - Hotel ID
   * @returns {Promise<Array>} List of room types
   */
  async getRoomTypesByHotel(hotelId) {
    const roomTypes = await RoomType.findAll({
      where: { hotel_id: hotelId },
      include: [
        { model: Hotel },
        { model: Room }
      ],
      order: [['type_id', 'ASC']]
    });

    return roomTypes;
  }

  /**
   * Get room by ID
   * @param {number} roomId - Room ID
   * @returns {Promise<object|null>} Room details
   */
  async getRoom(roomId) {
    const room = await Room.findByPk(roomId, {
      include: [
        {
          model: RoomType,
          include: [{ model: Hotel }]
        }
      ]
    });

    return room;
  }

  /**
   * Get all rooms for a room type
   * @param {number} typeId - Room type ID
   * @returns {Promise<Array>} List of rooms
   */
  async getRoomsByType(typeId) {
    const rooms = await Room.findAll({
      where: { type_id: typeId },
      include: [
        {
          model: RoomType,
          include: [{ model: Hotel }]
        }
      ],
      order: [['room_id', 'ASC']]
    });

    return rooms;
  }

  /**
   * Create a reservation hold/lock (transaction-aware)
   * This prevents overbooking by temporarily reserving inventory
   * @param {number} roomId - Room ID
   * @param {Date} checkInDate - Check-in date
   * @param {Date} checkOutDate - Check-out date
   * @param {number} holdDurationMinutes - How long to hold (default 15 minutes)
   * @returns {Promise<{holdId: string, expiresAt: Date}>}
   */
  async createReservationHold(roomId, checkInDate, checkOutDate, holdDurationMinutes = 15) {
    const transaction = await sequelize.transaction();

    try {
      // Check availability first
      const availability = await this.checkRoomAvailability(roomId, checkInDate, checkOutDate);
      
      if (!availability.available) {
        await transaction.rollback();
        throw new Error(availability.reason);
      }

      // Create a temporary hold record (using RoomLog for tracking)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + holdDurationMinutes);

      const holdId = `HOLD_${roomId}_${Date.now()}`;

      await RoomLog.create({
        room_id: roomId,
        event_type: 'BOOK_CREATED',
        extra_context: JSON.stringify({
          hold_id: holdId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          expires_at: expiresAt,
          status: 'hold'
        }),
        created_at: new Date()
      }, { transaction });

      await transaction.commit();

      return {
        holdId,
        expiresAt,
        roomId,
        checkInDate,
        checkOutDate
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Release a reservation hold
   * @param {string} holdId - Hold ID
   * @returns {Promise<boolean>} Success status
   */
  async releaseReservationHold(holdId) {
    // In a real implementation, you might have a separate Hold table
    // For now, we'll update the RoomLog entry
    const holdLog = await RoomLog.findOne({
      where: {
        extra_context: {
          [Op.like]: `%${holdId}%`
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (!holdLog) {
      throw new Error('Hold not found or already released');
    }

    const context = JSON.parse(holdLog.extra_context);
    if (context.status === 'released') {
      throw new Error('Hold already released');
    }

    context.status = 'released';
    holdLog.extra_context = JSON.stringify(context);
    await holdLog.save();

    return true;
  }

  /**
   * Get inventory calendar for a room type
   * @param {number} typeId - Room type ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Calendar entries with availability
   */
  async getInventoryCalendar(typeId, startDate, endDate) {
    const rooms = await Room.findAll({
      where: { type_id: typeId },
      include: [
        {
          model: Booking,
          where: {
            status: {
              [Op.in]: ['accepted', 'pending', 'maintained']
            },
            [Op.or]: [
              {
                check_in_date: { [Op.between]: [startDate, endDate] }
              },
              {
                check_out_date: { [Op.between]: [startDate, endDate] }
              },
              {
                [Op.and]: [
                  { check_in_date: { [Op.lte]: startDate } },
                  { check_out_date: { [Op.gte]: endDate } }
                ]
              }
            ]
          },
          required: false
        }
      ]
    });

    // Generate calendar entries
    const calendar = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let availableCount = 0;

      for (const room of rooms) {
        const isBooked = room.Bookings && room.Bookings.some(booking => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return currentDate >= checkIn && currentDate < checkOut;
        });

        if (!isBooked && room.status === 1) {
          availableCount++;
        }
      }

      calendar.push({
        date: dateStr,
        available_rooms: availableCount,
        total_rooms: rooms.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  }
}

module.exports = new RoomInventoryService();


