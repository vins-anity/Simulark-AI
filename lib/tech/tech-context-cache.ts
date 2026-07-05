/**
 * Redis-backed cache for resolved tech context bundles (1h TTL).
 */

import { createLogger } from "@/lib/logger";
import {
  getRedisClient,
  REDIS_KEY_PREFIX,
  withRedisTimeout,
} from "@/lib/redis";
import type {
  TechContextBundle,
  TechContextInput,
} from "@/lib/tech/resolve-context";
import {
  getTechContextCacheKey,
  resolveTechContext,
} from "@/lib/tech/resolve-context";

const logger = createLogger("tech-context-cache");

const CACHE_PREFIX = `${REDIS_KEY_PREFIX}tech-ctx:`;
const CACHE_TTL_SECONDS = 3600;

export async function resolveTechContextCached(
  input: TechContextInput,
): Promise<TechContextBundle> {
  if (!getRedisClient()) {
    return resolveTechContext(input);
  }

  const key = `${CACHE_PREFIX}${getTechContextCacheKey(input)}`;

  const cached = await withRedisTimeout("get", async (redis) =>
    redis.get<TechContextBundle>(key),
  );

  if (cached?.candidateIds?.length) {
    logger.debug("Tech context cache hit", { key: key.slice(0, 40) });
    return cached;
  }

  const bundle = resolveTechContext(input);

  void withRedisTimeout("set", async (redis) => {
    await redis.set(key, bundle, { ex: CACHE_TTL_SECONDS });
    return true;
  });

  return bundle;
}
