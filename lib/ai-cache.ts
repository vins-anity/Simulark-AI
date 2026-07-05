import { type Redis } from "@upstash/redis";
import { createLogger } from "@/lib/logger";
import {
  getRedisClient,
  REDIS_KEY_PREFIX,
  withRedisTimeout,
} from "@/lib/redis";

const logger = createLogger("ai-cache");

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  // Default TTL for cached responses (1 hour)
  defaultTTL: 3600,
  // TTL for architecture generations (24 hours - they're expensive)
  architectureTTL: 86400,
  // TTL for quick completions (15 minutes)
  quickTTL: 900,
  // Prefix for all cache keys
  keyPrefix: `${REDIS_KEY_PREFIX}ai-cache:`,
};

/**
 * Cache entry metadata
 */
interface CacheEntry<T> {
  result: T;
  model: string;
  provider: string;
  cachedAt: number;
  hitCount: number;
}

/**
 * Generate a cache key from request parameters
 */
function generateCacheKey(params: {
  prompt: string;
  model?: string;
  mode?: string;
  userId?: string;
}): string {
  const {
    prompt,
    model = "default",
    mode = "default",
    userId = "anonymous",
  } = params;

  // Create a deterministic hash of the prompt
  const promptHash = hashString(prompt);
  return `${CACHE_CONFIG.keyPrefix}${userId}:${mode}:${model}:${promptHash}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached AI response
 */
export async function getCachedResponse<T>(params: {
  prompt: string;
  model?: string;
  mode?: string;
  userId?: string;
}): Promise<T | null> {
  if (!getRedisClient()) {
    logger.debug("Redis not configured, skipping cache lookup");
    return null;
  }

  const key = generateCacheKey(params);
  const cached = await withRedisTimeout("get", async (redis: Redis) =>
    redis.get<CacheEntry<T>>(key),
  );

  if (!cached) {
    logger.debug("AI cache miss", { key: key.substring(0, 50) });
    return null;
  }

  logger.info("AI cache hit", {
    key: key.substring(0, 50),
    model: cached.model,
    age: Date.now() - cached.cachedAt,
  });

  await withRedisTimeout("set", async (redis: Redis) =>
    redis.set(key, { ...cached, hitCount: cached.hitCount + 1 }),
  );

  return cached.result;
}

/**
 * Cache an AI response
 */
export async function setCachedResponse<T>(params: {
  prompt: string;
  result: T;
  model?: string;
  provider?: string;
  mode?: string;
  userId?: string;
  ttl?: number;
}): Promise<boolean> {
  if (!getRedisClient()) {
    logger.debug("Redis not configured, skipping cache set");
    return false;
  }

  const key = generateCacheKey(params);
  const ttl = params.ttl ?? CACHE_CONFIG.defaultTTL;

  const entry: CacheEntry<T> = {
    result: params.result,
    model: params.model ?? "unknown",
    provider: params.provider ?? "unknown",
    cachedAt: Date.now(),
    hitCount: 0,
  };

  const ok = await withRedisTimeout("set", async (redis: Redis) => {
    await redis.set(key, entry, { ex: ttl });
    return true;
  });

  if (ok) {
    logger.info("AI response cached", {
      key: key.substring(0, 50),
      model: entry.model,
      ttl,
    });
  }

  return Boolean(ok);
}

/**
 * Invalidate cache for a user
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  if (!getRedisClient()) {
    return 0;
  }

  const pattern = `${CACHE_CONFIG.keyPrefix}${userId}:*`;
  const keys = await withRedisTimeout("keys", async (redis: Redis) =>
    redis.keys(pattern),
  );

  if (!keys || keys.length === 0) {
    return 0;
  }

  const deleted = await withRedisTimeout("del", async (redis: Redis) => {
    await redis.del(...keys);
    return keys.length;
  });

  if (deleted) {
    logger.info("User cache invalidated", { userId, count: deleted });
  }

  return deleted ?? 0;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  enabled: boolean;
  totalKeys?: number;
  sampleEntries?: Array<{
    key: string;
    model: string;
    age: number;
    hits: number;
  }>;
}> {
  if (!getRedisClient()) {
    return { enabled: false };
  }

  const keys = await withRedisTimeout("keys", async (redis: Redis) =>
    redis.keys(`${CACHE_CONFIG.keyPrefix}*`),
  );

  if (!keys) {
    return { enabled: true };
  }

  const sampleKeys = keys.slice(0, 10);
  const sampleEntries = await Promise.all(
    sampleKeys.map(async (key) => {
      const entry = await withRedisTimeout("get", async (redis: Redis) =>
        redis.get<CacheEntry<unknown>>(key),
      );
      return {
        key: key.substring(0, 50),
        model: entry?.model ?? "unknown",
        age: entry ? Date.now() - entry.cachedAt : 0,
        hits: entry?.hitCount ?? 0,
      };
    }),
  );

  return {
    enabled: true,
    totalKeys: keys.length,
    sampleEntries,
  };
}

/**
 * Clear all AI cache entries
 */
export async function clearAICache(): Promise<number> {
  if (!getRedisClient()) {
    return 0;
  }

  const keys = await withRedisTimeout("keys", async (redis: Redis) =>
    redis.keys(`${CACHE_CONFIG.keyPrefix}*`),
  );

  if (!keys || keys.length === 0) {
    return 0;
  }

  const count = await withRedisTimeout("del", async (redis: Redis) => {
    await redis.del(...keys);
    return keys.length;
  });

  if (count) {
    logger.info("AI cache cleared", { count });
  }

  return count ?? 0;
}

/**
 * Higher-order function to wrap AI generation with caching
 */
export function withAICache<TInput, TOutput>(
  generateFn: (input: TInput) => Promise<TOutput>,
  options: {
    getCacheKey: (input: TInput) => string;
    getTTL?: (input: TInput) => number;
    getUserId?: (input: TInput) => string | undefined;
  },
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput): Promise<TOutput> => {
    const cacheKey = options.getCacheKey(input);
    const userId = options.getUserId?.(input);
    const ttl = options.getTTL?.(input) ?? CACHE_CONFIG.defaultTTL;

    // Try to get cached result
    const cached = await getCachedResponse<TOutput>({
      prompt: cacheKey,
      userId,
    });

    if (cached !== null) {
      return cached;
    }

    // Generate new result
    const result = await generateFn(input);

    // Cache the result (fire and forget)
    setCachedResponse({
      prompt: cacheKey,
      result,
      userId,
      ttl,
    }).catch((error) => {
      logger.error("Failed to cache AI result", error);
    });

    return result;
  };
}

/**
 * Export TTL constants for convenience
 */
export const CACHE_TTL = {
  DEFAULT: CACHE_CONFIG.defaultTTL,
  ARCHITECTURE: CACHE_CONFIG.architectureTTL,
  QUICK: CACHE_CONFIG.quickTTL,
};
