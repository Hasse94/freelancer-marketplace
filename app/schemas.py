from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class FreelancerCreate(BaseModel):
    bio: Optional[str] = None
    skills: Optional[str] = None
    hourly_rate: Optional[float] = None


class FreelancerResponse(BaseModel):
    id: int
    user_id: int
    bio: Optional[str]
    skills: Optional[str]
    hourly_rate: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class ClientCreate(BaseModel):
    company_name: Optional[str] = None


class ClientResponse(BaseModel):
    id: int
    user_id: int
    company_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class JobCreate(BaseModel):
    title: str
    description: str
    budget: float
    deadline: Optional[datetime] = None


class JobResponse(BaseModel):
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


class BidCreate(BaseModel):
    proposal: str
    bid_amount: float


class BidResponse(BaseModel):
    id: int
    freelancer_id: int
    job_id: int
    proposal: str
    bid_amount: float
    is_accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentIntentCreate(BaseModel):
    bid_id: int


class PaymentIntentResponse(BaseModel):
    """Includes the Stripe client_secret the frontend needs to confirm payment."""
    payment_id: int
    client_secret: str
    amount: float
    currency: str
    status: str


class PaymentResponse(BaseModel):
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
