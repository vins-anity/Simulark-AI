import { createLogger } from "@/lib/logger";
import { getPlanDetails } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("rate-limit");

export async function checkRateLimit(userId: string) {
  const supabase = await createClient(); // Use server client

  // 1. Get User's Subscription Tier
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("user_id", userId)
    .single();

  if (userError) {
    logger.error("Failed to fetch user tier", userError, { userId });
    // Fail open or closed? Let's fail safe to free tier limits if we can't read
  }

  const tier = userData?.subscription_tier || "free";
  const plan = getPlanDetails(tier);

  // Safety check: if plan doesn't have a limit defined, default to 30 (Free)
  const dailyLimit = plan.daily_limit ?? 30;

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
      reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    };
  }

  const usage = Array.isArray(data) ? data[0] : data;
  if (!usage) {
    logger.error("Usage RPC returned empty result", undefined, { userId });
    return {
      allowed: true,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - 1),
      reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
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
        : new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
  };
}
