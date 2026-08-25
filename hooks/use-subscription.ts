"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import type { SubscriptionTier, TierEntitlements } from "@/lib/supabase/types";

export const DEFAULT_FREE_ENTITLEMENTS: TierEntitlements = {
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

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  entitlements: TierEntitlements;
  isLoading: boolean;
  isSubscribed: boolean;
  isSignedIn: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [data, setData] = React.useState<{
    tier: SubscriptionTier;
    status: string;
    currentPeriodEnd: string | null;
    entitlements: TierEntitlements;
    isLoading: boolean;
  }>({
    tier: "free",
    status: "none",
    currentPeriodEnd: null,
    entitlements: DEFAULT_FREE_ENTITLEMENTS,
    isLoading: true,
  });

  const fetchSubscription = React.useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setData({
        tier: "free",
        status: "none",
        currentPeriodEnd: null,
        entitlements: DEFAULT_FREE_ENTITLEMENTS,
        isLoading: false,
      });
      return;
    }

    try {
      const res = await fetch("/api/user/subscription");
      if (!res.ok) {
        throw new Error(`Failed to fetch subscription: ${res.statusText}`);
      }
      const json = await res.json();
      setData({
        tier: json.tier || "free",
        status: json.status || "none",
        currentPeriodEnd: json.currentPeriodEnd || null,
        entitlements: json.entitlements || DEFAULT_FREE_ENTITLEMENTS,
        isLoading: false,
      });
    } catch (err) {
      console.error("[useSubscription] Failed to load subscription state:", err);
      setData({
        tier: "free",
        status: "none",
        currentPeriodEnd: null,
        entitlements: DEFAULT_FREE_ENTITLEMENTS,
        isLoading: false,
      });
    }
  }, [isLoaded, isSignedIn, userId]);

  React.useEffect(() => {
    let ignore = false;

    async function load() {
      if (!isLoaded) return;
      if (!isSignedIn || !userId) {
        if (!ignore) {
          setData({
            tier: "free",
            status: "none",
            currentPeriodEnd: null,
            entitlements: DEFAULT_FREE_ENTITLEMENTS,
            isLoading: false,
          });
        }
        return;
      }

      try {
        const res = await fetch("/api/user/subscription");
        if (!res.ok) throw new Error("Failed to fetch subscription");
        const json = await res.json();
        if (!ignore) {
          setData({
            tier: json.tier || "free",
            status: json.status || "none",
            currentPeriodEnd: json.currentPeriodEnd || null,
            entitlements: json.entitlements || DEFAULT_FREE_ENTITLEMENTS,
            isLoading: false,
          });
        }
      } catch (err) {
        console.error("[useSubscription] Failed to load subscription:", err);
        if (!ignore) {
          setData({
            tier: "free",
            status: "none",
            currentPeriodEnd: null,
            entitlements: DEFAULT_FREE_ENTITLEMENTS,
            isLoading: false,
          });
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  const isSubscribed =
    data.tier !== "free" &&
    (data.status === "active" || data.status === "trialing");

  return {
    tier: data.tier,
    status: data.status,
    currentPeriodEnd: data.currentPeriodEnd,
    entitlements: data.entitlements,
    isLoading: data.isLoading,
    isSubscribed,
    isSignedIn: Boolean(isSignedIn),
    refetch: fetchSubscription,
  };
}
