/**
 * Verify Upstash Redis connectivity using .env.local credentials.
 * Usage: bun run redis:verify
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  console.error(
    "Set them in .env.local (Upstash → simulark → Connect → REST API)",
  );
  process.exit(1);
}

if (token.includes("REPLACE_WITH")) {
  console.error(
    "Replace UPSTASH_REDIS_REST_TOKEN in .env.local with your token from Upstash Console.",
  );
  process.exit(1);
}

const redis = new Redis({ url, token, retry: { retries: 0 } });

const testKey = `simulark:ping:${Date.now()}`;

try {
  const start = Date.now();
  const pong = await redis.ping();
  const latency = Date.now() - start;

  await redis.set(testKey, "ok", { ex: 60 });
  const value = await redis.get(testKey);
  await redis.del(testKey);

  console.log("Redis OK");
  console.log(`  URL:        ${url}`);
  console.log(`  Ping:       ${pong} (${latency}ms)`);
  console.log(`  Read/write: ${value === "ok" ? "pass" : "fail"}`);

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 s"),
    prefix: "simulark:verify:ratelimit",
    timeout: 1500,
  });

  const rlStart = Date.now();
  const { success, remaining } = await ratelimit.limit("verify-test");
  const rlLatency = Date.now() - rlStart;

  console.log(
    `  Ratelimit:  ${success ? "pass" : "fail"} (${rlLatency}ms, ${remaining} remaining)`,
  );
} catch (error) {
  console.error("Redis connection failed:");
  console.error(error instanceof Error ? error.message : error);
  console.error("\nCheck .env.local matches Upstash → simulark → Connect tab.");
  process.exit(1);
}
