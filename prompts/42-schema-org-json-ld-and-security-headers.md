# 42 — Schema.org JSON-LD Structured Data and Security Headers

## Goal

Add search engine structured data using Schema.org JSON-LD (`NewsArticle`, `NewsMediaOrganization`, `WebSite`) to the home and news article details pages to improve SEO and rich snippet discovery, and configure industry-standard HTTP security response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`) in `next.config.ts`.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js metadata, custom headers configuration, and React Server Component guidelines.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `app/page.tsx` — Server Component rendering the top news page and reading searchParams.
- `app/article/[id]/page.tsx` — Server Component rendering the full news analysis, summary, and bias distribution metrics.
- `app/sitemap.ts` — Base URL derivation logic (`process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app"`).
- `next.config.ts` — Existing Next.js configuration including image domains and PostHog proxy rewrites.

---

## Decisions and assumptions

1. **Zero Client Runtime Overhead**: Structured data scripts must be purely server-rendered via standard `<script type="application/ld+json">` tags using safe JSON serialization (`JSON.stringify(schema).replace(/</g, '\\u003c')` to prevent XSS).
2. **Schema.org Specification Alignment**:
   - `WebSite` Schema on `/`: Includes name, url, description, and `potentialAction` (`SearchAction`) targeting `/?q={search_term_string}`.
   - `NewsMediaOrganization` Schema on `/`: Highlights Pixca as a transparent media analysis organization with foundational metadata.
   - `NewsArticle` Schema on `/article/[id]`: Fully structured with `headline`, `image`, `datePublished`, `dateModified`, `author` (source name/org), `publisher` (Pixca News), and `description` (AI summary).
3. **HTTP Security Headers**:
   - `X-Frame-Options: DENY` — Protects against clickjacking.
   - `X-Content-Type-Options: nosniff` — Prevents MIME type sniffing.
   - `Referrer-Policy: strict-origin-when-cross-origin` — Protects user privacy while retaining referrers on HTTPS.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()` — Restricts unauthorized browser hardware APIs.
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` — Enforces HTTPS.
   - Keep PostHog rewrites and remote image domains untouched.

---

## Files likely to change

- `components/seo/json-ld.tsx` [NEW] — Type-safe Server Component for rendering `<script type="application/ld+json">` tags.
- `app/article/[id]/page.tsx` [MODIFY] — Inject `NewsArticle` structured data.
- `app/page.tsx` [MODIFY] — Inject `WebSite` and `NewsMediaOrganization` structured data.
- `next.config.ts` [MODIFY] — Add `headers()` configuration with standard security headers.

---

## Implementation requirements

1. **`components/seo/json-ld.tsx`**:
   - Create a clean Server Component `JsonLd` that accepts any `Record<string, unknown>` or array of schema objects and renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />`.
2. **`app/page.tsx`**:
   - Render `WebSite` and `NewsMediaOrganization` JSON-LD schemas using the base URL.
3. **`app/article/[id]/page.tsx`**:
   - Build a comprehensive `NewsArticle` JSON-LD object when an article is loaded, linking the publisher, author/source, image, published date, and neutral AI summary.
4. **`next.config.ts`**:
   - Export an async `headers()` function providing security headers for all routes (`source: "/(.*)"`).

---

## Security requirements

- All JSON-LD output must be sanitized to escape HTML tags and prevent XSS injection.
- Security headers must not interfere with Clerk authentication iframes or API calls, Supabase database requests, or PostHog event logging.

---

## Acceptance criteria

1. Valid JSON-LD scripts are embedded in the server-rendered HTML for both `/` and `/article/[id]`.
2. `next.config.ts` exports security headers that apply across all routes.
3. `npm run typecheck`, `npm run lint`, and `npm run build` pass with 0 errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Run verification checks:
   ```bash
   npm run typecheck && npm run lint && npm run build
   ```
2. Start dev server and verify structured data in HTML source:
   - Check `<script type="application/ld+json">` on `http://localhost:3000/`.
   - Check `<script type="application/ld+json">` on `http://localhost:3000/article/<id>`.
3. Check HTTP response headers on `curl -I http://localhost:3000/` to confirm security headers.
