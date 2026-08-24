---
name: polar
description: Official Polar (polar.sh) billing and Merchant of Record skill for Next.js and full-stack TypeScript applications. Use when developers ask about: (1) Polar billing, subscriptions, products, or digital downloads, (2) Polar Next.js integration via @polar-sh/nextjs, @polar-sh/sdk, or @polar-sh/checkout, (3) Creating Polar checkout sessions, redirect flows, or embedded checkouts, (4) Handling Polar webhooks and signature verification, (5) Customer portal sessions, (6) Linking Clerk/Supabase users to Polar customer IDs, (7) Global Merchant of Record (MoR) VAT and sales tax compliance.
license: MIT
metadata:
  version: 1.0.0
---

# Polar (polar.sh) Integration Guide

Polar is an open-source Merchant of Record (MoR) and developer-first billing engine. It handles global VAT/sales tax calculation, cross-border payments (Apple Pay, Google Pay, international credit/debit cards), fraud prevention, and automated customer invoicing.

---

## 1. Official Packages & Installation

Polar provides specialized TypeScript/JavaScript libraries for different layers of your stack:

```bash
# Core SDK + Next.js App Router helpers + Embedded Checkout UI
npm install @polar-sh/sdk @polar-sh/nextjs @polar-sh/checkout
```

* `@polar-sh/sdk`: Full typed API client for server-side operations (creating products, checkouts, customer sessions, meter events, subscriptions).
* `@polar-sh/nextjs`: Next.js App Router route handlers for `Checkout()`, `CustomerPortal()`, and `Webhooks()`.
* `@polar-sh/checkout`: Client-side embed library (`PolarEmbedCheckout`) for in-page iframe modals without page redirects.

---

## 2. Environment Variables

Store your Polar credentials in `.env.local` (server-side only unless prefixed with `NEXT_PUBLIC_`):

```bash
# Server-only Organization Access Token from https://polar.sh/dashboard/{org}/settings
POLAR_ACCESS_TOKEN="polar_at_..."

# Server-only Webhook Secret from https://polar.sh/dashboard/{org}/settings/webhooks
POLAR_WEBHOOK_SECRET="polar_whsec_..."

# Server environment: 'production' (default) or 'sandbox'
POLAR_SERVER="production"

# Optional: Polar Organization Slug for checkout links & branding
NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG="pixca"

# Optional: Product IDs / Checkout Links for fast mapping
POLAR_PRO_MONTHLY_PRODUCT_ID="prod_..."
POLAR_PRO_ANNUAL_PRODUCT_ID="prod_..."
POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID="prod_..."
POLAR_ENTERPRISE_ANNUAL_PRODUCT_ID="prod_..."
```

---

## 3. Configuring the Polar Server SDK Client

Initialize the singleton Polar client in `lib/polar.ts`:

```typescript
// lib/polar.ts
import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
});
```

---

## 4. Next.js App Router Checkout Handler

Polar provides a pre-built App Router route handler wrapper via `@polar-sh/nextjs`:

```typescript
// app/api/checkout/polar/route.ts
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?status=success&checkout_id={CHECKOUT_ID}`,
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
  theme: "dark", // 'light' | 'dark' | undefined (system-preference)
});
```

### Supported Query Parameters for `/api/checkout/polar`
* `products`: Product ID(s) (e.g. `?products=prod_123`)
* `customerEmail`: Pre-fills customer email (e.g. `?customerEmail=user@example.com`)
* `customerName`: Pre-fills customer name (e.g. `?customerName=Kwame+Mensah`)
* `customerExternalId`: Pass Clerk/Supabase User ID (e.g. `?customerExternalId=user_2bX...`)
* `metadata`: URL-encoded JSON object for custom tracking (e.g. `?metadata=%7B%22tier%22%3A%22pro%22%7D`)

---

## 5. Programmatic Checkout Creation (Custom Route Handler)

When you need fine-grained server control over discounts, metadata, or trial periods:

```typescript
// app/api/billing/polar/checkout/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { polar } from "@/lib/polar";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const body = await req.json();
    const { productId, successUrl, returnUrl } = body;

    const email = user?.primaryEmailAddress?.emailAddress || body.email;

    const checkout = await polar.checkouts.create({
      products: [productId],
      customerEmail: email,
      externalCustomerId: userId || undefined,
      customerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : undefined,
      successUrl: successUrl || `${req.headers.get("origin")}/pricing?status=success&checkout_id={CHECKOUT_ID}`,
      returnUrl: returnUrl || `${req.headers.get("origin")}/pricing`,
      metadata: {
        clerk_user_id: userId || "",
        plan: body.planName || "pro",
      },
    });

    return NextResponse.json({ url: checkout.url, id: checkout.id });
  } catch (error: any) {
    console.error("Polar Checkout Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

---

## 6. Embedded Checkout (No Redirects)

Use `@polar-sh/checkout/embed` to render Polar checkout directly inside a modal or iframe:

```typescript
// components/ui/polar-embed-button.tsx
"use client";

import * as React from "react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";

export function PolarCheckoutButton({ checkoutUrl }: { checkoutUrl: string }) {
  const [loading, setLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const checkout = await PolarEmbedCheckout.create(checkoutUrl, {
        theme: "dark",
        onLoaded: () => console.log("Polar Checkout Modal Loaded"),
      });

      checkout.addEventListener("success", (event) => {
        console.log("Polar payment successful:", event.detail);
        window.location.href = "/pricing?status=success";
      });

      checkout.addEventListener("close", () => {
        setLoading(false);
      });
    } catch (err) {
      console.error("Failed to launch Polar checkout:", err);
      // Fallback to direct redirect
      window.location.href = checkoutUrl;
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? "Opening Secure Checkout..." : "Pay with Card / Wallets (Polar)"}
    </button>
  );
}
```

---

## 7. Webhook Handler & Event Processing

Polar uses standard cryptographic signatures for webhooks. `@polar-sh/nextjs` automatically validates incoming signatures using `POLAR_WEBHOOK_SECRET`:

```typescript
// app/api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { supabaseAdmin } from "@/lib/supabase/service";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // Subscription created or renewed
  onSubscriptionActive: async (subscription) => {
    const customerId = subscription.customerId;
    const externalUserId = subscription.customer?.externalId || (subscription.metadata?.clerk_user_id as string);
    const status = subscription.status; // 'active' | 'canceled' | 'past_due'

    if (externalUserId) {
      // Update user subscription state in Supabase
      await supabaseAdmin
        .from("user_subscriptions")
        .upsert({
          user_id: externalUserId,
          polar_customer_id: customerId,
          polar_subscription_id: subscription.id,
          status: status,
          current_period_end: subscription.currentPeriodEnd,
          updated_at: new Date().toISOString(),
        });
    }
  },

  // Subscription canceled or revoked
  onSubscriptionRevoked: async (subscription) => {
    const externalUserId = subscription.customer?.externalId || (subscription.metadata?.clerk_user_id as string);
    if (externalUserId) {
      await supabaseAdmin
        .from("user_subscriptions")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("user_id", externalUserId);
    }
  },

  // One-time order or invoice paid
  onOrderPaid: async (order) => {
    console.log(`Order ${order.id} paid by customer ${order.customerId}`);
  },

  // Catch-all logger for audit
  onPayload: async (payload) => {
    console.log(`[Polar Webhook] ${payload.type} received`);
  },
});
```

---

## 8. Customer Self-Service Portal

Provide subscribers with a direct link to manage active plans, update credit cards, and download tax invoices:

```typescript
// app/api/portal/polar/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/service";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async () => {
    const { userId } = await auth();
    if (!userId) return "";

    const { data } = await supabaseAdmin
      .from("user_subscriptions")
      .select("polar_customer_id")
      .eq("user_id", userId)
      .single();

    return data?.polar_customer_id || "";
  },
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
  server: (process.env.POLAR_SERVER as "production" | "sandbox") || "production",
});
```

---

## 9. Verification & Best Practices

1. **Always Set Fallbacks**: If `POLAR_ACCESS_TOKEN` is not yet configured during development, provide clean mock simulation so staging tests never crash.
2. **Metadata Hygiene**: Always attach `clerk_user_id` or `customerExternalId` during checkout creation to ensure 100% reliable webhook reconciliation.
3. **Embed Allowed Origins**: When using embedded checkouts in production, ensure your domain (e.g. `pixca.app`) is added to Polar Dashboard → Settings → Preferences → Embedding.
4. **Zero-Tax Leakage**: Let Polar handle EU VAT, UK VAT, and US Sales Tax compliance as the Merchant of Record.
