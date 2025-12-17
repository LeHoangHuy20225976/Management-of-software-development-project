const { body, param, query } = require('express-validator');

/**
 * Validation rules for Payment Gateway endpoints
 */
const paymentValidation = {
  /**
   * Validate create payment request
   */
  createPayment: [
    body('booking_id')
      .notEmpty()
      .withMessage('Booking ID is required')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer'),
    
    body('bank_code')
      .optional()
      .isString()
      .withMessage('Bank code must be a string'),
    
    body('locale')
      .optional()
      .isIn(['vn', 'en'])
      .withMessage('Locale must be vn or en')
  ],

  /**
   * Validate payment ID parameter
   */
  paymentId: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer')
  ],

  /**
   * Validate booking ID parameter
   */
  bookingId: [
    param('bookingId')
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer')
  ],

  /**
   * Validate refund payment request
   */
  refundPayment: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Payment ID must be a positive integer'),
    
    body('amount')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Amount must be a positive integer'),
    
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string')
  ],

  /**
   * Validate query parameters for listing payments
   */
  listPayments: [
    query('booking_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Booking ID must be a positive integer'),
    
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'])
      .withMessage('Invalid status value'),
    
    query('payment_method')
      .optional()
      .isIn(['vnpay'])
      .withMessage('Invalid payment method'),
    
    query('date_from')
      .optional()
      .isISO8601()
      .withMessage('Date from must be a valid date'),
    
    query('date_to')
      .optional()
      .isISO8601()
      .withMessage('Date to must be a valid date'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be 0 or greater')
  ]
};

module.exports = paymentValidation;

