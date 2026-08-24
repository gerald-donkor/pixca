# 41 — Continuous Integration and Build Verification Workflow

## Goal

Create an automated GitHub Actions Continuous Integration (CI) workflow at `.github/workflows/ci.yml` that automatically validates TypeScript type safety (`npm run typecheck`), ESLint code standards (`npm run lint`), and Next.js production build (`npm run build`) on every push to `main` and pull request to maintain codebase health and prevent regressions.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js production build requirements, static generation, server/client boundaries, and environment handling.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `.github/workflows/hourly-pipeline.yml` — Existing scheduled GitHub Actions workflow structure and environment variable passing.
- `package.json` — Scripts (`typecheck`, `lint`, `build`), dependencies, and Node engine requirements.
- `.env.example` — Required environment variable signatures for build-time execution.

---

## Decisions and assumptions

1. **Workflow Triggers**:
   - Run on `push` to `main`.
   - Run on `pull_request` targeting `main`.
   - Allow manual triggers via `workflow_dispatch`.
2. **Environment & Node Setup**:
   - Use `ubuntu-latest` runner with `actions/setup-node@v4` on Node.js 20.
   - Enable npm dependency caching (`cache: 'npm'`) to optimize CI execution times.
3. **Build Environment Variables**:
   - Provide build-safe mock environment variables for headless Next.js compilation (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PIXCA_ADMIN_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`) so CI builds succeed reliably without requiring live production database or external API keys during CI checks.
4. **Step Sequencing**:
   - Step 1: Checkout repository (`actions/checkout@v4`).
   - Step 2: Set up Node.js with cache (`actions/setup-node@v4`).
   - Step 3: Clean install dependencies (`npm ci`).
   - Step 4: Run typecheck (`npm run typecheck`).
   - Step 5: Run lint (`npm run lint`).
   - Step 6: Run build (`npm run build`).

---

## Files likely to change

- `.github/workflows/ci.yml` [NEW] — GitHub Actions CI pipeline configuration.

---

## Implementation requirements

1. **`.github/workflows/ci.yml`**:
   - Create a clean, reliable workflow file named `ci.yml` in `.github/workflows/`.
   - Configure triggers:
     ```yaml
     name: CI
     on:
       push:
         branches: [main]
       pull_request:
         branches: [main]
       workflow_dispatch:
     ```
   - Define job `verify` with concurrency cancellation for active PRs (`cancel-in-progress: true`).
   - Run verification commands sequentially with proper error propagation (`npm run typecheck`, `npm run lint`, `npm run build`).

---

## Security requirements

- CI checks must not expose secret tokens or private keys.
- Fallback/mock values provided during build-time checks in CI must be non-functional dummy strings safe for public CI execution.

---

## Acceptance criteria

1. `.github/workflows/ci.yml` is syntactically valid YAML and conforms to GitHub Actions schema.
2. The workflow includes typecheck, lint, and build verification steps.
3. Local verification commands (`npm run typecheck`, `npm run lint`, and `npm run build`) pass cleanly with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run verification checks locally:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
2. Validate workflow YAML structure:
   - Check `.github/workflows/ci.yml` formatting and step declarations.
