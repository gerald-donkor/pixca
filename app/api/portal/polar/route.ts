import { NextRequest, NextResponse } from "next/server";
import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { isPolarConfigured } from "@/lib/polar";
import { getUserSubscription } from "@/lib/supabase/queries/subscriptions";

const polarPortalHandler = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
  getCustomerId: async () => {
    const { userId } = await auth();
    if (!userId) return "";

    const subscription = await getUserSubscription(userId);
    return subscription?.polar_customer_id || "";
  },
});

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { userId } = await auth();


  // If user is not authenticated, redirect to sign-in with return URL
  if (!userId) {
    return NextResponse.redirect(`${origin}/sign-in?redirect_url=${encodeURIComponent("/api/portal/polar")}`);
  }

  // If POLAR_ACCESS_TOKEN is not configured, provide graceful development simulation fallback
  if (!isPolarConfigured()) {
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({
        simulated: true,
        message: "POLAR_ACCESS_TOKEN not configured in .env.local. In live mode, this redirects to the Polar Customer Portal.",
        url: `${origin}/pricing?status=simulated_portal`,
      });
    }
    return NextResponse.redirect(`${origin}/pricing?status=simulated_portal`);
  }

  // Verify whether user has an active Polar customer ID in Supabase
  const subscription = await getUserSubscription(userId);
  if (!subscription?.polar_customer_id) {
    return NextResponse.redirect(`${origin}/pricing?status=no_active_subscription`);
  }

  return polarPortalHandler(req);
}
