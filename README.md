# FreelanceHub — Freelancer Marketplace

A full-stack freelancer marketplace where clients post jobs, freelancers bid on them, and Claude AI does the heavy lifting of figuring out who's actually a good fit. Accepted bids get paid through Stripe.

I built this to go deep on a realistic product end-to-end: auth, role-based permissions, LLM integration, payment flows with webhooks, and a polished frontend — not just another CRUD demo.

## ✨ Features

- **Email + JWT authentication** — bcrypt-hashed passwords, OAuth2 password flow, protected routes
- **Dual roles** — one account can hold a client profile, a freelancer profile, or both
- **Job posting & bidding** — clients post jobs with budgets and deadlines, freelancers pitch proposals; one bid per freelancer per job, one accepted bid per job
- **AI job summarization** — Claude Haiku extracts skills, complexity, and domain from messy job descriptions
- **AI freelancer matching** — Claude Sonnet ranks freelancers 0–100 by skill match, budget fit, and profile quality
- **Stripe payments** — clients pay accepted bids via Stripe Elements; webhooks keep payment status honest, and a database-level unique constraint makes double charges impossible
- **Responsive UI** — Next.js 14 App Router with Tailwind, dark mode, and Framer Motion transitions

## 🚀 Tech Stack

- **Backend:** FastAPI, Python 3.11
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Database:** PostgreSQL, SQLAlchemy
- **Auth:** JWT + bcrypt
- **AI:** Claude Haiku (job summarization), Claude Sonnet (freelancer matching)
- **Payments:** Stripe (test mode)
- **Docs:** Swagger UI (auto-generated at `/docs`)

## 🎬 Project Demo

The full flow, from posting to payment:

1. A **client** signs up, creates a client profile, and posts a job ("Build me a landing page, $1,500").
2. They hit **Summarize** — Claude Haiku reads the description and tags it with skills, complexity, and domain.
3. **Freelancers** browse open jobs and submit proposals with their price.
4. On the job page, the client sees Claude Sonnet's **ranked freelancer matches** with 0–100 scores.
5. The client **accepts a bid** — the job closes to further bidding.
6. **Pay Now** opens a Stripe Elements modal; the payment confirms in-page and a webhook flips the payment record to `succeeded`.
7. Both sides see the transaction in their dashboard's **Payments** tab.

## ⚡ Getting Started

Three steps to run it locally (details in [SETUP.md](SETUP.md)):

```bash
# 1. Backend — install deps and configure
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # then fill in your keys

# 2. Frontend
cd frontend && npm install
copy .env.local.example .env.local

# 3. Run both (two terminals)
uvicorn app.main:app --reload      # backend on :8000
cd frontend && npm run dev         # frontend on :3000
```

API docs: http://127.0.0.1:8000/docs · App: http://localhost:3000

## 🔌 API Endpoints

<details>
<summary><b>Authentication</b> — <code>/api/auth</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login + get token |
| GET | `/api/auth/me` | Get current user |

</details>

<details>
<summary><b>Users & Profiles</b> — <code>/api/users</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/freelancer` | Create freelancer profile |
| GET | `/api/users/freelancer/me` | Get my freelancer profile |
| GET | `/api/users/freelancer/{user_id}` | Get freelancer profile |
| POST | `/api/users/client` | Create client profile |
| GET | `/api/users/client/me` | Get my client profile |

</details>

<details>
<summary><b>Jobs</b> — <code>/api/jobs</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/` | Create job |
| GET | `/api/jobs/` | Get all open jobs (public) |
| GET | `/api/jobs/{job_id}` | Get job |
| GET | `/api/jobs/my/jobs` | Get my jobs |
| PATCH | `/api/jobs/{job_id}/close` | Close job |

</details>

<details>
<summary><b>Bids</b> — <code>/api/bids</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bids/{job_id}` | Submit bid |
| GET | `/api/bids/job/{job_id}` | Get bids for job (owner only) |
| GET | `/api/bids/my/bids` | Get my bids |
| POST | `/api/bids/{bid_id}/accept` | Accept bid (job owner) |
| DELETE | `/api/bids/{bid_id}` | Withdraw bid |

</details>

<details>
<summary><b>AI Matching</b> — <code>/api/matching</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/matching/summarize-job/{job_id}` | Summarize job with Claude Haiku |
| GET | `/api/matching/job/{job_id}/matching-freelancers` | Match freelancers with Claude Sonnet |

</details>

<details>
<summary><b>Payments</b> — <code>/api/payments</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Pay for an accepted bid (client) |
| POST | `/api/payments/webhook` | Stripe webhook (signature verified) |
| GET | `/api/payments/history` | Payment history (client or freelancer) |

</details>

## 🛠️ Troubleshooting

**`Cannot reach the server. Is the API running?` in the frontend**
The backend isn't up or `NEXT_PUBLIC_API_URL` in `frontend/.env.local` doesn't point at it. Start the backend on port 8000 and restart `npm run dev` after changing env files — Next.js only reads them at startup.

**`connection refused` / SQLAlchemy errors on backend start**
PostgreSQL isn't running or `DATABASE_URL` in `.env` is wrong. Check the service is up and the database in the URL actually exists (`createdb freelancer_marketplace`).

**AI endpoints return empty results**
`ANTHROPIC_API_KEY` is missing or invalid — the AI helpers fail soft and return defaults instead of crashing. Check the backend logs for `Error in job summarization` / `Error in freelancer matching`.

**Payments stay `pending` forever**
Stripe can't reach your local webhook. Run `stripe listen --forward-to localhost:8000/api/payments/webhook` and put the printed `whsec_...` in `STRIPE_WEBHOOK_SECRET`. Test card: `4242 4242 4242 4242`.

**`ValueError: invalid literal for int()` on backend start**
Your `.env` is missing values — every variable in `.env.example` is required.

More in [SETUP.md](SETUP.md#troubleshooting).

## ✅ Roadmap

- [x] Phase 1 — User auth + database foundation
- [x] Phase 2 — Profiles, job posting, bidding system
- [x] Phase 3 — Claude API (job summarization + freelancer matching)
- [x] Phase 4 — Stripe payments
- [x] Phase 5 — Next.js frontend
- [ ] Phase 6 — Deploy (Vercel frontend + Railway/Render backend)

## 📚 Documentation

| Doc | What's in it |
|-----|--------------|
| [SETUP.md](SETUP.md) | Full local development setup, step by step |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, backend/frontend architecture, data flow |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Folder tree and what lives where |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Git workflow, code standards, PR process |
| [CHANGELOG.md](CHANGELOG.md) | What shipped in each phase |

## 📄 License

MIT — see [LICENSE](LICENSE).
