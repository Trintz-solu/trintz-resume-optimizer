from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    plan: str
    created_at: datetime
    usage_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ─── Usage ───────────────────────────────────────────────────────────────────

class UsageResponse(BaseModel):
    usage_count: int
    limit: int           # -1 means unlimited
    plan: str


# ─── Billing ─────────────────────────────────────────────────────────────────

class RazorpayOrderRequest(BaseModel):
    plan: str

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int          # in paise (₹999 = 99900)
    currency: str
    key_id: str          # Razorpay Key ID (safe to expose to frontend)


class RazorpayVerifyRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    plan: str
