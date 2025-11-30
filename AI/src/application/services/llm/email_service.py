"""
Email Service for Hotel AI System
Handles email sending with templates and attachments
"""

import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, List, Dict
from pathlib import Path
import aiosmtplib
from jinja2 import Template
from datetime import datetime


class EmailService:
    """Email service for sending emails with templates and attachments"""
    
    def __init__(
        self,
        smtp_host: str = "smtp.gmail.com",
        smtp_port: int = 587,
        smtp_user: str = "",
        smtp_password: str = "",
        from_email: str = ""
    ):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.from_email = from_email or smtp_user
    
    async def send_email(
        self,
        to: str | List[str],
        subject: str,
        body: str,
        html: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        attachments: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Send email asynchronously
        
        Args:
            to: Recipient email(s)
            subject: Email subject
            body: Plain text body
            html: HTML body (optional)
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)
            attachments: List of attachments [{filename, content}]
        
        Returns:
            Dict with status and message_id
        """
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = self.from_email
        message["Subject"] = subject
        message["Date"] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
        
        # Handle multiple recipients
        if isinstance(to, list):
            message["To"] = ", ".join(to)
            recipients = to
        else:
            message["To"] = to
            recipients = [to]
        
        if cc:
            message["Cc"] = ", ".join(cc)
            recipients.extend(cc)
        
        if bcc:
            recipients.extend(bcc)
        
        # Add body
        message.attach(MIMEText(body, "plain"))
        
        if html:
            message.attach(MIMEText(html, "html"))
        
        # Add attachments
        if attachments:
            for attachment in attachments:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment["content"])
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= {attachment['filename']}"
                )
                message.attach(part)
        
        try:
            # Send email using aiosmtplib
            # Port 587 uses STARTTLS, Port 465 uses direct SSL/TLS
            use_tls = (self.smtp_port == 465)
            start_tls = (self.smtp_port == 587)
            
            smtp = aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=use_tls,
                start_tls=start_tls
            )
            
            await smtp.connect()
            
            if self.smtp_user and self.smtp_password:
                await smtp.login(self.smtp_user, self.smtp_password)
            
            await smtp.send_message(message)
            await smtp.quit()
            
            return {
                "status": "sent",
                "recipients": recipients,
                "message_id": message["Message-ID"],
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def send_templated_email(
        self,
        to: str | List[str],
        template_name: str,
        context: Dict,
        subject: str,
        attachments: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Send email using Jinja2 template
        
        Args:
            to: Recipient email(s)
            template_name: Template name
            context: Template context variables
            subject: Email subject
            attachments: Optional attachments
        
        Returns:
            Dict with status
        """
        # Load and render template
        template_path = Path(f"templates/emails/{template_name}.html")
        
        if template_path.exists():
            with open(template_path, "r", encoding="utf-8") as f:
                template = Template(f.read())
                html_body = template.render(**context)
        else:
            # Fallback to basic template
            html_body = self._generate_default_template(context)
        
        # Generate plain text from context
        plain_body = "\n".join([f"{k}: {v}" for k, v in context.items()])
        
        return await self.send_email(
            to=to,
            subject=subject,
            body=plain_body,
            html=html_body,
            attachments=attachments
        )
    
    def _generate_default_template(self, context: Dict) -> str:
        """Generate a default HTML template"""
        html = """
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 10px; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Hotel AI Management System</h2>
                </div>
                <div class="content">
        """
        
        for key, value in context.items():
            html += f"<p><strong>{key}:</strong> {value}</p>\n"
        
        html += """
                </div>
                <div class="footer">
                    <p>This is an automated message from Hotel AI System</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    async def send_bulk_emails(
        self,
        recipients: List[Dict],
        subject: str,
        template_name: str,
        delay_seconds: float = 1.0
    ) -> List[Dict]:
        """
        Send bulk emails with personalization
        
        Args:
            recipients: List of {email, context} dicts
            subject: Email subject
            template_name: Template name
            delay_seconds: Delay between emails to avoid rate limiting
        
        Returns:
            List of results for each email
        """
        results = []
        
        for i, recipient in enumerate(recipients):
            try:
                result = await self.send_templated_email(
                    to=recipient["email"],
                    template_name=template_name,
                    context=recipient.get("context", {}),
                    subject=subject
                )
                results.append(result)
                print(f"  ✓ Sent email {i+1}/{len(recipients)} to {recipient['email']}")
                
                # Add delay between emails to avoid rate limiting
                if i < len(recipients) - 1:
                    await asyncio.sleep(delay_seconds)
                    
            except Exception as e:
                print(f"  ✗ Failed email {i+1}/{len(recipients)}: {str(e)}")
                results.append({"status": "failed", "error": str(e)})
        
        return results


# Singleton instance
email_service = None

def get_email_service() -> EmailService:
    """Get email service instance"""
    global email_service
    if email_service is None:
        # TODO: Load from environment variables
        email_service = EmailService(
            smtp_host="smtp.gmail.com",
            smtp_port=587,
            smtp_user="hotel@example.com",
            smtp_password="your-password",
            from_email="noreply@hotel.com"
        )
    return email_service

