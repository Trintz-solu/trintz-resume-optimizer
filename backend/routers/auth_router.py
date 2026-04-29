from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth as auth_utils
from datetime import datetime, timedelta, timezone
import secrets
from utils.email_service import send_email
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

FREE_MONTHLY_LIMIT = 3
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
IS_DEV = os.getenv("ENV", "development") == "development"


@router.post("/register", status_code=201)
async def register(body: schemas.RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if email already taken
    existing = db.query(models.User).filter(models.User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    token_val = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)

    user = models.User(
        name=body.name,
        email=body.email,
        hashed_password=auth_utils.hash_password(body.password),
        plan=models.PlanType.free,
        email_verified=True if IS_DEV else False,
        verification_token=token_val,
        verification_token_expires=expires
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send Verification Email Asynchronously
    # We do not block the request completely if email fails, but we should try.
    token = token_val
    user_name = body.name
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"

    email_body = f"""
<div style="background:#0a0a0f; padding:40px 20px; font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:480px; margin:auto; position:relative;">

    <div style="background:#111118; border:1px solid rgba(139,92,246,0.3); border-radius:20px; padding:36px 32px; text-align:center;">

      <div style="height:1px; background:linear-gradient(90deg,transparent,rgba(139,92,246,0.8),transparent); margin:-36px -32px 32px;"></div>

      <div style="display:inline-block; background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); border-radius:100px; padding:5px 14px; font-size:11px; color:#a78bfa; letter-spacing:0.05em; text-transform:uppercase; font-weight:600; margin-bottom:20px;">
        ● one more step
      </div>

      <div style="font-size:36px; margin-bottom:8px;">🚀</div>

      <h1 style="font-size:26px; font-weight:700; color:#f5f3ff; margin:8px 0 6px; letter-spacing:-0.5px;">
        verify ur email
      </h1>

      <p style="font-size:14px; color:#6b7280; margin:0 0 4px; line-height:1.7;">
        hey <span style="color:#c4b5fd; font-weight:600;">{user_name}</span> 👋 welcome to
        <strong style="color:#f5f3ff;">Trintz AI</strong>
      </p>

      <p style="font-size:14px; color:#6b7280; margin:0 0 28px; line-height:1.7;">
        ur AI resume optimizer is literally waiting for u.<br>just hit verify and we're good 🙌
      </p>

      <a href="{verification_link}"
         style="display:block; padding:15px 28px; background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7); color:white; text-decoration:none; border-radius:12px; font-weight:700; font-size:15px; letter-spacing:0.02em;">
        verify email → 
      </a>

      <p style="font-size:12px; color:#4b5563; margin:14px 0 0;">
        ⏱ expires in 24 hrs
      </p>

      <div style="margin-top:24px; padding-top:18px; border-top:1px solid rgba(255,255,255,0.06);">
        <p style="font-size:12px; color:#374151; margin:0;">
          not u? no worries, just ignore this 🤙
        </p>
      </div>

    </div>

    <p style="text-align:center; font-size:11px; color:#374151; margin-top:16px;">
      built with 💜 by trintz ai
    </p>

  </div>
</div>
"""
    await send_email(
        to_email=body.email,
        subject="Verify your email — Trintz AI",
        body=email_body
    )

    return {"message": "Please verify your email before logging in."}


@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not auth_utils.verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not IS_DEV and not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email before logging in.",
        )

    token = auth_utils.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token.")
        
    if user.verification_token_expires:
        expires = user.verification_token_expires
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
            
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")

    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()

    return {"success": True, "message": "Email verified successfully. You can now log in."}


@router.post("/request-password-reset")
def request_password_reset(body: schemas.PasswordResetRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user:
        # Return generic success to prevent email sniffing
        return {"message": "If an account with that email exists, we have sent a password reset link."}

    token_val = secrets.token_urlsafe(32)
    user.reset_token = token_val
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    reset_link = f"{FRONTEND_URL}/reset-password?token={token_val}"
    email_body = f"""
    <p>We received a request to reset your password.</p>
    <p>Click the link below to reset your password (valid for 1 hour):</p>
    <a href="{reset_link}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    """
    background_tasks.add_task(send_email, user.email, "Reset your password", email_body)

    return {"message": "If an account with that email exists, we have sent a password reset link."}


@router.post("/reset-password")
def reset_password(body: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )

    user = db.query(models.User).filter(models.User.reset_token == body.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid password reset token.")
        
    if user.reset_token_expires:
        expires = user.reset_token_expires
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
            
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Password reset token has expired. Please request a new one.")

    user.hashed_password = auth_utils.hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"success": True, "message": "Password reset successfully. You can now log in."}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    # Count total usage
    usage_count = (
        db.query(models.UsageLog)
        .filter(
            models.UsageLog.user_id == current_user.id,
            models.UsageLog.action == "optimize",
        )
        .count()
    )

    return schemas.UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        plan=current_user.plan.value,
        created_at=current_user.created_at,
        usage_count=usage_count,
    )
