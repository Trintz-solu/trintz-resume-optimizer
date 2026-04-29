"""
Quick test to verify Resend email delivery is working with trintz.in domain.
Run: python test_email.py
"""
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@trintz.in")

# Change this to the email address you want to test delivery to
TEST_TO = input("Enter your test email address: ").strip()

payload = {
    "from": EMAIL_FROM,
    "to": [TEST_TO],
    "subject": "✅ AI Resume Optimizer — Email Test",
    "html": """
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a1a;">Email delivery confirmed ✅</h2>
        <p style="color: #555;">Your Resend setup with <strong>trintz.in</strong> is working correctly.</p>
        <p style="color: #555;">AI Resume Optimizer emails will be sent from:<br>
        <strong style="color:#3b82f6;">noreply@trintz.in</strong></p>
        <hr style="border:none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color:#999; font-size:12px;">This is a test email. You can safely ignore it.</p>
    </div>
    """
}

print(f"\nSending test email from {EMAIL_FROM} → {TEST_TO} ...")

try:
    with httpx.Client() as client:
        response = client.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ SUCCESS! Email sent.")
            print(f"   Email ID: {data.get('id')}")
            print(f"   Check your inbox at {TEST_TO}")
        else:
            print(f"\n❌ FAILED — Status {response.status_code}")
            print(f"   Response: {response.text}")
except Exception as e:
    print(f"\n❌ Error: {e}")
