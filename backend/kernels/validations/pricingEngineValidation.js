const { body, param, query } = require('express-validator');

/**
 * Validation rules for pricing engine endpoints
 */
const pricingEngineValidation = {
  /**
   * Validate calculate price request
   */
  calculatePrice: [
    body('type_id')
      .notEmpty()
      .withMessage('Room type ID is required')
      .isInt({ min: 1 })
      .withMessage('Room type ID must be a positive integer'),
    
    body('check_in_date')
      .notEmpty()
      .withMessage('Check-in date is required')
      .isISO8601()
      .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
    
    body('check_out_date')
      .notEmpty()
      .withMessage('Check-out date is required')
      .isISO8601()
      .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
    
    body('guests')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Number of guests must be at least 1'),
    
    body('promo_code')
      .optional()
      .isString()
      .withMessage('Promo code must be a string')
      .trim()
  ],

  /**
   * Validate get price for date request
   */
  getPriceForDate: [
    param('typeId')
      .isInt({ min: 1 })
      .withMessage('Room type ID must be a positive integer'),
    
    query('date')
      .notEmpty()
      .withMessage('Date is required')
      .isISO8601()
      .withMessage('Date must be a valid date (YYYY-MM-DD)')
  ],

  /**
   * Validate get price range request
   */
  getPriceRange: [
    param('typeId')
      .isInt({ min: 1 })
      .withMessage('Room type ID must be a positive integer'),

    query('start_date')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

    query('end_date')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)')
  ],

  /**
   * Validate update pricing request
   */
  updatePricing: [
    param('typeId')
      .isInt({ min: 1 })
      .withMessage('Room type ID must be a positive integer'),

    body('basic_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Basic price must be a positive number'),

    body('special_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Special price must be a positive number'),

    body('discount')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Discount must be between 0 and 1'),

    body('event')
      .optional()
      .isString()
      .withMessage('Event must be a string')
      .trim(),

    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),

    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ]
};

module.exports = pricingEngineValidation;


