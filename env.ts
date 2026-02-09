import { createEnv } from "@t3-oss/env-nextjs";
import { pipe, string, minLength, optional } from "valibot";

export const env = createEnv({
  server: {
    // AI Providers
    ZHIPU_API_KEY: pipe(string(), minLength(1)),
    OPENROUTER_API_KEY: optional(string()),

    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: optional(string()),

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: pipe(string(), minLength(1)),
    UPSTASH_REDIS_REST_TOKEN: pipe(string(), minLength(1)),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: pipe(string(), minLength(1)),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pipe(string(), minLength(1)),
  },
  runtimeEnv: {
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
