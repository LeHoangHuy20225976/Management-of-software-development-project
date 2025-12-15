const express = require('express');
const router = express.Router();
const roomInventoryController = require('../controller/roomInventoryController');
const roomInventoryValidation = require('../../../kernels/validations/roomInventoryValidation');

/**
 * Room & Inventory Routes
 * Base path: /rooms
 */

// Check room availability
router.post(
  '/check-availability',
  roomInventoryValidation.checkAvailability,
  roomInventoryController.checkAvailability
);

// Get available rooms for a hotel
router.get(
  '/available/:hotelId',
  roomInventoryValidation.getAvailableRooms,
  roomInventoryController.getAvailableRooms
);

// Get room type by ID
router.get(
  '/types/:id',
  roomInventoryValidation.roomTypeId,
  roomInventoryController.getRoomType
);

// Get all room types for a hotel
router.get(
  '/types/hotel/:hotelId',
  roomInventoryValidation.hotelId,
  roomInventoryController.getRoomTypesByHotel
);

// Get room by ID
router.get(
  '/:id',
  roomInventoryValidation.roomId,
  roomInventoryController.getRoom
);

// Get all rooms for a room type
router.get(
  '/type/:typeId',
  roomInventoryValidation.roomTypeId,
  roomInventoryController.getRoomsByType
);

// Create reservation hold
router.post(
  '/hold',
  roomInventoryValidation.createReservationHold,
  roomInventoryController.createReservationHold
);

// Release reservation hold
router.post(
  '/hold/:holdId/release',
  roomInventoryController.releaseReservationHold
);

// Get inventory calendar
router.get(
  '/inventory-calendar/:typeId',
  roomInventoryValidation.getInventoryCalendar,
  roomInventoryController.getInventoryCalendar
);

module.exports = router;


