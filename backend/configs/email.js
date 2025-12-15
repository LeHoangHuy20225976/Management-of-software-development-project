const nodemailer = require("nodemailer");

/**
 * Email Configuration
 * Nodemailer transporter for sending emails
 */

/**
 * Create email transporter
 * Uses Gmail by default, can be configured for other providers
 */
const createTransporter = () => {
  const config = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER || process.env.GMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.APP_PASS,
    },
  };

  // For custom SMTP servers
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: config.auth,
    });
  }

  // For service-based providers (Gmail, Outlook, etc.)
  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

/**
 * Email configuration options
 */
const emailConfig = {
  from:
    process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER,
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
};

module.exports = {
  transporter,
  emailConfig,
};
