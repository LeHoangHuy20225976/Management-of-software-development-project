# Email Service - Prefect Flows Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Email Flows](#email-flows)
4. [API Endpoints](#api-endpoints)
5. [Email Templates](#email-templates)
6. [Usage Examples](#usage-examples)
7. [Configuration](#configuration)
8. [Testing](#testing)

---

## 🎯 Overview

The Email Service provides comprehensive email functionality for the Hotel AI System using Prefect flows for reliable, scalable email delivery.

### Key Features

- ✅ **Simple Email Sending** - Send plain text and HTML emails
- ✅ **Template-based Emails** - Use Jinja2 templates for professional emails
- ✅ **Bulk Email Campaigns** - Send personalized emails to multiple recipients
- ✅ **Notification System** - Pre-configured notification types
- ✅ **Retry Logic** - Automatic retry with exponential backoff
- ⏳ **Audit Trail** - Database logging (disabled until DB is ready)
- ✅ **Async Processing** - Non-blocking email delivery

### Components

```
src/
├── application/
│   ├── services/llm/
│   │   └── email_service.py          # Email service implementation
│   ├── dtos/llm/
│   │   └── email_dto.py               # Request/Response models
│   └── controllers/llm/
│       └── email_router.py            # API endpoints
├── flow/
│   └── email_flow.py                  # Prefect flows
└── templates/
    └── emails/
        ├── booking_confirmation.html
        ├── check_in_ready.html
        └── promotional.html
```

---

## 🏗️ Architecture

### Email Flow Architecture

```
┌─────────────────────────────────────────────────┐
│              API Request (FastAPI)              │
│         POST /api/email/send                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│          Background Task (async)                │
│    Triggers Prefect Email Flow                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│           Prefect Flow Execution                │
│  ┌──────────────────────────────────────┐      │
│  │ 1. Validate email data               │      │
│  └──────────────┬───────────────────────┘      │
│                 ▼                               │
│  ┌──────────────────────────────────────┐      │
│  │ 2. Render template (if needed)       │      │
│  └──────────────┬───────────────────────┘      │
│                 ▼                               │
│  ┌──────────────────────────────────────┐      │
│  │ 3. Send email (with retry)           │      │
│  └──────────────┬───────────────────────┘      │
│                 ▼                               │
│  ┌──────────────────────────────────────┐      │
│  │ 4. Log to database (disabled)        │      │
│  └──────────────────────────────────────┘      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│              SMTP Server                        │
│         (Gmail, SendGrid, etc.)                 │
└─────────────────────────────────────────────────┘
```

---

## 📧 Email Flows

### 1. Simple Email Flow

**Flow Name:** `send-simple-email`

**Purpose:** Send a single email with plain text and/or HTML body

**Function:** `send_simple_email_flow(to, subject, body, html=None)`

**Features:**
- Email validation
- Retry logic (3 attempts with delays: 10s, 30s, 60s)
- Database logging (currently disabled - will be enabled when DB is ready)
- Support for plain text and HTML

**Example:**

```python
from src.flow.email_flow import send_simple_email_flow

# Send simple email
result = await send_simple_email_flow(
    to="guest@hotel.com",
    subject="Welcome to Our Hotel",
    body="Thank you for choosing us!",
    html="<h1>Welcome!</h1><p>Thank you for choosing us!</p>"
)
```

---

### 2. Templated Email Flow

**Flow Name:** `send-templated-email`

**Purpose:** Send email using Jinja2 templates with dynamic content

**Function:** `send_templated_email_flow(to, template_name, context, subject)`

**Features:**
- Jinja2 template rendering
- Context variable substitution
- Fallback to default template if template not found
- Auto-generate plain text version

**Example:**

```python
from src.flow.email_flow import send_templated_email_flow

# Send booking confirmation
result = await send_templated_email_flow(
    to="guest@hotel.com",
    template_name="booking_confirmation",
    context={
        "guest_name": "John Doe",
        "booking_id": "BOOK123",
        "check_in": "2025-02-01",
        "check_out": "2025-02-03",
        "room_number": "201",
        "room_type": "Deluxe Suite",
        "total_amount": 5000000
    },
    subject="Booking Confirmation"
)
```

---

### 3. Bulk Email Campaign Flow

**Flow Name:** `send-bulk-email-campaign`

**Purpose:** Send personalized emails to multiple recipients in batches

**Function:** `send_bulk_email_campaign_flow(recipients, subject, template_name, batch_size=10)`

**Features:**
- Batch processing (default 10 emails per batch)
- Personalization per recipient
- Progress tracking
- Statistics reporting
- Rate limiting between batches

**Example:**

```python
from src.flow.email_flow import send_bulk_email_campaign_flow

# Send promotional campaign
recipients = [
    {
        "email": "guest1@hotel.com",
        "context": {
            "name": "John Doe",
            "discount": "25%",
            "promo_code": "JOHN25"
        }
    },
    {
        "email": "guest2@hotel.com",
        "context": {
            "name": "Jane Smith",
            "discount": "30%",
            "promo_code": "JANE30"
        }
    }
]

result = await send_bulk_email_campaign_flow(
    recipients=recipients,
    subject="Special Offer Just for You",
    template_name="promotional",
    batch_size=10
)

# Result: {
#   "total": 2,
#   "sent": 2,
#   "failed": 0,
#   "duration_seconds": 5.2,
#   "timestamp": "2025-01-17T10:00:00Z"
# }
```

---

### 4. Notification Email Flow

**Flow Name:** `send-notification-email`

**Purpose:** Send predefined notification types with appropriate templates

**Function:** `send_notification_email_flow(recipient, notification_type, data)`

**Supported Notification Types:**
- `booking_confirmation` - Booking confirmation email
- `check_in_ready` - Room ready notification
- `payment_receipt` - Payment receipt
- `special_offer` - Promotional offers
- `late_checkout_reminder` - Check-out reminder

**Example:**

```python
from src.flow.email_flow import send_notification_email_flow

# Send check-in ready notification
result = await send_notification_email_flow(
    recipient="guest@hotel.com",
    notification_type="check_in_ready",
    data={
        "guest_name": "John Doe",
        "room_number": "201",
        "check_in_time": "14:00"
    }
)
```

---

## 🔌 API Endpoints

### 1. Send Simple Email

**Endpoint:** `POST /api/email/send`

**Request:**

```json
{
  "to": ["guest@hotel.com"],
  "subject": "Welcome",
  "body": "Thank you for choosing our hotel",
  "html": "<h1>Welcome!</h1><p>Thank you!</p>",
  "cc": ["manager@hotel.com"],
  "bcc": ["admin@hotel.com"]
}
```

**Response:**

```json
{
  "status": "queued",
  "message": "Email queued for sending",
  "recipients": ["guest@hotel.com"],
  "timestamp": "2025-01-17T10:00:00Z"
}
```

**cURL Example:**

```bash
curl -X POST "http://localhost:8000/api/email/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["guest@hotel.com"],
    "subject": "Welcome",
    "body": "Thank you for choosing our hotel"
  }'
```

---

### 2. Send Templated Email

**Endpoint:** `POST /api/email/send-templated`

**Request:**

```json
{
  "to": ["guest@hotel.com"],
  "template_name": "booking_confirmation",
  "subject": "Booking Confirmation",
  "context": {
    "guest_name": "John Doe",
    "booking_id": "BOOK123",
    "check_in": "2025-02-01",
    "check_out": "2025-02-03"
  }
}
```

**Response:**

```json
{
  "status": "queued",
  "message": "Templated email queued: booking_confirmation",
  "recipients": ["guest@hotel.com"],
  "timestamp": "2025-01-17T10:00:00Z"
}
```

---

### 3. Send Bulk Email

**Endpoint:** `POST /api/email/send-bulk`

**Request:**

```json
{
  "recipients": [
    {
      "email": "guest1@hotel.com",
      "context": {"name": "John", "discount": "20%"}
    },
    {
      "email": "guest2@hotel.com",
      "context": {"name": "Jane", "discount": "25%"}
    }
  ],
  "subject": "Special Offer",
  "template_name": "promotional"
}
```

---

### 4. Send Notification

**Endpoint:** `POST /api/email/notification/{notification_type}`

**Request:**

```json
{
  "recipient": "guest@hotel.com",
  "data": {
    "guest_name": "John Doe",
    "room_number": "201"
  }
}
```

**Example:**

```bash
curl -X POST "http://localhost:8000/api/email/notification/check_in_ready?recipient=guest@hotel.com" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "guest_name": "John Doe",
      "room_number": "201",
      "check_in_time": "14:00"
    }
  }'
```

---

### 5. List Templates

**Endpoint:** `GET /api/email/templates`

**Response:**

```json
{
  "templates": [
    "booking_confirmation",
    "check_in_ready",
    "promotional"
  ],
  "count": 3
}
```

---

## 📝 Email Templates

### Template Structure

Templates are stored in `templates/emails/` and use Jinja2 syntax.

### Available Templates

#### 1. Booking Confirmation (`booking_confirmation.html`)

**Variables:**
- `guest_name` - Guest's name
- `booking_id` - Booking ID
- `check_in` - Check-in date
- `check_out` - Check-out date
- `room_number` - Room number (optional)
- `room_type` - Room type (optional)
- `total_amount` - Total amount (optional)

#### 2. Check-in Ready (`check_in_ready.html`)

**Variables:**
- `guest_name` - Guest's name
- `room_number` - Room number
- `check_in_time` - Check-in time (default: 14:00)

#### 3. Promotional (`promotional.html`)

**Variables:**
- `name` - Guest's name
- `discount` - Discount percentage
- `promo_code` - Promo code
- `offer_description` - Offer description
- `valid_until` - Offer expiry date

### Creating New Templates

1. Create HTML file in `templates/emails/`:

```html
<!-- templates/emails/my_template.html -->
<!DOCTYPE html>
<html>
<body>
    <h1>Hello {{ guest_name }}!</h1>
    <p>{{ message }}</p>
</body>
</html>
```

2. Use in your flow:

```python
await send_templated_email_flow(
    to="guest@hotel.com",
    template_name="my_template",
    context={
        "guest_name": "John",
        "message": "Welcome!"
    },
    subject="Custom Email"
)
```

---

## 💡 Usage Examples

### Example 1: Send Welcome Email on Booking

```python
from src.flow.email_flow import send_notification_email_flow

@flow(name="process-new-booking")
async def process_booking_flow(booking_data: dict):
    """Process new booking and send confirmation"""
    
    # Save booking to database
    booking = await save_booking(booking_data)
    
    # Send confirmation email
    await send_notification_email_flow(
        recipient=booking["guest_email"],
        notification_type="booking_confirmation",
        data={
            "guest_name": booking["guest_name"],
            "booking_id": booking["id"],
            "check_in": booking["check_in_date"],
            "check_out": booking["check_out_date"],
            "room_number": booking["room_number"],
            "room_type": booking["room_type"],
            "total_amount": booking["total_amount"]
        }
    )
    
    return booking
```

### Example 2: Send Room Ready Notification

```python
from src.flow.email_flow import send_notification_email_flow

@flow(name="room-cleaning-completed")
async def room_cleaning_completed_flow(room_data: dict):
    """Notify guest when room is ready"""
    
    # Update room status
    await update_room_status(room_data["room_number"], "clean")
    
    # Check if guest is waiting
    booking = await get_todays_booking(room_data["room_number"])
    
    if booking:
        # Send notification
        await send_notification_email_flow(
            recipient=booking["guest_email"],
            notification_type="check_in_ready",
            data={
                "guest_name": booking["guest_name"],
                "room_number": room_data["room_number"],
                "check_in_time": "14:00"
            }
        )
```

### Example 3: Monthly Promotional Campaign

```python
from src.flow.email_flow import send_bulk_email_campaign_flow

@flow(name="monthly-promotion")
async def monthly_promotion_flow():
    """Send monthly promotional emails to all guests"""
    
    # Get active guests from database
    guests = await get_active_guests()
    
    # Prepare recipients with personalization
    recipients = []
    for guest in guests:
        recipients.append({
            "email": guest["email"],
            "context": {
                "name": guest["name"],
                "discount": calculate_discount(guest),
                "promo_code": generate_promo_code(guest),
                "offer_description": "Special discount on your next stay",
                "valid_until": "2025-12-31"
            }
        })
    
    # Send bulk campaign
    result = await send_bulk_email_campaign_flow(
        recipients=recipients,
        subject="Exclusive Offer Just for You!",
        template_name="promotional",
        batch_size=20
    )
    
    print(f"Campaign sent: {result['sent']} emails, {result['failed']} failed")
    return result
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hotel@example.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@hotel.com

# Email Settings
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAYS=10,30,60
EMAIL_BATCH_SIZE=10
```

### Update Email Service

Update `src/application/services/llm/email_service.py`:

```python
from src.infrastructure.config import get_settings

settings = get_settings()

email_service = EmailService(
    smtp_host=settings.smtp_host,
    smtp_port=settings.smtp_port,
    smtp_user=settings.smtp_user,
    smtp_password=settings.smtp_password,
    from_email=settings.from_email
)
```

---

## 🧪 Testing

### Test Flows Locally

```bash
# Test simple email
python src/flow/email_flow.py

# Or run specific flow
python -c "
from src.flow.email_flow import send_simple_email_flow
import asyncio

result = asyncio.run(
    send_simple_email_flow(
        to='test@example.com',
        subject='Test',
        body='Test email'
    )
)
print(result)
"
```

### Test via API

```bash
# Test simple email endpoint
curl -X POST "http://localhost:8000/api/email/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["test@example.com"],
    "subject": "Test Email",
    "body": "This is a test"
  }'

# Test templated email
curl -X POST "http://localhost:8000/api/email/send-templated" \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["test@example.com"],
    "template_name": "booking_confirmation",
    "subject": "Test Booking",
    "context": {
      "guest_name": "Test User",
      "booking_id": "TEST123"
    }
  }'
```

### Test via Prefect UI

1. Open Prefect UI: http://localhost:4200
2. Go to Deployments
3. Find "send-simple-email" deployment
4. Click "Run" → "Custom Run"
5. Enter parameters:
   ```json
   {
     "to": "test@example.com",
     "subject": "Test from Prefect",
     "body": "Testing email flow"
   }
   ```
6. Watch execution in real-time

---

## 📊 Monitoring

### View Flow Runs

```bash
# List recent email flow runs
prefect flow-run ls --flow-name send-simple-email

# Get flow run details
prefect flow-run inspect <flow-run-id>

# View logs
prefect flow-run logs <flow-run-id>
```

### Check Statistics

> **Note:** Database logging is currently disabled. Once database is set up, email statistics will be logged.

Future query example (when DB is ready):

```sql
-- Email success rate
SELECT
    DATE(timestamp) as date,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
    ROUND(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric * 100, 2) as success_rate
FROM email_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30;
```

For now, you can check email logs in Prefect UI or application logs.

---

## 🚀 Deployment

The email flows are automatically deployed when the Prefect worker starts.

### Manual Deployment

```bash
# Deploy all email flows
docker exec hotel-prefect-worker prefect deploy --all

# Deploy specific flow
docker exec hotel-prefect-worker prefect deploy \
  --name send-simple-email \
  --pool local-pool
```

### Schedule Email Flows

Add to `prefect.yaml`:

```yaml
- name: daily-promotional-email
  entrypoint: src/flow/my_email_campaign.py:daily_promo_flow
  work_pool:
    name: local-pool
  schedule:
    cron: "0 9 * * *"  # Run daily at 9 AM
  tags:
    - email
    - scheduled
```

---

## 📚 Additional Resources

- [Prefect Documentation](https://docs.prefect.io/)
- [Jinja2 Template Documentation](https://jinja.palletsprojects.com/)
- [aiosmtplib Documentation](https://aiosmtplib.readthedocs.io/)

---

**Created:** 2025-01-17  
**Last Updated:** 2025-01-17  
**Version:** 1.0.0

