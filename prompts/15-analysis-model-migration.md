# 15 — Analysis model migration to `gemini-3.6-flash`

## Goal

`gemini-2.5-flash` is unreachable. The project's Gemini key returns
`404 NOT_FOUND` for it — _"This model models/gemini-2.5-flash is no longer
available to new users."_ Every analysis run therefore fails at the first API
call, regardless of the retry and pacing work done in prompt 14.

Migrate the analysis model to `gemini-3.6-flash`, and update the documentation
that still mandates the retired model so code and AGENTS.md stop contradicting
each other.

This is a configuration and documentation change. **No pipeline logic, schema,
prompt text, validation, or DB shape changes.**

## Skills read

- None newly required. No new SDK surface is introduced: the call site,
  `Output.object({ schema })` usage, `maxRetries: 0`, and the Zod re-parse in
  `lib/ai/analyze-article.ts` are all unchanged. Only the string passed to
  `google(...)` changes.
- `ai-sdk` skill was already read for prompts 10, 11, 13 and 14.

## Existing code inspected

- `lib/config/ai.ts` — `ANALYSIS_MODEL_ID = "gemini-2.5-flash"` (line 6). The
  single source of the model ID; `EMBEDDING_MODEL_ID` and
  `EMBEDDING_DIMENSIONS` are unaffected.
- `lib/ai/analyze-article.ts` — calls `google(ANALYSIS_MODEL_ID)`. Already reads
  the constant, so no call-site edit is needed.
- `lib/config/limits.ts` — `ANALYSIS_REQUEST_DELAY_MS = 13_000`, whose doc
  comment cites "the measured `gemini-2.5-flash` free-tier ceiling of 5 requests
  per minute". The value stays; the justification must stop naming a model the
  project no longer calls.
- `AGENTS.md` §19 line 587 — mandates `gemini-2.5-flash` by name.
- `AGENTS.md` §21 env table line 710 — `GOOGLE_GENERATIVE_AI_API_KEY` row names
  `gemini-2.5-flash`.
- `.env.example` — line 16 declares `GOOGLE_GENERATIVE_AI_API_KEY` with no model
  name, so it needs no change.
- `prompts/10`, `prompts/11`, `prompts/14` — reference `gemini-2.5-flash`.
  These are historical records of past work. **Do not edit or renumber them**
  (AGENTS.md §4).

## Verification already performed (2026-07-25)

Measured against the project's real `analysisOutputSchema`,
`ANALYSIS_SYSTEM_PROMPT` and `buildAnalysisPrompt` — not a reimplementation — on
a representative political news article:

| model                 | result                    | in  | out  | reasoning | total |
| --------------------- | ------------------------- | --- | ---- | --------- | ----- |
| `gemini-2.5-flash`    | **404 — unavailable**     | —   | —    | —         | —     |
| `gemini-3.6-flash`    | OK, schema valid, 5341ms  | 795 | 790  | 599       | 1585  |
| `gemini-flash-latest` | OK, schema valid, 7005ms  | 795 | 1217 | 1027      | 2012  |

- Structured output via `Output.object` works; the Zod re-parse passes; the
  three percentages summed to exactly 100 and `normalizePercentages(15,70,15)`
  returned `{left:15,center:70,right:15}`.
- Embeddings were confirmed working separately (`gemini-embedding-001` → 1536
  dims, 605ms), and
  `article_analyses.embedding` already exists in the database.
- `gemini-flash-latest` resolves to `modelVersion=gemini-3.6-flash` — it is the
  **same model**, not a cheaper alternative. The token gap above is
  reasoning-token variance across two runs of one model.

## Decisions and assumptions

1. **Use the pinned `gemini-3.6-flash`, not `gemini-flash-latest`.** They are
   the same model today, but `article_analyses.model` is a permanent record of
   what produced each row. A floating alias writes a string whose meaning
   changes when Google re-points it, and would silently swap models mid-backfill.
2. **Keep `ANALYSIS_REQUEST_DELAY_MS = 13_000`.** Google no longer publishes
   per-model free-tier RPM in the public docs — `ai.google.dev/gemini-api/docs/rate-limits`
   now defers to the AI Studio dashboard. Rather than guess a lower number and
   re-trigger the prompt-14 failure mode, keep the conservative 13s. Lowering it
   is a follow-up once the real limit is read off AI Studio.
3. **Accept higher token cost per article.** 3.6-flash reasons by default; ~75%
   of output tokens were reasoning. This is inherent to the model tier, not a
   misconfiguration. Lighter tiers (`gemini-3.5-flash-lite`,
   `gemini-3.1-flash-lite`) exist on this key but are unvalidated for framing
   analysis and are explicitly out of scope here.
4. **Throughput is a known constraint, not a bug.** At ~5.3s per call plus a 13s
   delay ≈ 18.3s per article, `MAX_ANALYSIS_RUN_MS = 240_000` yields ~13
   articles per run. With ~4 articles currently pending this is sufficient;
   larger backfills need multiple runs, which the pending-analysis LEFT JOIN
   already handles correctly.
5. **AGENTS.md is amended, not silently violated.** §19 names the model
   explicitly, so the rule itself must change — this is a deviation the user
   approved on 2026-07-25 because the mandated model is unreachable.

## Files likely to change

- `lib/config/ai.ts` — `ANALYSIS_MODEL_ID` value and its doc comment.
- `lib/config/limits.ts` — `ANALYSIS_REQUEST_DELAY_MS` doc comment only; the
  value is unchanged.
- `AGENTS.md` — §19 model mandate (line ~587) and §21 env table row (line ~710).

No changes to: `lib/ai/analyze-article.ts`, `lib/ai/embed-article.ts`,
`lib/ai/analysis-schema.ts`, `lib/ai/prompt.ts`, `lib/pipeline/*`,
`app/api/analyze/route.ts`, `supabase/schema.sql`, `lib/supabase/types.ts`.

## Implementation requirements

1. Set `ANALYSIS_MODEL_ID = "gemini-3.6-flash"` in `lib/config/ai.ts`. Update
   its comment to note the value is a deliberate pin, and why the alias is not
   used.
2. Update the `ANALYSIS_REQUEST_DELAY_MS` comment in `lib/config/limits.ts` to
   state that the 13s spacing is a conservative carry-over pending confirmation
   of `gemini-3.6-flash`'s real free-tier RPM in AI Studio. Do not change the
   number.
3. Update AGENTS.md §19 to mandate `gemini-3.6-flash`, and the §21 env table row
   to match.
4. The model ID must remain centralized — after the change,
   `grep -rn "gemini-3.6-flash" app lib` must match `lib/config/ai.ts` only.
5. Do not edit prompts 10, 11, or 14.

## Security requirements

- No change to secret handling. `GOOGLE_GENERATIVE_AI_API_KEY` stays server-only
  and is read by `@ai-sdk/google` from the environment.
- No model IDs or keys reach browser code; `lib/config/ai.ts` holds no secrets
  and stays free of client imports.
- `lib/ai/*` retains `import "server-only"`.
- Do not commit the API key or paste it into prompt files or logs.

## Acceptance criteria

- `ANALYSIS_MODEL_ID === "gemini-3.6-flash"`.
- `grep -rn "gemini-2.5-flash" app lib` returns **no matches**.
- `grep -rn "gemini-3.6-flash" app lib` matches `lib/config/ai.ts` only.
- AGENTS.md §19 and the §21 env table both name `gemini-3.6-flash`.
- `ANALYSIS_REQUEST_DELAY_MS` is still `13_000`.
- A real analysis run saves rows with `model = 'gemini-3.6-flash'`,
  percentages summing to 100, and a non-null `embedding`.
- No pipeline, schema, or validation behaviour changes.

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` — server config module changed.

Expect the 2 pre-existing `@next/next/no-img-element` warnings in
`app/article/[id]/page.tsx` and `components/ui/news-card.tsx` to remain; they
are unrelated to this change.

## Manual test steps

1. Start the dev server and watch its terminal for analysis logs (AGENTS.md §17):

   ```bash
   npm run dev
   ```

2. Analyze one article to confirm the model responds end-to-end:

   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{"batchSize": 1}'
   ```

   Expect `analyzed: 1`, `failed: 0`, and no `rate_limited` reason in the
   summary. The dev-server terminal should show per-article progress and a final
   summary object.

3. Drain the remaining pending articles (~4 total):

   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-PIXCA-admin-secret: $PIXCA_ADMIN_SECRET" \
     -d '{}'
   ```

4. In Supabase → SQL Editor, confirm what was written:

   ```sql
   select model,
          count(*) as rows,
          count(embedding) as with_embedding,
          min(left_percentage + center_percentage + right_percentage) as min_pct_sum,
          max(left_percentage + center_percentage + right_percentage) as max_pct_sum
   from article_analyses
   group by model;
   ```

   New rows must show `model = 'gemini-3.6-flash'`, `with_embedding` equal to
   `rows`, and both `min_pct_sum` and `max_pct_sum` equal to `100`.

5. Load an analyzed article's details page and confirm the analysis renders and
   the Related Articles section appears once at least two articles have
   embeddings.
