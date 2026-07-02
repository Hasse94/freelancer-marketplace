from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas, auth, claude_ai
import json

router = APIRouter(prefix="/api/matching", tags=["Matching"])


# ─── SUMMARIZE JOB (RUN CLAUDE HAIKU) ────────────────────────

@router.post("/summarize-job/{job_id}")
def summarize_job_endpoint(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Summarize a job using Claude Haiku.
    Only the client who owns the job can do this.
    Extracts skills, complexity, domain, must-haves, nice-to-haves.
    """
    # Get client profile
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile first"
        )

    # Get job
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.client_id == client.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't own it"
        )

    # Run Claude Haiku summarization
    summary = claude_ai.summarize_job(job.title, job.description)

    # Save to database
    job.extracted_skills = json.dumps(summary.get("skills", []))
    job.complexity_level = summary.get("complexity", "medium")
    job.domain = summary.get("domain", "other")
    job.must_haves = summary.get("must_haves", "")

    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "extracted_skills": summary.get("skills"),
        "complexity": summary.get("complexity"),
        "domain": summary.get("domain"),
        "must_haves": summary.get("must_haves"),
        "nice_to_haves": summary.get("nice_to_haves"),
        "message": "Job summarized successfully"
    }


# ─── FIND MATCHING FREELANCERS (RUN CLAUDE SONNET) ─────────────

@router.get("/job/{job_id}/matching-freelancers")
def find_matching_freelancers(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Find matching freelancers for a job using Claude Sonnet.
    Only the client who owns the job can see matches.
    Returns ranked list of freelancers with match scores.
    """
    # Get client profile
    client = db.query(models.Client).filter(
        models.Client.user_id == current_user.id
    ).first()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need a client profile first"
        )

    # Get job
    job = db.query(models.Job).filter(
        models.Job.id == job_id,
        models.Job.client_id == client.id
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't own it"
        )

    # Get all freelancers
    freelancers_db = db.query(models.Freelancer).all()

    if not freelancers_db:
        return {
            "job_id": job.id,
            "matches": []
        }

    # Convert to format Claude expects
    freelancers_for_claude = []
    for f in freelancers_db:
        user = db.query(models.User).filter(models.User.id == f.user_id).first()
        freelancers_for_claude.append({
            "id": f.id,
            "name": user.email.split("@")[0],  # Use part of email as name
            "skills": f.skills or "Not specified",
            "hourly_rate": f.hourly_rate or 0,
            "bio": f.bio or "No bio provided"
        })

    # Parse extracted skills
    extracted_skills = []
    if job.extracted_skills:
        try:
            extracted_skills = json.loads(job.extracted_skills)
        except:
            extracted_skills = []

    # Run Claude Sonnet matching
    matches = claude_ai.match_freelancers(
        job_id=job.id,
        job_title=job.title,
        job_skills=extracted_skills or [],
        job_complexity=job.complexity_level or "medium",
        job_budget=job.budget,
        freelancers=freelancers_for_claude
    )

    # Save match scores to database
    for match in matches:
        bid = db.query(models.Bid).filter(
            models.Bid.freelancer_id == match["freelancer_id"],
            models.Bid.job_id == job.id
        ).first()

        if bid:
            bid.match_score = match["match_score"]
            db.commit()

    return {
        "job_id": job.id,
        "job_title": job.title,
        "matches": matches
    }