import { createEnv } from "@t3-oss/env-nextjs";
import { boolean, minLength, optional, pipe, string, transform } from "valibot";

export const env = createEnv({
  server: {
    // AI Providers
    ZHIPU_API_KEY: pipe(string(), minLength(1)),
    KIMI_API_KEY: optional(string()), // Optional to not break dev if missing immediately
    KIMI_BASE_URL: optional(string()), // Support for .cn endpoint
    OPENROUTER_API_KEY: optional(string()),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: optional(string()),

    // Rate Limiting (defaults to 10 if not set or invalid)
    FREE_TIER_DAILY_LIMIT: pipe(
      optional(string(), "10"),
      transform((v: string) => Number(v) || 10),
    ),

    // Upstash Redis (for rate limiting)
    UPSTASH_REDIS_REST_URL: optional(string()),
    UPSTASH_REDIS_REST_TOKEN: optional(string()),

    // Admin & Cron
    CRON_SECRET: optional(string()), // Secret for cron job authentication

    // Feature Flags - Master switches
    ENABLE_ALL_FEATURES: pipe(
      optional(string(), "true"),
      transform((v: string) => v === "true"),
    ),
    RESTRICT_FEATURES_BY_TIER: pipe(
      optional(string(), "false"),
      transform((v: string) => v === "true"),
    ),

    // Feature Flags - Individual feature tier restrictions (comma-separated list: free,starter,pro)
    FEATURE_PRIVATE_MODE_TIERS: optional(string()),
    FEATURE_COMMERCIAL_RIGHTS_TIERS: optional(string()),
    FEATURE_PRIORITY_SUPPORT_TIERS: optional(string()),
    FEATURE_PRIORITY_QUEUE_TIERS: optional(string()),
    FEATURE_EARLY_ACCESS_TIERS: optional(string()),
    FEATURE_CODE_GENERATION_TIERS: optional(string()),
    FEATURE_CHAOS_ENGINEERING_TIERS: optional(string()),
    FEATURE_AUTO_LAYOUTS_TIERS: optional(string()),
    FEATURE_ENTERPRISE_MODE_TIERS: optional(string()),
    FEATURE_ADVANCED_MODELS_TIERS: optional(string()),
    FEATURE_UNLIMITED_PROJECTS_TIERS: optional(string()),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: pipe(string(), minLength(1)),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pipe(string(), minLength(1)),
  },
  runtimeEnv: {
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
    KIMI_BASE_URL: process.env.KIMI_BASE_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    FREE_TIER_DAILY_LIMIT: process.env.FREE_TIER_DAILY_LIMIT,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    ENABLE_ALL_FEATURES: process.env.ENABLE_ALL_FEATURES,
    RESTRICT_FEATURES_BY_TIER: process.env.RESTRICT_FEATURES_BY_TIER,
    FEATURE_PRIVATE_MODE_TIERS: process.env.FEATURE_PRIVATE_MODE_TIERS,
    FEATURE_COMMERCIAL_RIGHTS_TIERS:
      process.env.FEATURE_COMMERCIAL_RIGHTS_TIERS,
    FEATURE_PRIORITY_SUPPORT_TIERS: process.env.FEATURE_PRIORITY_SUPPORT_TIERS,
    FEATURE_PRIORITY_QUEUE_TIERS: process.env.FEATURE_PRIORITY_QUEUE_TIERS,
    FEATURE_EARLY_ACCESS_TIERS: process.env.FEATURE_EARLY_ACCESS_TIERS,
    FEATURE_CODE_GENERATION_TIERS: process.env.FEATURE_CODE_GENERATION_TIERS,
    FEATURE_CHAOS_ENGINEERING_TIERS:
      process.env.FEATURE_CHAOS_ENGINEERING_TIERS,
    FEATURE_AUTO_LAYOUTS_TIERS: process.env.FEATURE_AUTO_LAYOUTS_TIERS,
    FEATURE_ENTERPRISE_MODE_TIERS: process.env.FEATURE_ENTERPRISE_MODE_TIERS,
    FEATURE_ADVANCED_MODELS_TIERS: process.env.FEATURE_ADVANCED_MODELS_TIERS,
    FEATURE_UNLIMITED_PROJECTS_TIERS:
      process.env.FEATURE_UNLIMITED_PROJECTS_TIERS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
