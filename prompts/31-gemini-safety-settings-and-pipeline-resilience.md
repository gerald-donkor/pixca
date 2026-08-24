# 31 — Gemini Safety Settings & Analysis Pipeline Resilience

## Goal

Configure Google Gemini provider safety settings (`BLOCK_NONE`) in `lib/ai/analyze-article.ts` and enhance error resolution and pipeline queue handling so legitimate sensitive news articles (e.g. reporting on crimes, court proceedings, political controversies, and allegations) are successfully analyzed without false safety blocks or getting stuck in permanent retry loops.

---

## Skills read

- `.agents/skills/ai-sdk/SKILL.md` — AI SDK and Google Gemini provider usage, model options, safety settings, structured outputs.
- `.agents/skills/supabase/SKILL.md` — Server-side queries, transactions, and status updates.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback evaluation.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- `lib/ai/analyze-article.ts` — `attemptAnalysis()` and `resolveErrorReason()` functions using `@ai-sdk/google`.
- `lib/ai/errors.ts` — Classification of Gemini call failures and safe message formatting.
- `lib/pipeline/analysis.ts` — Batch execution, item outcome handling, and retry loop logic.
- `lib/supabase/queries/articles.ts` — `getPendingAnalysisArticles()` pending check query.

---

## Decisions and assumptions

1. **News NLP Safety Thresholds**:
   - Real-world news reporting often covers sensitive subjects (sexual misconduct allegations, violent crime, civil unrest, war, political extremist rhetoric).
   - Configure `@ai-sdk/google` provider options with `safetySettings` set to `BLOCK_NONE` for all standard safety categories (`HARM_CATEGORY_HATE_SPEECH`, `HARM_CATEGORY_DANGEROUS_CONTENT`, `HARM_CATEGORY_HARASSMENT`, `HARM_CATEGORY_SEXUALLY_EXPLICIT`, `HARM_CATEGORY_CIVIC_INTEGRITY`).
2. **Granular Error Classification**:
   - Update `resolveErrorReason()` in `lib/ai/analyze-article.ts` and `lib/ai/errors.ts` to detect safety block / refusal signatures from model responses and categorize them appropriately.
3. **Pipeline Queue Resilience**:
   - Ensure that when an article is attempted and analyzed, it seamlessly proceeds through embedding and gets marked with `analyzed_at` timestamp.
   - If an article fails all attempts with a permanent model error, log the exact failure reason without blocking remaining batch items.

---

## Files likely to change

- `lib/ai/analyze-article.ts` [MODIFY] — Pass `safetySettings` in `providerOptions.google` to `generateText`.
- `lib/ai/errors.ts` [MODIFY] — Enhance error detection for safety/refusal responses.
- `lib/pipeline/analysis.ts` [MODIFY] — Improve resilience and logging for article failures.

---

## Implementation requirements

### 1. `lib/ai/analyze-article.ts`
- Pass `providerOptions: { google: { safetySettings: [...] } }` to `generateText` in `attemptAnalysis()`.
- Configure `BLOCK_NONE` threshold for:
  - `HARM_CATEGORY_HATE_SPEECH`
  - `HARM_CATEGORY_DANGEROUS_CONTENT`
  - `HARM_CATEGORY_HARASSMENT`
  - `HARM_CATEGORY_SEXUALLY_EXPLICIT`
  - `HARM_CATEGORY_CIVIC_INTEGRITY`

### 2. `lib/ai/errors.ts`
- Add helper to inspect error messages and detect if a safety block or refusal occurred.

### 3. `lib/pipeline/analysis.ts`
- Ensure robust handling of individual article analysis outcomes.

---

## Security requirements

- Permissive safety thresholds are applied exclusively within server-side AI news analysis workers; never exposed to client-side code.
- API keys and raw error stack traces containing credentials remain sanitized from logs.

---

## Acceptance criteria

1. Calling `POST /api/analyze` successfully processes sensitive news articles that previously triggered safety/model refusals.
2. The Jared Leto article (`c45a910e-809e-45b8-b28f-d8cd9bddbb19`) is analyzed and embedded successfully, transitioning out of the pending queue.
3. Subsequent calls to `GET /api/logs` show completed analysis with 0 failures.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Trigger analysis pipeline:
   ```bash
   curl -s -X POST -H "x-PIXCA-admin-secret: jfnfieosllsmssuisosl938j3" "http://localhost:3000/api/analyze" | jq .
   ```
2. Verify output indicates `articlesAnalyzed: 1, articlesFailed: 0, articlesPending: 1`.
3. Check logs to confirm success:
   ```bash
   curl -s "http://localhost:3000/api/logs?limit=1" | jq .
   ```
4. Verify the article appears on the homepage / details page with full framing and sentiment analysis.
