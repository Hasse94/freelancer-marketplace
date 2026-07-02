# Contributing

This started as a portfolio project, but issues and PRs are welcome. Here's how to keep things consistent.

## Git Workflow

- `main` is always deployable. Work happens on branches:
  - `feat/<short-name>` for features
  - `fix/<short-name>` for bug fixes
  - `docs/<short-name>` for documentation
- Keep commits focused — one logical change per commit.
- Rebase on `main` before opening a PR so the history stays linear.

### Commit messages

Conventional-commits style, imperative mood:

```
feat: add freelancer availability toggle
fix: prevent double payment on rapid clicks
docs: clarify Stripe webhook setup
refactor: extract job ownership check
```

The subject line should make sense in a changelog. Add a body when the *why* isn't obvious from the diff.

## Code Standards

**Python (backend)**
- Follow the existing layering: route handlers stay thin, models/schemas stay declarative. If a check is used by more than one route, extract a helper.
- Every endpoint declares a Pydantic `response_model` (or returns an explicit dict for ad-hoc shapes).
- Raise `HTTPException` with a specific status code and a human-readable `detail` — the frontend surfaces these directly.
- No bare `except:` — catch the exceptions you expect.

**TypeScript (frontend)**
- `strict` mode is on and stays on. No `any` unless you can defend it in review.
- All backend calls go through `frontend/app/lib/api.ts` — don't scatter axios calls through components.
- Keep types in `lib/types.ts` in sync with the backend's Pydantic schemas.
- No `console.log` in committed code. Errors surface to the user via `getApiError()`, not the console.
- Match the existing Tailwind style, including dark-mode variants on anything user-visible.

**Both**
- Comments explain *why*, not *what*. If the code needs a "what" comment, rewrite the code.
- Never commit secrets. `.env` and `.env.local` are gitignored for a reason; add new variables to the `.example` files instead.

## Testing

There's no automated test suite yet (it's on the wishlist — pytest for the API, Playwright for the UI). Until then, PRs are verified manually:

1. `npm run build` in `frontend/` must pass — it type-checks and lints the whole app.
2. Exercise the flow you touched end-to-end against a local backend (see [SETUP.md](SETUP.md#4-try-the-whole-flow)).
3. If you touched payments, test with the Stripe CLI forwarding webhooks and confirm the payment status transitions in the dashboard.

If you want to contribute the initial test setup, that would be a very welcome PR.

## Pull Requests

1. Open an issue first for anything non-trivial so we can agree on the approach.
2. Keep PRs small and single-purpose — a 200-line focused PR beats a 2,000-line kitchen sink.
3. In the description: what changed, why, and how you verified it. Screenshots for UI changes.
4. Update the relevant docs (README, SETUP, ARCHITECTURE) in the same PR when behavior changes.
5. PRs get reviewed before merge; expect questions rather than silent rewrites.
