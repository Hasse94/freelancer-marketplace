import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, users, jobs, bids, matching, payments

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Freelancer Marketplace API",
    description="A full-stack freelancer marketplace with AI-powered matching",
    version="1.0.0"
)

# Local dev origins plus the deployed frontend (FRONTEND_URL, set in production)
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL").rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(jobs.router)
app.include_router(bids.router)
app.include_router(matching.router)
app.include_router(payments.router)


@app.get("/")
def root():
    return {
        "message": "Freelancer Marketplace API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
