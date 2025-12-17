const { body, param, query } = require('express-validator');

/**
 * Validation rules for room inventory endpoints
 */
const roomInventoryValidation = {
  /**
   * Validate check availability request
   */
  checkAvailability: [
    body('room_id')
      .notEmpty()
      .withMessage('Room ID is required')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a positive integer'),
    
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
    
    body('exclude_booking_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Exclude booking ID must be a positive integer')
  ],

  /**
   * Validate get available rooms request
   */
  getAvailableRooms: [
    param('hotelId')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer'),
    
    query('check_in_date')
      .notEmpty()
      .withMessage('Check-in date is required')
      .isISO8601()
      .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
    
    query('check_out_date')
      .notEmpty()
      .withMessage('Check-out date is required')
      .isISO8601()
      .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
    
    query('guests')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Number of guests must be at least 1')
  ],

  /**
   * Validate room ID parameter
   */
  roomId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a positive integer')
  ],

  /**
   * Validate room type ID parameter
   * Handles both :id and :typeId route parameters
   */
  roomTypeId: [
    param().custom((value, { req }) => {
      const id = req.params.id || req.params.typeId;
      if (!id) {
        throw new Error('Room type ID parameter is required');
      }
      const numId = parseInt(id);
      if (isNaN(numId) || numId < 1) {
        throw new Error('Room type ID must be a positive integer');
      }
      return true;
    })
  ],

  /**
   * Validate hotel ID parameter
   */
  hotelId: [
    param('hotelId')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer')
  ],

  /**
   * Validate create reservation hold request
   */
  createReservationHold: [
    body('room_id')
      .notEmpty()
      .withMessage('Room ID is required')
      .isInt({ min: 1 })
      .withMessage('Room ID must be a positive integer'),
    
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
    
    body('hold_duration_minutes')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('Hold duration must be between 1 and 1440 minutes (24 hours)')
  ],

  /**
   * Validate get inventory calendar request
   */
  getInventoryCalendar: [
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
  ]
};

module.exports = roomInventoryValidation;

