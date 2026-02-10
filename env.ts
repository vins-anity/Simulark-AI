import { createEnv } from "@t3-oss/env-nextjs";
import { pipe, string, minLength, optional, transform } from "valibot";

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
    FREE_TIER_DAILY_LIMIT: pipe(optional(string(), "10"), transform((v: string) => Number(v) || 10)),
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
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
