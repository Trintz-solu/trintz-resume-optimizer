import os
import httpx
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev") # Default Resend sandbox sender

async def send_email(to_email: str, subject: str, body: str) -> bool:
    """
    Reusable utility to send an HTML email via Resend API.
    A modern, highly reliable alternative to SMTP services like Brevo.
    """
    if not RESEND_API_KEY:
        print("WARNING: RESEND_API_KEY is not set. Email not sent.")
        # In dev mode we just print the contents if API key is missing
        if os.getenv("ENV", "development") == "development":
            print(f"--- DEVELOPMENT MOCK EMAIL ---\nTo: {to_email}\nSubject: {subject}\n{body}\n------------------------------")
        return False
        
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "from": EMAIL_FROM,
                "to": [to_email],
                "subject": subject,
                "html": body
            }
            response = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
            )
            response.raise_for_status()
            return True
    except Exception as e:
        print(f"Error sending email via Resend to {to_email}: {e}")
        return False
