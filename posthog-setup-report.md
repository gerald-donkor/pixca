# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into Pixca. Client-side analytics is initialized via `instrumentation-client.ts` (the Next.js 15.3+ pattern) with a reverse proxy through `/ingest` to avoid ad blockers. A server-side singleton in `lib/posthog-server.ts` covers API route events. Clerk users are identified on every page load via a `PostHogIdentify` client component mounted in the root layout. Four events are instrumented — one server-side content engagement event, one client-side conversion event, and two pipeline health events.

| Event | Description | File |
|---|---|---|
| `article_viewed` | Fired server-side when an authenticated user opens an article detail page. | `app/article/[id]/page.tsx` |
| `newsletter_subscribe_clicked` | Fired client-side when a user clicks the Subscribe button on the article page newsletter block. | `components/ui/newsletter-subscribe.tsx` |
| `scrape_run_completed` | Fired server-side when a manual scrape pipeline run finishes, with counts of articles inserted and sources checked. | `app/api/scrape/route.ts` |
| `analysis_run_completed` | Fired server-side when an AI analysis pipeline run finishes, with counts of articles analyzed and failed. | `app/api/analyze/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/437003/dashboard/1905580)
- **Insight**: [Article views over time (wizard)](https://us.posthog.com/project/437003/insights/rifiZg5i)
- **Insight**: [Article views by source (wizard)](https://us.posthog.com/project/437003/insights/awD80Dhg)
- **Insight**: [Newsletter subscribe clicks (wizard)](https://us.posthog.com/project/437003/insights/dgVJstly)
- **Insight**: [Scrape pipeline health (wizard)](https://us.posthog.com/project/437003/insights/h9LsWAEP)
- **Insight**: [Article view to newsletter funnel (wizard)](https://us.posthog.com/project/437003/insights/Ev6Tq9dQ)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the `PostHogIdentify` component runs on every render, but verify Clerk's `useUser()` resolves the user correctly on hard refresh and that the identify call fires before any page-specific events.
- [ ] This project uses Supabase and Clerk as data sources. Running `npx @posthog/wizard warehouse` will connect them to PostHog's data warehouse for deeper analysis.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
