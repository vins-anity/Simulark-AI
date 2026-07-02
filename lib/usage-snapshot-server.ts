import {
  getInferenceTierConfig,
  type InferenceTier,
} from "@/lib/inference-tier";
import { getModelDailyLimit } from "@/lib/usage-limits";
import {
  type DailyUsageSnapshot,
  getNextUtcDayIsoString,
  getUtcDateString,
} from "@/lib/usage-status";

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
