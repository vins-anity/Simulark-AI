import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionTier } from "@/lib/subscription";

/** Everyone uses the free plan — no tier gating. */
export async function getEffectiveTierForAccess(
  _supabase?: SupabaseClient,
  _userId?: string,
): Promise<SubscriptionTier> {
  return "free";
}

export function resolveEffectiveTierForAccess(): SubscriptionTier {
  return "free";
}

export function isModelAllowedForTier(
  _tier: SubscriptionTier,
  _modelId?: string,
): boolean {
  return true;
}
