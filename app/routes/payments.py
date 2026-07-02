import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List
from dotenv import load_dotenv
from app.database import get_db
from app import models, schemas, auth

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

router = APIRouter(prefix="/api/payments", tags=["Payments"])

# Stripe intent statuses that mean the intent can still be confirmed by the frontend
REUSABLE_INTENT_STATUSES = {
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
}


def _create_stripe_intent(bid: models.Bid, client: models.Client) -> stripe.PaymentIntent:
    """Create a PaymentIntent on Stripe for a bid (amount in cents)"""
    return stripe.PaymentIntent.create(
        amount=int(round(bid.bid_amount * 100)),
        currency="usd",
        automatic_payment_methods={"enabled": True},
        metadata={
            "bid_id": str(bid.id),
            "job_id": str(bid.job_id),
            "client_id": str(client.id),
        },
    )


# ─── CREATE PAYMENT INTENT ───────────────────────────────────

@router.post("/create-intent", response_model=schemas.PaymentIntentResponse)
def create_payment_intent(
    payload: schemas.PaymentIntentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Client starts a payment for an accepted bid.
    Returns a client_secret the frontend uses with Stripe.js to confirm.
    Safe to call again after a failed payment (creates a fresh intent)
    or while one is pending (returns the same intent).
    """
    # Must be a client
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile to make payments"
        )

    # Bid must exist and be accepted
    bid = db.query(models.Bid).filter(models.Bid.id == payload.bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    if not bid.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only pay for an accepted bid"
        )

    # Only the client who owns the job can pay
    if bid.job.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the job owner can pay for this bid"
        )

    existing = db.query(models.Payment).filter(
        models.Payment.bid_id == bid.id
    ).first()

    try:
        # Duplicate payment protection
        if existing:
            if existing.status == "succeeded":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This bid has already been paid"
                )

            if existing.status == "pending":
                # Reuse the live intent if it can still be confirmed
                intent = stripe.PaymentIntent.retrieve(existing.stripe_payment_intent_id)
                if intent.status == "succeeded":
                    # Webhook hasn't caught up yet — sync and reject
                    existing.status = "succeeded"
                    db.commit()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="This bid has already been paid"
                    )
                if intent.status in REUSABLE_INTENT_STATUSES:
                    return schemas.PaymentIntentResponse(
                        payment_id=existing.id,
                        client_secret=intent.client_secret,
                        amount=existing.amount,
                        currency=existing.currency,
                        status=existing.status,
                    )

            # Failed or canceled — create a fresh intent on the same record
            intent = _create_stripe_intent(bid, client)
            existing.stripe_payment_intent_id = intent.id
            existing.status = "pending"
            db.commit()
            db.refresh(existing)
            return schemas.PaymentIntentResponse(
                payment_id=existing.id,
                client_secret=intent.client_secret,
                amount=existing.amount,
                currency=existing.currency,
                status=existing.status,
            )

        # First payment attempt for this bid
        intent = _create_stripe_intent(bid, client)
        payment = models.Payment(
            bid_id=bid.id,
            client_id=client.id,
            amount=bid.bid_amount,
            currency="usd",
            stripe_payment_intent_id=intent.id,
            status="pending",
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return schemas.PaymentIntentResponse(
            payment_id=payment.id,
            client_secret=intent.client_secret,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status,
        )

    except IntegrityError:
        # Two simultaneous requests for the same bid — the unique
        # constraint on bid_id caught the second one
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A payment for this bid is already being processed, try again"
        )
    except stripe.error.StripeError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Stripe error: {e.user_message or str(e)}"
        )


# ─── STRIPE WEBHOOK ──────────────────────────────────────────

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe calls this endpoint when a payment succeeds/fails.
    Verifies the signature so nobody can fake payment events.
    No JWT here — Stripe authenticates via the signature header.
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="STRIPE_WEBHOOK_SECRET is not configured"
        )

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )

    event_type = event["type"]
    intent = event["data"]["object"]

    status_map = {
        "payment_intent.succeeded": "succeeded",
        "payment_intent.payment_failed": "failed",
        "payment_intent.canceled": "canceled",
    }

    new_status = status_map.get(event_type)
    if new_status:
        payment = db.query(models.Payment).filter(
            models.Payment.stripe_payment_intent_id == intent["id"]
        ).first()

        # Ignore intents we don't know about (e.g. created via the
        # Stripe dashboard) — still return 200 so Stripe stops retrying
        if payment and payment.status != "succeeded":
            payment.status = new_status
            db.commit()

    return {"received": True}


# ─── PAYMENT HISTORY ─────────────────────────────────────────

@router.get("/history", response_model=List[schemas.PaymentResponse])
def get_payment_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Payment history for the logged in user.
    Clients see payments they made, freelancers see payments
    for their accepted bids.
    """
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not client and not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client or freelancer profile first"
        )

    payments = []

    if client:
        payments += db.query(models.Payment).filter(
            models.Payment.client_id == client.id
        ).all()

    if freelancer:
        payments += db.query(models.Payment).join(models.Bid).filter(
            models.Bid.freelancer_id == freelancer.id
        ).all()

    # Sort newest first, dedupe in case a user is both roles
    unique = {p.id: p for p in payments}
    return sorted(unique.values(), key=lambda p: p.created_at, reverse=True)
