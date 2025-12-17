const crypto = require('crypto');
const qs = require('qs');

/**
 * VNPay Utility Functions
 * Based on VNPay Sandbox Documentation: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */

/**
 * VNPay Configuration
 * These should be loaded from environment variables in production
 */
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'HJHRFWVG',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '1BKDBDK2UOBED86C469IHOYNEZ0TUKHH',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_Api: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payments/vnpay-return',
  vnp_Version: '2.1.0',
  vnp_CurrCode: 'VND',
  vnp_Locale: 'vn',
  vnp_OrderType: 'other'
};

/**
 * Sort object keys alphabetically
 * @param {object} obj - Object to sort
 * @returns {object} Sorted object
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

/**
 * Create HMAC SHA512 hash
 * @param {string} secretKey - Secret key
 * @param {string} data - Data to hash
 * @returns {string} Hex-encoded hash
 */
function hmacSHA512(secretKey, data) {
  const hmac = crypto.createHmac('sha512', secretKey);
  return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
}

/**
 * Generate random transaction reference
 * @param {number} length - Length of the reference
 * @returns {string} Random reference string
 */
function generateTxnRef(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date for VNPay (yyyyMMddHHmmss)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatVnpayDate(date = new Date()) {
  const pad = (n) => n.toString().padStart(2, '0');
  
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/**
 * Build payment URL for VNPay
 * @param {object} options - Payment options
 * @param {number} options.amount - Amount in VND
 * @param {string} options.orderId - Order/Booking ID
 * @param {string} options.orderInfo - Order description
 * @param {string} options.ipAddress - Customer IP address
 * @param {string} options.bankCode - Bank code (optional)
 * @param {string} options.locale - Locale (vn or en)
 * @returns {object} Payment URL and transaction reference
 */
function createPaymentUrl(options) {
  const {
    amount,
    orderId,
    orderInfo,
    ipAddress,
    bankCode = '',
    locale = 'vn'
  } = options;

  const date = new Date();
  const createDate = formatVnpayDate(date);
  
  // Expire after 15 minutes
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
  const vnpExpireDate = formatVnpayDate(expireDate);
  
  // Generate unique transaction reference
  const txnRef = `${orderId}_${Date.now()}`;

  let vnpParams = {
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: 'pay',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: vnpayConfig.vnp_CurrCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: vnpayConfig.vnp_OrderType,
    vnp_Amount: Math.round(amount * 100), // VNPay requires amount * 100
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddress,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: vnpExpireDate
  };

  if (bankCode) {
    vnpParams.vnp_BankCode = bankCode;
  }

  // Sort parameters
  vnpParams = sortObject(vnpParams);

  // Build query string for signing
  const signData = qs.stringify(vnpParams, { encode: false });
  
  // Create signature
  const secureHash = hmacSHA512(vnpayConfig.vnp_HashSecret, signData);
  vnpParams.vnp_SecureHash = secureHash;

  // Build final URL
  const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnpParams, { encode: false });

  return {
    paymentUrl,
    txnRef,
    createDate,
    orderInfo
  };
}

/**
 * Verify VNPay return/IPN signature
 * @param {object} vnpParams - Parameters from VNPay callback
 * @returns {boolean} Whether signature is valid
 */
function verifyReturnUrl(vnpParams) {
  const secureHash = vnpParams.vnp_SecureHash;
  
  // Remove hash fields before verification
  const params = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;
  
  // Sort and sign
  const sortedParams = sortObject(params);
  const signData = qs.stringify(sortedParams, { encode: false });
  const checkHash = hmacSHA512(vnpayConfig.vnp_HashSecret, signData);
  
  return secureHash === checkHash;
}

/**
 * Build refund request for VNPay
 * @param {object} options - Refund options
 * @param {string} options.txnRef - Original transaction reference
 * @param {number} options.amount - Refund amount in VND
 * @param {string} options.transactionNo - VNPay transaction number
 * @param {string} options.transactionDate - Original transaction date (yyyyMMddHHmmss)
 * @param {string} options.createBy - User who initiated refund
 * @param {string} options.ipAddress - IP address
 * @param {string} options.transactionType - 02: Full refund, 03: Partial refund
 * @returns {object} Refund request body
 */
function createRefundRequest(options) {
  const {
    txnRef,
    amount,
    transactionNo,
    transactionDate,
    createBy,
    ipAddress,
    transactionType = '02' // Full refund
  } = options;

  const date = new Date();
  const createDate = formatVnpayDate(date);
  const requestId = formatVnpayDate(date);

  const orderInfo = `Refund for transaction ${txnRef}`;

  // Build hash data (pipe-separated values in specific order)
  const hashData = [
    requestId,
    vnpayConfig.vnp_Version,
    'refund',
    vnpayConfig.vnp_TmnCode,
    transactionType,
    txnRef,
    Math.round(amount * 100),
    transactionNo || '0',
    transactionDate,
    createBy,
    createDate,
    ipAddress,
    orderInfo
  ].join('|');

  const secureHash = hmacSHA512(vnpayConfig.vnp_HashSecret, hashData);

  return {
    vnp_RequestId: requestId,
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: 'refund',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_TransactionType: transactionType,
    vnp_TxnRef: txnRef,
    vnp_Amount: Math.round(amount * 100),
    vnp_TransactionNo: transactionNo || '0',
    vnp_TransactionDate: transactionDate,
    vnp_CreateBy: createBy,
    vnp_CreateDate: createDate,
    vnp_IpAddr: ipAddress,
    vnp_OrderInfo: orderInfo,
    vnp_SecureHash: secureHash
  };
}

/**
 * Build query transaction request for VNPay
 * @param {object} options - Query options
 * @param {string} options.txnRef - Transaction reference
 * @param {string} options.transactionDate - Transaction date (yyyyMMddHHmmss)
 * @param {string} options.ipAddress - IP address
 * @returns {object} Query request body
 */
function createQueryRequest(options) {
  const {
    txnRef,
    transactionDate,
    ipAddress
  } = options;

  const date = new Date();
  const createDate = formatVnpayDate(date);
  const requestId = formatVnpayDate(date);
  const orderInfo = `Query transaction ${txnRef}`;

  // Build hash data (pipe-separated values in specific order)
  const hashData = [
    requestId,
    vnpayConfig.vnp_Version,
    'querydr',
    vnpayConfig.vnp_TmnCode,
    txnRef,
    transactionDate,
    createDate,
    ipAddress,
    orderInfo
  ].join('|');

  const secureHash = hmacSHA512(vnpayConfig.vnp_HashSecret, hashData);

  return {
    vnp_RequestId: requestId,
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: 'querydr',
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_TransactionDate: transactionDate,
    vnp_CreateDate: createDate,
    vnp_IpAddr: ipAddress,
    vnp_SecureHash: secureHash
  };
}

/**
 * Get VNPay response code message
 * @param {string} responseCode - VNPay response code
 * @returns {string} Human-readable message
 */
function getResponseMessage(responseCode) {
  const messages = {
    '00': 'Transaction successful',
    '07': 'Money deducted, transaction suspected (fraud/abnormal)',
    '09': 'Transaction failed: Card/Account not registered for Internet Banking',
    '10': 'Transaction failed: Card/Account authentication failed more than 3 times',
    '11': 'Transaction failed: Payment timeout. Please try again',
    '12': 'Transaction failed: Card/Account is locked',
    '13': 'Transaction failed: Incorrect OTP. Please try again',
    '24': 'Transaction cancelled by customer',
    '51': 'Transaction failed: Insufficient balance',
    '65': 'Transaction failed: Daily transaction limit exceeded',
    '75': 'Bank is under maintenance',
    '79': 'Transaction failed: Incorrect payment password too many times',
    '99': 'Other error'
  };

  return messages[responseCode] || `Unknown error (${responseCode})`;
}

/**
 * Get IP address from request
 * @param {object} req - Express request object
 * @returns {string} IP address
 */
function getIpAddress(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
}

module.exports = {
  vnpayConfig,
  sortObject,
  hmacSHA512,
  generateTxnRef,
  formatVnpayDate,
  createPaymentUrl,
  verifyReturnUrl,
  createRefundRequest,
  createQueryRequest,
  getResponseMessage,
  getIpAddress
};

