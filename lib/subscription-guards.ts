import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canUseModel,
  SUBSCRIPTION_PLANS,
  type SubscriptionTier,
} from "@/lib/subscription";

const GRACE_PERIOD_DAYS = 3;

interface SubscriptionAccessRow {
  subscription_tier: string | null;
  subscription_expires_at: string | null;
}

function isKnownTier(value: string): value is SubscriptionTier {
  return value === "free" || value === "starter" || value === "pro";
}

export function resolveEffectiveTierForAccess(
  row: SubscriptionAccessRow | null,
): SubscriptionTier {
  if (!row?.subscription_tier || !isKnownTier(row.subscription_tier)) {
    return "free";
  }

  if (!row.subscription_expires_at) {
    return row.subscription_tier;
  }

  const now = Date.now();
  const expiresAtMs = new Date(row.subscription_expires_at).getTime();
  if (!Number.isFinite(expiresAtMs) || now <= expiresAtMs) {
    return row.subscription_tier;
  }

  const graceEndsMs = expiresAtMs + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  if (now < graceEndsMs) {
    return row.subscription_tier;
  }

  return "free";
}

export async function getEffectiveTierForAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionTier> {
  const { data, error } = await supabase
    .from("users")
    .select("subscription_tier, subscription_expires_at")
    .eq("user_id", userId)
    .single();

  if (error) {
    return "free";
  }

  return resolveEffectiveTierForAccess(data as SubscriptionAccessRow);
}

function toCanonicalModelId(modelId: string): string {
  const value = modelId.trim();
  const lower = value.toLowerCase();

  if (
    lower.startsWith("qwen:") ||
    lower.startsWith("nvidia:") ||
    lower.startsWith("zhipu:") ||
    lower.startsWith("openrouter:")
  ) {
    return lower;
  }

  if (lower.startsWith("glm-")) {
    return `zhipu:${lower}`;
  }
  if (lower.startsWith("qwen")) {
    return `qwen:${lower}`;
  }
  if (lower.includes("moonshot") || lower.includes("kimi")) {
    return "nvidia:moonshotai/kimi-k2.5";
  }
  if (lower.includes("minimax")) {
    return "nvidia:minimaxai/minimax-m2.1";
  }
  if (lower.includes("claude")) {
    return "openrouter:anthropic/claude-3-opus";
  }

  return lower;
}

export function isModelAllowedForTier(
  tier: SubscriptionTier,
  modelId?: string,
): boolean {
  if (!modelId || modelId === "auto") {
    return true;
  }

  const canonicalModelId = toCanonicalModelId(modelId);
  if (canUseModel(tier, canonicalModelId)) {
    return true;
  }

  const knownModels = SUBSCRIPTION_PLANS[tier].tierFeatures.allowedModels;
  return knownModels.includes(modelId);
}
