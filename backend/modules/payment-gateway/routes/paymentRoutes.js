const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const paymentValidation = require('../../../kernels/validations/paymentValidation');
const middlewares = require('../../../kernels/middlewares');
const authMiddleware = require('../../../kernels/middlewares/authMiddleware');
const rbacMiddleware = require('../../../kernels/middlewares/rbacMiddleware');

/**
 * Payment Gateway Routes
 * Base path: /payments
 * 
 * VNPay Integration:
 * - Sandbox: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 * - Refund: https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html
 */

// ============================================================================
// PUBLIC ROUTES (VNPay callbacks - no auth required)
// ============================================================================

// VNPay return URL - user redirected here after payment
router.get(
  '/vnpay-return',
  paymentController.vnpayReturn
);

// VNPay IPN URL - VNPay server callback for payment confirmation
router.get(
  '/vnpay-ipn',
  paymentController.vnpayIPN
);

// ============================================================================
// PUBLIC CONFIG ROUTE
// ============================================================================

// Get payment configuration (supported methods, bank codes, etc.)
router.get(
  '/config',
  paymentController.getConfig
);

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

// Create payment for a booking (customer can pay for their bookings)
router.post(
  '/create',
  middlewares([authMiddleware, rbacMiddleware(['booking:create', 'payment:manage'])]),
  paymentValidation.createPayment,
  paymentController.createPayment
);

// Get all payments (admin sees all, customer sees own)
router.get(
  '/',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_own', 'payment:manage'])]),
  paymentController.getPayments
);

// Get payment by booking ID
router.get(
  '/booking/:bookingId',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_own', 'payment:manage'])]),
  paymentValidation.bookingId,
  paymentController.getPaymentByBooking
);

// Get payment by ID
router.get(
  '/:id',
  middlewares([authMiddleware, rbacMiddleware(['booking:view_own', 'payment:manage'])]),
  paymentValidation.paymentId,
  paymentController.getPayment
);

// Query payment status from VNPay
router.get(
  '/:id/query',
  middlewares([authMiddleware, rbacMiddleware(['payment:manage'])]),
  paymentValidation.paymentId,
  paymentController.queryPayment
);

// Cancel a pending payment
router.post(
  '/:id/cancel',
  middlewares([authMiddleware, rbacMiddleware(['booking:cancel_own', 'payment:manage'])]),
  paymentValidation.paymentId,
  paymentController.cancelPayment
);

// Request refund (admin only)
router.post(
  '/:id/refund',
  middlewares([authMiddleware, rbacMiddleware(['payment:manage'])]),
  paymentValidation.refundPayment,
  paymentController.refundPayment
);

module.exports = router;

