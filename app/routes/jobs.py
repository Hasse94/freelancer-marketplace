from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.post("/", response_model=schemas.JobResponse, status_code=201)
def create_job(
    job_data: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Post a new job (requires a client profile)."""
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile to post jobs"
        )

    job = models.Job(
        client_id=client.id,
        title=job_data.title,
        description=job_data.description,
        budget=job_data.budget,
        deadline=job_data.deadline
    )

    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=List[schemas.JobResponse])
def get_all_jobs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List all open jobs — public, no token needed. Paginated: 20 per page by default."""
    return db.query(models.Job).filter(models.Job.is_open == True).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get a single job by ID."""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job


@router.get("/my/jobs", response_model=List[schemas.JobResponse])
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all jobs posted by the logged in client."""
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile first"
        )

    return db.query(models.Job).filter(
        models.Job.client_id == client.id
    ).all()


@router.patch("/{job_id}/close", response_model=schemas.JobResponse)
def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Close a job so no more bids can be submitted."""
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile first"
        )

    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.client_id == client.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't own it"
        )

    job.is_open = False
    db.commit()
    db.refresh(job)
    return job
