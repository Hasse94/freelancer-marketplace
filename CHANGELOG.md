# Changelog

All notable changes to this project. Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] — 2026-07-02

First complete version: full marketplace loop from job posting to payment, built in five phases.

### Phase 5 — Next.js frontend (2026-07-02)
- Next.js 14 App Router frontend with TypeScript and Tailwind CSS
- Landing page, login/signup, job browsing, job detail with bidding, role-based dashboard
- Auth context with JWT session restore, dark mode, Framer Motion transitions
- Stripe Elements payment modal wired to the backend intent flow

### Phase 4 — Stripe payments (2026-07-02)
- Payment intents for accepted bids with client-side confirmation via Stripe.js
- Signature-verified webhook keeps payment status in sync (`pending` → `succeeded`/`failed`/`canceled`)
- One-payment-per-bid enforced with a database unique constraint; failed payments retry with a fresh intent
- Payment history endpoint for both clients and freelancers

### Phase 3 — Claude AI features (2026-07-02)
- Job summarization with Claude Haiku: extracts skills, complexity, domain, and requirements from raw descriptions
- Freelancer matching with Claude Sonnet: ranks all freelancers 0–100 against a job
- AI results persisted to the database (job tags, bid match scores)

### Phase 2 — Profiles, jobs, and bidding (2026-06-28)
- Freelancer and client profiles (one user can hold both)
- Job posting, public job listing, close-job endpoint
- Bidding: submit, list (owner-only), withdraw, accept — accepting closes the job

### Phase 1 — Auth and database foundation (2026-06-27)
- FastAPI project skeleton with PostgreSQL + SQLAlchemy
- Registration and login with bcrypt password hashing
- JWT access tokens and the `get_current_user` dependency for protected routes
