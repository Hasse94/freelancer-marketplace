from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/bids", tags=["Bids"])


# ─── SUBMIT A BID ────────────────────────────────────────────

@router.post("/{job_id}", response_model=schemas.BidResponse, status_code=201)
def submit_bid(
    job_id: int,
    bid_data: schemas.BidCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Freelancer submits a bid on a job.
    Requires JWT token + must have a freelancer profile.
    """
    # Check if user has a freelancer profile
    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a freelancer profile to submit bids"
        )

    # Check if job exists and is open
    job = db.query(models.Job).filter(models.Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    if not job.is_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job is no longer accepting bids"
        )

    # Check if freelancer already bid on this job
    existing_bid = db.query(models.Bid).filter(
        models.Bid.freelancer_id == freelancer.id,
        models.Bid.job_id == job_id
    ).first()

    if existing_bid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already submitted a bid for this job"
        )

    bid = models.Bid(
        freelancer_id=freelancer.id,
        job_id=job_id,
        proposal=bid_data.proposal,
        bid_amount=bid_data.bid_amount
    )

    db.add(bid)
    db.commit()
    db.refresh(bid)
    return bid


# ─── GET ALL BIDS FOR A JOB ──────────────────────────────────

@router.get("/job/{job_id}", response_model=List[schemas.BidResponse])
def get_bids_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Get all bids for a specific job.
    Only the client who owns the job can see all bids.
    """
    # Verify job exists
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Verify current user is the client who owns this job
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client or job.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the job owner can view bids"
        )

    bids = db.query(models.Bid).filter(models.Bid.job_id == job_id).all()
    return bids


# ─── GET MY BIDS (FREELANCER) ────────────────────────────────

@router.get("/my/bids", response_model=List[schemas.BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all bids submitted by the logged in freelancer"""
    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a freelancer profile first"
        )

    bids = db.query(models.Bid).filter(
        models.Bid.freelancer_id == freelancer.id
    ).all()
    return bids


# ─── ACCEPT A BID ────────────────────────────────────────────

@router.post("/{bid_id}/accept", response_model=schemas.BidResponse)
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Client accepts a bid on their job.
    Closes the job and marks the bid as accepted (ready for payment).
    """
    bid = db.query(models.Bid).filter(models.Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    # Verify current user is the client who owns the job
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client or bid.job.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the job owner can accept bids"
        )

    # A job can only have one accepted bid
    already_accepted = db.query(models.Bid).filter(
        models.Bid.job_id == bid.job_id,
        models.Bid.is_accepted == True
    ).first()

    if already_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This job already has an accepted bid"
        )

    bid.is_accepted = True
    bid.job.is_open = False
    db.commit()
    db.refresh(bid)
    return bid


# ─── DELETE A BID ────────────────────────────────────────────

@router.delete("/{bid_id}", status_code=204)
def delete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Freelancer withdraws their bid"""
    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a freelancer profile first"
        )

    bid = db.query(models.Bid).filter(
        models.Bid.id == bid_id,
        models.Bid.freelancer_id == freelancer.id
    ).first()

    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found or you don't own it"
        )

    if bid.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't withdraw a bid that has been accepted"
        )

    db.delete(bid)
    db.commit()