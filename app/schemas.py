from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── USER SCHEMAS ───────────────────────────────────────────

class UserCreate(BaseModel):
    """What we expect when someone registers"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back after creating a user"""
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AUTH SCHEMAS ────────────────────────────────────────────

class Token(BaseModel):
    """What we send back after successful login"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Data stored inside the JWT token"""
    email: Optional[str] = None


# ─── FREELANCER SCHEMAS ──────────────────────────────────────

class FreelancerCreate(BaseModel):
    """What we expect when creating a freelancer profile"""
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None


class FreelancerResponse(BaseModel):
    """What we send back for a freelancer profile"""
    id: int
    user_id: int
    bio: Optional[str]
    skills: Optional[str]
    hourly_rate: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── CLIENT SCHEMAS ──────────────────────────────────────────

class ClientCreate(BaseModel):
    """What we expect when creating a client profile"""
    company_name: Optional[str] = None


class ClientResponse(BaseModel):
    """What we send back for a client profile"""
    id: int
    user_id: int
    company_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── JOB SCHEMAS ─────────────────────────────────────────────

class JobCreate(BaseModel):
    """What we expect when posting a job"""
    title: str
    description: str
    budget: float
    deadline: Optional[datetime] = None


class JobResponse(BaseModel):
    """What we send back for a job"""
    id: int
    client_id: int
    title: str
    description: str
    budget: float
    deadline: Optional[datetime]
    is_open: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── BID SCHEMAS ─────────────────────────────────────────────

class BidCreate(BaseModel):
    """What we expect when submitting a bid"""
    proposal: str
    bid_amount: float


class BidResponse(BaseModel):
    """What we send back for a bid"""
    id: int
    freelancer_id: int
    job_id: int
    proposal: str
    bid_amount: float
    is_accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── PAYMENT SCHEMAS ─────────────────────────────────────────

class PaymentIntentCreate(BaseModel):
    """What we expect when a client starts a payment"""
    bid_id: int


class PaymentIntentResponse(BaseModel):
    """What we send back so the frontend can confirm the payment"""
    payment_id: int
    client_secret: str
    amount: float
    currency: str
    status: str


class PaymentResponse(BaseModel):
    """What we send back for a payment record"""
    id: int
    bid_id: int
    client_id: int
    amount: float
    currency: str
    stripe_payment_intent_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True