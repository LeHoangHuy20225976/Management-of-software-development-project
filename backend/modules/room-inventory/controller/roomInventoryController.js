const roomInventoryService = require('../services/roomInventoryService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Room & Inventory Controller
 * Handles HTTP requests for room and inventory operations
 */
class RoomInventoryController {
  /**
   * Check room availability
   * POST /api/v1/rooms/check-availability
   */
  async checkAvailability(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { room_id, check_in_date, check_out_date, exclude_booking_id } = req.body;

      const availability = await roomInventoryService.checkRoomAvailability(
        room_id,
        check_in_date,
        check_out_date,
        exclude_booking_id || null
      );

      return responseUtils.ok(res, availability);
    } catch (error) {
      console.error('Check availability error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get available rooms for a hotel
   * GET /api/v1/rooms/available/:hotelId
   */
  async getAvailableRooms(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { hotelId } = req.params;
      const { check_in_date, check_out_date, guests = 1 } = req.query;

      const availableRooms = await roomInventoryService.getAvailableRooms(
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
   * Get room type by ID
   * GET /api/v1/rooms/types/:id
   */
  async getRoomType(req, res) {
    try {
      const { id } = req.params;
      const roomType = await roomInventoryService.getRoomType(parseInt(id));

      if (!roomType) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { room_type: roomType });
    } catch (error) {
      console.error('Get room type error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get all room types for a hotel
   * GET /api/v1/rooms/types/hotel/:hotelId
   */
  async getRoomTypesByHotel(req, res) {
    try {
      const { hotelId } = req.params;
      const roomTypes = await roomInventoryService.getRoomTypesByHotel(parseInt(hotelId));

      return responseUtils.ok(res, {
        hotel_id: parseInt(hotelId),
        room_types: roomTypes,
        count: roomTypes.length
      });
    } catch (error) {
      console.error('Get room types by hotel error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get room by ID
   * GET /api/v1/rooms/:id
   */
  async getRoom(req, res) {
    try {
      const { id } = req.params;
      const room = await roomInventoryService.getRoom(parseInt(id));

      if (!room) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { room });
    } catch (error) {
      console.error('Get room error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get all rooms for a room type
   * GET /api/v1/rooms/type/:typeId
   */
  async getRoomsByType(req, res) {
    try {
      const typeId = req.params.typeId || req.params.id;
      const rooms = await roomInventoryService.getRoomsByType(parseInt(typeId));

      return responseUtils.ok(res, {
        type_id: parseInt(typeId),
        rooms,
        count: rooms.length
      });
    } catch (error) {
      console.error('Get rooms by type error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Create a reservation hold
   * POST /api/v1/rooms/hold
   */
  async createReservationHold(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { room_id, check_in_date, check_out_date, hold_duration_minutes } = req.body;

      const hold = await roomInventoryService.createReservationHold(
        room_id,
        check_in_date,
        check_out_date,
        hold_duration_minutes || 15
      );

      return responseUtils.ok(res, {
        message: 'Reservation hold created successfully',
        hold
      });
    } catch (error) {
      console.error('Create reservation hold error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Release a reservation hold
   * POST /api/v1/rooms/hold/:holdId/release
   */
  async releaseReservationHold(req, res) {
    try {
      const { holdId } = req.params;
      await roomInventoryService.releaseReservationHold(holdId);

      return responseUtils.ok(res, {
        message: 'Reservation hold released successfully'
      });
    } catch (error) {
      console.error('Release reservation hold error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get inventory calendar
   * GET /api/v1/rooms/inventory-calendar/:typeId
   */
  async getInventoryCalendar(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const typeId = req.params.typeId || req.params.id;
      const { start_date, end_date } = req.query;

      const calendar = await roomInventoryService.getInventoryCalendar(
        parseInt(typeId),
        start_date,
        end_date
      );

      return responseUtils.ok(res, {
        type_id: parseInt(typeId),
        start_date,
        end_date,
        calendar
      });
    } catch (error) {
      console.error('Get inventory calendar error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new RoomInventoryController();

