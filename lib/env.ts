import { createEnv } from "@t3-oss/env-nextjs";
import { string, minLength, optional, object, pipe } from "valibot";

export const env = createEnv({
    server: {
        ZHIPU_API_KEY: pipe(string(), minLength(1)),
        OPENROUTER_API_KEY: optional(string()),
        SUPABASE_SERVICE_ROLE_KEY: optional(string()),
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: pipe(string(), minLength(1)),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: pipe(string(), minLength(1)),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
});
