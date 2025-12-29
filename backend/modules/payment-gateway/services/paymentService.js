const { Payment, Booking, User, Room, RoomType, Hotel } = require('../../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models');
const vnpayUtils = require('../../../utils/vnpayUtils');

/**
 * Payment Gateway Service
 * Integrates with VNPay for payment processing
 * 
 * Based on VNPay Documentation:
 * - Pay: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 * - Refund: https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr&refund.html
 */
class PaymentService {
  /**
   * Create a new payment for a booking
   * @param {object} options - Payment options
   * @param {number} options.bookingId - Booking ID
   * @param {string} options.ipAddress - Customer IP address
   * @param {string} options.bankCode - Bank code (optional)
   * @param {string} options.locale - Locale (vn or en)
   * @returns {Promise<object>} Payment record and redirect URL
   */
  async createPayment(options) {
    const { bookingId, ipAddress, bankCode, locale = 'vn' } = options;

    // Get booking details
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Room,
        include: [{
          model: RoomType,
          include: [{ model: Hotel }]
        }]
      }]
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if booking is in valid state for payment
    if (booking.status !== 'pending') {
      throw new Error(`Cannot create payment for booking with status: ${booking.status}`);
    }

    // Validate booking has a valid price
    if (!booking.total_price || booking.total_price <= 0) {
      throw new Error('Cannot create payment for booking with invalid price. Please contact support.');
    }

    // Check if there's already a pending/completed payment
    const existingPayment = await Payment.findOne({
      where: {
        booking_id: bookingId,
        status: { [Op.in]: ['pending', 'processing', 'completed'] }
      }
    });

    if (existingPayment) {
      if (existingPayment.status === 'completed') {
        throw new Error('This booking has already been paid');
      }
      // Return existing pending payment URL
      if (existingPayment.payment_url) {
        return {
          payment: existingPayment,
          paymentUrl: existingPayment.payment_url,
          isExisting: true
        };
      }
    }

    // Build order info
    const hotelName = booking.Room?.RoomType?.Hotel?.name || 'Hotel';
    const roomName = booking.Room?.name || 'Room';
    const orderInfo = `Payment for ${hotelName} - ${roomName} (Booking #${bookingId})`;

    // Create VNPay payment URL
    const vnpayResult = vnpayUtils.createPaymentUrl({
      amount: booking.total_price,
      orderId: bookingId.toString(),
      orderInfo,
      ipAddress,
      bankCode,
      locale
    });

    const transaction = await sequelize.transaction();

    try {
      // Create or update payment record
      let payment;
      if (existingPayment) {
        existingPayment.vnp_txn_ref = vnpayResult.txnRef;
        existingPayment.vnp_order_info = vnpayResult.orderInfo;
        existingPayment.payment_url = vnpayResult.paymentUrl;
        existingPayment.ip_address = ipAddress;
        existingPayment.status = 'processing';
        await existingPayment.save({ transaction });
        payment = existingPayment;
      } else {
        payment = await Payment.create({
          booking_id: bookingId,
          amount: booking.total_price,
          payment_method: 'vnpay',
          status: 'processing',
          vnp_txn_ref: vnpayResult.txnRef,
          vnp_order_info: vnpayResult.orderInfo,
          payment_url: vnpayResult.paymentUrl,
          ip_address: ipAddress
        }, { transaction });
      }

      await transaction.commit();

      return {
        payment,
        paymentUrl: vnpayResult.paymentUrl,
        txnRef: vnpayResult.txnRef,
        isExisting: false
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Handle VNPay return URL callback
   * @param {object} vnpParams - Parameters from VNPay callback
   * @returns {Promise<object>} Payment result
   */
  async handleVnpayReturn(vnpParams) {
    // Verify signature
    const isValidSignature = vnpayUtils.verifyReturnUrl(vnpParams);

    if (!isValidSignature) {
      throw new Error('Invalid signature');
    }

    const txnRef = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const transactionNo = vnpParams.vnp_TransactionNo;
    const bankCode = vnpParams.vnp_BankCode;
    const payDate = vnpParams.vnp_PayDate;
    const amount = parseInt(vnpParams.vnp_Amount) / 100; // VNPay returns amount * 100

    // Find payment by transaction reference
    const payment = await Payment.findOne({
      where: { vnp_txn_ref: txnRef },
      include: [{
        model: Booking,
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email']
        }]
      }]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check if already processed
    if (payment.status === 'completed') {
      return {
        success: true,
        message: 'Payment already processed',
        payment,
        alreadyProcessed: true
      };
    }

    const transaction = await sequelize.transaction();

    try {
      // Update payment record
      payment.vnp_response_code = responseCode;
      payment.vnp_transaction_no = transactionNo;
      payment.vnp_bank_code = bankCode;
      payment.vnp_pay_date = payDate;

      if (responseCode === '00') {
        // Payment successful
        payment.status = 'completed';

        // Update booking status to accepted
        const booking = await Booking.findByPk(payment.booking_id, { transaction });
        if (booking) {
          booking.status = 'accepted';
          await booking.save({ transaction });
        }
      } else {
        // Payment failed
        payment.status = 'failed';
      }

      await payment.save({ transaction });
      await transaction.commit();

      return {
        success: responseCode === '00',
        responseCode,
        message: vnpayUtils.getResponseMessage(responseCode),
        payment,
        booking: payment.Booking
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Handle VNPay IPN (Instant Payment Notification)
   * @param {object} vnpParams - Parameters from VNPay IPN
   * @returns {Promise<object>} IPN response
   */
  async handleVnpayIPN(vnpParams) {
    // Verify signature
    const isValidSignature = vnpayUtils.verifyReturnUrl(vnpParams);

    if (!isValidSignature) {
      return { RspCode: '97', Message: 'Checksum failed' };
    }

    const txnRef = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const amount = parseInt(vnpParams.vnp_Amount) / 100;
    const transactionNo = vnpParams.vnp_TransactionNo;
    const bankCode = vnpParams.vnp_BankCode;
    const payDate = vnpParams.vnp_PayDate;

    // Find payment
    const payment = await Payment.findOne({
      where: { vnp_txn_ref: txnRef }
    });

    if (!payment) {
      return { RspCode: '01', Message: 'Order not found' };
    }

    // Verify amount
    if (payment.amount !== amount) {
      return { RspCode: '04', Message: 'Amount invalid' };
    }

    // Check if already processed
    if (payment.status === 'completed' || payment.status === 'failed') {
      return { RspCode: '02', Message: 'Order already updated' };
    }

    const transaction = await sequelize.transaction();

    try {
      // Update payment
      payment.vnp_response_code = responseCode;
      payment.vnp_transaction_no = transactionNo;
      payment.vnp_bank_code = bankCode;
      payment.vnp_pay_date = payDate;

      if (responseCode === '00') {
        payment.status = 'completed';

        // Update booking
        const booking = await Booking.findByPk(payment.booking_id, { transaction });
        if (booking) {
          booking.status = 'accepted';
          await booking.save({ transaction });
        }
      } else {
        payment.status = 'failed';
      }

      await payment.save({ transaction });
      await transaction.commit();

      return { RspCode: '00', Message: 'Success' };
    } catch (error) {
      await transaction.rollback();
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  /**
   * Request refund for a payment
   * @param {object} options - Refund options
   * @param {number} options.paymentId - Payment ID
   * @param {number} options.amount - Refund amount (optional, defaults to full refund)
   * @param {string} options.reason - Refund reason
   * @param {string} options.createBy - User who initiated refund
   * @param {string} options.ipAddress - IP address
   * @returns {Promise<object>} Refund result
   */
  async refundPayment(options) {
    const { paymentId, amount, reason, createBy, ipAddress } = options;

    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: Booking }]
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    if (payment.status === 'refunded') {
      throw new Error('Payment already refunded');
    }

    const refundAmount = amount || payment.amount;
    const transactionType = refundAmount === payment.amount ? '02' : '03'; // 02: Full, 03: Partial

    // Create refund request
    const refundRequest = vnpayUtils.createRefundRequest({
      txnRef: payment.vnp_txn_ref,
      amount: refundAmount,
      transactionNo: payment.vnp_transaction_no,
      transactionDate: payment.vnp_pay_date,
      createBy,
      ipAddress,
      transactionType
    });

    try {
      // Call VNPay refund API using native fetch (Node 18+) or https module
      const result = await this._postToVnpay(refundRequest);

      if (result.vnp_ResponseCode === '00') {
        // Refund successful
        payment.status = 'refunded';
        await payment.save();

        // Update booking status
        if (payment.Booking) {
          payment.Booking.status = 'cancelled';
          await payment.Booking.save();
        }

        return {
          success: true,
          message: 'Refund successful',
          payment,
          vnpayResponse: result
        };
      } else {
        return {
          success: false,
          message: result.vnp_Message || 'Refund failed',
          responseCode: result.vnp_ResponseCode,
          vnpayResponse: result
        };
      }
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Query payment status from VNPay
   * @param {object} options - Query options
   * @param {number} options.paymentId - Payment ID
   * @param {string} options.ipAddress - IP address
   * @returns {Promise<object>} Query result
   */
  async queryPaymentStatus(options) {
    const { paymentId, ipAddress } = options;

    const payment = await Payment.findByPk(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.vnp_txn_ref || !payment.vnp_pay_date) {
      throw new Error('Payment has not been processed by VNPay');
    }

    // Create query request
    const queryRequest = vnpayUtils.createQueryRequest({
      txnRef: payment.vnp_txn_ref,
      transactionDate: payment.vnp_pay_date,
      ipAddress
    });

    try {
      const result = await this._postToVnpay(queryRequest);

      return {
        success: result.vnp_ResponseCode === '00',
        payment,
        vnpayResponse: result,
        transactionStatus: result.vnp_TransactionStatus,
        message: vnpayUtils.getResponseMessage(result.vnp_ResponseCode)
      };
    } catch (error) {
      console.error('Query error:', error);
      throw new Error(`Query failed: ${error.message}`);
    }
  }

  /**
   * Helper method to post to VNPay API
   * Uses native https module for compatibility
   * @param {object} data - Request body
   * @returns {Promise<object>} Response from VNPay
   */
  async _postToVnpay(data) {
    const https = require('https');
    const url = new URL(vnpayUtils.vnpayConfig.vnp_Api);
    const postData = JSON.stringify(data);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('Invalid JSON response from VNPay'));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @returns {Promise<object|null>} Payment details
   */
  async getPaymentById(paymentId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [{
        model: Booking,
        include: [
          {
            model: User,
            attributes: ['user_id', 'name', 'email', 'phone_number']
          },
          {
            model: Room,
            include: [{
              model: RoomType,
              include: [{ model: Hotel }]
            }]
          }
        ]
      }]
    });

    return payment;
  }

  /**
   * Get payment by booking ID
   * @param {number} bookingId - Booking ID
   * @returns {Promise<object|null>} Payment details
   */
  async getPaymentByBookingId(bookingId) {
    const payment = await Payment.findOne({
      where: { booking_id: bookingId },
      include: [{
        model: Booking,
        include: [
          {
            model: User,
            attributes: ['user_id', 'name', 'email', 'phone_number']
          }
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    return payment;
  }

  /**
   * Get all payments with filters
   * @param {object} filters - Filter options
   * @returns {Promise<object>} Paginated payment list
   */
  async getPayments(filters = {}) {
    const {
      booking_id,
      status,
      payment_method,
      user_id,
      date_from,
      date_to,
      limit = 50,
      offset = 0
    } = filters;

    const whereClause = {};
    const bookingWhereClause = {};

    if (booking_id) whereClause.booking_id = booking_id;
    if (status) whereClause.status = status;
    if (payment_method) whereClause.payment_method = payment_method;

    if (date_from) {
      whereClause.created_at = {
        ...whereClause.created_at,
        [Op.gte]: date_from
      };
    }

    if (date_to) {
      whereClause.created_at = {
        ...whereClause.created_at,
        [Op.lte]: date_to
      };
    }

    if (user_id) {
      bookingWhereClause.user_id = user_id;
    }

    const includeClause = [{
      model: Booking,
      where: Object.keys(bookingWhereClause).length > 0 ? bookingWhereClause : undefined,
      include: [
        {
          model: User,
          attributes: ['user_id', 'name', 'email']
        },
        {
          model: Room,
          include: [{
            model: RoomType,
            include: [{ model: Hotel, attributes: ['hotel_id', 'name'] }]
          }]
        }
      ]
    }];

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      payments: payments.rows,
      total: payments.count,
      limit,
      offset
    };
  }

  /**
   * Cancel a pending payment
   * @param {number} paymentId - Payment ID
   * @returns {Promise<object>} Updated payment
   */
  async cancelPayment(paymentId) {
    const payment = await Payment.findByPk(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending' && payment.status !== 'processing') {
      throw new Error('Can only cancel pending or processing payments');
    }

    payment.status = 'cancelled';
    await payment.save();

    return payment;
  }
}

module.exports = new PaymentService();

