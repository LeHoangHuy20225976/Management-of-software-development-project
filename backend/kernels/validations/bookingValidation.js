const { body, param, query } = require('express-validator');

/**
 * Validation rules for booking endpoints
 */
const bookingValidation = {
  /**
   * Validate create booking request
   */
  createBooking: [
    body('user_id')
      .notEmpty()
      .withMessage('User ID is required')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    
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
    
    body('people')
      .notEmpty()
      .withMessage('Number of people is required')
      .isInt({ min: 1 })
      .withMessage('Number of people must be at least 1')
  ],

  /**
   * Validate update booking request
   */
  updateBooking: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer'),
    
    body('check_in_date')
      .optional()
      .isISO8601()
      .withMessage('Check-in date must be a valid date (YYYY-MM-DD)'),
    
    body('check_out_date')
      .optional()
      .isISO8601()
      .withMessage('Check-out date must be a valid date (YYYY-MM-DD)'),
    
    body('people')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Number of people must be at least 1')
  ],

  /**
   * Validate booking status update
   */
  updateBookingStatus: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer'),
    
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['accepted', 'pending', 'rejected', 'cancel requested', 'cancelled', 'maintained'])
      .withMessage('Invalid status value')
  ],

  /**
   * Validate booking ID parameter
   */
  bookingId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer')
  ],

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
      .withMessage('Check-out date must be a valid date (YYYY-MM-DD)')
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
      .withMessage('Check-out date must be a valid date (YYYY-MM-DD)')
  ]
};

module.exports = bookingValidation;

