const { body, param, query } = require('express-validator');

/**
 * Validation rules for Super Admin endpoints
 */
const adminValidation = {
  /**
   * Validate user ID parameter
   */
  userId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer')
  ],

  /**
   * Validate hotel ID parameter
   */
  hotelId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer')
  ],

  /**
   * Validate update user role request
   */
  updateUserRole: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['customer', 'hotel_manager', 'admin'])
      .withMessage('Role must be one of: customer, hotel_manager, admin')
  ],

  /**
   * Validate update user request
   */
  updateUser: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    
    body('name')
      .optional()
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address'),
    
    body('phone_number')
      .optional()
      .isString()
      .withMessage('Phone number must be a string'),
    
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Other'])
      .withMessage('Gender must be Male, Female, or Other'),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),
    
    body('role')
      .optional()
      .isIn(['customer', 'hotel_manager', 'admin'])
      .withMessage('Role must be one of: customer, hotel_manager, admin')
  ],

  /**
   * Validate update hotel status request
   */
  updateHotelStatus: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Hotel ID must be a positive integer'),
    
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn([0, 1])
      .withMessage('Status must be 0 (inactive) or 1 (active)')
  ],

  /**
   * Validate date range query parameters
   */
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date (YYYY-MM-DD)')
  ]
};

module.exports = adminValidation;

