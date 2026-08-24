import { NextRequest, NextResponse } from "next/server";
import { Checkout } from "@polar-sh/nextjs";
import { isPolarConfigured } from "@/lib/polar";

const polarCheckoutHandler = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?status=success`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
  theme: "dark",
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const products = url.searchParams.getAll("products");

  if (products.length === 0) {
    return NextResponse.json(
      { error: "Missing products in query params. Provide ?products=<product_id>" },
      { status: 400 }
    );
  }

  // If POLAR_ACCESS_TOKEN is not yet configured, provide graceful development simulation
  if (!isPolarConfigured()) {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const simulatedId = `polar_sim_${Date.now().toString(36)}`;
    const acceptHeader = req.headers.get("accept") || "";

    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({
        simulated: true,
        message: "POLAR_ACCESS_TOKEN not configured in .env.local. In live mode, this redirects to Polar hosted checkout.",
        url: `${origin}/pricing?status=success&checkout_id=${simulatedId}`,
        products,
      });
    }

    return NextResponse.redirect(`${origin}/pricing?status=success&checkout_id=${simulatedId}`);
  }

  return polarCheckoutHandler(req);
}
