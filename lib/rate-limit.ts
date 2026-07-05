import { createLogger } from "@/lib/logger";
import { getModelDailyLimit, USAGE_LIMITS } from "@/lib/usage-limits";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("rate-limit");

function getNextUtcDayIsoString(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();
}

export async function checkRateLimit(userId: string, modelId?: string) {
  const supabase = await createClient();
  const dailyLimit = getModelDailyLimit(modelId);

  const { data, error: usageError } = await supabase.rpc(
    "check_and_increment_daily_usage",
    {
      p_user_id: userId,
      p_daily_limit: dailyLimit,
    },
  );

  if (usageError) {
    logger.error("Failed to atomically check usage", usageError, { userId });
    return {
      allowed: true,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - 1),
      reset: getNextUtcDayIsoString(),
    };
  }

  const usage = Array.isArray(data) ? data[0] : data;
  if (!usage) {
    logger.error("Usage RPC returned empty result", undefined, { userId });
    return {
      allowed: true,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - 1),
      reset: getNextUtcDayIsoString(),
    };
  }

  if (!usage.allowed) {
    logger.warn("Rate limit exceeded", {
      userId,
      modelId,
      currentCount: usage.current_count,
      dailyLimit,
    });
  }

  return {
    allowed: Boolean(usage.allowed),
    limit: dailyLimit,
    remaining: Number(usage.remaining ?? 0),
    reset:
      typeof usage.reset_at === "string"
        ? usage.reset_at
        : getNextUtcDayIsoString(),
  };
}

export async function checkIPRateLimit(
  ip: string,
  limit: number = USAGE_LIMITS.ipDaily,
) {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const redisModule = await import("@/lib/redis");
  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:ip:${ip}:${today}`;

  const count = await redisModule.redisIncrWithExpiry(key, 86400);
  if (count === null) {
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const remaining = Math.max(0, limit - count);
  const allowed = count <= limit;

  if (!allowed) {
    logger.warn("IP rate limit exceeded", { ip, count, limit });
  }

  return {
    allowed,
    limit,
    remaining,
    reset: getNextUtcDayIsoString(),
  };
}

export async function checkBurstRateLimit(
  userId: string,
  limit: number = USAGE_LIMITS.burstLimit,
  windowSeconds: number = USAGE_LIMITS.burstWindowSeconds,
) {
  const redisModule = await import("@/lib/redis");
  const key = `ratelimit:burst:${userId}`;

  const count = await redisModule.redisIncrWithExpiry(key, windowSeconds);
  if (count === null) {
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const remaining = Math.max(0, limit - count);
  const allowed = count <= limit;

  if (!allowed) {
    logger.warn("Burst rate limit exceeded", { userId, count, limit });
  }

  return {
    allowed,
    limit,
    remaining,
    reset: new Date(Date.now() + windowSeconds * 1000).toISOString(),
  };
}

/** Rate-limit read-only usage status polling (prevents enumeration abuse). */
export async function checkUsageStatusReadLimit(
  userId: string,
  limit: number = 30,
  windowSeconds: number = 60,
) {
  const redisModule = await import("@/lib/redis");
  const key = `ratelimit:usage-read:${userId}`;

  const count = await redisModule.redisIncrWithExpiry(key, windowSeconds);
  if (count === null) {
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const remaining = Math.max(0, limit - count);
  return {
    allowed: count <= limit,
    limit,
    remaining,
    reset: new Date(Date.now() + windowSeconds * 1000).toISOString(),
  };
}
