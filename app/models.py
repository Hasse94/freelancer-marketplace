from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    freelancer_profile = relationship("Freelancer", back_populates="user", uselist=False)
    client_profile = relationship("Client", back_populates="user", uselist=False)


class Freelancer(Base):
    __tablename__ = "freelancers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bio = Column(Text, nullable=True)
    skills = Column(String, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="freelancer_profile")
    bids = relationship("Bid", back_populates="freelancer")


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="client_profile")
    jobs = relationship("Job", back_populates="client")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Float, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    is_open = Column(Boolean, default=True)

    # Populated by Claude when the client runs job summarization
    extracted_skills = Column(String, nullable=True)  # JSON array of skill names
    complexity_level = Column(String, nullable=True)  # easy / medium / hard
    domain = Column(String, nullable=True)  # web / mobile / data / devops / design / other
    must_haves = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="jobs")
    bids = relationship("Bid", back_populates="job")


class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    freelancer_id = Column(Integer, ForeignKey("freelancers.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    proposal = Column(Text, nullable=False)
    bid_amount = Column(Float, nullable=False)
    is_accepted = Column(Boolean, default=False)

    # Scores (0-100) written back by the AI matching endpoint
    ai_quality_score = Column(Float, nullable=True)
    match_score = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    freelancer = relationship("Freelancer", back_populates="bids")
    job = relationship("Job", back_populates="bids")
    payment = relationship("Payment", back_populates="bid", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    # unique=True enforces one payment per bid at the database level
    bid_id = Column(Integer, ForeignKey("bids.id"), nullable=False, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="usd")
    stripe_payment_intent_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="pending")  # pending / succeeded / failed / canceled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    bid = relationship("Bid", back_populates="payment")
    client = relationship("Client")
