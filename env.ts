import { createEnv } from "@t3-oss/env-nextjs";
import { minLength, optional, pipe, string, transform } from "valibot";

export const env = createEnv({
  server: {
    // AI Providers — Alibaba Cloud Model Studio (DeepSeek v4)
    DASHSCOPE_API_KEY: optional(string()),
    DASHSCOPE_WORKSPACE_ID: optional(string()),
    /** @deprecated Use DASHSCOPE_API_KEY */
    QWEN_API_KEY: optional(string()),
    /** Legacy providers — optional, no longer used in primary inference path */
    ZHIPU_API_KEY: optional(string()),
    KIMI_API_KEY: optional(string()),
    KIMI_BASE_URL: optional(string()),
    OPENROUTER_API_KEY: optional(string()),
    NVIDIA_API_KEY: optional(string()),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: optional(string()),

    // Rate Limiting
    FREE_TIER_DAILY_LIMIT: pipe(
      optional(string(), "50"),
      transform((v: string) => Number(v) || 50),
    ),
    IP_DAILY_LIMIT: pipe(
      optional(string(), "60"),
      transform((v: string) => Number(v) || 60),
    ),
    BURST_RATE_LIMIT: pipe(
      optional(string(), "8"),
      transform((v: string) => Number(v) || 8),
    ),
    BURST_RATE_WINDOW_SECONDS: pipe(
      optional(string(), "60"),
      transform((v: string) => Number(v) || 60),
    ),
    FLASH_DAILY_LIMIT: pipe(
      optional(string(), "80"),
      transform((v: string) => Number(v) || 80),
    ),
    PRO_DAILY_LIMIT: pipe(
      optional(string(), "25"),
      transform((v: string) => Number(v) || 25),
    ),

    // Upstash Redis (for rate limiting)
    UPSTASH_REDIS_REST_URL: optional(string()),
    UPSTASH_REDIS_REST_TOKEN: optional(string()),

    // Admin & Cron
    CRON_SECRET: optional(string()),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: pipe(string(), minLength(1)),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pipe(string(), minLength(1)),
    NEXT_PUBLIC_SITE_URL: optional(string()),
    NEXT_PUBLIC_AI_STREAM_FORMAT: optional(string()),
  },
  runtimeEnv: {
    DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY,
    DASHSCOPE_WORKSPACE_ID: process.env.DASHSCOPE_WORKSPACE_ID,
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
    KIMI_BASE_URL: process.env.KIMI_BASE_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    FREE_TIER_DAILY_LIMIT: process.env.FREE_TIER_DAILY_LIMIT,
    IP_DAILY_LIMIT: process.env.IP_DAILY_LIMIT,
    BURST_RATE_LIMIT: process.env.BURST_RATE_LIMIT,
    BURST_RATE_WINDOW_SECONDS: process.env.BURST_RATE_WINDOW_SECONDS,
    FLASH_DAILY_LIMIT: process.env.FLASH_DAILY_LIMIT,
    PRO_DAILY_LIMIT: process.env.PRO_DAILY_LIMIT,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_AI_STREAM_FORMAT: process.env.NEXT_PUBLIC_AI_STREAM_FORMAT,
  },
  skipValidation:
    process.env.NODE_ENV === "test" ||
    process.env.SKIP_ENV_VALIDATION === "true",
});
