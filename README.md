# FreelanceHub

A full-stack freelancer marketplace built with FastAPI, PostgreSQL, and Claude AI. Clients post jobs, freelancers bid, and AI handles the matching.

## Tech Stack

**Backend:** FastAPI, Python 3.11, PostgreSQL, SQLAlchemy, JWT + bcrypt  
**AI:** Claude Haiku (job summarization), Claude Sonnet (freelancer matching)  
**Payments:** Stripe (test mode)

## What It Does

- Clients post jobs with budgets and deadlines
- Claude Haiku extracts skills, complexity, and domain from messy job descriptions
- Claude Sonnet ranks freelancers (0-100) by skill match, budget fit, and profile quality
- Freelancers browse jobs and submit proposals
- Clients accept bids and pay through Stripe
- Webhook-verified payments with duplicate charge protection

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/freelancer | Create freelancer profile |
| GET | /api/users/freelancer/me | My freelancer profile |
| GET | /api/users/freelancer/{id} | Get freelancer |
| POST | /api/users/client | Create client profile |
| GET | /api/users/client/me | My client profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/jobs/ | Create job |
| GET | /api/jobs/ | List open jobs |
| GET | /api/jobs/{id} | Get job |
| GET | /api/jobs/my/jobs | My jobs |
| PATCH | /api/jobs/{id}/close | Close job |

### Bids
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bids/{job_id} | Submit bid |
| GET | /api/bids/job/{job_id} | Bids for job |
| GET | /api/bids/my/bids | My bids |
| POST | /api/bids/{bid_id}/accept | Accept bid |
| DELETE | /api/bids/{bid_id} | Withdraw bid |

### AI Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/matching/summarize-job/{job_id} | Summarize with Claude Haiku |
| GET | /api/matching/job/{job_id}/matching-freelancers | Rank freelancers with Claude Sonnet |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-intent | Create payment |
| POST | /api/payments/webhook | Stripe webhook |
| GET | /api/payments/history | Payment history |

## Setup

```bash
git clone https://github.com/Hasse94/freelancer-marketplace.git
cd freelancer-marketplace
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:



DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/freelancer_marketplace
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ANTHROPIC_API_KEY=your_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...




Create the database tables:
```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine)"
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API docs at http://127.0.0.1:8000/docs

## Roadmap

- [x] Phase 1 — Auth + database
- [x] Phase 2 — Profiles, jobs, bids
- [x] Phase 3 — Claude AI integration
- [x] Phase 4 — Stripe payments
- [ ] Phase 5 — React frontend
- [ ] Phase 6 — Deploy

## License

MIT