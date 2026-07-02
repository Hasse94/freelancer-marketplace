from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/bids", tags=["Bids"])


@router.post("/{job_id}", response_model=schemas.BidResponse, status_code=201)
def submit_bid(
    job_id: int,
    bid_data: schemas.BidCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Submit a bid on an open job (requires a freelancer profile, one bid per job)."""
    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a freelancer profile to submit bids"
        )

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


@router.get("/job/{job_id}", response_model=List[schemas.BidResponse])
def get_bids_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all bids for a job — only visible to the client who owns it."""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client or job.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the job owner can view bids"
        )

    return db.query(models.Bid).filter(models.Bid.job_id == job_id).all()


@router.get("/my/bids", response_model=List[schemas.BidResponse])
def get_my_bids(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all bids submitted by the logged in freelancer."""
    freelancer = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a freelancer profile first"
        )

    return db.query(models.Bid).filter(
        models.Bid.freelancer_id == freelancer.id
    ).all()


@router.post("/{bid_id}/accept", response_model=schemas.BidResponse)
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Accept a bid, which also closes the job to further bidding."""
    bid = db.query(models.Bid).filter(models.Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )

    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client or bid.job.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the job owner can accept bids"
        )

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


@router.delete("/{bid_id}", status_code=204)
def delete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Withdraw a bid (not allowed once it has been accepted)."""
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
