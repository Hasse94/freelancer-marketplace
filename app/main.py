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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
