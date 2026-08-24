import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { polar, isPolarConfigured } from "@/lib/polar";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const body = await req.json().catch(() => ({}));

    const {
      productId,
      planName = "Pixca Pro",
      interval = "monthly",
      email: inputEmail,
      name: inputName,
    } = body;

    const email =
      inputEmail ||
      user?.primaryEmailAddress?.emailAddress ||
      "reader@example.com";
    const name =
      inputName ||
      (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : undefined) ||
      "Pixca Subscriber";

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const resolvedProductId =
      productId ||
      (planName.toLowerCase().includes("enterprise")
        ? interval === "annual"
          ? process.env.POLAR_ENTERPRISE_ANNUAL_PRODUCT_ID
          : process.env.POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID
        : interval === "annual"
        ? process.env.POLAR_PRO_ANNUAL_PRODUCT_ID
        : process.env.POLAR_PRO_MONTHLY_PRODUCT_ID);

    // If Polar credentials are live in environment, create live checkout session
    if (isPolarConfigured() && resolvedProductId) {
      const checkout = await polar.checkouts.create({
        products: [resolvedProductId],
        customerEmail: email,
        externalCustomerId: userId || undefined,
        customerName: name,
        successUrl: `${origin}/pricing?status=success&checkout_id={CHECKOUT_ID}`,
        returnUrl: `${origin}/pricing`,
        metadata: {
          clerk_user_id: userId || "",
          plan: planName,
          interval,
        },
      });

      return NextResponse.json({
        url: checkout.url,
        id: checkout.id,
        simulated: false,
      });
    }

    // Local simulation fallback when Polar API keys are pending setup
    const simulatedId = `polar_sim_${Date.now().toString(36)}`;
    return NextResponse.json({
      url: `${origin}/pricing?status=success&checkout_id=${simulatedId}`,
      id: simulatedId,
      simulated: true,
      message: "Polar simulated checkout processed successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Polar Checkout Creation Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
