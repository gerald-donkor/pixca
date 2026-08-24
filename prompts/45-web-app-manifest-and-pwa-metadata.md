# 45 — Web App Manifest and PWA Metadata

## Goal

Implement the standard Web App Manifest (`/manifest.webmanifest`) and enrich root layout metadata with Progressive Web App (PWA) configurations, standalone display modes, theme colors, and quick application shortcuts for Top Stories, Blindspot Feed, and Saved Articles.

---

## Skills read

- `node_modules/next/dist/docs/` — Next.js App Router metadata conventions (`app/manifest.ts` returning `MetadataRoute.Manifest` and root `appleWebApp` metadata).
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review protocol.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical evaluation of review feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Conventional commit formatting.

---

## Existing code inspected

- `app/layout.tsx` — Root layout metadata, `<head>` tags, and theme script.
- `app/page.tsx` — Home page structure and routes.
- `app/blindspot/page.tsx` — Blindspot feed.
- `app/saved/page.tsx` — Saved articles library.

---

## Decisions and assumptions

1. **Next.js Native `app/manifest.ts`**:
   - Return standard `MetadataRoute.Manifest` typed structure.
   - Configure `name: "Pixca News — AI News Analysis & Media Bias Intelligence"`.
   - Configure `short_name: "Pixca"`.
   - Configure `description: "Real-time AI-powered news analysis, sentiment scoring, and political framing insights across top global news sources."`.
   - Set `start_url: "/"`, `display: "standalone"`, `orientation: "portrait-primary"`.
   - Set `background_color: "#0B0F19"` and `theme_color: "#0B0F19"`.
   - Set `categories: ["news", "politics", "productivity"]`.
2. **PWA Shortcuts**:
   - Provide direct quick-access shortcuts to:
     - `Top Stories` (`/`)
     - `Blindspot Feed` (`/blindspot`)
     - `Saved Articles` (`/saved`)
3. **App Layout Metadata**:
   - Update `app/layout.tsx` root `metadata` to include `appleWebApp` configuration (`capable: true`, `statusBarStyle: "black-translucent"`, `title: "Pixca News"`).

---

## Files likely to change

- `app/manifest.ts` [NEW] — Type-safe Next.js manifest generator.
- `app/layout.tsx` [MODIFY] — Add `appleWebApp` and manifest metadata.

---

## Implementation requirements

1. **`app/manifest.ts`**:
   - Export default function `manifest(): MetadataRoute.Manifest`.
   - Include standard icons (`/favicon.ico`).
   - Define shortcuts with names, URLs, and descriptions.
2. **`app/layout.tsx`**:
   - Add `manifest: "/manifest.webmanifest"` and `appleWebApp` to `metadata`.

---

## Security requirements

- Pure static/deterministic metadata routing.
- Zero secrets or client-side side-effects.

---

## Acceptance criteria

1. Requesting `GET /manifest.webmanifest` returns HTTP 200 OK with `Content-Type: application/manifest+json`.
2. Root HTML contains proper metadata for PWA and manifest discovery.
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
2. Test manifest endpoint:
   ```bash
   curl -s -I http://localhost:3000/manifest.webmanifest
   curl -s http://localhost:3000/manifest.webmanifest
   ```
