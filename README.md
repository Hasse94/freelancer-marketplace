# FreelanceHub

A full-stack freelancer marketplace built with FastAPI, PostgreSQL, Next.js, and Claude AI. Clients post jobs, freelancers bid, and AI handles the matching.

**Live demo:** [freelancehub-plum.vercel.app](https://freelancehub-plum.vercel.app)

> The backend runs on Render's free tier, so the first request after a period of inactivity can take 30-50 seconds while the instance wakes up. After that it's fast.

## Tech Stack

**Backend:** FastAPI, Python 3.11, PostgreSQL, SQLAlchemy, JWT + bcrypt
**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, React Three Fiber
**AI:** Claude Haiku (job summarization), Claude Sonnet (freelancer matching)
**Payments:** Stripe (test mode) with webhook verification
**Deployment:** Vercel (frontend), Render (backend + database)

## What It Does

- Clients post jobs with budgets and deadlines
- Claude Haiku extracts skills, complexity, and domain from messy job descriptions
- Claude Sonnet ranks freelancers (0-100) by skill match, budget fit, and profile quality
- Freelancers browse jobs and submit proposals
- Clients accept bids and pay through a Stripe card form
- Webhook-verified payments with duplicate charge protection
- One account can hold both a client and a freelancer profile
- Dark-themed UI with a 3D animated hero, built with React Three Fiber

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

## Backend Setup

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
FRONTEND_URL=http://localhost:3000


Create the database tables:
```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine)"
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API docs at http://127.0.0.1:8000/docs

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:


NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...


Run it:
```bash
npm run dev
```

App runs at http://localhost:3000

**Pages:** landing (animated 3D hero), job listing with search and budget filters, job detail (AI analysis, freelancer matching, bidding, payment), auth, and a dashboard with role setup, job posting, and tabs for jobs, bids, and payments.

**Testing payments:** use Stripe's test card `4242 4242 4242 4242` with any future expiry and any CVC.

## Roadmap

- [x] Phase 1 — Auth + database
- [x] Phase 2 — Profiles, jobs, bids
- [x] Phase 3 — Claude AI integration
- [x] Phase 4 — Stripe payments
- [x] Phase 5 — Next.js frontend
- [x] Phase 6 — Deploy (Vercel + Render)

## License

MIT