import { env } from "@/env";
import { DEFAULT_USAGE_LIMITS } from "@/lib/usage-limits-defaults";

function limitOrDefault(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && (value as number) > 0
    ? (value as number)
    : fallback;
}

/** Central abuse-prevention limits (no paid tiers — everyone gets the same caps). */
export const USAGE_LIMITS = {
  /** Default daily AI requests per authenticated user. */
  userDaily: limitOrDefault(
    env.FREE_TIER_DAILY_LIMIT,
    DEFAULT_USAGE_LIMITS.userDaily,
  ),
  /** Daily AI requests per client IP (stops multi-account abuse). */
  ipDaily: limitOrDefault(env.IP_DAILY_LIMIT, DEFAULT_USAGE_LIMITS.ipDaily),
  /** Short-window burst cap per user (requests per burst window). */
  burstLimit: limitOrDefault(
    env.BURST_RATE_LIMIT,
    DEFAULT_USAGE_LIMITS.burstLimit,
  ),
  burstWindowSeconds: limitOrDefault(
    env.BURST_RATE_WINDOW_SECONDS,
    DEFAULT_USAGE_LIMITS.burstWindowSeconds,
  ),
  modelDaily: {
    "deepseek:deepseek-v4-flash": limitOrDefault(
      env.FLASH_DAILY_LIMIT,
      DEFAULT_USAGE_LIMITS.modelDaily["deepseek:deepseek-v4-flash"],
    ),
    "deepseek:deepseek-v4-pro": limitOrDefault(
      env.PRO_DAILY_LIMIT,
      DEFAULT_USAGE_LIMITS.modelDaily["deepseek:deepseek-v4-pro"],
    ),
    "qwen:qwen3.6-flash": limitOrDefault(
      env.FLASH_DAILY_LIMIT,
      DEFAULT_USAGE_LIMITS.modelDaily["qwen:qwen3.6-flash"],
    ),
  } as const,
};

export function getModelDailyLimit(modelId?: string): number {
  if (!modelId) {
    return USAGE_LIMITS.userDaily;
  }

  const modelLimit =
    USAGE_LIMITS.modelDaily[modelId as keyof typeof USAGE_LIMITS.modelDaily];
  return modelLimit ?? USAGE_LIMITS.userDaily;
}
