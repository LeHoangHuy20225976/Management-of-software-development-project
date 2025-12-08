"""
Email Sending Flows for Hotel AI System

This module contains Prefect flows for hotel operations:
1. Booking Success Notification - Notify customer when booking is confirmed
2. Check-in/Check-out Notification - Notify customer for room ready/checkout
3. Staff Attendance Check - Send attendance report for staff
4. ML Report Analysis - Send analysis reports from ML service

All flows use HTML templates from templates/emails/ directory.
"""

from prefect import flow, task
from typing import List, Dict, Optional
from datetime import datetime


# ==============================================================================
# SHARED TASKS
# ==============================================================================

@task(name="send_email_task", retries=3, retry_delay_seconds=[10, 30, 60])
async def send_email_task(
    to: str | List[str],
    subject: str,
    body: str,
    html: Optional[str] = None,
    cc: Optional[List[str]] = None,
    bcc: Optional[List[str]] = None,
    attachments: Optional[List[Dict]] = None
) -> Dict:
    """
    Send email with retry logic
    
    Args:
        to: Recipient email(s)
        subject: Email subject
        body: Plain text body
        html: HTML body (optional)
        cc: CC recipients
        bcc: BCC recipients
        attachments: Email attachments
    
    Returns:
        Dict with send status
    """
    from src.application.services.llm.email_service import get_email_service
    
    email_service = get_email_service()
    
    result = await email_service.send_email(
        to=to,
        subject=subject,
        body=body,
        html=html,
        cc=cc,
        bcc=bcc,
        attachments=attachments
    )
    
    if result["status"] == "sent":
        print(f"✅ Email sent successfully to {result['recipients']}")
    else:
        print(f"❌ Failed to send email: {result.get('error')}")
        raise Exception(f"Email send failed: {result.get('error')}")
    
    return result


@task(name="load_email_template")
def load_email_template(template_name: str, context: Dict) -> str:
    """
    Load and render email template from templates/emails/ directory
    
    Args:
        template_name: Template name (without .html extension)
        context: Template context variables
    
    Returns:
        Rendered HTML string
    """
    from jinja2 import Environment, FileSystemLoader, select_autoescape
    from pathlib import Path
    
    template_dir = Path("templates/emails")
    
    # Setup Jinja2 environment with proper configuration
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=select_autoescape(['html', 'xml'])
    )
    
    template_file = f"{template_name}.html"
    
    try:
        template = env.get_template(template_file)
        html = template.render(**context)
        print(f"✅ Loaded template: {template_name}")
        return html
    except Exception as e:
        print(f"⚠️ Template {template_name} not found, using fallback")
        # Fallback to simple template
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hotel AI System</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                {"".join([f'<p><strong>{k}:</strong> {v}</p>' for k, v in context.items()])}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated message from Hotel AI System
            </p>
        </body>
        </html>
        """
        return html


# ==============================================================================
# FLOW 1: BOOKING SUCCESS NOTIFICATION
# Template: templates/emails/booking_confirmation.html
# ==============================================================================

@flow(name="notify-booking-success", log_prints=True)
async def notify_booking_success_flow(
    customer_email: str,
    customer_name: str,
    booking_id: str,
    room_type: str,
    check_in_date: str,
    check_out_date: str,
    total_price: float,
    special_requests: Optional[str] = None
) -> Dict:
    """
    Notify customer when booking is successful
    
    Uses template: booking_confirmation.html
    
    Args:
        customer_email: Customer's email address
        customer_name: Customer's full name
        booking_id: Unique booking ID
        room_type: Type of room booked
        check_in_date: Check-in date (YYYY-MM-DD)
        check_out_date: Check-out date (YYYY-MM-DD)
        total_price: Total booking price
        special_requests: Any special requests from customer
    
    Returns:
        Dict with send status
    """
    print(f"📧 Sending booking confirmation to {customer_name} ({customer_email})")
    
    # Prepare context for template
    context = {
        "guest_name": customer_name,
        "booking_id": booking_id,
        "room_type": room_type,
        "check_in": check_in_date,
        "check_out": check_out_date,
        "total_amount": f"{total_price:.2f}",
        "special_requests": special_requests or "None",
    }
    
    # Load HTML template
    html_body = load_email_template("booking_confirmation", context)
    
    # Plain text fallback
    plain_body = f"""
Booking Confirmation - Hotel AI

Dear {customer_name},

Your booking has been confirmed!

Booking Details:
- Booking ID: {booking_id}
- Room Type: {room_type}
- Check-in: {check_in_date}
- Check-out: {check_out_date}
- Total Price: ${total_price:.2f}
- Special Requests: {special_requests or 'None'}

Thank you for choosing our hotel!

Best regards,
Hotel AI Management Team
    """
    
    # Send email
    result = await send_email_task(
        to=customer_email,
        subject=f"Booking Confirmed - {booking_id}",
        body=plain_body,
        html=html_body
    )
    
    print(f"✅ Booking notification sent for {booking_id}")
    return result


# ==============================================================================
# FLOW 2: CHECK-IN / CHECK-OUT NOTIFICATION
# Templates: check_in_ready.html, checkout_reminder.html
# ==============================================================================

@flow(name="notify-checkin-checkout", log_prints=True)
async def notify_checkin_checkout_flow(
    customer_email: str,
    customer_name: str,
    booking_id: str,
    room_number: str,
    notification_type: str,
    time: Optional[str] = None,
    additional_info: Optional[Dict] = None
) -> Dict:
    """
    Notify customer for check-in or check-out
    
    Uses templates:
    - check_in: check_in_ready.html
    - check_out: checkout_reminder.html
    
    Args:
        customer_email: Customer's email address
        customer_name: Customer's full name
        booking_id: Booking ID
        room_number: Room number assigned
        notification_type: "check_in" or "check_out"
        time: Check-in/out time
        additional_info: Additional information (wifi_password, feedback_link, etc.)
    
    Returns:
        Dict with send status
    """
    if notification_type not in ["check_in", "check_out"]:
        raise ValueError(f"Invalid notification_type: {notification_type}. Must be 'check_in' or 'check_out'")
    
    print(f"📧 Sending {notification_type} notification to {customer_name}")
    
    additional_info = additional_info or {}
    
    if notification_type == "check_in":
        subject = f"Your Room is Ready! - Room {room_number}"
        template_name = "check_in_ready"
        
        context = {
            "guest_name": customer_name,
            "room_number": room_number,
            "check_in_time": time or "14:00",
            "booking_id": booking_id,
            "wifi_password": additional_info.get("wifi_password", "Ask at front desk"),
            "breakfast_time": additional_info.get("breakfast_time", "07:00 - 10:00"),
            "front_desk_phone": additional_info.get("front_desk_phone", "+1-234-567-8900")
        }
        
        plain_body = f"""
Your Room is Ready!

Dear {customer_name},

Great news! Your room is ready for check-in.

Room Details:
- Room Number: {room_number}
- Check-in Time: {time or '14:00'}
- WiFi Password: {additional_info.get('wifi_password', 'Ask at front desk')}

We look forward to welcoming you!

Best regards,
Hotel AI Management Team
        """
    else:
        subject = f"Check-out Reminder - Room {room_number}"
        template_name = "checkout_reminder"
        
        context = {
            "guest_name": customer_name,
            "room_number": room_number,
            "check_out_time": time or "11:00",
            "booking_id": booking_id,
            "feedback_link": additional_info.get("feedback_link", "https://hotel.ai/feedback")
        }
        
        plain_body = f"""
Check-out Reminder

Dear {customer_name},

This is a friendly reminder about your check-out today.

Details:
- Room Number: {room_number}
- Check-out Time: {time or '11:00'}

Thank you for staying with us!

Best regards,
Hotel AI Management Team
        """
    
    # Load HTML template
    html_body = load_email_template(template_name, context)
    
    # Send email
    result = await send_email_task(
        to=customer_email,
        subject=subject,
        body=plain_body,
        html=html_body
    )
    
    print(f"✅ {notification_type.replace('_', ' ').title()} notification sent")
    return result


# ==============================================================================
# FLOW 3: STAFF ATTENDANCE CHECK
# Template: templates/emails/staff_attendance.html
# ==============================================================================

@flow(name="notify-staff-attendance", log_prints=True)
async def notify_staff_attendance_flow(
    manager_email: str,
    report_date: str,
    department: str,
    total_staff: int,
    present_count: int,
    absent_count: int,
    late_count: int,
    absent_staff: Optional[List[Dict]] = None,
    late_staff: Optional[List[Dict]] = None
) -> Dict:
    """
    Send staff attendance report to manager
    
    Uses template: staff_attendance.html
    
    Args:
        manager_email: Manager's email address
        report_date: Date of the report (YYYY-MM-DD)
        department: Department name
        total_staff: Total number of staff
        present_count: Number of staff present
        absent_count: Number of staff absent
        late_count: Number of staff late
        absent_staff: List of absent staff [{name, id, reason}]
        late_staff: List of late staff [{name, id, minutes_late}]
    
    Returns:
        Dict with send status
    """
    print(f"📧 Sending attendance report for {department} - {report_date}")
    
    absent_staff = absent_staff or []
    late_staff = late_staff or []
    
    attendance_rate = (present_count / total_staff * 100) if total_staff > 0 else 0
    generated_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Prepare context for template
    context = {
        "department": department,
        "report_date": report_date,
        "total_staff": total_staff,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "attendance_rate": f"{attendance_rate:.1f}",
        "absent_staff": absent_staff,
        "late_staff": late_staff,
        "generated_time": generated_time
    }
    
    # Load HTML template
    html_body = load_email_template("staff_attendance", context)
    
    # Build plain text version
    absent_details = ""
    for staff in absent_staff:
        absent_details += f"\n  - {staff.get('name', 'Unknown')} (ID: {staff.get('id', 'N/A')}) - {staff.get('reason', 'Not specified')}"
    
    late_details = ""
    for staff in late_staff:
        late_details += f"\n  - {staff.get('name', 'Unknown')} (ID: {staff.get('id', 'N/A')}) - {staff.get('minutes_late', 0)} minutes late"
    
    absent_section = absent_details if absent_details else "\n  No absences"
    late_section = late_details if late_details else "\n  No late arrivals"
    
    subject = f"📊 Attendance Report: {department} - {report_date}"
    
    plain_body = f"""
Staff Attendance Report

Department: {department}
Date: {report_date}
Generated: {generated_time}

SUMMARY
Total Staff: {total_staff}
Present: {present_count}
Absent: {absent_count}
Late: {late_count}
Attendance Rate: {attendance_rate:.1f}%

ABSENT STAFF ({absent_count}){absent_section}

LATE ARRIVALS ({late_count}){late_section}

This is an automated report from Hotel AI System.
    """
    
    # Send email
    result = await send_email_task(
        to=manager_email,
        subject=subject,
        body=plain_body,
        html=html_body
    )
    
    print(f"✅ Attendance report sent to {manager_email}")
    return result


# ==============================================================================
# FLOW 4: ML REPORT ANALYSIS
# Template: templates/emails/ml_report.html
# ==============================================================================

@flow(name="send-ml-report", log_prints=True)
async def send_ml_report_flow(
    recipient_emails: List[str],
    report_type: str,
    report_title: str,
    report_summary: str,
    metrics: Dict,
    insights: List[str],
    recommendations: List[str],
    report_period: str
) -> Dict:
    """
    Send ML analysis report to stakeholders
    
    Uses template: ml_report.html
    
    Args:
        recipient_emails: List of recipient email addresses
        report_type: Type of report (occupancy, revenue, demand_forecast, sentiment, etc.)
        report_title: Title of the report
        report_summary: Executive summary
        metrics: Key metrics dictionary
        insights: List of key insights
        recommendations: List of recommendations
        report_period: Period covered (e.g., "2025-01-01 to 2025-01-31")
    
    Returns:
        Dict with send status
    """
    print(f"📧 Sending ML report: {report_title}")
    
    generated_time = datetime.now().strftime("%Y-%m-%d %H:%M")
    report_type_upper = report_type.replace('_', ' ').upper()
    report_type_formatted = report_type.replace('_', ' ').title()
    
    # Prepare context for template
    context = {
        "report_type_upper": report_type_upper,
        "report_title": report_title,
        "report_period": report_period,
        "report_summary": report_summary,
        "metrics": metrics,
        "insights": insights,
        "recommendations": recommendations,
        "generated_time": generated_time
    }
    
    # Load HTML template
    html_body = load_email_template("ml_report", context)
    
    # Build plain text version
    metrics_text = "\n".join([f"  - {k.replace('_', ' ').title()}: {v}" for k, v in metrics.items()])
    insights_text = "\n".join([f"  {i+1}. {insight}" for i, insight in enumerate(insights)])
    recommendations_text = "\n".join([f"  {i+1}. {rec}" for i, rec in enumerate(recommendations)])
    
    subject = f"📈 ML Analysis Report: {report_title}"
    
    plain_body = f"""
ML Analysis Report

Report: {report_title}
Type: {report_type_formatted}
Period: {report_period}
Generated: {generated_time}

EXECUTIVE SUMMARY
{report_summary}

KEY METRICS
{metrics_text}

KEY INSIGHTS
{insights_text}

RECOMMENDATIONS
{recommendations_text}

This report was generated by Hotel AI ML Service.
    """
    
    # Send email to all recipients
    result = await send_email_task(
        to=recipient_emails,
        subject=subject,
        body=plain_body,
        html=html_body
    )
    
    print(f"✅ ML report sent to {len(recipient_emails)} recipient(s)")
    return result


# ==============================================================================
# FLOW 5: PROMOTIONAL EMAIL
# Template: templates/emails/promotional.html
# ==============================================================================

@flow(name="send-promotional-email", log_prints=True)
async def send_promotional_email_flow(
    recipient_emails: List[str],
    discount: str,
    promo_code: str,
    offer_description: str,
    valid_until: str,
    campaign_name: Optional[str] = None
) -> Dict:
    """
    Send promotional email to customers
    
    Uses template: promotional.html
    
    Args:
        recipient_emails: List of recipient email addresses
        discount: Discount amount (e.g., "20%", "50%", "$100")
        promo_code: Promotional code for customers to use
        offer_description: Description of the offer
        valid_until: Expiry date of the offer
        campaign_name: Optional campaign name for tracking
    
    Returns:
        Dict with send status
    
    Example:
        >>> await send_promotional_email_flow(
        ...     recipient_emails=["guest1@email.com", "guest2@email.com"],
        ...     discount="30%",
        ...     promo_code="SUMMER30",
        ...     offer_description="Summer special discount on all suite rooms",
        ...     valid_until="August 31, 2025",
        ...     campaign_name="Summer 2025 Campaign"
        ... )
    """
    print(f"📧 Sending promotional email to {len(recipient_emails)} recipient(s)")
    if campaign_name:
        print(f"   Campaign: {campaign_name}")
    
    # Prepare context for template
    context = {
        "discount": discount,
        "promo_code": promo_code,
        "offer_description": offer_description,
        "valid_until": valid_until
    }
    
    # Load HTML template
    html_body = load_email_template("promotional", context)
    
    # Plain text fallback
    plain_body = f"""
Special Offer Just for You!

We have a special offer that we think you'll love!

Save up to {discount} on your next booking!

Offer Details:
- {offer_description}
- Valid until: {valid_until}
- Use code: {promo_code}

Why book with us?
- Award-winning service
- Luxury accommodations
- Prime location
- 100% satisfaction guarantee

Don't miss out on this amazing deal!

Best regards,
Hotel AI Management Team

To unsubscribe from promotional emails, please contact us.
    """
    
    subject = f"✨ Special Offer: Save {discount} - Use Code {promo_code}"
    
    # Send email to all recipients
    result = await send_email_task(
        to=recipient_emails,
        subject=subject,
        body=plain_body,
        html=html_body
    )
    
    print(f"✅ Promotional email sent to {len(recipient_emails)} recipient(s)")
    return result


# ==============================================================================
# FOR TESTING
# ==============================================================================

if __name__ == "__main__":
    import asyncio
    
    # Test booking notification
    print("Testing booking notification flow...")
    result = asyncio.run(
        notify_booking_success_flow(
            customer_email="test@example.com",
            customer_name="John Doe",
            booking_id="BOOK-2025-001",
            room_type="Deluxe Suite",
            check_in_date="2025-02-01",
            check_out_date="2025-02-03",
            total_price=299.99
        )
    )
    print(f"Result: {result}")
