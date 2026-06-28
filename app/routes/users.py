from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/users", tags=["Users"])


# ─── FREELANCER PROFILE ──────────────────────────────────────

@router.post("/freelancer", response_model=schemas.FreelancerResponse, status_code=201)
def create_freelancer_profile(
    profile_data: schemas.FreelancerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Create a freelancer profile for the logged in user.
    Requires JWT token.
    """
    # Check if profile already exists
    existing = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Freelancer profile already exists"
        )

    profile = models.Freelancer(
        user_id=current_user.id,
        bio=profile_data.bio,
        skills=profile_data.skills,
        hourly_rate=profile_data.hourly_rate
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/freelancer/me", response_model=schemas.FreelancerResponse)
def get_my_freelancer_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get the logged in user's freelancer profile"""
    profile = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Freelancer profile not found"
        )
    return profile


@router.get("/freelancer/{user_id}", response_model=schemas.FreelancerResponse)
def get_freelancer_profile(user_id: int, db: Session = Depends(get_db)):
    """Get any freelancer's profile by user ID"""
    profile = db.query(models.Freelancer).filter(
        models.Freelancer.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Freelancer profile not found"
        )
    return profile


# ─── CLIENT PROFILE ──────────────────────────────────────────

@router.post("/client", response_model=schemas.ClientResponse, status_code=201)
def create_client_profile(
    profile_data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Create a client profile for the logged in user.
    Requires JWT token.
    """
    existing = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client profile already exists"
        )

    profile = models.Client(
        user_id=current_user.id,
        company_name=profile_data.company_name
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/client/me", response_model=schemas.ClientResponse)
def get_my_client_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get the logged in user's client profile"""
    profile = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    return profile