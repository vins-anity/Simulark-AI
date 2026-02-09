import { createEnv } from "@t3-oss/env-nextjs";
import * as v from "valibot";

export const env = createEnv({
  server: {
    NODE_ENV: v.picklist(["development", "test", "production"]),
    SUPABASE_SERVICE_ROLE_KEY: v.string(),
    OPENROUTER_API_KEY: v.string(),
    UPSTASH_REDIS_REST_URL: v.string(),
    UPSTASH_REDIS_REST_TOKEN: v.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: v.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: v.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
