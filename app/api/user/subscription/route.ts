import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserTierAndEntitlements,
  getTierEntitlements,
} from "@/lib/supabase/queries/subscriptions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          authenticated: false,
          tier: "free",
          status: "none",
          currentPeriodEnd: null,
          entitlements: getTierEntitlements("free"),
        },
        {
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    const { tier, status, currentPeriodEnd, entitlements } =
      await getUserTierAndEntitlements(userId);

    return NextResponse.json(
      {
        authenticated: true,
        tier,
        status,
        currentPeriodEnd,
        entitlements,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[User Subscription API] Error resolving subscription:", error);
    return NextResponse.json(
      {
        authenticated: false,
        tier: "free",
        status: "error",
        currentPeriodEnd: null,
        entitlements: getTierEntitlements("free"),
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  }
}
