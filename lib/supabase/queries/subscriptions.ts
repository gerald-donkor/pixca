import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserSubscription, UserSubscriptionInsert } from "@/lib/supabase/types";

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export interface TierEntitlements {
  tier: SubscriptionTier;
  name: string;
  badgeLabel: string;
  maxBookmarks: number;
  unlimitedpgVectorSearch: boolean;
  loadedRhetoricExtraction: boolean;
  fullBiasCalibration: boolean;
  blindspotFeed: boolean;
  developerApiAccess: boolean;
  exportData: boolean;
}

/**
 * Return static entitlement configuration for a specific tier.
 */
export function getTierEntitlements(tier?: string | null): TierEntitlements {
  const normalized = (tier || "free").toLowerCase().trim();

  switch (normalized) {
    case "enterprise":
      return {
        tier: "enterprise",
        name: "Pixca Enterprise",
        badgeLabel: "Enterprise",
        maxBookmarks: 999999,
        unlimitedpgVectorSearch: true,
        loadedRhetoricExtraction: true,
        fullBiasCalibration: true,
        blindspotFeed: true,
        developerApiAccess: true,
        exportData: true,
      };

    case "pro":
      return {
        tier: "pro",
        name: "Pixca Pro",
        badgeLabel: "Pro",
        maxBookmarks: 999999,
        unlimitedpgVectorSearch: true,
        loadedRhetoricExtraction: true,
        fullBiasCalibration: true,
        blindspotFeed: true,
        developerApiAccess: false,
        exportData: true,
      };

    case "starter":
      return {
        tier: "starter",
        name: "Pixca Starter",
        badgeLabel: "Starter",
        maxBookmarks: 25,
        unlimitedpgVectorSearch: false,
        loadedRhetoricExtraction: true,
        fullBiasCalibration: true,
        blindspotFeed: true,
        developerApiAccess: false,
        exportData: false,
      };

    case "free":
    default:
      return {
        tier: "free",
        name: "Free Reader",
        badgeLabel: "Free",
        maxBookmarks: 5,
        unlimitedpgVectorSearch: false,
        loadedRhetoricExtraction: false,
        fullBiasCalibration: false,
        blindspotFeed: true,
        developerApiAccess: false,
        exportData: false,
      };
  }
}

/**
 * Fetch subscription record for a specific Clerk user ID.
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  if (!userId || userId.trim() === "") {
    return null;
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116" || error.code === "42P01") {
      return null;
    }
    console.error("[Subscriptions] Error fetching user subscription:", error);
    return null;
  }

  return data;
}

/**
 * Resolve user subscription and full entitlements for a Clerk user ID.
 */
export async function getUserTierAndEntitlements(userId: string): Promise<{
  subscription: UserSubscription | null;
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  entitlements: TierEntitlements;
}> {
  const subscription = await getUserSubscription(userId);
  const isActive =
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing");

  const rawTier = isActive ? (subscription.tier || "pro") : "free";
  const normalizedTier: SubscriptionTier =
    rawTier === "starter" || rawTier === "pro" || rawTier === "enterprise"
      ? rawTier
      : "free";

  return {
    subscription,
    tier: normalizedTier,
    status: subscription?.status ?? "none",
    currentPeriodEnd: subscription?.current_period_end ?? null,
    entitlements: getTierEntitlements(normalizedTier),
  };
}

/**
 * Upsert subscription record by Clerk user ID.
 */
export async function upsertUserSubscription(data: UserSubscriptionInsert): Promise<UserSubscription> {
  const { data: result, error } = await getSupabaseAdminClient()
    .from("user_subscriptions")
    .upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("[Subscriptions] Error upserting user subscription:", error);
    throw error;
  }

  return result;
}

/**
 * Update user subscription status (e.g. 'revoked', 'canceled').
 */
export async function updateUserSubscriptionStatus(userId: string, status: string): Promise<void> {
  if (!userId || userId.trim() === "") {
    return;
  }

  const { error } = await getSupabaseAdminClient()
    .from("user_subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[Subscriptions] Error updating subscription status:", error);
    throw error;
  }
}
