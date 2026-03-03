import { createLogger } from "@/lib/logger";
import { getPlanDetails } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("rate-limit");

function getNextUtcDayIsoString(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString();
}

export async function checkRateLimit(
  userId: string,
  modelId?: string,
  tierOverride?: string,
) {
  const supabase = await createClient(); // Use server client

  let tier = tierOverride || "free";
  if (!tierOverride) {
    // 1. Get User's Subscription Tier
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_tier")
      .eq("user_id", userId)
      .single();

    if (userError) {
      logger.error("Failed to fetch user tier", userError, { userId });
    }

    tier = userData?.subscription_tier || "free";
  }

  const plan = getPlanDetails(tier);

  // Determine the limit: use model-specific limit if provided, otherwise global daily_limit
  let dailyLimit = plan.daily_limit ?? 30;
  if (modelId && plan.tierFeatures.modelDailyLimits?.[modelId]) {
    dailyLimit = plan.tierFeatures.modelDailyLimits[modelId];
  }

  // 2. Atomically check and increment today's usage in SQL.
  const { data, error: usageError } = await supabase.rpc(
    "check_and_increment_daily_usage",
    {
      p_user_id: userId,
      p_daily_limit: dailyLimit,
    },
  );

  if (usageError) {
    logger.error("Failed to atomically check usage", usageError, { userId });
    // Keep service available if usage tracking fails.
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
      tier,
      currentCount: usage.current_count,
      dailyLimit,
    });
  } else {
    logger.debug("Rate limit check passed", {
      userId,
      tier,
      currentCount: usage.current_count,
      dailyLimit,
      remaining: usage.remaining,
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

export async function checkIPRateLimit(ip: string, limit: number = 30) {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const redisModule = await import("@/lib/redis");
  const redis = redisModule.getRedisClient();
  if (!redis) {
    logger.warn("Redis is not configured. Skipping IP rate limit.", { ip });
    return { allowed: true, limit, remaining: limit, reset: "" };
  }

  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:ip:${ip}:${today}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 86400); // 24 hours
    }

    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;

    if (!allowed) {
      logger.warn("IP Rate limit exceeded", { ip, count, limit });
    }

    return {
      allowed,
      limit,
      remaining,
      reset: getNextUtcDayIsoString(),
    };
  } catch (error) {
    logger.error("Redis IP rate limit error", error as Error, { ip });
    // Fail open if redis is down
    return { allowed: true, limit, remaining: 1, reset: "" };
  }
}
