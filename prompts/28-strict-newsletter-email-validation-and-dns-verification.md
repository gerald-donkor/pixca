# 28 — Strict Newsletter Email Validation, Typo Detection, and Server DNS MX Verification

## Goal

Resolve the email validation bypass where invalid, non-existent, typo-ridden, or disposable domains (such as `donkorgerald0@kkkkgmail.com`) succeeded. Implement a multi-tier, robust, and explicit validation engine:
1. **Strict Format & RFC Syntax Validation**: Reject malformed local parts, consecutive dots, invalid characters, missing or short TLDs (< 2 characters), and trailing/leading periods.
2. **Provider Typo Detection & Fuzzy Suggestions**: Detect common misspellings of major email providers (e.g. `kkkkgmail.com`, `gmaill.com`, `gamil.com`, `gmial.com`, `yaho.com`, `outlok.com`, `hotmial.com`, etc.) and provide explicit suggestions (e.g., *"Did you mean @gmail.com?"*).
3. **Disposable & Temporary Domain Blocklist**: Block burner email domains (`mailinator.com`, `10minutemail.com`, `tempmail.com`, `guerrillamail.com`, etc.).
4. **Server-Side DNS MX Record Verification**: Perform asynchronous DNS MX and A-record lookups in `app/api/newsletter/route.ts` using `node:dns/promises` to verify that the domain actually exists on the public Internet and has active mail exchangers capable of receiving email.
5. **Detailed Client-Side & Server-Side Error Handling**: Present clear, non-generic error messages inline on the details page newsletter form when an email is rejected.

---

## Skills read

- `.agents/skills/requesting-code-review/SKILL.md` — Code review workflow.
- `.agents/skills/receiving-code-review/SKILL.md` — Code review feedback evaluation.
- `.agents/skills/caveman-commit/SKILL.md` — Terse conventional commit formatting.
- `node_modules/next/dist/docs/` — Route handlers, server runtime, and client component validation.

---

## Existing code inspected

- `components/ui/newsletter-subscribe.tsx` — Current newsletter form using basic regex and status handling.
- `app/api/newsletter/route.ts` — Server route handler with standard Zod `.email()` check that accepts any syntactically valid domain string.
- `/home/dgk/Pictures/Screenshots/Screenshot_20260824_135151.png` — User screenshot demonstrating `donkorgerald0@kkkkgmail.com` receiving a successful subscription confirmation.

---

## Decisions and assumptions

1. **Multi-Tier Validation Architecture**:
   - **Tier 1: Client & Server Syntax Validation**:
     - Local part: 1 to 64 ASCII letters, numbers, and allowed symbols (`.`, `_`, `%`, `+`, `-`), no consecutive dots, no leading or trailing dot.
     - Domain part: 1 to 255 characters, valid DNS hostname labels (alphanumeric and hyphens, no leading/trailing hyphen).
     - TLD: Alphabetical only, minimum length 2 characters (e.g. `.com`, `.org`, `.co`, `.io`), not purely numeric or invalid.
   - **Tier 2: Typo Detection**:
     - Compare domain against canonical major providers (`gmail.com`, `googlemail.com`, `yahoo.com`, `outlook.com`, `hotmail.com`, `icloud.com`, `live.com`, `msn.com`, `aol.com`, `proton.me`, `protonmail.com`, `zoho.com`, `mail.com`, `yandex.com`).
     - Detect leading junk/repeated characters (e.g. `kkkkgmail.com`), letter swaps, dropped characters, and double letters. If matched, reject with `"Did you mean @<canonical>?"`.
   - **Tier 3: Disposable Domain Filter**:
     - Block known temporary inbox domains.
   - **Tier 4: Server-Side DNS MX Resolution**:
     - In `app/api/newsletter/route.ts`, query `dns.resolveMx(domain)` with a fallback to `dns.resolve4(domain)` with a 3.5s timeout.
     - If the domain does not resolve (`ENOTFOUND`, `ENODATA`, `SERVFAIL`, or empty MX records), reject with HTTP 400 and message `"The domain '<domain>' does not exist or cannot receive email."`.
     - If DNS query times out or fails due to network environment error, fall back safely rather than breaking legitimate users.

2. **User Experience & Feedback**:
   - On the client, show the precise error message below the input in high-contrast red (`text-red-600 dark:text-red-400`).
   - Trigger `toast.error(message)` with the explicit explanation so the user immediately understands why their input was rejected.
   - As soon as the user changes their input, clear the error status back to idle.

---

## Files likely to change

- `lib/validation/email.ts` [NEW] — Modular validation engine with strict regex, typo detection dictionary, disposable domain list, and DNS MX lookup helper.
- `app/api/newsletter/route.ts` [MODIFY] — Integrate strict email validator, typo checks, and asynchronous DNS MX verification before database insertion.
- `components/ui/newsletter-subscribe.tsx` [MODIFY] — Integrate client-side validation rules, provider typo suggestions, and refined error display.

---

## Implementation requirements

### 1. `lib/validation/email.ts`
- Define strict regex for email address:
  ```typescript
  export const STRICT_EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  ```
- Implement `detectDomainTypo(domain: string): { isTypo: boolean; suggestedDomain?: string }`:
  - Handles patterns like `/.*gmail\.com$/` (e.g. `kkkkgmail.com` -> `gmail.com`), `/g+m+a+i+l+l*\.com/`, `/y+a+h+o+o*\.com/`, `/o+u+t+l+o+o*k*\.com/`, `/h+o+t+m+a+i*l*\.com/`, etc.
- Implement `isDisposableEmailDomain(domain: string): boolean`.
- Implement `validateEmailFormat(email: string): { valid: boolean; error?: string; suggestion?: string }`.
- Implement server-side `verifyEmailDomainDns(domain: string): Promise<{ valid: boolean; error?: string }>`.

### 2. `app/api/newsletter/route.ts`
- Validate payload with Zod + `validateEmailFormat(email)`.
- If typo detected, return 400 with `error: "Invalid email domain. Did you mean @" + suggestion + "?"`.
- If disposable domain, return 400 with `error: "Disposable email addresses are not accepted."`.
- Call `await verifyEmailDomainDns(domain)`. If invalid, return 400 with `error: "The domain '@" + domain + "' does not exist or cannot receive email."`.
- Only proceed to Supabase insertion when all checks pass.

### 3. `components/ui/newsletter-subscribe.tsx`
- Run `validateEmailFormat(email)` before dispatching API request.
- Display suggestions or descriptive error messages directly inline.

---

## Security requirements

- DNS lookups executed safely on server with timeouts (max 3.5s) to prevent hanging requests.
- No ReDoS vulnerable regular expressions.
- Input length capped at 255 characters.

---

## Acceptance criteria

1. Submitting `donkorgerald0@kkkkgmail.com` is rejected with an explicit error explaining the invalid domain or suggesting `@gmail.com`.
2. Submitting non-existent domains (e.g. `user@nonexistentdomain12345fake.org`) is rejected with a clear domain verification error.
3. Submitting valid emails with active MX records (e.g. `user@gmail.com`, `editor@nytimes.com`) succeeds and records the subscriber.
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

1. Start dev server: `npm run dev`.
2. Visit an article details page (`http://localhost:3000/article/[id]`).
3. Enter `donkorgerald0@kkkkgmail.com` and click **Subscribe**:
   - Verify that the subscription is rejected.
   - Verify that an explicit error message (e.g. suggesting `@gmail.com` or flagging non-existent domain) is displayed inline and in a toast.
4. Enter a valid email (`reader@gmail.com`) and click **Subscribe**:
   - Verify that the subscription succeeds and shows the green confirmation badge.
