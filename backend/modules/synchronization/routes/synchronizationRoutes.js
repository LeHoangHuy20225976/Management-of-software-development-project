const express = require('express');
const router = express.Router();
const synchronizationController = require('../controller/synchronizationController');
const synchronizationValidation = require('../../../kernels/validations/synchronizationValidation');

/**
 * Synchronization Routes
 * Base path: /sync
 */

// Sync hotel availability
router.post(
  '/availability/:hotelId',
  synchronizationValidation.syncHotelAvailability,
  synchronizationController.syncHotelAvailability
);

// Sync hotel pricing
router.post(
  '/pricing/:hotelId',
  synchronizationValidation.hotelId,
  synchronizationController.syncHotelPricing
);

// Sync all hotel data
router.post(
  '/hotel/:hotelId',
  synchronizationValidation.syncHotelData,
  synchronizationController.syncHotelData
);

// Sync multiple hotels
router.post(
  '/hotels',
  synchronizationValidation.syncMultipleHotels,
  synchronizationController.syncMultipleHotels
);

// Get sync status
router.get(
  '/status/:hotelId',
  synchronizationValidation.hotelId,
  synchronizationController.getSyncStatus
);

// Handle incoming sync (webhook)
router.post(
  '/incoming',
  synchronizationValidation.handleIncomingSync,
  synchronizationController.handleIncomingSync
);

module.exports = router;


