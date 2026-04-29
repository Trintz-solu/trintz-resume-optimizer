from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum


class PlanType(str, enum.Enum):
    free = "free"
    pro = "pro"
    enterprise = "enterprise"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    plan = Column(Enum(PlanType), default=PlanType.free, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)       # kept for migration safety
    razorpay_payment_id = Column(String(255), nullable=True)
    razorpay_order_id = Column(String(255), nullable=True)
    import os
    email_verified = Column(Boolean, default=os.getenv("ENV", "development") == "development")
    verification_token = Column(String(255), nullable=True, index=True)
    verification_token_expires = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String(255), nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    usage_logs = relationship("UsageLog", back_populates="user")
    resume_history = relationship("ResumeHistory", back_populates="user")


class ResumeHistory(Base):
    __tablename__ = "resume_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_text = Column(String, nullable=False)
    optimized_text = Column(String, nullable=False)
    job_description = Column(String, nullable=False)
    ats_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resume_history")
class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), default="optimize", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="usage_logs")
