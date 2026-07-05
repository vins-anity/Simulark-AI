/**
 * Upstash Ratelimit instances — follows @upstash/ratelimit best practices:
 * shared Redis client, ephemeralCache, timeout failover, analytics.
 * @see .agents/skills/upstash-ratelimit-js/features.md
 */

import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "@/lib/redis";

const RATELIMIT_TIMEOUT_MS = 1500;

/** Module-scoped cache — must live outside request handlers (per Upstash docs). */
const ephemeralCache = new Map<string, number>();

export type ProxyRateLimiters = {
  ai: Ratelimit;
  api: Ratelimit;
  auth: Ratelimit;
};

let cachedLimiters: ProxyRateLimiters | null = null;
let cachedRedisFingerprint: string | null = null;

function buildLimiters(
  redis: NonNullable<ReturnType<typeof getRedisClient>>,
): ProxyRateLimiters {
  const base = {
    redis,
    analytics: true,
    ephemeralCache,
    timeout: RATELIMIT_TIMEOUT_MS,
  } as const;

  return {
    ai: new Ratelimit({
      ...base,
      limiter: Ratelimit.slidingWindow(15, "1 m"),
      prefix: "simulark:ratelimit:ai",
    }),
    api: new Ratelimit({
      ...base,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      prefix: "simulark:ratelimit:api",
    }),
    auth: new Ratelimit({
      ...base,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      prefix: "simulark:ratelimit:auth",
    }),
  };
}

export function getProxyRateLimiters(): ProxyRateLimiters | null {
  const redis = getRedisClient();
  if (!redis) {
    cachedLimiters = null;
    cachedRedisFingerprint = null;
    return null;
  }

  const fingerprint = `${process.env.UPSTASH_REDIS_REST_URL}:${process.env.UPSTASH_REDIS_REST_TOKEN?.slice(0, 8)}`;
  if (!cachedLimiters || fingerprint !== cachedRedisFingerprint) {
    cachedLimiters = buildLimiters(redis);
    cachedRedisFingerprint = fingerprint;
  }

  return cachedLimiters;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  limit?: number;
  reset?: number;
  remaining?: number;
  pending?: Promise<unknown>;
}

export async function checkProxyRateLimit(
  limiter: Ratelimit,
  key: string,
): Promise<RateLimitCheckResult> {
  const { success, limit, reset, remaining, pending } =
    await limiter.limit(key);

  if (pending) {
    void pending.catch(() => {
      /* analytics flush — non-blocking */
    });
  }

  return { allowed: success, limit, reset, remaining, pending };
}
