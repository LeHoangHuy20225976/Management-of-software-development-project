const pricingEngineService = require('../services/pricingEngineService');
const responseUtils = require('../../../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Pricing Engine Controller
 * Handles HTTP requests for pricing operations
 */
class PricingEngineController {
  /**
   * Calculate booking price
   * POST /api/v1/pricing/calculate
   */
  async calculatePrice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { type_id, check_in_date, check_out_date, guests, promo_code } = req.body;

      const pricing = await pricingEngineService.calculatePrice(
        type_id,
        check_in_date,
        check_out_date,
        guests || 1,
        promo_code || null
      );

      return responseUtils.ok(res, pricing);
    } catch (error) {
      console.error('Calculate price error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get price for a specific date
   * GET /api/v1/pricing/date/:typeId
   */
  async getPriceForDate(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { typeId } = req.params;
      const { date } = req.query;

      const priceInfo = await pricingEngineService.getPriceForDate(
        parseInt(typeId),
        date
      );

      return responseUtils.ok(res, {
        type_id: parseInt(typeId),
        date,
        ...priceInfo
      });
    } catch (error) {
      console.error('Get price for date error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Get price range for a date range
   * GET /api/v1/pricing/range/:typeId
   */
  async getPriceRange(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { typeId } = req.params;
      const { start_date, end_date } = req.query;

      const priceRange = await pricingEngineService.getPriceRange(
        parseInt(typeId),
        start_date,
        end_date
      );

      return responseUtils.ok(res, {
        type_id: parseInt(typeId),
        start_date,
        end_date,
        ...priceRange
      });
    } catch (error) {
      console.error('Get price range error:', error);
      return responseUtils.error(res, error.message);
    }
  }
}

module.exports = new PricingEngineController();


