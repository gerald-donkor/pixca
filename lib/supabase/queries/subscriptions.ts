import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserSubscription, UserSubscriptionInsert } from "@/lib/supabase/types";

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
