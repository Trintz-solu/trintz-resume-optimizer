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
def register(body: schemas.RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
    verification_link = f"{FRONTEND_URL}/verify-email?token={token_val}"
    email_body = f"""
    <p>Welcome to AI Resume Optimizer, {body.name}!</p>
    <p>Please verify your email address by clicking the link below (valid for 24 hours):</p>
    <a href="{verification_link}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
    """
    background_tasks.add_task(send_email, body.email, "Verify your account", email_body)

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
        
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
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
        
    if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
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
