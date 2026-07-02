# Freelancer Marketplace API

A full-stack freelancer marketplace with AI-powered job summarization and intelligent freelancer matching, built with FastAPI, PostgreSQL, and Claude API.

## 🚀 Tech Stack

- **Backend:** FastAPI, Python 3.11
- **Database:** PostgreSQL 18.4, SQLAlchemy
- **Auth:** JWT + bcrypt
- **AI:** Claude Haiku (job summarization), Claude Sonnet (freelancer matching)
- **Payments:** Stripe (test mode)
- **Docs:** Swagger UI

## ✅ Roadmap

- [x] Phase 1 — User auth + database foundation
- [x] Phase 2 — Profiles, job posting, bidding system
- [x] Phase 3 — Claude API (job summarization + freelancer matching)
- [x] Phase 4 — Stripe payments
- [ ] Phase 5 — Deploy (Vercel frontend + Railway/Render backend)

## 📦 Installation

```bash
git clone https://github.com/Hasse94/freelancer-marketplace.git
cd freelancer-marketplace
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Environment Variables

Create a `.env` file:




DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/freelancer_marketplace

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

ANTHROPIC_API_KEY=your_anthropic_api_key

STRIPE_PUBLISHABLE_KEY=pk_test_...

STRIPE_SECRET_KEY=sk_test_...

STRIPE_WEBHOOK_SECRET=whsec_...



## 🗄️ Database Setup

```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine)"
```

## ▶️ Run

```bash
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login + get token |
| GET | /api/auth/me | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/freelancer | Create freelancer profile |
| GET | /api/users/freelancer/me | Get my freelancer profile |
| GET | /api/users/freelancer/{user_id} | Get freelancer profile |
| POST | /api/users/client | Create client profile |
| GET | /api/users/client/me | Get my client profile |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/jobs/ | Create job |
| GET | /api/jobs/ | Get all jobs |
| GET | /api/jobs/{job_id} | Get job |
| GET | /api/jobs/my/jobs | Get my jobs |
| PATCH | /api/jobs/{job_id}/close | Close job |

### Bids
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bids/{job_id} | Submit bid |
| GET | /api/bids/job/{job_id} | Get bids for job |
| GET | /api/bids/my/bids | Get my bids |
| POST | /api/bids/{bid_id}/accept | Accept bid (job owner) |
| DELETE | /api/bids/{bid_id} | Delete bid |

### AI Matching
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/matching/summarize-job/{job_id} | Summarize job with Claude Haiku |
| GET | /api/matching/job/{job_id}/matching-freelancers | Match freelancers with Claude Sonnet |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-intent | Pay for an accepted bid (client) |
| POST | /api/payments/webhook | Stripe webhook (signature verified) |
| GET | /api/payments/history | Payment history (client or freelancer) |

## 🤖 AI Features

**Job Summarization (Claude Haiku)**
- Extracts skills, complexity, domain, must-haves and nice-to-haves from messy job descriptions
- Runs automatically on demand
- Results stored in PostgreSQL

**Freelancer Matching (Claude Sonnet)**
- Ranks freelancers by skill match, budget fit, experience level, and profile quality
- Returns top matches with scores (0-100)
- Match scores saved to database

## 💳 Payments (Stripe)

**Flow:** client accepts a bid → creates a payment intent → confirms with Stripe.js on the frontend → webhook updates payment status.

- One payment per bid, enforced at the database level — no double charges
- Pending intents are reused; failed payments can be retried with a fresh intent
- Webhook events are signature-verified, so payment status can't be faked
- Only the client who owns the job can pay for its accepted bid

**Local webhook testing** (requires the [Stripe CLI](https://stripe.com/docs/stripe-cli)):

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`, then use test card `4242 4242 4242 4242` to pay.
