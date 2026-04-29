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


# ─── Resume Optimization ─────────────────────────────────────────────────────

from typing import List

class PersonalInfo(BaseModel):
    name: str = "Candidate Name"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""

class ExperienceItem(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = ""
    end_date: Optional[str] = "Present"
    bullets: List[str] = []

    # Using pydantic V2 or V1 validator depending on project.
    # As it's mostly V1 in standard projects without @field_validator, we'll keep the user's syntax:
    from pydantic import validator
    @validator("bullets", pre=True, always=True)
    def ensure_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

class ProjectItem(BaseModel):
    name: str
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    bullets: List[str] = []

    from pydantic import validator
    @validator("bullets", pre=True, always=True)
    def ensure_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v

class EducationItem(BaseModel):
    institution: str
    degree: Optional[str] = ""
    graduation_year: Optional[str] = ""

class StructuredResume(BaseModel):
    personal_info: PersonalInfo
    summary: str
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    skills: List[str] = []
    education: List[EducationItem] = []
    auto_applied_keywords: List[str] = []
