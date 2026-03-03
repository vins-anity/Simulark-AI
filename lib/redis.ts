import { Redis } from "@upstash/redis";
import { env } from "@/env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisClient;
}

const redis = getRedisClient();

export default redis;
