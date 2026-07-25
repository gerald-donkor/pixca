import "server-only";

import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const ADMIN_SECRET_HEADER = "x-pixca-admin-secret";

/**
 * Shared admin secret guard for every action route (AGENTS.md section 15).
 * The secret is read from the `x-PIXCA-admin-secret` header only — never from
 * the query string — and compared without short-circuiting on the first
 * differing byte.
 *
 * Returns a `401` Response when the secret is missing or invalid, `null` when
 * the request is authorized. Responses carry no detail about why.
 */
export function requireAdminSecret(request: NextRequest): Response | null {
  const expected = process.env.PIXCA_ADMIN_SECRET;

  if (!expected) {
    console.error("[auth] PIXCA_ADMIN_SECRET is not configured; rejecting request.");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provided = request.headers.get(ADMIN_SECRET_HEADER);

  if (!provided || !constantTimeEquals(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "utf8");
  const bufferB = Buffer.from(b, "utf8");

  // timingSafeEqual throws on length mismatch, which would itself leak the
  // expected length. Compare against a same-length copy and fold the length
  // check into the boolean result instead.
  if (bufferA.length !== bufferB.length) {
    timingSafeEqual(bufferA, bufferA);
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}
