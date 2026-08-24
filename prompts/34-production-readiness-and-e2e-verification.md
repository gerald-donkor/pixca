# 34 — Production Readiness and End-to-End System Verification

## Goal

Perform comprehensive production-readiness verification and end-to-end validation of all core PIXCA systems: Clerk authentication boundaries, Supabase persistence & pgvector cosine similarity search, Oxylabs scraping & scheduler processing pipelines, Gemini AI analysis & embedding generation, and GSAP-animated interactive UI components.

---

## Skills read

- `.agents/skills/clerk/SKILL.md` — Authentication, user sessions, middleware routing, and protected routes.
- `.agents/skills/supabase/SKILL.md` — Database queries, RLS policies, service role access, and pgvector IVFFlat index.
- `.agents/skills/oxylabs-web-scraper/SKILL.md` — Scraper and Scheduler API integrations, precise 64-bit integer handling, and dedupe logic.
- `.agents/skills/ai-sdk/SKILL.md` — Gemini model configuration (`gemini-3.6-flash`), structured outputs, safety settings, and fallback handling.
- `.agents/skills/gsap-core/SKILL.md` & `.agents/skills/gsap-react/SKILL.md` — React 19 lifecycle safety, `useGSAP` scoping, and performance best practices.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review evaluation guidelines.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit standards.

---

## Existing code inspected

- `app/layout.tsx`, `app/page.tsx`, `app/article/[id]/page.tsx`, `app/saved/page.tsx`, `app/blindspot/page.tsx` — Full Next.js App Router UI pages.
- `app/api/scrape/route.ts`, `app/api/analyze/route.ts`, `app/api/cron/pipeline/route.ts`, `app/api/logs/route.ts`, `app/api/sources/route.ts`, `app/api/oxylabs/schedules/route.ts`, `app/api/oxylabs/runs/route.ts`, `app/api/oxylabs/scheduled-results/process/route.ts` — Full backend API route handlers.
- `lib/ai/analyze-article.ts`, `lib/ai/embed-article.ts`, `lib/config/ai.ts` — Gemini AI analysis and pgvector embedding pipelines.
- `lib/pipeline/run-logger.ts` — Unified operational logging and error formatting.
- `lib/supabase/admin.ts`, `lib/supabase/queries/` — Supabase database and vector query layer.
- `components/ui/`, `components/layout/` — GSAP animated interactive components.
- `.github/workflows/hourly-pipeline.yml` — Automated hourly pipeline trigger.

---

## Decisions and assumptions

1. **System Health & Integrity**:
   - Ensure all TypeScript types, ESLint rules, and Next.js production builds pass with 0 errors or warnings.
   - Verify that all sensitive tokens (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, `PIXCA_ADMIN_SECRET`, `CRON_SECRET`) are strictly server-side and never exposed to the client.
2. **Resilience & Fault Tolerance**:
   - Confirm that API endpoints return structured, clean JSON responses with uniform error formatting via `toMessage`.
   - Confirm that cron and batch pipelines gracefully handle network drops, rate limits, and safety blocks without corrupting state.
3. **Interactive UI & Performance**:
   - Ensure GSAP animations are SSR-safe, execute inside `useGSAP` with container refs, and respect `prefers-reduced-motion`.

---

## Files likely to change

- `prompts/34-production-readiness-and-e2e-verification.md` [NEW] — Implementation prompt definition.

---

## Implementation requirements

1. Verify build and type integrity:
   - Run `npm run typecheck` to confirm zero type errors.
   - Run `npm run lint` to confirm zero lint violations.
   - Run `npm run build` to confirm clean Next.js production bundle compilation.
2. Validate environment & configuration:
   - Confirm `.env.example` lists all required client and server environment variables.
   - Confirm constant-time secret comparison logic in `lib/api/admin-secret.ts` and `lib/api/cron-secret.ts`.
3. Validate API response schemas and endpoints:
   - Verify `GET /api/sources`, `GET /api/logs`, `GET /api/oxylabs/schedules`, and `GET /api/oxylabs/runs`.
   - Verify authentication guards on `POST /api/scrape`, `POST /api/analyze`, `POST /api/oxylabs/schedules`, and `POST /api/oxylabs/scheduled-results/process`.

---

## Security requirements

- Zero leakage of server environment variables to browser code (`NEXT_PUBLIC_*` strictly limited to public keys).
- Admin routes must strictly require `x-PIXCA-admin-secret` header.
- Cron pipeline route must strictly require `Authorization: Bearer <CRON_SECRET>` in production environments.

---

## Acceptance criteria

1. TypeScript compiler (`npm run typecheck`) reports 0 errors.
2. ESLint (`npm run lint`) reports 0 errors.
3. Next.js production build (`npm run build`) builds cleanly.
4. All API route contracts and security guardrails function as specified in `AGENTS.md`.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run full typecheck and linting:
   ```bash
   npm run typecheck && npm run lint
   ```
2. Verify production build:
   ```bash
   npm run build
   ```
3. Test read endpoints:
   ```bash
   curl -s "http://localhost:3000/api/sources" | jq .
   curl -s "http://localhost:3000/api/logs?limit=5" | jq .
   curl -s "http://localhost:3000/api/oxylabs/schedules" | jq .
   ```
4. Test cron endpoint:
   ```bash
   curl -s "http://localhost:3000/api/cron/pipeline" | jq .
   ```
