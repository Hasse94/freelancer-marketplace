# Local Development Setup

Everything you need to run FreelanceHub on your machine. The stack is a FastAPI backend on port 8000, a Next.js frontend on port 3000, and a local PostgreSQL database.

## Prerequisites

- Python 3.11+
- Node.js 18+ (with npm)
- PostgreSQL (any recent version — developed against 18)
- An [Anthropic API key](https://console.anthropic.com/) for the AI features
- A [Stripe](https://dashboard.stripe.com/test/apikeys) account in test mode, plus the [Stripe CLI](https://stripe.com/docs/stripe-cli) for webhook testing

You can run the app without the Anthropic and Stripe keys — auth, jobs, and bidding all work. The AI endpoints will return empty defaults and the payment modal will tell you Stripe isn't configured.

## 1. Backend

### Clone and create a virtualenv

```bash
git clone https://github.com/Hasse94/freelancer-marketplace.git
cd freelancer-marketplace
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Create the database

```bash
createdb freelancer_marketplace
```

Or in `psql`: `CREATE DATABASE freelancer_marketplace;`

### Configure environment

Copy `.env.example` to `.env` and fill it in:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/freelancer_marketplace
SECRET_KEY=generate_a_long_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

A quick way to generate `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Create the tables

Tables are created automatically on first startup (`Base.metadata.create_all` in `app/main.py`). To create them without starting the server:

```bash
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine)"
```

### Run it

```bash
uvicorn app.main:app --reload
```

The API is now at http://127.0.0.1:8000 — interactive docs at http://127.0.0.1:8000/docs.

## 2. Frontend

```bash
cd frontend
npm install
```

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

The Stripe key here is the same **publishable** key as in the backend `.env` (safe to expose — it's the secret key that must stay server-side).

```bash
npm run dev
```

App is at http://localhost:3000.

## 3. Stripe webhooks (for payments)

Stripe needs to call your local backend when a payment settles. In a third terminal:

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET` in `.env` and restart the backend. Use test card `4242 4242 4242 4242` with any future expiry and any CVC.

## 4. Try the whole flow

1. Sign up at http://localhost:3000/auth/signup (or use `POST /api/auth/register` in Swagger).
2. In the dashboard, create a **client** profile and post a job.
3. Sign up a second account, create a **freelancer** profile, and bid on the job.
4. Back on the client account, open the job: run the AI match, accept the bid, and pay it.
5. Check the Payments tab on both accounts.

Testing the API directly? Hit `/docs`, call `/api/auth/login`, then click **Authorize** and paste the token to use the protected endpoints.

## Troubleshooting

**`psycopg2` / `connection refused` on startup** — PostgreSQL isn't running, or the credentials/database name in `DATABASE_URL` are wrong.

**`ValueError: invalid literal for int() with base 10: 'None'`** — `ACCESS_TOKEN_EXPIRE_MINUTES` (or another variable) is missing from `.env`. Every key in `.env.example` must be set.

**Frontend shows "Cannot reach the server"** — backend not running, or `NEXT_PUBLIC_API_URL` is wrong. Remember Next.js reads env files at startup only: restart `npm run dev` after editing `.env.local`.

**Login works in Swagger but not the frontend** — the frontend sends form-encoded credentials to match FastAPI's `OAuth2PasswordRequestForm`; if you've modified `login()` in `frontend/app/lib/api.ts`, make sure it still sends `application/x-www-form-urlencoded`.

**AI matching returns `matches: []`** — either no freelancer profiles exist yet, or the Anthropic call failed (bad key, no credit). The backend logs the underlying error.

**Payment modal says Stripe is not configured** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` missing from `frontend/.env.local`, or you didn't restart the dev server after adding it.

**Payment succeeded but status stays `pending`** — the webhook listener isn't running or `STRIPE_WEBHOOK_SECRET` doesn't match what `stripe listen` printed.

**Port already in use** — something else is on 8000/3000. Either stop it or run `uvicorn app.main:app --reload --port 8001` and update `NEXT_PUBLIC_API_URL`.
