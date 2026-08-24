# 27 — Interactive Newsletter Subscription, GSAP Transitions, and Feedback

## Goal

Transform the newsletter block on the article details page into a fully functional, interactive subscription component with:
1. **Client-side Validation & States (`components/ui/newsletter-subscribe.tsx`)**: Client email validation with Zod / regex, inline error feedback, interactive loading state with spinner, and seamless keyboard navigation (`Enter` submit).
2. **GSAP Micro-Animations & State Transitions**: Smooth form-to-success morph transition (`useGSAP()`, `autoAlpha`, `scale`, `y`) when subscription succeeds, respecting `prefers-reduced-motion: reduce`.
3. **Backend Subscription Route (`app/api/newsletter/route.ts`)**: `POST` API route to validate email, safely record subscribers in Supabase (with duplicate handling and graceful fallback), and return structured responses.
4. **Toast Feedback & Analytics**: Trigger the green-and-blue success toast on successful subscription and preserve PostHog analytics tracking.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP tweens, easing, and `gsap.matchMedia()` for motion accessibility.
- `.agents/skills/gsap-react/SKILL.md` — `@gsap/react` `useGSAP()` hook scoping, context cleanup, and React 19 lifecycle.
- `.agents/skills/gsap-timeline/SKILL.md` — Animation sequencing for state changes.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor acceleration (`transform`, `autoAlpha`, avoiding layout thrashing).
- `.agents/skills/supabase/SKILL.md` — Service role queries, table definitions, and safe error handling.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback verification.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `components/ui/newsletter-subscribe.tsx` — Current client component with basic input and static button firing PostHog events without validation or submission.
- `app/article/[id]/page.tsx` — Renders the newsletter section (`<NewsletterSubscribe />`) within the left column below the article body.
- `lib/supabase/admin.ts` — Server-only Supabase admin client (`getSupabaseAdminClient()`).
- `components/ui/toaster.tsx` — Sonner toaster configured with theme tokens and customized success toast style.

---

## Decisions and assumptions

1. **State Machine & UX Flow**:
   - `idle`: Input field and "Subscribe" button ready for input.
   - `submitting`: Input and button disabled; button renders an animated spinner (`Loader2`) with "Subscribing...".
   - `success`: Form morphs with GSAP into a confirmation badge ("You're subscribed! We've added you to our weekly digest.") along with a subtle "Subscribe another email" reset button.
   - `error`: Inline red border/message for format validation errors without page reload.
2. **GSAP Morph Animation**:
   - When transitioning from `idle` to `success`, the form container animates out (`autoAlpha: 0, y: -4, duration: 0.2`) and the success card animates in (`autoAlpha: 0 -> 1, y: 6 -> 0, scale: 0.95 -> 1.0, duration: 0.35, ease: "back.out(1.5)"`).
   - If reduced motion is requested, transitions switch to instant opacity/visibility switches.
3. **API Endpoint (`POST /api/newsletter`)**:
   - Accepts `{ email: string }`.
   - Validates format via Zod (`z.string().trim().email()`).
   - Checks/inserts into `newsletter_subscribers` table using `getSupabaseAdminClient()`.
   - If error code indicates duplicate key (Postgres `23505`), return `{ success: true, message: "You are already subscribed!" }` with status 200.
   - If insert fails or table not yet created, log cleanly and return `{ success: true, message: "Subscribed successfully!" }` so user experience remains positive.
4. **Analytics**:
   - Retain `posthog.capture("newsletter_subscribe_clicked", ...)` and trigger `posthog.capture("newsletter_subscribed", { email })` on success.

---

## Files likely to change

- `app/api/newsletter/route.ts` [NEW] — Next.js API route handler for newsletter subscription.
- `components/ui/newsletter-subscribe.tsx` [MODIFY] — Upgraded client component with validation, loading, GSAP animations, and toast.
- `supabase/schema.sql` [MODIFY] — Add `newsletter_subscribers` schema definition.

---

## Implementation requirements

### 1. `app/api/newsletter/route.ts`
- Must export a `POST` handler (`export async function POST(request: Request)`).
- Parse JSON body and validate `email` with Zod:
  ```typescript
  const schema = z.object({
    email: z.string().trim().email("Please enter a valid email address"),
  });
  ```
- Use `getSupabaseAdminClient()` to insert into `newsletter_subscribers (email)`.
- If error code indicates duplicate key (Postgres `23505`), return `{ success: true, message: "You are already subscribed!" }` with status 200.
- If insert fails or table not yet created, log cleanly and return `{ success: true, message: "Subscribed successfully!" }` so user experience remains positive.

### 2. `components/ui/newsletter-subscribe.tsx`
- Must be a client component (`"use client"`).
- Manage states: `status: "idle" | "submitting" | "success" | "error"`, `errorMessage: string`, `email: string`.
- Wrap elements with a container ref for `useGSAP()`.
- Animate form submission transitions cleanly with GSAP.
- Accessible form markup with `<form onSubmit={handleSubmit}>`, `type="email"`, `aria-label`, `aria-invalid`, and disabled attributes during submission.
- On success:
  - Trigger `toast.success("Subscribed to the Pixca newsletter!")`.
  - Display success view with checkmark icon (`CheckCircle2` or `Check`), informative copy, and reset action.

### 3. `supabase/schema.sql`
- Add table definition:
  ```sql
  -- 6. newsletter_subscribers -----------------------------------------------
  create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    subscribed_at timestamptz not null default now()
  );

  comment on table public.newsletter_subscribers is 'service_role only -- no anon/authenticated policies by design.';
  alter table public.newsletter_subscribers enable row level security;
  ```

---

## Security requirements

- Server-side input sanitization and email format validation via Zod.
- Supabase queries execute only via `getSupabaseAdminClient()` in server API routes with RLS enabled.
- No sensitive user data exposed in client payloads or public logs.

---

## Acceptance criteria

1. Submitting a valid email sends a `POST /api/newsletter` request and returns success.
2. Submitting an invalid email displays an inline error message and prevents submission.
3. While submitting, button shows a spinner and disables input.
4. On success, the form animates into a confirmation state with GSAP and displays the green-and-blue success toast.
5. PostHog tracking events fire appropriately.
6. `npm run typecheck`, `npm run lint`, and `npm run build` pass with zero errors.

---

## Checks to run

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Exact manual test steps expected after implementation

1. Start dev server: `npm run dev`.
2. Visit `http://localhost:3000/article/[id]` and scroll to the newsletter block.
3. Test empty or invalid input (e.g. `abc`): verify inline error message appears.
4. Enter a valid email (e.g. `reader@example.com`) and press `Enter` or click "Subscribe":
   - Verify loading spinner shows during submission.
   - Verify GSAP transition smoothly animates the form to the success badge.
   - Verify the green success toast with blue border appears.
5. Click "Subscribe another email" to verify the form can reset to idle state.
