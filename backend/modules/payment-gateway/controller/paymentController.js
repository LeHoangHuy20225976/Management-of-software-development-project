const paymentService = require('../services/paymentService');
const responseUtils = require('../../../utils/responseUtils');
const vnpayUtils = require('../../../utils/vnpayUtils');
const { validationResult } = require('express-validator');

/**
 * Payment Gateway Controller
 * Handles HTTP requests for payment operations
 * 
 * Integrates with VNPay sandbox: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */
const paymentController = {
  /**
   * Create payment for a booking
   * POST /payments/create
   * Body: { booking_id, bank_code, locale }
   */
  createPayment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { booking_id, bank_code, locale } = req.body;
      const ipAddress = vnpayUtils.getIpAddress(req);

      const result = await paymentService.createPayment({
        bookingId: booking_id,
        ipAddress,
        bankCode: bank_code,
        locale
      });

      return responseUtils.ok(res, {
        message: result.isExisting ? 'Existing payment URL retrieved' : 'Payment created successfully',
        payment_id: result.payment.payment_id,
        payment_url: result.paymentUrl,
        txn_ref: result.txnRef
      });
    } catch (error) {
      console.error('Create payment error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Handle VNPay return URL (user redirected back after payment)
   * GET /payments/vnpay-return
   * Query params from VNPay
   */
  vnpayReturn: async (req, res) => {
    try {
      const vnpParams = req.query;
      
      const result = await paymentService.handleVnpayReturn(vnpParams);

      // In production, redirect to frontend with result
      // For now, return JSON response
      if (result.success) {
        return responseUtils.ok(res, {
          message: 'Payment successful',
          response_code: result.responseCode,
          payment: {
            payment_id: result.payment.payment_id,
            booking_id: result.payment.booking_id,
            amount: result.payment.amount,
            status: result.payment.status,
            vnp_transaction_no: result.payment.vnp_transaction_no
          }
        });
      } else {
        return res.status(200).send({
          success: false,
          message: result.message,
          response_code: result.responseCode,
          payment_id: result.payment?.payment_id
        });
      }
    } catch (error) {
      console.error('VNPay return error:', error);
      return res.status(200).send({
        success: false,
        message: error.message
      });
    }
  },

  /**
   * Handle VNPay IPN (Instant Payment Notification)
   * GET /payments/vnpay-ipn
   * Query params from VNPay
   * 
   * Note: VNPay requires specific response format
   */
  vnpayIPN: async (req, res) => {
    try {
      const vnpParams = req.query;
      
      const result = await paymentService.handleVnpayIPN(vnpParams);

      // VNPay requires this exact response format
      return res.status(200).json(result);
    } catch (error) {
      console.error('VNPay IPN error:', error);
      return res.status(200).json({
        RspCode: '99',
        Message: 'Unknown error'
      });
    }
  },

  /**
   * Request refund for a payment
   * POST /payments/:id/refund
   * Body: { amount, reason }
   */
  refundPayment: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseUtils.invalidated(res, errors.array());
      }

      const { id } = req.params;
      const { amount, reason } = req.body;
      const ipAddress = vnpayUtils.getIpAddress(req);
      const createBy = req.user?.email || 'admin';

      const result = await paymentService.refundPayment({
        paymentId: parseInt(id),
        amount,
        reason,
        createBy,
        ipAddress
      });

      if (result.success) {
        return responseUtils.ok(res, {
          message: 'Refund successful',
          payment: result.payment
        });
      } else {
        return res.status(400).send({
          success: false,
          message: result.message,
          response_code: result.responseCode
        });
      }
    } catch (error) {
      console.error('Refund payment error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Query payment status from VNPay
   * GET /payments/:id/query
   */
  queryPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const ipAddress = vnpayUtils.getIpAddress(req);

      const result = await paymentService.queryPaymentStatus({
        paymentId: parseInt(id),
        ipAddress
      });

      return responseUtils.ok(res, {
        success: result.success,
        payment: result.payment,
        transaction_status: result.transactionStatus,
        message: result.message
      });
    } catch (error) {
      console.error('Query payment error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get payment by ID
   * GET /payments/:id
   */
  getPayment: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await paymentService.getPaymentById(parseInt(id));

      if (!payment) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { payment });
    } catch (error) {
      console.error('Get payment error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get payment by booking ID
   * GET /payments/booking/:bookingId
   */
  getPaymentByBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;

      const payment = await paymentService.getPaymentByBookingId(parseInt(bookingId));

      if (!payment) {
        return responseUtils.notFound(res);
      }

      return responseUtils.ok(res, { payment });
    } catch (error) {
      console.error('Get payment by booking error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get all payments with filters
   * GET /payments
   * Query: booking_id, status, payment_method, user_id, date_from, date_to, limit, offset
   */
  getPayments: async (req, res) => {
    try {
      const filters = {
        booking_id: req.query.booking_id ? parseInt(req.query.booking_id) : undefined,
        status: req.query.status,
        payment_method: req.query.payment_method,
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      // Role-based filtering
      const userRole = req.user?.role;
      const userId = req.user?.user_id;

      if (userRole === 'customer') {
        // Customers can only see their own payments
        filters.user_id = userId;
      }

      const result = await paymentService.getPayments(filters);

      return responseUtils.ok(res, result);
    } catch (error) {
      console.error('Get payments error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Cancel a pending payment
   * POST /payments/:id/cancel
   */
  cancelPayment: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await paymentService.cancelPayment(parseInt(id));

      return responseUtils.ok(res, {
        message: 'Payment cancelled',
        payment
      });
    } catch (error) {
      console.error('Cancel payment error:', error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Get payment configuration (for frontend)
   * GET /payments/config
   */
  getConfig: async (req, res) => {
    try {
      return responseUtils.ok(res, {
        supported_methods: ['vnpay'],
        vnpay: {
          bank_codes: [
            { code: '', name: 'Choose at VNPay' },
            { code: 'VNPAYQR', name: 'VNPay QR Code' },
            { code: 'VNBANK', name: 'Domestic Bank (ATM)' },
            { code: 'INTCARD', name: 'International Card' }
          ],
          locales: ['vn', 'en'],
          currency: 'VND'
        }
      });
    } catch (error) {
      console.error('Get config error:', error);
      return responseUtils.error(res, error.message);
    }
  }
};

module.exports = paymentController;

