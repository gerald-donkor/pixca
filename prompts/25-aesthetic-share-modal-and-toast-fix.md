# 25 — Aesthetic Share Modal and High-Contrast Toast Notification Fix

## Goal

Resolve the transparency/legibility defect in toast notifications and replace the default browser share sheet with an aesthetically pleasing, feature-rich, and accessible **Share Modal**:
1. **High-Contrast, Opaque Toast Notifications (`components/ui/toaster.tsx`)**: Fix the Sonner toast transparency bug where `!bg-[var(--bias-right)]/10` caused 90% transparent unreadable toasts on dark backgrounds. Implement solid, high-contrast, theme-aware toast styling with clear typography and vibrant status badges.
2. **Accessible Dialog Primitive (`components/ui/dialog.tsx`)**: Implement a reusable, accessible modal dialog primitive built on `@base-ui/react/dialog` with smooth backdrop animations and keyboard focus trapping.
3. **Aesthetic Share Modal (`components/ui/share-modal.tsx`)**: Create an in-app share dialog with:
   - Article thumbnail, source badge, and headline preview card.
   - 1-click "Copy Link" input field with instant visual checkmark feedback and toast confirmation.
   - Curated direct social share buttons (X / Twitter, LinkedIn, Reddit, WhatsApp, Facebook, Email).
   - Optional native OS device share trigger ("More options") for mobile devices.
4. **Article Action Bar Integration (`components/ui/article-action-bar.tsx`)**: Connect the Share button to open the custom `ShareModal` instead of directly triggering browser-native popups.

---

## Skills read

- `.agents/skills/gsap-core/SKILL.md` — Core GSAP animations and responsive reduced motion handling.
- `.agents/skills/gsap-react/SKILL.md` — Scoped `@gsap/react` micro-interactions.
- `.agents/skills/gsap-performance/SKILL.md` — 60fps GPU compositor acceleration for modals and dialogs.
- `.agents/skills/requesting-code-review/SKILL.md` — Two-stage code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Technical verification of feedback.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit format.

---

## Existing code inspected

- `/home/dgk/Pictures/Screenshots/Screenshot_20260824_130638.png` — Screenshot demonstrating unreadable transparent toast text over background paragraphs.
- `/home/dgk/Pictures/Screenshots/Screenshot_20260824_130818.png` — Screenshot demonstrating Chrome's native OS share popup lacking Pixca aesthetic.
- `components/ui/toaster.tsx` — Sonner wrapper with transparency defect in `success` and `error` classNames.
- `components/ui/article-action-bar.tsx` — Action bar currently triggering raw `navigator.share`.
- `components/ui/popover.tsx` — Base UI popover primitive reference.

---

## Decisions and assumptions

1. **Toast Notification Styling Fix**:
   - Replace Sonner's `!bg-[var(--bias-right)]/10` with solid opaque backgrounds: `bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xl rounded-2xl p-4`.
   - Remove conflicting color overrides so text is crisp, fully opaque, and high contrast in both light and dark themes.
   - Style success toasts with an emerald/blue indicator badge and crisp foreground typography.
2. **Accessible Dialog Primitive (`@base-ui/react/dialog`)**:
   - Build `components/ui/dialog.tsx` utilizing `@base-ui/react/dialog` primitives (`Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`).
   - Implement smooth backdrop blur (`bg-black/60 backdrop-blur-sm animate-in fade-in-0`) and centered modal animations (`zoom-in-95 data-[state=closed]:zoom-out-95`).
3. **Aesthetic Share Modal Content**:
   - **Article Card Preview**: Displays article thumbnail, source pill, and truncated title so the user knows exactly what they are sharing.
   - **Quick Copy Section**: Clean input with direct "Copy" button that copies the clean URL to clipboard, triggers an animated checkmark, and displays a toast.
   - **Social Share Actions**: Direct deep-links with official brand colors and icons:
     - X (Twitter): `https://twitter.com/intent/tweet?text=${title}&url=${url}`
     - LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
     - Reddit: `https://reddit.com/submit?url=${url}&title=${title}`
     - WhatsApp: `https://api.whatsapp.com/send?text=${title}%20${url}`
     - Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
     - Email: `mailto:?subject=${title}&body=Check%20out%20this%20article%20on%20Pixca:%20${url}`
   - **Native Device Share Fallback**: "More sharing options..." button calling `navigator.share` on supported touch devices.

---

## Files likely to change

- `components/ui/toaster.tsx` [MODIFY] — Fix transparency and improve contrast, padding, and status badges.
- `components/ui/dialog.tsx` [NEW] — Accessible Dialog component built on `@base-ui/react/dialog`.
- `components/ui/share-modal.tsx` [NEW] — Feature-rich, visually appealing Share Modal component.
- `components/ui/article-action-bar.tsx` [MODIFY] — Wire the Share button to open `ShareModal`.

---

## Implementation requirements

### 1. `components/ui/toaster.tsx`
- Must be a client component (`"use client"`).
- Remove transparent background hacks (`!bg-.../10`).
- Ensure toast containers are 100% opaque with solid borders and rich drop shadows:
  ```tsx
  toast: "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-[#18181B] group-[.toaster]:text-zinc-900 dark:group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl font-sans text-sm p-4",
  success: "group-[.toaster]:!border-emerald-500/30 dark:group-[.toaster]:!border-emerald-500/30",
  error: "group-[.toaster]:!border-red-500/30 dark:group-[.toaster]:!border-red-500/30",
  ```
- Ensure clear visibility in both light mode and dark mode over any page text or media.

### 2. `components/ui/dialog.tsx`
- Must be a client component (`"use client"`).
- Exports `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogBackdrop`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`.
- Includes accessible backdrop with blur:
  ```tsx
  <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
  ```
- Includes animated popup:
  ```tsx
  <DialogPrimitive.Popup className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-6 shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 outline-none" />
  ```

### 3. `components/ui/share-modal.tsx`
- Must be a client component (`"use client"`).
- Props:
  ```typescript
  export interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    article: {
      id: string;
      title: string;
      original_url: string;
      source_name: string;
      image_url?: string;
    };
  }
  ```
- Renders:
  - Dialog Title: "Share Article" with close button (X).
  - Article Preview: Thumbnail image + Source Pill + Title (2-line clamp).
  - Quick Copy Bar: Readonly input showing current URL with "Copy Link" button (transitions to "Copied!" with Check icon).
  - Social Share Grid: 6 circular/pill social buttons with icons and labels (X, LinkedIn, Reddit, WhatsApp, Facebook, Email).
  - Optional device share button (`navigator.share`) if supported.

### 4. `components/ui/article-action-bar.tsx`
- Replace direct `handleShare` call with `setShareOpen(true)` opening `<ShareModal />`.
- Retain all bookmark and options popover functionality.

---

## Security requirements

- Social sharing links use `target="_blank"` and `rel="noopener noreferrer"`.
- URL parameters are safely encoded with `encodeURIComponent`.
- No sensitive keys or user credentials exposed.

---

## Acceptance criteria

1. Clicking "Save" or copying a link shows a solid, completely opaque toast notification that is clearly legible over any page background or text in both light and dark modes.
2. Clicking "Share" opens a polished, aesthetically pleasing Share Modal instead of triggering the browser-native OS popup.
3. The Share Modal displays an article preview card with thumbnail, source, and title.
4. Clicking "Copy Link" in the modal copies the article URL, flips the button to "Copied!", and fires a toast notification.
5. Social sharing buttons (X, LinkedIn, Reddit, WhatsApp, Facebook, Email) open the respective pre-filled share URLs in new tabs.
6. The modal can be closed via the close button, clicking the backdrop, or pressing Escape.
7. `npm run typecheck` and `npm run lint` pass with zero errors.

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
2. Open an article at `http://localhost:3000/article/[id]`.
3. Click "Save":
   - Verify the toast is solid, opaque, with high-contrast text and no transparent text bleed-through.
4. Click "Share":
   - Verify the custom Pixca Share Modal opens with smooth backdrop blur and entrance animation.
   - Verify the article preview shows the image thumbnail, source name, and headline.
   - Click "Copy Link": verify instant feedback ("Copied!") and URL copied to clipboard.
   - Click the "X" (Twitter) or "LinkedIn" button: verify a new tab opens with the pre-filled share link.
   - Press "Escape" or click outside to dismiss the modal.
