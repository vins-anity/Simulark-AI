import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiters for different endpoints
// AI Generation: Stricter limits due to cost
const aiRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit-ai",
});

// General API: More lenient
const apiRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-api",
});

// Auth-sensitive operations
const authRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-auth",
});

export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const pathname = request.nextUrl.pathname;

  // 1. Rate Limiting for AI Generation endpoints
  if (pathname.startsWith("/api/generate")) {
    const { success, limit, reset, remaining } = await aiRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "AI generation rate limit exceeded. Please wait before trying again.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }
  }

  // 2. Rate Limiting for Auth-sensitive operations
  if (
    pathname.startsWith("/api/auth") ||
    pathname.includes("/signin") ||
    pathname.includes("/signup")
  ) {
    const { success, limit, reset, remaining } = await authRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message:
            "Authentication rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }

  // 3. Rate Limiting for other API routes
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/_next") &&
    !pathname.startsWith("/api/webhook")
  ) {
    const { success, limit, reset, remaining } = await apiRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "API rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }

  // 4. Supabase Auth Session Update
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/webhook (webhooks from external services)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/webhook).*)",
  ],
};
