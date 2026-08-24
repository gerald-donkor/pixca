# 32 — Pipeline Error Formatting & Safety-Blocked Queue Fallback

## Goal

1. Enhance `toMessage()` in pipeline loggers to accurately format PostgREST / Supabase and custom object errors instead of falling back to `"Unknown error"`.
2. Implement a graceful fallback analysis handler for `safety_blocked` articles (e.g. sensitive crime / court news blocked by upstream AI provider policy) so they receive a neutral analysis record with clear disclaimers, embed successfully, transition out of the pending queue, and do not trigger redundant hourly API requests.

---

## Skills read

- `.agents/skills/supabase/SKILL.md` — Database queries, analysis insertion, and status updates.
- `.agents/skills/ai-sdk/SKILL.md` — AI SDK error handling and embedding integration.
- `.agents/skills/requesting-code-review/SKILL.md` — Code review request protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review evaluation protocol.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.

---

## Existing code inspected

- `lib/pipeline/run-logger.ts` — `toMessage()` utility checking `error instanceof Error`.
- `lib/pipeline/analysis-run-logger.ts` — Analysis logger and run summary persistence.
- `lib/pipeline/analysis.ts` — `analyzeOne()`, item outcome tracking, and batch processing.
- `lib/ai/analyze-article.ts` — `analyzeArticle()`, `AnalyzeArticleResult`, and failure classifications.
- `lib/ai/errors.ts` — Error identification and safe message extraction.
- `lib/supabase/queries/articles.ts` — `getPendingAnalysisArticles()` pending queue query.

---

## Decisions and assumptions

1. **Defensive Pipeline Error Formatting**:
   - Update `toMessage(error: unknown)` to inspect `error.message`, `error.details`, `error.code`, plain strings, and safely stringify error objects so database disconnects and PostgREST errors are clearly readable in `logs` entries.
2. **Safety-Blocked Article Queue Drain**:
   - Upstream Gemini model policy strictly blocks certain sensitive news content (e.g. allegations involving minors) with `PROHIBITED_CONTENT`, returning no output candidates.
   - For articles where analysis returns `safety_blocked`, create a neutral fallback analysis record (`buildSafetyBlockedFallbackAnalysis`) with `sentiment: neutral (0)`, `bias: unclear (0)`, `confidence: 0.1`, and an explicit disclaimer note explaining that automated AI framing is unavailable under provider content policies.
   - Commit the analysis row, generate the embedding using neutral metadata, and mark `analyzed_at` so the article is cleanly drained from the pending queue and displayed properly on PIXCA without repeating failed API calls every hour.

---

## Files likely to change

- `lib/pipeline/run-logger.ts` [MODIFY] — Upgrade `toMessage()` to handle PostgREST objects, strings, and custom error shapes.
- `lib/ai/analyze-article.ts` [MODIFY] — Add `buildSafetyBlockedFallbackAnalysis()` helper.
- `lib/pipeline/analysis.ts` [MODIFY] — Apply fallback analysis on `safety_blocked` outcome and commit row + embedding.

---

## Implementation requirements

### 1. `lib/pipeline/run-logger.ts`
- Enhance `toMessage(error: unknown)`:
  - If `error instanceof Error`: return `error.message`.
  - If `typeof error === "string"`: return `error`.
  - If `typeof error === "object"` with `message`: combine `message`, optional `details`, and `code`.
  - Otherwise attempt safe `JSON.stringify()` or return `"Unknown error"`.

### 2. `lib/ai/analyze-article.ts`
- Export `buildSafetyBlockedFallbackAnalysis(article: AnalyzableArticle): ArticleAnalysisInsert` with:
  - `summary`: title with notice of unavailable automated summary.
  - `sentiment_score`: 0, `sentiment_label`: "neutral".
  - `bias_score`: 0, `bias_label`: "unclear".
  - `left_percentage`: 0, `center_percentage`: 100, `right_percentage`: 0.
  - `confidence`: 0.1.
  - `framing_notes`: "Automated framing analysis omitted in accordance with AI provider sensitive content policies."
  - `loaded_terms`: empty array.
  - `disclaimer`: "Automated AI analysis unavailable for this report due to AI provider content policy."
  - `model`: `ANALYSIS_MODEL_ID`.

### 3. `lib/pipeline/analysis.ts`
- In `analyzeOne()`:
  - If `result.ok === false` and `result.reason === "safety_blocked"`:
    - Log notice that a fallback analysis is being saved.
    - Insert the fallback analysis record via `insertArticleAnalysis()`.
    - Generate embedding for the fallback summary via `saveEmbedding()`.
    - Mark article analyzed via `markArticleAnalyzed(article.id)`.
    - Record article status as `"analyzed"` and return `"analyzed"`.

---

## Security requirements

- Fallback summaries must remain strictly neutral and objective.
- Error formatting in `toMessage` must not log auth headers or secrets.

---

## Acceptance criteria

1. Calling `POST /api/analyze` processes the pending Jared Leto article, writes a neutral fallback analysis row, embeds it, and sets `analyzed_at`.
2. Subsequent calls to `POST /api/analyze` report `articlesPending: 0, articlesAnalyzed: 0, articlesFailed: 0`.
3. Database / pipeline errors log detailed messages instead of generic `"Unknown error"`.
4. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run analysis pipeline:
   ```bash
   curl -s -X POST -H "x-PIXCA-admin-secret: jfnfieosllsmssuisosl938j3" "http://localhost:3000/api/analyze" | jq .
   ```
2. Verify output shows 1 article analyzed and 0 failed.
3. Re-run analysis pipeline:
   ```bash
   curl -s -X POST -H "x-PIXCA-admin-secret: jfnfieosllsmssuisosl938j3" "http://localhost:3000/api/analyze" | jq .
   ```
4. Verify queue is fully drained: `articlesPending: 0, articlesAnalyzed: 0, articlesFailed: 0`.
5. Check latest logs:
   ```bash
   curl -s "http://localhost:3000/api/logs?limit=2" | jq .
   ```
