# Email Notification System Documentation

## Overview

Complete email notification system using Nodemailer for sending transactional emails.

---

## 📁 Project Structure

```
configs/
  └── email.js                    # Email transporter configuration

modules/
  └── notification/
      ├── controller/
      │   └── notificationController.js   # HTTP request handlers
      ├── services/
      │   └── notificationService.js      # Email sending logic
      └── routes/
          └── notificationRoutes.js       # API routes
```

---

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Primary email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Or use legacy variables (still supported)
GMAIL_USER=your-email@gmail.com
APP_PASS=your-app-password
```

### Gmail Setup (Recommended)

1. **Enable 2-Step Verification**

   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**

   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Hotel Backend"
   - Copy the 16-character password
   - Use it as `EMAIL_PASSWORD` (remove spaces)

3. **Update .env**
   ```env
   EMAIL_USER=yourhotel@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

### Custom SMTP Server (Optional)

```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@your-domain.com
EMAIL_PASSWORD=your-password
```

---

## 📧 Available Email Templates

### 1. Booking Confirmation

Professional email with booking details.

### 2. Booking Cancellation

Notification when a booking is cancelled.

### 3. Password Reset

Secure password reset with OTP code and link.

### 4. Welcome Email

Sent to new users upon registration.

### 5. Payment Confirmation

Receipt for completed payments.

---

## 🚀 API Endpoints

Base path: `/notifications`

### Test Email

**POST** `/notifications/test`

```json
{
  "to": "user@example.com",
  "subject": "Test Email",
  "message": "This is a test message"
}
```

### Booking Confirmation

**POST** `/notifications/booking-confirmation`

```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "bookingId": "BK-12345",
  "hotelName": "Grand Hotel",
  "roomType": "Deluxe Suite",
  "checkIn": "2025-12-20",
  "checkOut": "2025-12-25",
  "totalPrice": "500"
}
```

### Booking Cancellation

**POST** `/notifications/booking-cancellation`

```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "bookingId": "BK-12345",
  "hotelName": "Grand Hotel",
  "checkIn": "2025-12-20"
}
```

### Password Reset

**POST** `/notifications/password-reset`

```json
{
  "email": "user@example.com",
  "resetToken": "123456",
  "resetUrl": "http://localhost:4200/auth/reset-password?token=123456"
}
```

### Welcome Email

**POST** `/notifications/welcome`

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Payment Confirmation

**POST** `/notifications/payment-confirmation`

```json
{
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "bookingId": "BK-12345",
  "amount": "500",
  "paymentMethod": "Credit Card",
  "transactionId": "TXN-98765"
}
```

---

## 💻 Usage in Code

### Import Service

```javascript
const notificationService = require("modules/notification/services/notificationService");
```

### Send Booking Confirmation

```javascript
// In your booking service/controller
const bookingData = {
  userEmail: user.email,
  userName: user.name,
  bookingId: booking.booking_id,
  hotelName: hotel.name,
  roomType: room.type,
  checkIn: booking.check_in_date,
  checkOut: booking.check_out_date,
  totalPrice: booking.total_price,
};

await notificationService.sendBookingConfirmation(bookingData);
```

### Send Custom Email

```javascript
await notificationService.sendEmail(
  "user@example.com",
  "Subject Line",
  "Plain text message",
  "<h1>HTML message</h1>" // optional
);
```

### Send Welcome Email on Registration

```javascript
// In auth service after user registration
await notificationService.sendWelcomeEmail(newUser.email, newUser.name);
```

---

## 🔧 Integration Examples

### Example 1: Booking Flow

```javascript
// modules/booking-engine/services/bookingService.js
const notificationService = require('../../notification/services/notificationService');

async createBooking(bookingData) {
  // Create booking in database
  const booking = await db.Booking.create(bookingData);

  // Send confirmation email
  try {
    await notificationService.sendBookingConfirmation({
      userEmail: booking.user.email,
      userName: booking.user.name,
      bookingId: booking.booking_id,
      hotelName: booking.hotel.name,
      roomType: booking.room.type,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      totalPrice: booking.total_price
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't fail the booking if email fails
  }

  return booking;
}
```

### Example 2: Update Auth Service

```javascript
// modules/auth/services/authService.js
const notificationService = require('../../notification/services/notificationService');

async register(userData) {
  // Create user
  const newUser = await db.User.create(userData);

  // Send welcome email
  await notificationService.sendWelcomeEmail(
    newUser.email,
    newUser.name
  );

  return newUser;
}

async verifyForgetPassword(email) {
  const user = await db.User.findOne({ where: { email } });
  const otp = await this.genOTP();
  await redis.set(email, otp, { EX: 300 });

  const resetUrl = `${process.env.RESET_PASSWORD_URL}${otp}`;

  // Use new notification service
  await notificationService.sendPasswordReset(email, otp, resetUrl);

  return { message: "Password reset email sent successfully" };
}
```

---

## 🧪 Testing

### Test via Postman

1. **Test Email Connectivity**

   ```
   POST http://localhost:3000/notifications/test
   Body: {
     "to": "your-email@gmail.com",
     "subject": "Test",
     "message": "Testing email system"
   }
   ```

2. **Test Booking Confirmation**
   ```
   POST http://localhost:3000/notifications/booking-confirmation
   Body: { ... booking data ... }
   ```

### Test via cURL

```bash
curl -X POST http://localhost:3000/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@gmail.com",
    "subject": "Test Email",
    "message": "Hello from Hotel Backend!"
  }'
```

---

## 🔍 Troubleshooting

### Email not sending

**Check logs on server startup:**

```
✅ Email transporter is ready to send emails  # Good
❌ Email transporter verification failed      # Problem
```

**Common issues:**

1. **Invalid credentials**

   - Use App Password, not regular password
   - Remove spaces from password

2. **2-Step Verification not enabled**

   - Required for Gmail App Passwords

3. **Less secure apps blocked**

   - Use App Password instead

4. **Port blocked**
   - Try port 587 or 465
   - Check firewall settings

### Test email transporter manually

```javascript
// Create test file: test-email.js
require("dotenv").config();
const { transporter } = require("./configs/email");

transporter.sendMail(
  {
    from: process.env.EMAIL_USER,
    to: "your-email@gmail.com",
    subject: "Test",
    text: "Testing",
  },
  (error, info) => {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Success:", info.messageId);
    }
  }
);
```

---

## 📝 Email Template Customization

### Modify HTML templates

Edit `modules/notification/services/notificationService.js`:

```javascript
async sendBookingConfirmation(bookingData) {
  const html = `
    <div style="...">
      <!-- Customize your HTML here -->
      <h1>Your Booking is Confirmed!</h1>
      <!-- Add your branding, colors, images -->
    </div>
  `;

  return this.sendEmail(userEmail, subject, text, html);
}
```

### Add new email template

```javascript
async sendCustomEmail(data) {
  const { userEmail, ...otherData } = data;

  const subject = "Your Custom Subject";
  const html = `
    <!-- Your custom template -->
  `;

  return this.sendEmail(userEmail, subject, text, html);
}
```

Then add route in `notificationRoutes.js` and controller method.

---

## 🔒 Security Best Practices

1. **Never commit credentials**

   - Use `.env` file
   - Add `.env` to `.gitignore`

2. **Use App Passwords**

   - Never use your main Gmail password

3. **Rate limiting** (TODO)

   - Add rate limiting to prevent spam

4. **Email validation**

   - Validate email format before sending

5. **Unsubscribe links** (TODO)
   - Add unsubscribe functionality

---

## 🚀 Production Recommendations

### Use Dedicated Email Service

For production, consider:

1. **SendGrid** (Recommended)

   - 100 emails/day free
   - Better deliverability
   - Analytics dashboard

2. **AWS SES**

   - Very cheap
   - Requires domain verification

3. **Mailgun**
   - Developer-friendly
   - Good API

### Example: SendGrid Integration

```javascript
// configs/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In service
async sendEmail(to, subject, text, html) {
  const msg = {
    to: to,
    from: process.env.EMAIL_FROM,
    subject: subject,
    text: text,
    html: html,
  };

  return sgMail.send(msg);
}
```

---

## ✅ Setup Checklist

- [ ] Install nodemailer (already installed)
- [ ] Get Gmail App Password
- [ ] Update `.env` with credentials
- [ ] Test with `/notifications/test` endpoint
- [ ] Integrate with booking flow
- [ ] Integrate with auth flow (welcome email)
- [ ] Test all email templates
- [ ] Add your branding to HTML templates
- [ ] Configure custom domain (production)

---

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)

---

Your email notification system is ready! Just add your credentials to `.env` and start sending emails! 📧✨
