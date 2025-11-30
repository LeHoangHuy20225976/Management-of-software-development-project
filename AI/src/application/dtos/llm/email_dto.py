"""
Email DTOs for request/response models
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime


class EmailAttachment(BaseModel):
    """Email attachment model"""
    filename: str = Field(..., description="Attachment filename")
    content: bytes = Field(..., description="Attachment content in bytes")
    content_type: Optional[str] = Field(
        default="application/octet-stream",
        description="MIME type"
    )


class EmailRequest(BaseModel):
    """Request model for sending email"""
    to: List[EmailStr] | EmailStr = Field(..., description="Recipient email(s)")
    subject: str = Field(..., description="Email subject", min_length=1, max_length=200)
    body: str = Field(..., description="Email body (plain text)")
    html: Optional[str] = Field(None, description="HTML body (optional)")
    cc: Optional[List[EmailStr]] = Field(None, description="CC recipients")
    bcc: Optional[List[EmailStr]] = Field(None, description="BCC recipients")
    attachments: Optional[List[Dict]] = Field(None, description="Email attachments")
    
    class Config:
        json_schema_extra = {
            "example": {
                "to": ["guest@example.com"],
                "subject": "Welcome to Our Hotel",
                "body": "Thank you for choosing our hotel!",
                "html": "<h1>Welcome!</h1><p>Thank you for choosing our hotel!</p>"
            }
        }


class TemplatedEmailRequest(BaseModel):
    """Request model for templated email"""
    to: List[EmailStr] | EmailStr = Field(..., description="Recipient email(s)")
    template_name: str = Field(..., description="Template name")
    context: Dict = Field(..., description="Template context variables")
    subject: str = Field(..., description="Email subject")
    attachments: Optional[List[Dict]] = Field(None, description="Email attachments")
    
    class Config:
        json_schema_extra = {
            "example": {
                "to": ["guest@example.com"],
                "template_name": "booking_confirmation",
                "subject": "Booking Confirmation",
                "context": {
                    "guest_name": "John Doe",
                    "booking_id": "BOOK123",
                    "check_in": "2025-02-01",
                    "check_out": "2025-02-03"
                }
            }
        }


class BulkEmailRequest(BaseModel):
    """Request model for bulk email"""
    recipients: List[Dict] = Field(
        ...,
        description="List of recipients with email and context"
    )
    subject: str = Field(..., description="Email subject")
    template_name: str = Field(..., description="Template name")
    
    class Config:
        json_schema_extra = {
            "example": {
                "recipients": [
                    {
                        "email": "guest1@example.com",
                        "context": {"name": "John", "room": "201"}
                    },
                    {
                        "email": "guest2@example.com",
                        "context": {"name": "Jane", "room": "202"}
                    }
                ],
                "subject": "Room Ready Notification",
                "template_name": "room_ready"
            }
        }


class EmailResponse(BaseModel):
    """Response model for email operations"""
    status: str = Field(..., description="Email status: sent, failed, queued")
    message: str = Field(..., description="Status message")
    recipients: List[str] = Field(..., description="List of recipients")
    message_id: Optional[str] = Field(None, description="Email message ID")
    timestamp: str = Field(..., description="Timestamp of operation")
    error: Optional[str] = Field(None, description="Error message if failed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "sent",
                "message": "Email sent successfully",
                "recipients": ["guest@example.com"],
                "message_id": "abc123",
                "timestamp": "2025-01-17T10:00:00Z"
            }
        }


class BulkEmailResponse(BaseModel):
    """Response model for bulk email operations"""
    total: int = Field(..., description="Total emails to send")
    sent: int = Field(..., description="Number of emails sent")
    failed: int = Field(..., description="Number of emails failed")
    results: List[Dict] = Field(..., description="Individual email results")
    timestamp: str = Field(..., description="Timestamp of operation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 100,
                "sent": 98,
                "failed": 2,
                "results": [
                    {"email": "guest1@example.com", "status": "sent"},
                    {"email": "guest2@example.com", "status": "failed", "error": "Invalid email"}
                ],
                "timestamp": "2025-01-17T10:00:00Z"
            }
        }

