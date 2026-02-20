# AGENTS.md

## Developer Guide for Simulark

This document provides essential guidelines for contributing to Simulark.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Lint code
bun run lint

# Auto-fix formatting
bun run format
```

> **Note:** This project uses **Bun** as the runtime. Do not use `npm` or `pnpm`.

---

## Tech Stack

| Category   | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19         |
| Language   | TypeScript (strict mode)                  |
| Runtime    | Bun                                       |
| Styling    | Tailwind CSS v4                           |
| Canvas     | XYFlow (React Flow)                       |
| State      | Zustand                                   |
| Database   | Supabase (PostgreSQL)                     |
| Auth       | Supabase Auth                             |
| Validation | Valibot                                   |
| Linting    | Biome                                     |
| AI         | OpenAI SDK with ZhipuAI, OpenRouter, Kimi |

---

## Project Structure

```
simulark-app/
├── actions/                 # Server Actions
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication
│   ├── dashboard/         # Protected dashboard
│   └── projects/          # Project editor
├── components/
│   ├── canvas/            # Canvas components
│   │   ├── nodes/         # Custom nodes
│   │   └── edges/         # Custom edges
│   ├── ui/                # Shadcn UI
│   └── layout/            # Layout components
├── lib/                   # Utilities
├── supabase/              # Database migrations
└── workers/               # Web Workers
```

---

## Code Standards

### Formatting

- **Indentation:** 2 spaces
- **Quotes:** Double quotes
- **Semicolons:** Required
- **Line width:** 80-100 characters

### Naming Conventions

| Type             | Convention        | Example              |
| ---------------- | ----------------- | -------------------- |
| Components       | PascalCase        | `FlowEditor.tsx`     |
| Hooks            | camelCase + `use` | `useCanvasState.ts`  |
| Utilities        | camelCase         | `tech-normalizer.ts` |
| Types/Interfaces | PascalCase        | `NodeData`           |
| Constants        | UPPER_SNAKE_CASE  | `MAX_NODES`          |

### Import Order

1. React/Next imports
2. Third-party libraries
3. Internal `@/` aliases
4. Relative imports
5. Types

---

## TypeScript Guidelines

- **Strict mode enabled** - Avoid `any` types
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for complex state
- Path alias `@/*` maps to project root

---

## Component Structure

```typescript
"use client"; // If needed

import { useState } from "react";

interface Props {
  projectId: string;
}

export function ComponentName({ projectId }: Props) {
  const [data, setData] = useState<string>("");

  return <div>{data}</div>;
}
```

---

## Server Actions

```typescript
"use server";

export async function actionName(param: string) {
  // Validate input with Valibot
  // Perform operation
  // Return discriminated union
  return { success: true, data: result };
  // or
  return { success: false, error: "message" };
}
```

---

## API Routes

- Use Next.js 15+ route handlers
- Validate with Valibot before processing
- Return appropriate HTTP status codes

---

## Error Handling

```typescript
try {
  const result = await fetchData();
  return result;
} catch (error) {
  logger.error("Failed to fetch data", error);
  throw new Error("User-friendly message");
}
```

---

## Environment Variables

Define in [`env.ts`](env.ts) using `@t3-oss/env-nextjs` + Valibot:

```typescript
export const env = createEnv({
  server: {
    API_KEY: string,
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: string,
  },
});
```

---

## Database

- Migrations in `supabase/migrations/`
- Use RLS policies for security
- Use camelCase in TypeScript, snake_case in SQL

---

## Git Workflow

1. Run `bun run lint` before committing
2. Run `bun run format` to auto-fix issues
3. Ensure `bun run build` succeeds
4. Use conventional commit messages

---

## Feature Flags

Configure in environment variables:

```bash
ENABLE_ALL_FEATURES=true
RESTRICT_FEATURES_BY_TIER=true
FEATURE_CHAOS_ENGINEERING_TIERS=starter,pro
```

See [`lib/feature-flags.ts`](lib/feature-flags.ts) for all available flags.
