import { Webhooks } from "@polar-sh/nextjs";
import {
  upsertUserSubscription,
  updateUserSubscriptionStatus,
} from "@/lib/supabase/queries/subscriptions";

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
        await upsertUserSubscription({
          user_id: externalUserId,
          polar_customer_id: sub.customerId,
          polar_subscription_id: sub.id,
          status: sub.status,
          current_period_end: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        });
        console.log(`[Polar Webhook] Synced active subscription for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to upsert subscription in Supabase:", err);
      }
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
        await upsertUserSubscription({
          user_id: externalUserId,
          polar_customer_id: sub.customerId,
          polar_subscription_id: sub.id,
          status: sub.status,
          current_period_end: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
        });
        console.log(`[Polar Webhook] Synced updated subscription for user ${externalUserId}`);
      } catch (err) {
        console.error("[Polar Webhook] Failed to upsert subscription update in Supabase:", err);
      }
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

