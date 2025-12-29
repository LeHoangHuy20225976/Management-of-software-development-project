const synchronizationService = require('../services/synchronizationService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Synchronization Controller
 * Handles HTTP requests for synchronization operations
 */
class SynchronizationController {
  /**
   * Sync hotel availability
   * POST /api/v1/sync/availability/:hotelId
   */
  async syncHotelAvailability(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { hotelId } = req.params;
      const { start_date, end_date } = req.body;

      const result = await synchronizationService.syncHotelAvailability(
        parseInt(hotelId),
        start_date,
        end_date
      );

      return responseUtils.ok(res, {
        message: 'Hotel availability synced successfully',
        ...result
      });
    } catch (error) {
      console.error('Sync hotel availability error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Sync hotel pricing
   * POST /api/v1/sync/pricing/:hotelId
   */
  async syncHotelPricing(req, res) {
    try {
      const { hotelId } = req.params;
      const result = await synchronizationService.syncHotelPricing(parseInt(hotelId));

      return responseUtils.ok(res, {
        message: 'Hotel pricing synced successfully',
        ...result
      });
    } catch (error) {
      console.error('Sync hotel pricing error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Sync all hotel data
   * POST /api/v1/sync/hotel/:hotelId
   */
  async syncHotelData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { hotelId } = req.params;
      const { start_date, end_date } = req.body;

      const result = await synchronizationService.syncHotelData(
        parseInt(hotelId),
        start_date,
        end_date
      );

      return responseUtils.ok(res, {
        message: 'Hotel data synced successfully',
        ...result
      });
    } catch (error) {
      console.error('Sync hotel data error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Sync multiple hotels
   * POST /api/v1/sync/hotels
   */
  async syncMultipleHotels(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { hotel_ids, start_date, end_date } = req.body;

      const results = await synchronizationService.syncMultipleHotels(
        hotel_ids,
        start_date,
        end_date
      );

      return responseUtils.ok(res, {
        message: 'Hotels sync completed',
        results,
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });
    } catch (error) {
      console.error('Sync multiple hotels error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get sync status
   * GET /api/v1/sync/status/:hotelId
   */
  async getSyncStatus(req, res) {
    try {
      const { hotelId } = req.params;
      const status = await synchronizationService.getSyncStatus(parseInt(hotelId));

      return responseUtils.ok(res, { status });
    } catch (error) {
      console.error('Get sync status error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Handle incoming sync (webhook)
   * POST /api/v1/sync/incoming
   */
  async handleIncomingSync(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const syncData = req.body;
      const result = await synchronizationService.handleIncomingSync(syncData);

      return responseUtils.ok(res, {
        message: 'Incoming sync processed successfully',
        ...result
      });
    } catch (error) {
      console.error('Handle incoming sync error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new SynchronizationController();


