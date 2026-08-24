import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",

  onSubscriptionActive: async (subscription) => {
    console.log("[Polar Webhook] Subscription Active:", subscription.data.id, "Status:", subscription.data.status);
  },

  onSubscriptionRevoked: async (subscription) => {
    console.log("[Polar Webhook] Subscription Revoked:", subscription.data.id);
  },

  onSubscriptionCanceled: async (subscription) => {
    console.log("[Polar Webhook] Subscription Canceled:", subscription.data.id);
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
