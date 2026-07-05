import { Redis } from "@upstash/redis";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";

const logger = createLogger("redis");

const REDIS_TIMEOUT_MS = 1500;
const REDIS_COOLDOWN_MS = 60_000;

/** Namespace all Simulark keys in the shared Upstash database. */
export const REDIS_KEY_PREFIX = "simulark:";

function isValidToken(token: string | undefined): boolean {
  if (!token || token.length < 10) return false;
  if (token.includes("REPLACE_WITH")) return false;
  return true;
}

let redisClient: Redis | null = null;
let redisDisabledUntil = 0;
let lastRedisConfig: string | null = null;

function getRedisConfigFingerprint(): string | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return `${env.UPSTASH_REDIS_REST_URL}:${env.UPSTASH_REDIS_REST_TOKEN.slice(0, 8)}`;
}

export function isRedisConfigured(): boolean {
  const disabled =
    env.UPSTASH_REDIS_DISABLED === "true" || env.UPSTASH_REDIS_DISABLED === "1";
  if (disabled) {
    return false;
  }
  return Boolean(
    env.UPSTASH_REDIS_REST_URL && isValidToken(env.UPSTASH_REDIS_REST_TOKEN),
  );
}

/** False while Redis is in cooldown after a failed/timeout request. */
export function isRedisOperational(): boolean {
  return isRedisConfigured() && Date.now() >= redisDisabledUntil;
}

export function markRedisUnavailable(reason: unknown): void {
  redisDisabledUntil = Date.now() + REDIS_COOLDOWN_MS;
  const message = reason instanceof Error ? reason.message : String(reason);
  logger.warn("Redis unavailable — skipping Redis for 60s", { message });
}

export function getRedisClient(): Redis | null {
  if (!isRedisOperational()) {
    return null;
  }

  const fingerprint = getRedisConfigFingerprint();
  if (fingerprint !== lastRedisConfig) {
    redisClient = null;
    lastRedisConfig = fingerprint;
    redisDisabledUntil = 0;
  }

  if (!redisClient && fingerprint) {
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
      retry: {
        retries: 0,
      },
    });
  }

  return redisClient;
}

export async function withRedisTimeout<T>(
  operation: string,
  fn: (redis: Redis) => Promise<T>,
): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const result = await Promise.race([
      fn(redis),
      new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                `Redis ${operation} timed out after ${REDIS_TIMEOUT_MS}ms`,
              ),
            ),
          REDIS_TIMEOUT_MS,
        );
      }),
    ]);
    return result;
  } catch (error) {
    markRedisUnavailable(error);
    return null;
  }
}

export async function redisIncrWithExpiry(
  key: string,
  windowSeconds: number,
): Promise<number | null> {
  const namespacedKey = key.startsWith(REDIS_KEY_PREFIX)
    ? key
    : `${REDIS_KEY_PREFIX}${key}`;

  return withRedisTimeout("incr", async (redis) => {
    const value = await redis.incr(namespacedKey);
    if (value === 1) {
      await redis.expire(namespacedKey, windowSeconds);
    }
    return Number(value);
  });
}

export default getRedisClient;
