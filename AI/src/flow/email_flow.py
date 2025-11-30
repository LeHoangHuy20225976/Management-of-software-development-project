"""
Email Sending Flows for Hotel AI System

This module contains Prefect flows for various email operations:
- Simple email sending
- Templated emails
- Bulk email campaigns
- Notification emails with retry logic
"""

from prefect import flow, task
from typing import List, Dict, Optional
from datetime import datetime
import asyncio


@task(name="validate_email_data", retries=2)
def validate_email_data(email_data: Dict) -> Dict:
    """
    Validate email data before sending
    
    Args:
        email_data: Email data to validate
    
    Returns:
        Validated email data
    
    Raises:
        ValueError: If validation fails
    """
    required_fields = ["to", "subject", "body"]
    
    for field in required_fields:
        if field not in email_data:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate email format (basic check)
    recipients = email_data["to"]
    if isinstance(recipients, str):
        recipients = [recipients]
    
    for email in recipients:
        if "@" not in email or "." not in email:
            raise ValueError(f"Invalid email format: {email}")
    
    print(f"✅ Validated email data for {len(recipients)} recipient(s)")
    return email_data


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


@task(name="log_email_to_database")
async def log_email_to_database(email_data: Dict, result: Dict):
    """
    Log email sending to database for audit trail
    
    Args:
        email_data: Original email data
        result: Email sending result
    """
    # Database logging disabled until database is set up
    print(f"📝 Email logging (DB disabled): {result.get('message_id')}")
    
    # TODO: Enable when database is ready
    # from src.infrastructure.database import get_db
    # db = get_db()
    # await db.execute(
    #     "INSERT INTO email_logs (recipients, subject, status, message_id, timestamp) VALUES ($1, $2, $3, $4, $5)",
    #     result['recipients'], email_data['subject'], result['status'], result.get('message_id'), datetime.now()
    # )


@flow(name="send-simple-email", log_prints=True)
async def send_simple_email_flow(
    to: str | List[str],
    subject: str,
    body: str,
    html: Optional[str] = None
) -> Dict:
    """
    Simple email sending flow
    
    This flow sends a single email with validation and logging.
    
    Args:
        to: Recipient email(s)
        subject: Email subject
        body: Email body (plain text)
        html: HTML body (optional)
    
    Returns:
        Dict with send status
    
    Example:
        >>> await send_simple_email_flow(
        ...     to="guest@hotel.com",
        ...     subject="Welcome",
        ...     body="Thank you for booking!"
        ... )
    """
    print(f"📧 Starting email flow: {subject}")
    
    # Validate
    email_data = validate_email_data({
        "to": to,
        "subject": subject,
        "body": body,
        "html": html
    })
    
    # Send email
    result = await send_email_task(
        to=email_data["to"],
        subject=email_data["subject"],
        body=email_data["body"],
        html=email_data.get("html")
    )
    
    # Log to database (disabled until DB is ready)
    # await log_email_to_database(email_data, result)
    
    print(f"✅ Email flow completed: {result['status']}")
    return result


@task(name="load_email_template")
def load_email_template(template_name: str, context: Dict) -> str:
    """
    Load and render email template
    
    Args:
        template_name: Template name
        context: Template context variables
    
    Returns:
        Rendered HTML
    """
    from jinja2 import Template
    from pathlib import Path
    
    template_path = Path(f"templates/emails/{template_name}.html")
    
    if template_path.exists():
        with open(template_path, "r", encoding="utf-8") as f:
            template = Template(f.read())
            html = template.render(**context)
    else:
        # Fallback to simple template
        html = f"""
        <html>
        <body>
            <h2>Hotel AI System</h2>
            <div>
                {"<br>".join([f"<p><strong>{k}:</strong> {v}</p>" for k, v in context.items()])}
            </div>
        </body>
        </html>
        """
    
    print(f"✅ Loaded template: {template_name}")
    return html


@flow(name="send-templated-email", log_prints=True)
async def send_templated_email_flow(
    to: str | List[str],
    template_name: str,
    context: Dict,
    subject: str
) -> Dict:
    """
    Send email using template
    
    This flow renders a Jinja2 template and sends the email.
    
    Args:
        to: Recipient email(s)
        template_name: Template name (e.g., "booking_confirmation")
        context: Template context variables
        subject: Email subject
    
    Returns:
        Dict with send status
    
    Example:
        >>> await send_templated_email_flow(
        ...     to="guest@hotel.com",
        ...     template_name="booking_confirmation",
        ...     context={"guest_name": "John Doe", "booking_id": "BOOK123"},
        ...     subject="Booking Confirmation"
        ... )
    """
    print(f"📧 Starting templated email flow: {template_name}")
    
    # Load and render template
    html_body = load_email_template(template_name, context)
    
    # Generate plain text fallback
    plain_body = "\n".join([f"{k}: {v}" for k, v in context.items()])
    
    # Send email
    result = await send_email_task(
        to=to,
        subject=subject,
        body=plain_body,
        html=html_body
    )
    
    # Log to database (disabled until DB is ready)
    # await log_email_to_database(
    #     {"to": to, "subject": subject, "template": template_name},
    #     result
    # )
    
    print(f"✅ Templated email flow completed")
    return result


@task(name="send_bulk_emails_batch")
async def send_bulk_emails_batch(
    recipients: List[Dict],
    subject: str,
    template_name: str,
    batch_size: int = 10
) -> List[Dict]:
    """
    Send bulk emails in batches
    
    Args:
        recipients: List of {email, context} dicts
        subject: Email subject
        template_name: Template name
        batch_size: Number of emails per batch
    
    Returns:
        List of results
    """
    from src.application.services.llm.email_service import get_email_service
    
    email_service = get_email_service()
    results = []
    
    # Process in batches to avoid overwhelming SMTP server
    for i in range(0, len(recipients), batch_size):
        batch = recipients[i:i + batch_size]
        print(f"📤 Sending batch {i//batch_size + 1}: {len(batch)} emails")
        
        batch_results = await email_service.send_bulk_emails(
            recipients=batch,
            subject=subject,
            template_name=template_name
        )
        
        results.extend(batch_results)
        
        # Small delay between batches
        if i + batch_size < len(recipients):
            await asyncio.sleep(1)
    
    return results


@flow(name="send-bulk-email-campaign", log_prints=True)
async def send_bulk_email_campaign_flow(
    recipients: List[Dict],
    subject: str,
    template_name: str,
    batch_size: int = 10
) -> Dict:
    """
    Send bulk email campaign
    
    This flow sends personalized emails to multiple recipients in batches.
    
    Args:
        recipients: List of {email, context} dicts
        subject: Email subject
        template_name: Template name
        batch_size: Emails per batch (default: 10)
    
    Returns:
        Dict with campaign statistics
    
    Example:
        >>> await send_bulk_email_campaign_flow(
        ...     recipients=[
        ...         {"email": "guest1@hotel.com", "context": {"name": "John"}},
        ...         {"email": "guest2@hotel.com", "context": {"name": "Jane"}}
        ...     ],
        ...     subject="Special Offer",
        ...     template_name="promotional"
        ... )
    """
    print(f"📧 Starting bulk email campaign: {len(recipients)} recipients")
    
    start_time = datetime.now()
    
    # Send in batches
    results = await send_bulk_emails_batch(
        recipients=recipients,
        subject=subject,
        template_name=template_name,
        batch_size=batch_size
    )
    
    # Calculate statistics
    total = len(results)
    sent = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "sent")
    failed = total - sent
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    stats = {
        "total": total,
        "sent": sent,
        "failed": failed,
        "duration_seconds": duration,
        "timestamp": end_time.isoformat()
    }
    
    print(f"✅ Bulk email campaign completed")
    print(f"   Total: {total}, Sent: {sent}, Failed: {failed}")
    print(f"   Duration: {duration:.2f}s")
    
    return stats


@flow(name="send-notification-email", log_prints=True)
async def send_notification_email_flow(
    recipient: str,
    notification_type: str,
    data: Dict
) -> Dict:
    """
    Send notification email based on type
    
    This flow handles different notification types like:
    - booking_confirmation
    - check_in_ready
    - payment_receipt
    - special_offer
    
    Args:
        recipient: Recipient email
        notification_type: Type of notification
        data: Notification data
    
    Returns:
        Dict with send status
    
    Example:
        >>> await send_notification_email_flow(
        ...     recipient="guest@hotel.com",
        ...     notification_type="booking_confirmation",
        ...     data={"booking_id": "BOOK123", "guest_name": "John Doe"}
        ... )
    """
    print(f"🔔 Sending notification: {notification_type} to {recipient}")
    
    # Map notification types to templates and subjects
    notification_config = {
        "booking_confirmation": {
            "template": "booking_confirmation",
            "subject": "Booking Confirmation - Hotel AI"
        },
        "check_in_ready": {
            "template": "check_in_ready",
            "subject": "Your Room is Ready!"
        },
        "payment_receipt": {
            "template": "payment_receipt",
            "subject": "Payment Receipt"
        },
        "special_offer": {
            "template": "promotional",
            "subject": "Special Offer Just for You!"
        },
        "late_checkout_reminder": {
            "template": "checkout_reminder",
            "subject": "Check-out Reminder"
        }
    }
    
    config = notification_config.get(notification_type)
    
    if not config:
        raise ValueError(f"Unknown notification type: {notification_type}")
    
    # Send templated email
    result = await send_templated_email_flow(
        to=recipient,
        template_name=config["template"],
        context=data,
        subject=config["subject"]
    )
    
    print(f"✅ Notification sent: {notification_type}")
    return result


# For testing flows locally
if __name__ == "__main__":
    import asyncio
    
    # Test simple email
    print("Testing simple email flow...")
    result = asyncio.run(
        send_simple_email_flow(
            to="test@example.com",
            subject="Test Email",
            body="This is a test email from Hotel AI System"
        )
    )
    print(f"Result: {result}")
    
    # Test templated email
    print("\nTesting templated email flow...")
    result = asyncio.run(
        send_templated_email_flow(
            to="test@example.com",
            template_name="booking_confirmation",
            context={
                "guest_name": "John Doe",
                "booking_id": "BOOK123",
                "check_in": "2025-02-01",
                "check_out": "2025-02-03"
            },
            subject="Booking Confirmation"
        )
    )
    print(f"Result: {result}")
    
    # Test notification
    print("\nTesting notification email flow...")
    result = asyncio.run(
        send_notification_email_flow(
            recipient="test@example.com",
            notification_type="check_in_ready",
            data={
                "guest_name": "Jane Doe",
                "room_number": "201",
                "check_in_time": "14:00"
            }
        )
    )
    print(f"Result: {result}")

