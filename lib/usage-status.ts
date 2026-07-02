import {
  getInferenceTierConfig,
  type InferenceTier,
} from "@/lib/inference-tier";
import { getModelDailyLimit } from "@/lib/usage-limits";

export interface DailyUsageSnapshot {
  tier: InferenceTier;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  resetAt: string;
}

export function getUtcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getNextUtcDayIsoString(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();
}

export function buildUsageSnapshot(params: {
  tier: InferenceTier;
  generationCount: number;
  recordDate: string | null;
  now?: Date;
}): DailyUsageSnapshot {
  const utcToday = getUtcDateString(params.now);
  const used =
    params.recordDate === utcToday
      ? Math.max(0, params.generationCount)
      : 0;

  const tierConfig = getInferenceTierConfig(params.tier);
  const limit = getModelDailyLimit(tierConfig.modelId);
  const remaining = Math.max(0, limit - used);
  const percentUsed =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return {
    tier: params.tier,
    used,
    limit,
    remaining,
    percentUsed,
    resetAt: getNextUtcDayIsoString(),
  };
}

export function snapshotFromRateLimitResult(params: {
  tier: InferenceTier;
  limit: number;
  remaining: number;
  reset: string;
}): DailyUsageSnapshot {
  const used = Math.max(0, params.limit - params.remaining);
  const percentUsed =
    params.limit > 0
      ? Math.min(100, Math.round((used / params.limit) * 100))
      : 0;

  return {
    tier: params.tier,
    used,
    limit: params.limit,
    remaining: Math.max(0, params.remaining),
    percentUsed,
    resetAt: params.reset,
  };
}

export function snapshotFromRateLimitHeaders(
  tier: InferenceTier,
  headers: Headers,
): DailyUsageSnapshot | null {
  const limit = headers.get("X-RateLimit-Limit");
  const remaining = headers.get("X-RateLimit-Remaining");
  const reset = headers.get("X-RateLimit-Reset");
  if (!limit || !remaining || !reset) {
    return null;
  }

  const limitNum = Number(limit);
  const remainingNum = Number(remaining);
  if (!Number.isFinite(limitNum) || !Number.isFinite(remainingNum)) {
    return null;
  }

  return snapshotFromRateLimitResult({
    tier,
    limit: limitNum,
    remaining: remainingNum,
    reset,
  });
}
