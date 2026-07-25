import "server-only";

import type { NextRequest } from "next/server";
import { constantTimeEquals } from "@/lib/api/admin-secret";

/**
 * Guard for the internal cron route (AGENTS.md section 18). Vercel injects
 * `CRON_SECRET` and sends it as `Authorization: Bearer <secret>` on every cron
 * request, so the route is not callable from a browser in production.
 *
 * `PIXCA_ADMIN_SECRET` is deliberately *not* used here, and `CRON_SECRET` must
 * never be added to `.env.local` — outside production the check is skipped so
 * the route stays locally testable.
 *
 * Returns a `401` Response when the secret is missing or wrong, `null` when the
 * request is authorized.
 */
export function requireCronSecret(request: NextRequest): Response | null {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const expected = process.env.CRON_SECRET;

  if (!expected) {
    console.error("[cron] CRON_SECRET is not configured; rejecting request.");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!provided || !constantTimeEquals(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
