const { Hotel, RoomType, Room, RoomPrice, Booking } = require('../../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models');

/**
 * Synchronization Service
 * Synchronizes hotel data (availability, pricing) with external systems
 */
class SynchronizationService {
  /**
   * Sync hotel availability to external system
   * @param {number} hotelId - Hotel ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<{synced: boolean, records: number, timestamp: Date}>}
   */
  async syncHotelAvailability(hotelId, startDate, endDate) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [
        {
          model: RoomType,
          include: [
            { model: Room },
            { model: RoomPrice }
          ]
        }
      ]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const syncData = {
      hotel_id: hotelId,
      hotel_name: hotel.name,
      sync_timestamp: new Date(),
      availability: []
    };

    // Generate availability data for each room type
    for (const roomType of hotel.RoomTypes) {
      const availabilityData = {
        room_type_id: roomType.type_id,
        room_type: roomType.type,
        rooms: []
      };

      for (const room of roomType.Rooms) {
        // Get bookings for this room in the date range
        const bookings = await Booking.findAll({
          where: {
            room_id: room.room_id,
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
          }
        });

        const bookedDates = new Set();
        bookings.forEach(booking => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          const current = new Date(checkIn);
          
          while (current < checkOut) {
            bookedDates.add(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        });

        // Generate availability calendar
        const calendar = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          calendar.push({
            date: dateStr,
            available: !bookedDates.has(dateStr) && room.status === 1
          });
          current.setDate(current.getDate() + 1);
        }

        availabilityData.rooms.push({
          room_id: room.room_id,
          room_name: room.name,
          status: room.status,
          calendar
        });
      }

      syncData.availability.push(availabilityData);
    }

    // In a real implementation, this would send data to external system
    // For now, we'll just return the sync data
    const syncResult = {
      synced: true,
      records: syncData.availability.reduce((sum, rt) => sum + rt.rooms.length, 0),
      timestamp: syncData.sync_timestamp,
      data: syncData
    };

    return syncResult;
  }

  /**
   * Sync hotel pricing to external system
   * @param {number} hotelId - Hotel ID
   * @returns {Promise<{synced: boolean, records: number, timestamp: Date}>}
   */
  async syncHotelPricing(hotelId) {
    const hotel = await Hotel.findByPk(hotelId, {
      include: [
        {
          model: RoomType,
          include: [{ model: RoomPrice }]
        }
      ]
    });

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const syncData = {
      hotel_id: hotelId,
      hotel_name: hotel.name,
      sync_timestamp: new Date(),
      pricing: []
    };

    // Collect pricing data for each room type
    for (const roomType of hotel.RoomTypes) {
      if (roomType.RoomPrice) {
        syncData.pricing.push({
          room_type_id: roomType.type_id,
          room_type: roomType.type,
          base_price: roomType.RoomPrice.basic_price,
          special_price: roomType.RoomPrice.special_price,
          special_price_start: roomType.RoomPrice.start_date,
          special_price_end: roomType.RoomPrice.end_date,
          event: roomType.RoomPrice.event,
          discount: roomType.RoomPrice.discount
        });
      }
    }

    // In a real implementation, this would send data to external system
    const syncResult = {
      synced: true,
      records: syncData.pricing.length,
      timestamp: syncData.sync_timestamp,
      data: syncData
    };

    return syncResult;
  }

  /**
   * Sync all hotel data (availability + pricing)
   * @param {number} hotelId - Hotel ID
   * @param {Date} startDate - Start date for availability
   * @param {Date} endDate - End date for availability
   * @returns {Promise<{availability: object, pricing: object}>}
   */
  async syncHotelData(hotelId, startDate, endDate) {
    const [availabilityResult, pricingResult] = await Promise.all([
      this.syncHotelAvailability(hotelId, startDate, endDate),
      this.syncHotelPricing(hotelId)
    ]);

    return {
      availability: availabilityResult,
      pricing: pricingResult,
      synced_at: new Date()
    };
  }

  /**
   * Sync multiple hotels
   * @param {Array<number>} hotelIds - Array of hotel IDs
   * @param {Date} startDate - Start date for availability
   * @param {Date} endDate - End date for availability
   * @returns {Promise<Array>} Array of sync results
   */
  async syncMultipleHotels(hotelIds, startDate, endDate) {
    const results = [];

    for (const hotelId of hotelIds) {
      try {
        const result = await this.syncHotelData(hotelId, startDate, endDate);
        results.push({
          hotel_id: hotelId,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          hotel_id: hotelId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get sync status for a hotel
   * @param {number} hotelId - Hotel ID
   * @returns {Promise<{last_sync: Date|null, status: string}>}
   */
  async getSyncStatus(hotelId) {
    // In a real implementation, this would check a sync log table
    // For now, we'll return a basic status
    const hotel = await Hotel.findByPk(hotelId);

    if (!hotel) {
      throw new Error('Hotel not found');
    }

    // Check if hotel has room types and pricing configured
    const roomTypes = await RoomType.count({ where: { hotel_id: hotelId } });
    const hasPricing = await RoomPrice.count({
      include: [{
        model: RoomType,
        where: { hotel_id: hotelId }
      }]
    });

    return {
      hotel_id: hotelId,
      last_sync: null, // Would come from sync log table
      status: roomTypes > 0 && hasPricing > 0 ? 'ready' : 'incomplete',
      room_types_count: roomTypes,
      pricing_configured: hasPricing > 0
    };
  }

  /**
   * Handle incoming sync from external system (webhook/API)
   * @param {object} syncData - Sync data from external system
   * @returns {Promise<{processed: boolean, records: number}>}
   */
  async handleIncomingSync(syncData) {
    // In a real implementation, this would process incoming sync data
    // and update local database accordingly
    // This is a placeholder for the reverse sync operation

    const { hotel_id, availability_updates, pricing_updates } = syncData;

    if (!hotel_id) {
      throw new Error('Hotel ID is required');
    }

    const transaction = await sequelize.transaction();

    try {
      let recordsProcessed = 0;

      // Process availability updates
      if (availability_updates && Array.isArray(availability_updates)) {
        // Update room availability based on external system data
        // This would typically update room status or create maintenance records
        recordsProcessed += availability_updates.length;
      }

      // Process pricing updates
      if (pricing_updates && Array.isArray(pricing_updates)) {
        for (const pricingUpdate of pricing_updates) {
          const { type_id, price, start_date, end_date } = pricingUpdate;
          
          // Find existing room price or create new one
          const existingPrice = await RoomPrice.findOne({
            where: { type_id },
            transaction
          });

          if (existingPrice) {
            existingPrice.basic_price = price;
            if (start_date) existingPrice.start_date = start_date;
            if (end_date) existingPrice.end_date = end_date;
            await existingPrice.save({ transaction });
          } else {
            await RoomPrice.create({
              type_id,
              basic_price: price,
              start_date: start_date || null,
              end_date: end_date || null
            }, { transaction });
          }

          recordsProcessed++;
        }
      }

      await transaction.commit();

      return {
        processed: true,
        records: recordsProcessed,
        timestamp: new Date()
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new SynchronizationService();

