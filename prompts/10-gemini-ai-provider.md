# 10 — Switch AI provider from OpenAI to Google Gemini

## Goal

Make Google Gemini the AI provider for PIXCA instead of OpenAI, for both article
analysis (AGENTS.md section 19) and embeddings (section 20).

No AI code exists in the repo yet — `app/api/analyze`, `app/api/cron/pipeline`,
`lib/ai/`, the `ai` package and any provider package are all absent. So this change
is a **provider decision + configuration change**, applied to the documents that
drive future implementation, so that when sections 19 and 20 are implemented they
are written against Gemini from the start.

## Skills read

- `.claude/skills/ai-sdk/SKILL.md` — instructs: never write AI SDK code from memory,
  install only `ai` first, read version-matched bundled docs under
  `node_modules/ai/docs/`, verify model IDs against the live model list.

## Existing code inspected

- `package.json` — no `ai`, no `@ai-sdk/*` provider package installed.
- `.env.example` — has no AI key entry at all today.
- `.env.local` — currently has `OPENAI_API_KEY` and `ANALYSIS_BATCH_SIZE` set.
  (Also has `CRON_SECRET`, which AGENTS.md section 18 says should not live there —
  out of scope for this prompt, flagged only.)
- `app/api/` — only `scrape` and `sources` exist. No analyze route.
- `lib/` — `api`, `config`, `oxylabs`, `pipeline`, `scraping`, `supabase`. No `ai`.
- `supabase/schema.sql` — line 14 notes the `embedding` column is deferred to
  section 20; no vector column exists yet.
- `AGENTS.md` — sections 19, 20 and 21 reference OpenAI by name.
- Verified against live sources (not memory):
  - `@ai-sdk/google` is the provider package; default key env var is
    `GOOGLE_GENERATIVE_AI_API_KEY`.
  - Text/object: `google('gemini-2.5-flash')`.
  - Embeddings: `google.embedding('gemini-embedding-001')`, with
    `providerOptions: { google: { outputDimensionality: 1536 } }`.
  - `gemini-2.5-flash` and `gemini-embedding-001` both appear in the current
    Vercel AI Gateway model list.

## Decisions and assumptions

1. **Direct Google provider, not AI Gateway.** The user asked to use a Gemini API
   key, so use `@ai-sdk/google` with `GOOGLE_GENERATIVE_AI_API_KEY` directly. No
   `AI_GATEWAY_API_KEY`.
2. **Env var name is `GOOGLE_GENERATIVE_AI_API_KEY`** — the name `@ai-sdk/google`
   reads by default, so no custom `createGoogle({ apiKey })` wiring is needed.
3. **Analysis model: `gemini-2.5-flash`.** Cheap, fast, strong structured-output
   support — right fit for per-article batch analysis. Centralize the ID in
   `lib/config/` when section 19 is implemented, never inline in a route.
4. **Embedding model: `gemini-embedding-001` with `outputDimensionality: 1536`.**
   This keeps AGENTS.md section 20's `vector(1536)` column, the IVFFlat cosine
   index, and `lib/supabase/types.ts` exactly as already specified — no schema
   change, no migration, no re-embedding.
5. **`model` column in `article_analyses`** stores the Gemini model ID string. No
   schema change needed; the column is already free-form text.
6. **`OPENAI_API_KEY` is removed** from `.env.example` guidance and should be
   deleted from `.env.local` by the user. Nothing reads it.
7. **No AI packages are installed in this prompt.** Installing `ai` and
   `@ai-sdk/google` happens in the section 19 implementation prompt, per the
   ai-sdk skill's "install `ai` first, provider packages when the task requires
   them" rule. This prompt only fixes the provider decision.

## Files likely to change

- `AGENTS.md` — sections 19, 20, 21 (env table), and section 6 tech stack.
- `.env.example` — add the Gemini key entry.
- `.env.local` — user-edited; instruct the user, do not commit.

## Implementation requirements

1. `AGENTS.md` section 6 "Tech stack": replace `OpenAI provider` with
   `Google Gemini provider (@ai-sdk/google)`.
2. `AGENTS.md` section 19: replace the OpenAI references so analysis is described
   as running through the Vercel AI SDK with the Google provider using
   `gemini-2.5-flash`. All framing/sentiment/Zod-validation rules stay unchanged.
3. `AGENTS.md` section 20: replace `OpenAI text-embedding-3-small` with
   `gemini-embedding-001` called with `outputDimensionality: 1536`, and state
   explicitly that the `vector(1536)` column and cosine index are unchanged.
4. `AGENTS.md` section 21: in the "Never expose to browser code" list replace
   `OpenAI credentials` with `Gemini / Google AI credentials`; in the env table
   replace the `OPENAI_API_KEY` row with `GOOGLE_GENERATIVE_AI_API_KEY`
   (purpose: "AI analysis and `gemini-embedding-001` embeddings", exposure:
   server only). Keep the table alphabetically/positionally where the old row was.
5. `.env.example`: add, in the position matching the env table:
   ```
   # Google Gemini API key for AI analysis and embeddings (server only)
   GOOGLE_GENERATIVE_AI_API_KEY=
   ```
   and add `ANALYSIS_BATCH_SIZE=` if it is still missing, since section 21 lists it.
6. Do not add any `OPENAI_*` reference anywhere.
7. Do not install packages, create `lib/ai/`, or create the analyze route — those
   belong to the section 19 prompt.

## Security requirements

- `GOOGLE_GENERATIVE_AI_API_KEY` is server-only. It must never be prefixed with
  `NEXT_PUBLIC_` and never referenced from client components.
- Gemini calls must only ever run in server modules / route handlers, never from
  browser code (AGENTS.md section 21).
- `.env.local` must not be committed; only `.env.example` carries the empty key.

## Acceptance criteria

- `grep -ri "openai" --exclude-dir=node_modules --exclude-dir=.next .` returns no
  hits outside `.agents/skills/ai-sdk/SKILL.md` (third-party skill text, left as-is)
  and `prompts/` history.
- `AGENTS.md` sections 6, 19, 20, 21 consistently name Gemini and
  `GOOGLE_GENERATIVE_AI_API_KEY`.
- `.env.example` contains `GOOGLE_GENERATIVE_AI_API_KEY=` and no OpenAI key.
- Section 20 still specifies `vector(1536)` and the IVFFlat cosine index.

## Checks to run

- `npm run typecheck`
- `npm run lint`

`npm run build` is not needed — no route, config, or server module changes.

## Manual test steps

1. Get a Gemini API key from https://aistudio.google.com/apikey.
2. In `.env.local`, delete the `OPENAI_API_KEY` line and add:
   `GOOGLE_GENERATIVE_AI_API_KEY=<your key>`
3. Restart the dev server: `npm run dev`.
4. Confirm the app still builds and the homepage loads — nothing runtime changed
   yet, so this is a regression check only.
5. Verify the key works before the section 19 implementation:
   ```bash
   curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
     -H "x-goog-api-key: $GOOGLE_GENERATIVE_AI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Reply with the single word OK"}]}]}'
   ```
   Expect a 200 with `OK` in the response text.
6. When deploying, add `GOOGLE_GENERATIVE_AI_API_KEY` to Vercel project env vars
   and remove `OPENAI_API_KEY` there.
