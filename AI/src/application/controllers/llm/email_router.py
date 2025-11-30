"""
Email Router - API endpoints for email operations
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from src.application.dtos.llm.email_dto import (
    EmailRequest,
    EmailResponse,
    TemplatedEmailRequest,
    BulkEmailRequest,
    BulkEmailResponse
)
from datetime import datetime
from typing import List


router = APIRouter()


@router.post("/send", response_model=EmailResponse)
async def send_email(request: EmailRequest, background_tasks: BackgroundTasks):
    """
    Send a simple email
    
    This endpoint sends a single email with optional HTML body.
    Email is sent in the background to avoid blocking the API.
    """
    from src.flow.email_flow import send_simple_email_flow
    
    try:
        # Trigger email flow in background
        background_tasks.add_task(
            send_simple_email_flow,
            to=request.to,
            subject=request.subject,
            body=request.body,
            html=request.html
        )
        
        return EmailResponse(
            status="queued",
            message="Email queued for sending",
            recipients=request.to if isinstance(request.to, list) else [request.to],
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue email: {str(e)}")


@router.post("/send-templated", response_model=EmailResponse)
async def send_templated_email(request: TemplatedEmailRequest, background_tasks: BackgroundTasks):
    """
    Send email using template
    
    This endpoint sends an email using a Jinja2 template with context variables.
    """
    from src.flow.email_flow import send_templated_email_flow
    
    try:
        # Trigger templated email flow in background
        background_tasks.add_task(
            send_templated_email_flow,
            to=request.to,
            template_name=request.template_name,
            context=request.context,
            subject=request.subject
        )
        
        return EmailResponse(
            status="queued",
            message=f"Templated email queued: {request.template_name}",
            recipients=request.to if isinstance(request.to, list) else [request.to],
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue email: {str(e)}")


@router.post("/send-bulk", response_model=BulkEmailResponse)
async def send_bulk_email(request: BulkEmailRequest, background_tasks: BackgroundTasks):
    """
    Send bulk email campaign
    
    This endpoint sends personalized emails to multiple recipients.
    Emails are sent in batches to avoid overwhelming the SMTP server.
    """
    from src.flow.email_flow import send_bulk_email_campaign_flow
    
    try:
        # Trigger bulk email flow in background
        background_tasks.add_task(
            send_bulk_email_campaign_flow,
            recipients=request.recipients,
            subject=request.subject,
            template_name=request.template_name
        )
        
        return BulkEmailResponse(
            total=len(request.recipients),
            sent=0,
            failed=0,
            results=[],
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue bulk email: {str(e)}")


@router.post("/notification/{notification_type}")
async def send_notification(
    notification_type: str,
    recipient: str,
    data: dict,
    background_tasks: BackgroundTasks
):
    """
    Send notification email
    
    Supported notification types:
    - booking_confirmation
    - check_in_ready
    - payment_receipt
    - special_offer
    - late_checkout_reminder
    """
    from src.flow.email_flow import send_notification_email_flow
    
    valid_types = [
        "booking_confirmation",
        "check_in_ready",
        "payment_receipt",
        "special_offer",
        "late_checkout_reminder"
    ]
    
    if notification_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid notification type. Valid types: {', '.join(valid_types)}"
        )
    
    try:
        # Trigger notification flow in background
        background_tasks.add_task(
            send_notification_email_flow,
            recipient=recipient,
            notification_type=notification_type,
            data=data
        )
        
        return {
            "status": "queued",
            "message": f"Notification queued: {notification_type}",
            "recipient": recipient,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue notification: {str(e)}")


@router.get("/templates")
async def list_email_templates():
    """
    List available email templates
    """
    from pathlib import Path
    
    templates_dir = Path("templates/emails")
    
    if not templates_dir.exists():
        return {"templates": [], "message": "Templates directory not found"}
    
    templates = [f.stem for f in templates_dir.glob("*.html")]
    
    return {
        "templates": templates,
        "count": len(templates)
    }

