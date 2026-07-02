# Project Structure

```
freelancer-marketplace/
├── README.md                    # Start here
├── SETUP.md                     # Local development setup
├── ARCHITECTURE.md              # System design and data flow
├── CONTRIBUTING.md              # Workflow and code standards
├── CHANGELOG.md                 # What shipped in each phase
├── LICENSE                      # MIT
├── requirements.txt             # Backend dependencies
├── .env.example                 # Backend env template (copy to .env)
│
├── app/                         # FastAPI backend
│   ├── main.py                  # App factory: CORS, routers, table creation
│   ├── database.py              # Engine, session factory, get_db dependency
│   ├── models.py                # SQLAlchemy models (6 tables)
│   ├── schemas.py               # Pydantic request/response models
│   ├── auth.py                  # bcrypt hashing, JWT, get_current_user
│   ├── claude_ai.py             # Anthropic API calls (summarize + match)
│   └── routes/                  # One router per resource
│       ├── auth.py              # /api/auth — register, login, me
│       ├── users.py             # /api/users — freelancer/client profiles
│       ├── jobs.py              # /api/jobs — post, list, close
│       ├── bids.py              # /api/bids — submit, list, accept, withdraw
│       ├── matching.py          # /api/matching — AI summarize + rank
│       └── payments.py          # /api/payments — intents, webhook, history
│
└── frontend/                    # Next.js 14 (App Router)
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── .env.local.example       # Frontend env template (copy to .env.local)
    └── app/
        ├── layout.tsx           # Root layout: theme script, navbar, footer
        ├── page.tsx             # Landing page
        ├── globals.css          # Tailwind entry + base styles
        ├── auth/
        │   ├── login/page.tsx
        │   └── signup/page.tsx
        ├── jobs/
        │   ├── page.tsx         # Browse open jobs
        │   └── [id]/page.tsx    # Job detail: AI matches, bid form, accept/pay
        ├── dashboard/page.tsx   # Role-based tabs (jobs / bids / payments)
        ├── components/
        │   ├── Navbar.tsx       # Nav + dark mode toggle
        │   ├── Footer.tsx
        │   ├── JobCard.tsx      # Job listing card + money/date formatters
        │   ├── PayNowModal.tsx  # Stripe Elements checkout modal
        │   ├── AuthCard.tsx     # Shared login/signup form shell
        │   ├── Spinner.tsx
        │   ├── motion.tsx       # Framer Motion wrappers (PageFade, SlideUp…)
        │   └── dashboard/       # One component per dashboard tab
        │       ├── ProfileSetup.tsx
        │       ├── MyJobsTab.tsx
        │       ├── MyBidsTab.tsx
        │       └── PaymentsTab.tsx
        ├── context/
        │   └── AuthContext.tsx  # Session state: user, profiles, login/logout
        └── lib/
            ├── api.ts           # Typed API client (axios + JWT interceptor)
            └── types.ts         # TS mirrors of the Pydantic schemas
```

## The tour, in one paragraph each

**`app/`** is the whole backend. Requests come in through a router in `routes/`, get authenticated by the `get_current_user` dependency from `auth.py`, hit the database through the session `database.py` provides, and go back out shaped by a schema from `schemas.py`. `claude_ai.py` is intentionally the only file that knows Anthropic exists, so the AI integration can be changed in one place.

**`frontend/app/`** follows Next.js App Router conventions: folders are routes, `page.tsx` files are pages. Components shared across pages sit in `components/`; anything only the dashboard uses is nested under `components/dashboard/`. All server communication funnels through `lib/api.ts`, and `context/AuthContext.tsx` is the single source of truth for who's logged in and what roles they have.

Not in the tree: `venv/`, `node_modules/`, `.next/`, and the real `.env` files — all gitignored.
