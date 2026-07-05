import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/network";
import { isRedisOperational, markRedisUnavailable } from "@/lib/redis";
import { updateSession } from "@/lib/supabase/middleware";
import {
  checkProxyRateLimit,
  getProxyRateLimiters,
} from "@/lib/upstash/rate-limiters";

let aiRatelimit: Ratelimit | null = null;
let apiRatelimit: Ratelimit | null = null;
let authRatelimit: Ratelimit | null = null;

function resolveRateLimiters(): void {
  const limiters = getProxyRateLimiters();
  aiRatelimit = limiters?.ai ?? null;
  apiRatelimit = limiters?.api ?? null;
  authRatelimit = limiters?.auth ?? null;
}

resolveRateLimiters();

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // Content Security Policy - Allow workers, iconify and other required external resources
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://open.bigmodel.cn https://openrouter.ai wss://*.supabase.co https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com; worker-src 'self' blob:; frame-src 'self';",
  );

  return response;
}

/**
 * Log request details
 */
function logRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number,
  clientIp: string,
): void {
  const logData = {
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration,
    userAgent: request.headers.get("user-agent")?.slice(0, 100),
    ip: clientIp,
  };

  if (response.status >= 500) {
    logger.error(
      `[Proxy] Request failed: ${response.status}`,
      undefined,
      logData,
    );
  } else if (response.status >= 400) {
    logger.warn(`[Proxy] Request error: ${response.status}`, logData);
  } else {
    logger.debug("[Proxy] Request completed", logData);
  }
}

/**
 * Check rate limit for a given key
 */
async function checkRateLimit(
  ratelimit: Ratelimit | null,
  key: string,
  pathname: string,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  if (!ratelimit || !key || key === "unknown" || !isRedisOperational()) {
    return { allowed: true };
  }

  try {
    const { allowed, limit, reset, remaining } = await checkProxyRateLimit(
      ratelimit,
      key,
    );

    if (
      !allowed &&
      limit !== undefined &&
      reset !== undefined &&
      remaining !== undefined
    ) {
      const response = NextResponse.json(
        {
          error: "Too Many Requests",
          message: `Rate limit exceeded for ${pathname}. Please try again later.`,
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
      return { allowed: false, response };
    }

    return { allowed: true };
  } catch (error) {
    markRedisUnavailable(error);
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.warn("[Proxy] Rate limit skipped — Redis unreachable", {
      pathname,
      message: errorObj.message,
    });
    return { allowed: true };
  }
}

export async function proxy(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIp(request.headers);
  const pathname = request.nextUrl.pathname;

  try {
    // 1. Rate Limiting for AI Generation endpoints
    if (pathname.startsWith("/api/generate")) {
      const { allowed, response } = await checkRateLimit(
        aiRatelimit,
        clientIp,
        pathname,
      );
      if (!allowed) {
        addSecurityHeaders(response!);
        logRequest(request, response!, Date.now() - startTime, clientIp);
        return response!;
      }
    }

    // 2. Rate Limiting for Auth-sensitive operations
    if (
      pathname.startsWith("/api/auth") ||
      pathname.includes("/signin") ||
      pathname.includes("/signup")
    ) {
      const { allowed, response } = await checkRateLimit(
        authRatelimit,
        clientIp,
        pathname,
      );
      if (!allowed) {
        addSecurityHeaders(response!);
        logRequest(request, response!, Date.now() - startTime, clientIp);
        return response!;
      }
    }

    // 3. Rate Limiting for other API routes
    if (
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/_next") &&
      !pathname.startsWith("/api/webhook")
    ) {
      const { allowed, response } = await checkRateLimit(
        apiRatelimit,
        clientIp,
        pathname,
      );
      if (!allowed) {
        addSecurityHeaders(response!);
        logRequest(request, response!, Date.now() - startTime, clientIp);
        return response!;
      }
    }

    // 4. Supabase Auth Session Update
    const response = await updateSession(request);

    // Add security headers
    addSecurityHeaders(response);

    // Log request
    logRequest(request, response, Date.now() - startTime, clientIp);

    return response;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error("[Proxy] Unexpected error", errorObj, { pathname });

    const errorResponse = NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );

    addSecurityHeaders(errorResponse);
    logRequest(request, errorResponse, Date.now() - startTime, clientIp);

    return errorResponse;
  }
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
