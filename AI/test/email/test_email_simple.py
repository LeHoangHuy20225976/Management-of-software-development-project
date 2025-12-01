"""
Simple email testing without Prefect
Test the email service directly
"""

import asyncio
from src.application.services.llm.email_service import EmailService


async def test_email_service():
    """Test email service without Prefect"""
    
    print("=" * 60)
    print("Testing Email Service (No Prefect Required)")
    print("=" * 60)
    
    # Create email service
    # Using localhost:1025 (MailHog) - start with: docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
    email_service = EmailService(
        smtp_host="smtp.gmail.com",
        smtp_port=587,
        smtp_user="",
        smtp_password="",
        from_email="test@hotel.com"
    )
    
    print("\n✅ Email service initialized")
    print(f"   SMTP: {email_service.smtp_host}:{email_service.smtp_port}")
    print(f"   From: {email_service.from_email}")
    
    # CHANGE THIS TO YOUR EMAIL ADDRESS
    YOUR_EMAIL = ""  
    
    # Test 1: Simple email
    print("\n" + "=" * 60)
    print("Test 1: Simple Email")
    print("=" * 60)
    print(f"Sending to: {YOUR_EMAIL}")
    
    try:
        result = await email_service.send_email(
            to=YOUR_EMAIL,
            subject="Test Email - Simple",
            body="This is a test email from the Hotel AI System!",
            html="<h1>Hello!</h1><p>This is a <strong>test email</strong> from Hotel AI System</p>"
        )
        
        if result["status"] == "sent":
            print("✅ Email sent successfully!")
            print(f"   Recipients: {result['recipients']}")
            print(f"   Message ID: {result.get('message_id', 'N/A')}")
        else:
            print(f"❌ Failed: {result.get('error')}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Make sure MailHog is running: docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog")
    
    # Test 2: Templated email
    print("\n" + "=" * 60)
    print("Test 2: Templated Email")
    print("=" * 60)
    print(f"Sending to: {YOUR_EMAIL}")
    
    try:
        result = await email_service.send_templated_email(
            to=YOUR_EMAIL,
            template_name="booking_confirmation",
            context={
                "guest_name": "John Doe",
                "booking_id": "TEST123",
                "check_in": "2025-02-01",
                "check_out": "2025-02-03",
                "room_number": "201",
                "room_type": "Deluxe Suite",
                "total_amount": "5000000"
            },
            subject="Booking Confirmation - Test"
        )
        
        if result["status"] == "sent":
            print("✅ Templated email sent successfully!")
            print(f"   Recipients: {result['recipients']}")
        else:
            print(f"❌ Failed: {result.get('error')}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Bulk emails (all to your email with different content)
    print("\n" + "=" * 60)
    print("Test 3: Bulk Emails (3 emails to your inbox)")
    print("=" * 60)
    print(f"Sending 3 promotional emails to: {YOUR_EMAIL}")
    
    try:
        recipients = [
            {
                "email": YOUR_EMAIL,
                "context": {
                    "name": "Test User 1",
                    "discount": "20%",
                    "promo_code": "WELCOME20"
                }
            },
            {
                "email": YOUR_EMAIL,
                "context": {
                    "name": "Test User 2",
                    "discount": "25%",
                    "promo_code": "SPECIAL25"
                }
            },
            {
                "email": YOUR_EMAIL,
                "context": {
                    "name": "Test User 3",
                    "discount": "30%",
                    "promo_code": "VIP30"
                }
            }
        ]
        
        results = await email_service.send_bulk_emails(
            recipients=recipients,
            subject="Special Offer Just for You!",
            template_name="promotional"
        )
        
        sent_count = sum(1 for r in results if isinstance(r, dict) and r.get("status") == "sent")
        failed_count = len(results) - sent_count
        
        print(f"✅ Bulk email completed!")
        print(f"   Total: {len(results)}")
        print(f"   Sent: {sent_count}")
        print(f"   Failed: {failed_count}")
        
        # Show details for debugging
        if failed_count > 0:
            print("\n   Failed emails details:")
            for i, result in enumerate(results):
                if isinstance(result, dict) and result.get("status") != "sent":
                    print(f"   - Email {i+1}: {result.get('error', 'Unknown error')}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print(f"\n📧 Check your inbox: {YOUR_EMAIL}")
    print("You should have received 5 emails:")
    print("  1. Simple test email")
    print("  2. Booking confirmation (template)")
    print("  3-5. Three promotional emails with different discounts")


if __name__ == "__main__":
    print("\n🧪 Starting Email Service Tests\n")
    asyncio.run(test_email_service())
    print("\n✅ All tests completed!\n")

