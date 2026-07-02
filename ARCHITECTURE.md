# Architecture

## System Overview

FreelanceHub is a classic three-tier web app with an AI layer bolted on where it earns its keep. A Next.js frontend talks to a FastAPI backend over JSON; the backend owns all business rules and persists to PostgreSQL through SQLAlchemy. Two external services hang off the backend: the Anthropic API for job analysis and freelancer ranking, and Stripe for payments. The frontend never talks to Anthropic directly, and it only touches Stripe through Stripe.js with a short-lived client secret — all secrets stay server-side.

The design bias throughout is "boring and explicit": no message queues, no caching layer, no ORM magic beyond relationships. Every request follows the same path — route handler → permission checks → SQLAlchemy queries → Pydantic response model — which keeps the codebase easy to audit for a project of this size.

```
┌──────────────┐   JSON/REST    ┌──────────────┐    SQL     ┌────────────┐
│   Next.js    │ ─────────────► │   FastAPI    │ ─────────► │ PostgreSQL │
│  (port 3000) │ ◄───────────── │  (port 8000) │ ◄───────── │            │
└──────┬───────┘                └──────┬───────┘            └────────────┘
       │                               │
       │ Stripe.js                     ├──► Anthropic API (Haiku + Sonnet)
       └──► Stripe Elements            └──► Stripe API + webhooks
```

## Backend (FastAPI)

The backend lives in `app/` and is layered by responsibility rather than by feature:

- **`main.py`** — app factory: creates tables, mounts CORS, registers routers.
- **`routes/`** — one router per resource (`auth`, `users`, `jobs`, `bids`, `matching`, `payments`). Handlers do permission checks and orchestration; they stay thin.
- **`models.py`** — SQLAlchemy models. Six tables: `users`, `freelancers`, `clients`, `jobs`, `bids`, `payments`.
- **`schemas.py`** — Pydantic request/response models. Nothing leaves a route without going through one, so password hashes and other internals can't leak into responses.
- **`auth.py`** — password hashing (bcrypt), JWT create/verify, and the `get_current_user` dependency that protected routes inject.
- **`claude_ai.py`** — the only file that talks to Anthropic. Prompts ask for raw JSON; a small helper strips code fences when the model adds them anyway. Failures degrade to neutral defaults rather than 500s.
- **`database.py`** — engine, session factory, and the per-request `get_db` dependency.

### Data model

`User` is pure identity (email + password hash). Role data lives in optional one-to-one `Freelancer` and `Client` profiles, so one account can act as both sides of the marketplace. `Job` belongs to a client; `Bid` joins a freelancer to a job and carries the proposal and price. `Payment` references a bid with a **unique constraint on `bid_id`** — that single constraint is what makes double-charging structurally impossible, even under concurrent requests (the second insert hits an `IntegrityError` and returns 409).

### Authorization model

There's no role/permission table. Authorization is derived per-request: a route loads the caller's client or freelancer profile and checks ownership directly (e.g. "does this bid's job belong to your client profile?"). For a two-role marketplace this is simpler and harder to get wrong than a generic RBAC layer.

### AI integration

Two models, chosen by task economics: **Haiku** for job summarization (structured extraction — fast and cheap), **Sonnet** for freelancer matching (comparative judgment across profiles). Results are persisted (`jobs.extracted_skills`, `bids.match_score`), so the AI output is queryable data, not a one-off response.

## Frontend (Next.js App Router)

The frontend is a single Next.js 14 app in `frontend/`, all TypeScript:

- **Routing** — file-based under `app/`: landing, `auth/login`, `auth/signup`, `jobs`, `jobs/[id]` (dynamic), `dashboard`.
- **Components** — shared UI in `app/components/` (Navbar, JobCard, PayNowModal, Spinner, motion wrappers); dashboard-only pieces in `components/dashboard/`, split by tab.
- **State management** — deliberately minimal. One React context (`AuthContext`) holds the session: current user, both profile types, and login/logout/refresh actions. Everything else is local `useState` + fetch-on-mount. No Redux, no react-query — at this scale they'd be ceremony.
- **API layer** — `lib/api.ts` is the single module that talks to the backend: a typed function per endpoint, an axios interceptor that attaches the JWT, and `getApiError()` to normalize FastAPI/Pydantic error shapes into readable strings. `lib/types.ts` mirrors the backend's Pydantic schemas.
- **Styling** — Tailwind with class-based dark mode (an inline script applies the saved theme before first paint), Framer Motion for page and card transitions.

## Data Flow: Auth → API → Database

1. **Login** — the form posts form-encoded credentials to `/api/auth/login` (FastAPI's `OAuth2PasswordRequestForm` contract). The backend verifies the bcrypt hash and signs a JWT with the user's email as `sub`.
2. **Storage** — the token goes into `localStorage`; `AuthContext` then loads `/api/auth/me` plus both profiles to build the session. On refresh, the same restore runs before protected pages render.
3. **Requests** — the axios interceptor adds `Authorization: Bearer <token>` to every call. On the backend, `get_current_user` decodes the token and resolves it to a `User` row, or raises 401.
4. **Authorization** — the route handler loads the relevant profile and checks ownership before touching data.
5. **Response** — SQLAlchemy objects are serialized through Pydantic response models back to the client.

The payment flow adds one asynchronous leg: `create-intent` returns a Stripe `client_secret`, the browser confirms the payment directly with Stripe, and Stripe calls the signature-verified webhook to update the payment row. The UI treats the webhook as the source of truth — a confirmed payment shows as `pending` until the webhook lands.

## Deployment (Phase 6 — planned)

Target shape:

- **Frontend → Vercel.** Static/SSR hosting; `NEXT_PUBLIC_API_URL` points at the deployed API.
- **Backend → Railway or Render** with managed PostgreSQL. Swap `create_all` for Alembic migrations before the first real deploy, and tighten the CORS allowlist from `*` to the frontend origin.
- **Stripe** webhook endpoint registered in the dashboard against the public API URL (no more CLI forwarding).
- **Secrets** via each platform's environment settings — the `.env` files never leave local dev.
