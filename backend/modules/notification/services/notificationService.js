const { transporter, emailConfig } = require("../../../configs/email");

/**
 * Notification Service
 * Handles email notifications for various events
 */

const notificationService = {
  /**
   * Send a generic email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content (optional)
   */
  async sendEmail(to, subject, text, html = null) {
    try {
      const mailOptions = {
        from: emailConfig.from,
        to: to,
        subject: subject,
        text: text,
        html: html || text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  },

  /**
   * Send booking confirmation email
   * @param {object} bookingData - Booking details
   */
  async sendBookingConfirmation(bookingData) {
    const {
      userEmail,
      userName,
      bookingId,
      hotelName,
      roomType,
      roomName,
      guests,
      check_in_date,
      check_out_date,
      totalPrice,
    } = bookingData;

    const subject = `Booking Confirmation - ${hotelName}`;
    const text = `
Dear ${userName},

Your booking has been confirmed!

Booking Details:
- Booking ID: ${bookingId}
- Hotel: ${hotelName}
- Room Type: ${roomType}
- Room Name: ${roomName}
- Guests: ${guests}
- Check-in: ${check_in_date}
- Check-out: ${check_out_date}
- Total Price: $${totalPrice}

Thank you for choosing us!

Best regards,
Hotel Management Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff;">Booking Confirmation</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your booking has been confirmed!</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Hotel:</strong> ${hotelName}</p>
          <p><strong>Room Type:</strong> ${roomType}</p>
          <p><strong>Room Name:</strong> ${roomName}</p>
          <p><strong>Guests:</strong> ${guests}</p>
          <p><strong>Check-in:</strong> ${check_in_date}</p>
          <p><strong>Check-out:</strong> ${check_out_date}</p>
          <p><strong>Total Price:</strong> <span style="color: #28a745; font-size: 18px; font-weight: bold;">$${totalPrice}</span></p>
        </div>
        
        <p>Thank you for choosing us!</p>
        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
          If you have any questions, please contact us at ${emailConfig.from}
        </p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, text, html);
  },

  /**
   * Send booking cancellation email
   * @param {object} bookingData - Booking details
   */
  async sendBookingCancellation(bookingData) {
    const { userEmail, userName, bookingId, hotelName, check_in_date } =
      bookingData;

    const subject = `Booking Cancellation - ${hotelName}`;
    const text = `
Dear ${userName},

Your booking has been cancelled.

Booking ID: ${bookingId}
Hotel: ${hotelName}
Original Check-in Date: ${check_in_date}

If you did not request this cancellation, please contact us immediately.

Best regards,
Hotel Management Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #dc3545;">Booking Cancellation</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your booking has been cancelled.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Hotel:</strong> ${hotelName}</p>
          <p><strong>Original Check-in Date:</strong> ${check_in_date}</p>
        </div>
        
        <p>If you did not request this cancellation, please contact us immediately.</p>
        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
          Contact us at ${emailConfig.from}
        </p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, text, html);
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} resetToken - Reset token
   * @param {string} resetUrl - Reset URL
   */
  async sendPasswordReset(email, resetToken, resetUrl) {
    const subject = "Password Reset Request";
    const text = `
You requested to reset your password.

Use this code: ${resetToken}

Or click this link: ${resetUrl}

This code expires in 5 minutes.

If you didn't request this, please ignore this email.
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #007bff;">Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <p>Use this code:</p>
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 10px 0;">${resetToken}</h1>
          <p style="margin-top: 20px;">Or click the button below:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #dc3545; font-weight: bold;">This code expires in 5 minutes.</p>
        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  },

  /**
   * Send welcome email to new user
   * @param {string} email - User email
   * @param {string} name - User name
   */
  async sendWelcomeEmail(email, name) {
    const subject = "Welcome to Our Hotel Booking System!";
    const text = `
Dear ${name},

Welcome to our hotel booking platform!

Thank you for registering with us. You can now:
- Browse and book hotels
- Manage your bookings
- Save your favorite destinations
- Leave reviews

Start exploring amazing destinations today!

Best regards,
Hotel Management Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #28a745;">Welcome Aboard!</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Welcome to our hotel booking platform!</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>What you can do:</h3>
          <ul style="line-height: 1.8;">
            <li>Browse and book hotels</li>
            <li>Manage your bookings</li>
            <li>Save your favorite destinations</li>
            <li>Leave reviews</li>
          </ul>
        </div>
        
        <p>Start exploring amazing destinations today!</p>
        <p style="margin-top: 30px;">Best regards,<br>Hotel Management Team</p>
      </div>
    `;

    return this.sendEmail(email, subject, text, html);
  },

  /**
   * Send payment confirmation email
   * @param {object} paymentData - Payment details
   */
  async sendPaymentConfirmation(paymentData) {
    const { userEmail, userName, bookingId, amount, paymentMethod } =
      paymentData;

    const subject = "Payment Confirmation";
    const text = `
Dear ${userName},

Your payment has been successfully processed.

Payment Details:
- Booking ID: ${bookingId}
- Amount: $${amount}
- Payment Method: ${paymentMethod}

Thank you for your payment!

Best regards,
Hotel Management Team
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #28a745;">Payment Confirmation</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your payment has been successfully processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Amount:</strong> <span style="color: #28a745; font-size: 18px; font-weight: bold;">$${amount}</span></p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>
        
        <p>Thank you for your payment!</p>
        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
          Keep this email for your records.
        </p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, text, html);
  },
};

module.exports = notificationService;
