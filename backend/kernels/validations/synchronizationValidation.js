const { body, param } = require('express-validator');

/**
 * Validation rules for synchronization endpoints
 */
const synchronizationValidation = {
  /**
   * Validate hotel ID parameter
   */
  hotelId: [
    param('hotelId')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer')
  ],

  /**
   * Validate sync hotel availability request
   */
  syncHotelAvailability: [
    param('hotelId')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer'),
    
    body('start_date')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
    body('end_date')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)')
  ],

  /**
   * Validate sync hotel data request
   */
  syncHotelData: [
    param('hotelId')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer'),
    
    body('start_date')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
    body('end_date')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)')
  ],

  /**
   * Validate sync multiple hotels request
   */
  syncMultipleHotels: [
    body('hotel_ids')
      .notEmpty()
      .withMessage('Hotel IDs are required')
      .isArray({ min: 1 })
      .withMessage('Hotel IDs must be a non-empty array'),
    
    body('hotel_ids.*')
      .isInt({ min: 1 })
      .withMessage('Each hotel ID must be a positive integer'),
    
    body('start_date')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
    body('end_date')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)')
  ],

  /**
   * Validate handle incoming sync request
   */
  handleIncomingSync: [
    body('hotel_id')
      .notEmpty()
      .withMessage('Hotel ID is required')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer'),
    
    body('availability_updates')
      .optional()
      .isArray()
      .withMessage('Availability updates must be an array'),
    
    body('pricing_updates')
      .optional()
      .isArray()
      .withMessage('Pricing updates must be an array'),
    
    body('pricing_updates.*.type_id')
      .if(body('pricing_updates').exists())
      .isInt({ min: 1 })
      .withMessage('Room type ID must be a positive integer'),
    
    body('pricing_updates.*.price')
      .if(body('pricing_updates').exists())
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ]
};

module.exports = synchronizationValidation;


