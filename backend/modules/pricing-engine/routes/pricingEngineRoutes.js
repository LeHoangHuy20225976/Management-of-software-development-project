const express = require('express');
const router = express.Router();
const pricingEngineController = require('../controller/pricingEngineController');
const pricingEngineValidation = require('../../../kernels/validations/pricingEngineValidation');

/**
 * Pricing Engine Routes
 * Base path: /pricing
 */

// Calculate booking price
router.post(
  '/calculate',
  pricingEngineValidation.calculatePrice,
  pricingEngineController.calculatePrice
);

// Get price for a specific date
router.get(
  '/date/:typeId',
  pricingEngineValidation.getPriceForDate,
  pricingEngineController.getPriceForDate
);

// Get price range for a date range
router.get(
  '/range/:typeId',
  pricingEngineValidation.getPriceRange,
  pricingEngineController.getPriceRange
);

// Update pricing for room type (admin/hotel manager)
router.put(
  '/update/:typeId',
  pricingEngineValidation.updatePricing,
  pricingEngineController.updatePricing
);

module.exports = router;


