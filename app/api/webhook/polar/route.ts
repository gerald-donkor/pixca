import { Webhooks } from "@polar-sh/nextjs";
import {
  upsertUserSubscription,
  updateUserSubscriptionStatus,
} from "@/lib/supabase/queries/subscriptions";

function resolveSubscriptionTier(
  productId?: string | null,
  planMetadata?: string | null
): "starter" | "pro" | "enterprise" {
  if (productId) {
    if (
      productId === process.env.POLAR_STARTER_MONTHLY_PRODUCT_ID ||
      productId === process.env.POLAR_STARTER_ANNUAL_PRODUCT_ID
    ) {
      return "starter";
    }
    if (
      productId === process.env.POLAR_ENTERPRISE_MONTHLY_PRODUCT_ID ||
      productId === process.env.POLAR_ENTERPRISE_ANNUAL_PRODUCT_ID
    ) {
      return "enterprise";
    }
    if (
      productId === process.env.POLAR_PRO_MONTHLY_PRODUCT_ID ||
      productId === process.env.POLAR_PRO_ANNUAL_PRODUCT_ID
    ) {
      return "pro";
    }
  }

  if (planMetadata) {
    const lower = planMetadata.toLowerCase();
    if (lower.includes("enterprise")) return "enterprise";
    if (lower.includes("starter")) return "starter";
    if (lower.includes("pro")) return "pro";
  }

  return "pro";
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",

  onSubscriptionActive: async (subscription) => {
    const sub = subscription.data;
    console.log("[Polar Webhook] Subscription Active:", sub.id, "Status:", sub.status, "Customer:", sub.customerId);

    const externalUserId =
      (sub.customer as { externalId?: string | null } | undefined)?.externalId ||
      (sub.metadata?.clerk_user_id as string | undefined);

    if (externalUserId) {
      try {
        const tier = resolveSubscriptionTier(
          sub.productId,
          sub.metadata?.plan as string | undefined
        );

        await upsertUserSubscription({
          user_id: externalUserId,
          polar_customer_id: sub.customerId,
          polar_subscription_id: sub.id,
          tier,
          product_id: sub.productId || null,
          status: sub.status,
          current_period_end: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        });
        console.log(`[Polar Webhook] Synced active subscription (${tier}) for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to upsert subscription in Supabase:", err);
      }
    } else {
      console.warn(`[Polar Webhook] Subscription Active received without externalUserId/clerk_user_id: ${sub.id}`);
    }
  },

  onSubscriptionUpdated: async (subscription) => {
    const sub = subscription.data;
    console.log("[Polar Webhook] Subscription Updated:", sub.id, "Status:", sub.status, "Customer:", sub.customerId);

    const externalUserId =
      (sub.customer as { externalId?: string | null } | undefined)?.externalId ||
      (sub.metadata?.clerk_user_id as string | undefined);

    if (externalUserId) {
      try {
        const tier = resolveSubscriptionTier(
          sub.productId,
          sub.metadata?.plan as string | undefined
        );

        await upsertUserSubscription({
          user_id: externalUserId,
          polar_customer_id: sub.customerId,
          polar_subscription_id: sub.id,
          tier,
          product_id: sub.productId || null,
          status: sub.status,
          current_period_end: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        });
        console.log(`[Polar Webhook] Synced updated subscription (${tier}) for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to upsert subscription update in Supabase:", err);
      }
    } else {
      console.warn(`[Polar Webhook] Subscription Updated received without externalUserId/clerk_user_id: ${sub.id}`);
    }
  },

  onSubscriptionRevoked: async (subscription) => {
    const sub = subscription.data;
    console.log("[Polar Webhook] Subscription Revoked:", sub.id);

    const externalUserId =
      (sub.customer as { externalId?: string | null } | undefined)?.externalId ||
      (sub.metadata?.clerk_user_id as string | undefined);

    if (externalUserId) {
      try {
        await updateUserSubscriptionStatus(externalUserId, "revoked");
        console.log(`[Polar Webhook] Synced revoked subscription for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to update subscription status:", err);
      }
    } else {
      console.warn(`[Polar Webhook] Subscription Revoked received without externalUserId: ${sub.id}`);
    }
  },

  onSubscriptionCanceled: async (subscription) => {
    const sub = subscription.data;
    console.log("[Polar Webhook] Subscription Canceled:", sub.id);

    const externalUserId =
      (sub.customer as { externalId?: string | null } | undefined)?.externalId ||
      (sub.metadata?.clerk_user_id as string | undefined);

    if (externalUserId) {
      try {
        await updateUserSubscriptionStatus(externalUserId, "canceled");
        console.log(`[Polar Webhook] Synced canceled subscription for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to update subscription status:", err);
      }
    } else {
      console.warn(`[Polar Webhook] Subscription Canceled received without externalUserId: ${sub.id}`);
    }
  },

  onOrderPaid: async (order) => {
    console.log("[Polar Webhook] Order Paid:", order.data.id, "Amount:", order.data.subtotalAmount, "Customer:", order.data.customerId);
  },

  onCheckoutCreated: async (checkout) => {
    console.log("[Polar Webhook] Checkout Created:", checkout.data.id);
  },

  onPayload: async (payload) => {
    console.log("[Polar Webhook] Event Received:", payload.type);
  },
});

