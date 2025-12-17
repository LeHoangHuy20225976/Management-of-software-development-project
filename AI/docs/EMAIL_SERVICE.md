# Email Service - Prefect Flows Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Email Flows](#email-flows)
4. [Email Templates](#email-templates)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Testing](#testing)

---

## 🎯 Overview

The Email Service provides comprehensive email functionality for the Hotel AI System using Prefect flows for reliable, scalable email delivery.

### Key Features

- ✅ **Booking Notifications** - Automatic booking confirmation emails
- ✅ **Check-in/Check-out Alerts** - Room ready and checkout reminders
- ✅ **Staff Attendance Reports** - Daily HR attendance summaries
- ✅ **ML Analysis Reports** - Analytics and insights delivery
- ✅ **Promotional Campaigns** - Marketing email campaigns
- ✅ **Template-based Emails** - Professional Jinja2 HTML templates
- ✅ **Retry Logic** - Automatic retry with exponential backoff (10s, 30s, 60s)
- ✅ **Async Processing** - Non-blocking email delivery

### Components

```
src/
├── application/
│   └── services/llm/
│       └── email_service.py          # Email service implementation
├── flow/
│   └── email_flow.py                  # Prefect flows (5 flows)
└── templates/
    └── emails/
        ├── booking_confirmation.html  # Booking success
        ├── check_in_ready.html        # Room ready notification
        ├── checkout_reminder.html     # Checkout reminder
        ├── staff_attendance.html      # HR attendance report
        ├── ml_report.html             # ML analytics report
        └── promotional.html           # Marketing promotions
```

---

## 🏗️ Architecture

### Email Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prefect UI / API Trigger                      │
│                  http://localhost:4200                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Prefect Worker (local-pool)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 1. Load HTML template from templates/emails/              │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 2. Render template with Jinja2 context                    │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 3. Send email via SMTP (with retry: 3 attempts)           │  │
│  │    Retry delays: 10s → 30s → 60s                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SMTP Server (Gmail)                         │
│                    smtp.gmail.com:587                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📧 Email Flows

### Flow Summary

| # | Flow Name | Template | Description |
|---|-----------|----------|-------------|
| 1 | `notify-booking-success` | `booking_confirmation.html` | Booking confirmed |
| 2 | `notify-checkin-checkout` | `check_in_ready.html` / `checkout_reminder.html` | Room ready / Checkout |
| 3 | `notify-staff-attendance` | `staff_attendance.html` | HR attendance report |
| 4 | `send-ml-report` | `ml_report.html` | ML analytics report |
| 5 | `send-promotional-email` | `promotional.html` | Marketing promotions |

---

### 1. Booking Success Notification

**Flow Name:** `notify-booking-success`

**Template:** `booking_confirmation.html`

**Purpose:** Notify customer when booking is successfully confirmed

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_email` | string | ✅ | Customer's email address |
| `customer_name` | string | ✅ | Customer's full name |
| `booking_id` | string | ✅ | Unique booking ID |
| `room_type` | string | ✅ | Type of room booked |
| `check_in_date` | string | ✅ | Check-in date (YYYY-MM-DD) |
| `check_out_date` | string | ✅ | Check-out date (YYYY-MM-DD) |
| `total_price` | float | ✅ | Total booking price |
| `special_requests` | string | ❌ | Special requests from customer |

**Example (Prefect UI):**

```json
{
  "customer_email": "guest@email.com",
  "customer_name": "John Doe",
  "booking_id": "BOOK-2025-001",
  "room_type": "Deluxe Suite",
  "check_in_date": "2025-02-01",
  "check_out_date": "2025-02-03",
  "total_price": 299.99,
  "special_requests": "Late check-in requested"
}
```

---

### 2. Check-in / Check-out Notification

**Flow Name:** `notify-checkin-checkout`

**Templates:** 
- Check-in: `check_in_ready.html`
- Check-out: `checkout_reminder.html`

**Purpose:** Notify customer when room is ready or remind about checkout

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customer_email` | string | ✅ | Customer's email address |
| `customer_name` | string | ✅ | Customer's full name |
| `booking_id` | string | ✅ | Booking ID |
| `room_number` | string | ✅ | Room number assigned |
| `notification_type` | string | ✅ | `"check_in"` or `"check_out"` |
| `time` | string | ❌ | Check-in/out time |
| `additional_info` | object | ❌ | Extra info (wifi_password, feedback_link) |

**Example - Check-in:**

```json
{
  "customer_email": "guest@email.com",
  "customer_name": "John Doe",
  "booking_id": "BOOK-2025-001",
  "room_number": "301",
  "notification_type": "check_in",
  "time": "14:00",
  "additional_info": {
    "wifi_password": "hotel2025",
    "breakfast_time": "07:00 - 10:00"
  }
}
```

**Example - Check-out:**

```json
{
  "customer_email": "guest@email.com",
  "customer_name": "John Doe",
  "booking_id": "BOOK-2025-001",
  "room_number": "301",
  "notification_type": "check_out",
  "time": "11:00",
  "additional_info": {
    "feedback_link": "https://hotel.ai/feedback"
  }
}
```

---

### 3. Staff Attendance Report

**Flow Name:** `notify-staff-attendance`

**Template:** `staff_attendance.html`

**Purpose:** Send daily attendance report to manager/HR

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `manager_email` | string | ✅ | Manager's email address |
| `report_date` | string | ✅ | Date of report (YYYY-MM-DD) |
| `department` | string | ✅ | Department name |
| `total_staff` | int | ✅ | Total number of staff |
| `present_count` | int | ✅ | Number present |
| `absent_count` | int | ✅ | Number absent |
| `late_count` | int | ✅ | Number late |
| `absent_staff` | array | ❌ | List of absent staff |
| `late_staff` | array | ❌ | List of late staff |

**Example:**

```json
{
  "manager_email": "manager@hotel.com",
  "report_date": "2025-02-01",
  "department": "Housekeeping",
  "total_staff": 20,
  "present_count": 17,
  "absent_count": 2,
  "late_count": 1,
  "absent_staff": [
    {"name": "John Smith", "id": "EMP001", "reason": "Sick leave"},
    {"name": "Jane Doe", "id": "EMP002", "reason": "Personal leave"}
  ],
  "late_staff": [
    {"name": "Bob Wilson", "id": "EMP003", "minutes_late": 15}
  ]
}
```

---

### 4. ML Analysis Report

**Flow Name:** `send-ml-report`

**Template:** `ml_report.html`

**Purpose:** Send ML/Analytics reports to stakeholders

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recipient_emails` | array | ✅ | List of recipient emails |
| `report_type` | string | ✅ | Type (occupancy, revenue, demand_forecast) |
| `report_title` | string | ✅ | Report title |
| `report_summary` | string | ✅ | Executive summary |
| `metrics` | object | ✅ | Key metrics dictionary |
| `insights` | array | ✅ | List of key insights |
| `recommendations` | array | ✅ | List of recommendations |
| `report_period` | string | ✅ | Period covered |

**Example:**

```json
{
  "recipient_emails": ["manager@hotel.com", "owner@hotel.com"],
  "report_type": "occupancy",
  "report_title": "Monthly Occupancy Analysis",
  "report_summary": "Occupancy increased by 15% compared to last month, with weekend bookings showing the strongest growth.",
  "metrics": {
    "avg_occupancy": "78.5%",
    "peak_day": "Saturday",
    "total_revenue": "$125,000",
    "avg_daily_rate": "$185"
  },
  "insights": [
    "Weekend occupancy is 20% higher than weekdays",
    "Suite rooms are the most popular category",
    "Direct bookings increased by 10%"
  ],
  "recommendations": [
    "Consider implementing weekend premium pricing",
    "Increase suite room inventory",
    "Invest more in direct booking channels"
  ],
  "report_period": "January 2025"
}
```

---

### 5. Promotional Email

**Flow Name:** `send-promotional-email`

**Template:** `promotional.html`

**Purpose:** Send marketing promotional emails to customers

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `recipient_emails` | array | ✅ | List of recipient emails |
| `discount` | string | ✅ | Discount amount (e.g., "30%") |
| `promo_code` | string | ✅ | Promotional code |
| `offer_description` | string | ✅ | Description of the offer |
| `valid_until` | string | ✅ | Offer expiry date |
| `campaign_name` | string | ❌ | Campaign name for tracking |

**Example:**

```json
{
  "recipient_emails": ["guest1@email.com", "guest2@email.com", "guest3@email.com"],
  "discount": "30%",
  "promo_code": "SUMMER30",
  "offer_description": "Summer special discount on all suite rooms",
  "valid_until": "August 31, 2025",
  "campaign_name": "Summer 2025 Campaign"
}
```

---

## 📝 Email Templates

### Template Location

All templates are stored in `templates/emails/` directory.

### Available Templates

| Template | Used By | Description |
|----------|---------|-------------|
| `booking_confirmation.html` | notify-booking-success | Booking confirmation |
| `check_in_ready.html` | notify-checkin-checkout | Room ready notification |
| `checkout_reminder.html` | notify-checkin-checkout | Checkout reminder |
| `staff_attendance.html` | notify-staff-attendance | HR attendance report |
| `ml_report.html` | send-ml-report | ML analytics report |
| `promotional.html` | send-promotional-email | Marketing promotions |

### Template Variables

Templates use **Jinja2** syntax for variable substitution:

```html
<!-- Example -->
<p>Dear {{ guest_name }},</p>
<p>Your booking {{ booking_id }} is confirmed!</p>

{% if special_requests %}
<p>Special Requests: {{ special_requests }}</p>
{% endif %}

{% for item in items %}
<li>{{ item.name }}: {{ item.value }}</li>
{% endfor %}
```

### Creating New Templates

1. Create HTML file in `templates/emails/`:

```html
<!-- templates/emails/my_custom_template.html -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #667eea; color: white; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ title }}</h1>
        </div>
        <div class="content">
            <p>Hello {{ name }},</p>
            <p>{{ message }}</p>
        </div>
    </div>
</body>
</html>
```

2. Use `load_email_template` task in your flow:

```python
html_body = load_email_template("my_custom_template", {
    "title": "Welcome",
    "name": "John",
    "message": "Thank you for joining us!"
})
```

---

## ⚙️ Configuration

### Environment Variables

Add to `.env` file:

```bash
# SMTP Configuration (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password (16 characters)
SMTP_FROM_EMAIL=your-email@gmail.com
```

### Gmail App Password Setup

1. **Enable 2-Step Verification:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: Mail
   - Select device: Other (type "Hotel AI")
   - Copy the 16-character password

3. **Update `.env`:**
   ```bash
   SMTP_PASSWORD=your-16-char-app-password
   ```

---

## 🧪 Testing

### Test via Prefect UI

1. Open Prefect UI: http://localhost:4200
2. Go to **Deployments**
3. Select a deployment (e.g., `notify-booking-success`)
4. Click **Run** → **Custom Run**
5. Enter parameters as JSON
6. Click **Run**
7. Monitor execution in **Runs** tab

### Test via CLI

```bash
# Deploy all flows
docker compose exec prefect-worker uv run prefect deploy --all

# Run a specific deployment
docker compose exec prefect-worker uv run prefect deployment run 'notify-booking-success/notify-booking-success'
```

### Test Email Service Directly

```python
# test_email.py
import asyncio
from src.application.services.llm.email_service import get_email_service

async def test():
    service = get_email_service()
    result = await service.send_email(
        to="test@example.com",
        subject="Test Email",
        body="This is a test",
        html="<h1>Test</h1><p>This is a test</p>"
    )
    print(result)

asyncio.run(test())
```

---

## 📊 Monitoring

### View Flow Runs in Prefect UI

1. Open http://localhost:4200
2. Click **Runs** in sidebar
3. Filter by flow name or status
4. Click on a run to see details and logs

### Check Worker Status

```bash
# View worker logs
docker compose logs prefect-worker --tail 50

# Check worker status
docker compose ps prefect-worker
```

### List Deployments

```bash
docker compose exec prefect-server prefect deployment ls
```

---

## 🚀 Deployment

### Start Services

```bash
# Start all Prefect services
docker compose up -d prefect-server prefect-services prefect-worker

# Restart worker to redeploy flows
docker compose restart prefect-worker
```

### Deploy Specific Flow

```bash
docker compose exec prefect-worker uv run prefect deploy \
  --name notify-booking-success \
  --pool local-pool
```

### Schedule Flows (Optional)

Add schedule to `prefect.yaml`:

```yaml
- name: daily-attendance-report
  entrypoint: src/flow/email_flow.py:notify_staff_attendance_flow
  work_pool:
    name: local-pool
  schedule:
    cron: "0 8 * * *"  # Run daily at 8 AM
  tags:
    - email
    - scheduled
    - hr
```

---

## 📚 Additional Resources

- [Prefect Documentation](https://docs.prefect.io/)
- [Jinja2 Template Documentation](https://jinja.palletsprojects.com/)
- [aiosmtplib Documentation](https://aiosmtplib.readthedocs.io/)

---

**Created:** 2025-01-17  
**Last Updated:** 2025-12-08  
**Version:** 2.0.0
