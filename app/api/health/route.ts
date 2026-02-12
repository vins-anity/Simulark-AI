import { NextResponse } from "next/server";
import { env } from "@/env";
import { createLogger } from "@/lib/logger";
import { Redis } from "@upstash/redis";

const logger = createLogger("api:health");

export async function GET() {
  const timer = logger.time("health-check");

  const health: {
    status: string;
    timestamp: string;
    version: string;
    services: {
      supabase: { status: string; url?: string | null; error?: string };
      redis: { status: string; latency?: number; error?: string };
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    services: {
      supabase: { status: "unknown" },
      redis: { status: "unknown" },
    },
  };

  // Check Supabase
  try {
    health.services.supabase = {
      status: env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
      url: env.NEXT_PUBLIC_SUPABASE_URL ? "***" : null,
    };
  } catch (error) {
    logger.error("Supabase health check failed", error);
    health.services.supabase = { status: "error", error: String(error) };
    health.status = "degraded";
  }

  // Check Redis
  try {
    const redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    const start = Date.now();
    await redisClient.ping();
    const latency = Date.now() - start;
    health.services.redis = { status: "healthy", latency };
    logger.debug("Redis health check passed", { latency });
  } catch (error) {
    logger.error("Redis health check failed", error);
    health.services.redis = { status: "error", error: String(error) };
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  timer.end({ status: health.status });

  return NextResponse.json(health, { status: statusCode });
}
