const notificationService = require("../services/notificationService");
const responseUtils = require("../../../utils/responseUtils");

/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */

const notificationController = {
  /**
   * Send a test email
   * POST /notifications/test
   * Body: { "to": "email@example.com", "subject": "Test", "message": "Hello" }
   */
  async sendTestEmail(req, res) {
    try {
      const { to, subject, message } = req.body;

      if (!to || !subject || !message) {
        return responseUtils.error(
          res,
          "Missing required fields: to, subject, message"
        );
      }

      const result = await notificationService.sendEmail(to, subject, message);

      return responseUtils.ok(res, {
        message: "Test email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send test email error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Send booking confirmation email
   * POST /notifications/booking-confirmation
   */
  async sendBookingConfirmation(req, res) {
    try {
      const bookingData = req.body;

      const requiredFields = [
        "userEmail",
        "userName",
        "bookingId",
        "hotelName",
        "roomType",
        "roomName",
        "guests",
        "check_in_date",
        "check_out_date",
        "totalPrice",
      ];
      const missingFields = requiredFields.filter(
        (field) => !bookingData[field]
      );

      if (missingFields.length > 0) {
        return responseUtils.error(
          res,
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      const result = await notificationService.sendBookingConfirmation(
        bookingData
      );

      return responseUtils.ok(res, {
        message: "Booking confirmation email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send booking confirmation error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Send booking cancellation email
   * POST /notifications/booking-cancellation
   */
  async sendBookingCancellation(req, res) {
    try {
      const bookingData = req.body;

      const requiredFields = [
        "userEmail",
        "userName",
        "bookingId",
        "hotelName",
        "check_in_date",
      ];
      const missingFields = requiredFields.filter(
        (field) => !bookingData[field]
      );

      if (missingFields.length > 0) {
        return responseUtils.error(
          res,
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      const result = await notificationService.sendBookingCancellation(
        bookingData
      );

      return responseUtils.ok(res, {
        message: "Booking cancellation email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send booking cancellation error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Send password reset email
   * POST /notifications/password-reset
   */
  async sendPasswordReset(req, res) {
    try {
      const { email, resetToken, resetUrl } = req.body;

      if (!email || !resetToken || !resetUrl) {
        return responseUtils.error(
          res,
          "Missing required fields: email, resetToken, resetUrl"
        );
      }

      const result = await notificationService.sendPasswordReset(
        email,
        resetToken,
        resetUrl
      );

      return responseUtils.ok(res, {
        message: "Password reset email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send password reset error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Send welcome email
   * POST /notifications/welcome
   */
  async sendWelcomeEmail(req, res) {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return responseUtils.error(res, "Missing required fields: email, name");
      }

      const result = await notificationService.sendWelcomeEmail(email, name);

      return responseUtils.ok(res, {
        message: "Welcome email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send welcome email error:", error);
      return responseUtils.error(res, error.message);
    }
  },

  /**
   * Send payment confirmation email
   * POST /notifications/payment-confirmation
   */
  async sendPaymentConfirmation(req, res) {
    try {
      const paymentData = req.body;

      const requiredFields = [
        "userEmail",
        "userName",
        "bookingId",
        "amount",
        "paymentMethod",
      ];
      const missingFields = requiredFields.filter(
        (field) => !paymentData[field]
      );

      if (missingFields.length > 0) {
        return responseUtils.error(
          res,
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }

      const result = await notificationService.sendPaymentConfirmation(
        paymentData
      );

      return responseUtils.ok(res, {
        message: "Payment confirmation email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Send payment confirmation error:", error);
      return responseUtils.error(res, error.message);
    }
  },
};

module.exports = notificationController;
