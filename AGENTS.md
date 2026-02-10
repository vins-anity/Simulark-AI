# AGENTS.md - Simulark AI Development Guide

## Build & Development Commands

```bash
# Development server (uses Bun runtime)
bun dev

# Production build
bun run build

# Linting (Biome)
bun run lint

# Auto-fix formatting & imports
bun run format
```

**Important:** This project uses **Bun** as the runtime, not Node.js. Always use `bun` instead of `npm` or `pnpm`.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/UI + Radix UI primitives
- **Canvas:** XYFlow (React Flow)
- **State:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Validation:** Valibot
- **Linting:** Biome (replaces ESLint + Prettier)
- **AI:** OpenAI SDK with ZhipuAI, OpenRouter, Kimi providers

## Code Style Guidelines

### Formatting (enforced by Biome)
- **Indentation:** 2 spaces (never tabs)
- **Quotes:** Double quotes for strings
- **Semicolons:** Required
- **Line width:** Default (80-100 chars)
- **Trailing commas:** ES5 compatible

### Naming Conventions
- **Components:** PascalCase (e.g., `AIAssistantPanel.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useChatState.ts`)
- **Utilities:** camelCase (e.g., `tech-normalizer.ts`)
- **Types/Interfaces:** PascalCase (e.g., `SubscriptionTier`, `TierFeatures`)
- **Constants:** UPPER_SNAKE_CASE for true constants
- **Files:** kebab-case for multi-word files (e.g., `ai-orchestrator.ts`)

### Imports (auto-organized by Biome)
Order:
1. React/Next imports
2. Third-party libraries
3. Internal `@/` aliases
4. Relative imports
5. Types

```typescript
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { useChatStore } from "./store";
import type { SubscriptionTier } from "@/lib/subscription";
```

### TypeScript Guidelines
- **Strict mode enabled** - no `any` types without justification
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for complex state
- Path alias `@/*` maps to project root

### Component Structure
```typescript
"use client"; // If needed

// Imports
import { useState } from "react";

// Types
interface Props {
  projectId: string;
}

// Component
export function ComponentName({ projectId }: Props) {
  // State
  const [data, setData] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Render
  return <div />;
}
```

### Error Handling
- Use typed errors with discriminated unions
- Log errors with the logger utility: `import { logger } from "@/lib/logger"`
- Return early for error cases
- Use try/catch for async operations

```typescript
try {
  const result = await fetchData();
  return result;
} catch (error) {
  logger.error("Failed to fetch data", error);
  throw new Error("User-friendly message");
}
```

### Server Actions (app/actions/)
- Always include `"use server"` at top
- Use Valibot for input validation
- Return discriminated unions: `{ success: true, data } | { success: false, error }`
- Revalidate paths after mutations

### API Routes (app/api/)
- Use Next.js 15+ route handlers
- Validate with Valibot before processing
- Return appropriate HTTP status codes
- Use `export const runtime = "nodejs"` for streaming

### Styling (Tailwind)
- Use Tailwind v4 syntax
- Prefer utility classes over inline styles
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design
- Color scheme: `brand-charcoal`, `brand-orange`, `brand-blue`

### Environment Variables
- Define in `env.ts` using `@t3-oss/env-nextjs` + Valibot
- Server vars: add to `server` object
- Client vars: add to `client` object with `NEXT_PUBLIC_` prefix
- Never expose secrets in client-side code

## Project Structure

```
app/           # Next.js App Router
├── api/       # API routes
├── auth/      # Auth pages
├── layout.tsx # Root layout
└── page.tsx   # Home page

components/    # React components
├── ui/        # Shadcn components
├── canvas/    # Flow canvas
├── layout/    # Layout components
└── auth/      # Auth components

lib/           # Utilities
├── supabase/  # Supabase clients
├── schema/    # Valibot schemas
└── *.ts       # Utilities

actions/       # Server Actions
supabase/      # Database migrations
public/        # Static assets
workers/       # Web Workers
```

## Database (Supabase)

- Migrations in `supabase/migrations/`
- Use RLS policies for security
- Use camelCase in TypeScript, snake_case in SQL
- Prefer Supabase RPC functions for complex queries

## AI Integration

- AI client abstraction in `lib/ai-client.ts`
- Supports multiple providers via OpenAI SDK
- Streaming responses for real-time UI updates
- Fallback chain for resilience

## Git Workflow

1. Run `bun run lint` before committing
2. Run `bun run format` to auto-fix issues
3. Ensure `bun run build` succeeds
4. Use conventional commit messages

## Common Issues

- **Bun required:** Don't use npm/pnpm commands
- **Strict TypeScript:** Avoid `any` types
- **Biome formatting:** Auto-fixes on save if configured
- **Import order:** Biome auto-organizes imports

## Feature Flags

All features are enabled by default. To restrict by tier:
```bash
ENABLE_ALL_FEATURES=false
RESTRICT_FEATURES_BY_TIER=true
FEATURE_PRIVATE_MODE_TIERS=pro
```

See `lib/feature-flags.ts` for available flags.
