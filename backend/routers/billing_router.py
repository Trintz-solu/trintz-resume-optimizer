from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth as auth_utils
import razorpay
import hmac
import hashlib
import os
from utils.email_service import send_email
import asyncio

router = APIRouter(prefix="/api/billing", tags=["billing"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Plan prices in paise
PLAN_PRICES = {
    "pro": 29900,         # ₹299
    "enterprise": 499900  # ₹4999
}


def get_razorpay_client():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
        )
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# ─── Create Order ─────────────────────────────────────────────────────────────

@router.post("/create-order", response_model=schemas.RazorpayOrderResponse)
def create_order(
    body: schemas.RazorpayOrderRequest,
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    if body.plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    if current_user.plan.value == body.plan:
        raise HTTPException(status_code=400, detail=f"Already on {body.plan} plan")
        
    # Optional logic: perhaps don't let enterprise downgrade to pro directly here, 
    # but for now we just prevent purchasing the *same* plan.
    if current_user.plan == models.PlanType.enterprise and body.plan == "pro":
        raise HTTPException(status_code=400, detail="Cannot downgrade from Enterprise to Pro here")

    client = get_razorpay_client()
    amount_paise = PLAN_PRICES[body.plan]

    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": str(current_user.id),
                "plan": body.plan,
            },
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")

    return schemas.RazorpayOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=RAZORPAY_KEY_ID,
    )


# ─── Verify Payment ───────────────────────────────────────────────────────────

@router.post("/verify-payment")
def verify_payment(
    body: schemas.RazorpayVerifyRequest,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    """
    Called by frontend after Razorpay payment succeeds.
    Verifies SDK signature, stops duplicates, upgrades user, and sends receipt.
    """
    client = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": body.razorpay_order_id,
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    target_plan = models.PlanType(body.plan)

    # Prevent Duplicate Upgrades
    if current_user.plan == target_plan:
        return {"status": "already upgraded", "plan": target_plan.value}

    # Upgrade user and track payment IDs
    current_user.plan = target_plan
    current_user.razorpay_payment_id = body.razorpay_payment_id
    current_user.razorpay_order_id = body.razorpay_order_id
    db.commit()
    db.refresh(current_user)

    # Dispatch formatted receipt
    amount_str = f"₹{int(PLAN_PRICES[body.plan]/100)}"
    email_body = f"""
    <p>Hello {current_user.name},</p>
    <br/>
    <p>Your payment has been successfully processed.</p>
    <br/>
    <p><b>Plan Activated:</b> {body.plan.capitalize()}</p>
    <p><b>Amount Paid:</b> {amount_str}</p>
    <br/>
    <p>You now have access to your upgraded features.</p>
    <br/>
    <p>Thank you for using AI Resume Optimizer!</p>
    """
    background_tasks.add_task(send_email, current_user.email, "Payment Successful – AI Resume Optimizer", email_body)

    return {"success": True, "plan": body.plan}


# ─── Webhook (optional — for server-side event handling) ──────────────────────

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay webhook endpoint. Configure in Razorpay Dashboard →
    Settings → Webhooks → Add New Webhook.
    Event: payment.captured
    """
    payload = await request.body()
    sig_header = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature
    expected = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()

    if expected != sig_header:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    data = json.loads(payload)
    event = data.get("event")

    if event == "payment.captured":
        payment = data.get("payload", {}).get("payment", {}).get("entity", {})
        notes = payment.get("notes", {})
        user_id = notes.get("user_id")

        if user_id:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            target_plan_str = notes.get("plan", "pro")
            if user and user.plan.value != target_plan_str:
                user.plan = models.PlanType(target_plan_str)
                user.razorpay_payment_id = payment.get("id")
                db.commit()

    return {"received": True}
