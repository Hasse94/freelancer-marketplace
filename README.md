# Freelancer Marketplace

A full-stack freelancer marketplace platform where clients can post jobs and freelancers can submit proposals. Built with FastAPI and PostgreSQL, with JWT authentication, and Claude API integration for intelligent freelancer matching coming in Phase 3.

## Tech Stack

- **Backend:** FastAPI, Python 3.11
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Authentication:** JWT tokens with bcrypt password hashing
- **Payments:** Stripe API (Phase 4)
- **AI Integration:** Claude API — Anthropic (Phase 3)

## Features

- User registration and login with JWT authentication
- Freelancer profiles (bio, skills, hourly rate)
- Client profiles (company name)
- Job posting with budget and deadline
- Bidding system — freelancers submit proposals on open jobs
- Protected routes — token validation on every private endpoint
- Auto-generated API documentation via Swagger UI

## Project Roadmap

- [x] Phase 1 — User authentication and database foundation
- [x] Phase 2 — Freelancer profiles, job posting, bidding system
- [ ] Phase 3 — Claude API integration (job summarization + intelligent matching)
- [ ] Phase 4 — Stripe payment processing
- [ ] Phase 5 — Frontend + deployment

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL

### Installation

1. Clone the repo
```bash
git clone https://github.com/Hasse94/freelancer-marketplace.git
cd freelancer-marketplace
```

2. Create and activate virtual environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example`
```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/freelancer_marketplace
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Run the server
```bash
uvicorn app.main:app --reload
```

6. Open API docs



http://127.0.0.1:8000/docs



## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/freelancer` | Create freelancer profile | Yes |
| GET | `/api/users/freelancer/me` | Get my freelancer profile | Yes |
| GET | `/api/users/freelancer/{user_id}` | Get any freelancer profile | No |
| POST | `/api/users/client` | Create client profile | Yes |
| GET | `/api/users/client/me` | Get my client profile | Yes |

### Jobs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/jobs/` | Post a new job | Yes |
| GET | `/api/jobs/` | Get all open jobs | No |
| GET | `/api/jobs/{job_id}` | Get a single job | No |
| GET | `/api/jobs/my/jobs` | Get my posted jobs | Yes |
| PATCH | `/api/jobs/{job_id}/close` | Close a job | Yes |

### Bids
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bids/{job_id}` | Submit a bid on a job | Yes |
| GET | `/api/bids/job/{job_id}` | Get all bids for a job | Yes |
| GET | `/api/bids/my/bids` | Get my submitted bids | Yes |
| DELETE | `/api/bids/{bid_id}` | Withdraw a bid | Yes |

## Author

**Houssam Sabbagh** — Fullstack Developer  
[LinkedIn](https://linkedin.com/in/houssam-sabbagh-6a08b816b/) • [GitHub](https://github.com/Hasse94)
