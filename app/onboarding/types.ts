/**
 * Onboarding types - Living Blueprint Design System
 * Simplified 3-step flow with seamless UX
 */

// ============================================================================
// Core Data Types
// ============================================================================

export interface OnboardingData {
  // Step 1: Profile & Intent (INT-01)
  experienceLevel?: "beginner" | "intermediate" | "expert";
  projectType?: string;
  teamContext?: "solo" | "small" | "enterprise";

  // Step 2: Technology Stack (CFG-01)
  techStack: {
    cloud: string[];
    languages: string[];
    frameworks: string[];
  };

  // Step 3: Generation Mode (MOD-01)
  defaultMode?: "startup" | "default" | "enterprise";

  // Step 3.5: Architecture Patterns (CFG-03)
  architecturePreferences?: string[];
}

// ============================================================================
// Steps Configuration
// ============================================================================

export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "System Initialization",
    shortTitle: "INIT",
    badge: "SYS-00",
    description: "Configure your architecture generator",
  },
  {
    id: "profile",
    title: "Profile & Intent",
    shortTitle: "PROFILE",
    badge: "INT-01",
    description: "Who you are and what you build",
  },
  {
    id: "techstack",
    title: "Technology Stack",
    shortTitle: "CONFIG",
    badge: "CFG-01",
    description: "Your preferred technologies",
  },
  {
    id: "archpatterns",
    title: "Architecture Patterns",
    shortTitle: "PATTERNS",
    badge: "CFG-03",
    description: "Monolith, microservices, or serverless",
  },
  {
    id: "mode",
    title: "Generation Mode",
    shortTitle: "MODE",
    badge: "MOD-01",
    description: "Default complexity level",
  },
  {
    id: "complete",
    title: "System Ready",
    shortTitle: "READY",
    badge: "SYS-01",
    description: "Configuration complete",
  },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

// ============================================================================
// Step 1: Profile & Intent Options
// ============================================================================

export const EXPERIENCE_LEVEL_OPTIONS = [
  {
    id: "beginner" as const,
    name: "Beginner",
    description: "Simple, proven stacks with clear documentation",
    detail: "Focus on learning-friendly architectures",
    icon: "ph:plant",
  },
  {
    id: "intermediate" as const,
    name: "Intermediate",
    description: "Balanced modern choices with best practices",
    detail: "Production-ready with moderate complexity",
    icon: "ph:scales",
  },
  {
    id: "expert" as const,
    name: "Expert",
    description: "Cutting-edge patterns and optimizations",
    detail: "Complex, scalable enterprise architectures",
    icon: "ph:rocket-launch",
  },
] as const;

export const PROJECT_TYPE_OPTIONS = [
  {
    id: "saas",
    name: "SaaS Platform",
    description: "Multi-tenant web applications",
    icon: "ph:cloud",
  },
  {
    id: "api",
    name: "API / Backend",
    description: "REST, GraphQL, or gRPC services",
    icon: "ph:plugs",
  },
  {
    id: "mobile",
    name: "Mobile App",
    description: "iOS & Android with backend",
    icon: "ph:device-mobile",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online stores & marketplaces",
    icon: "ph:shopping-cart",
  },
  {
    id: "ai",
    name: "AI / ML",
    description: "Machine learning pipelines",
    icon: "ph:brain",
  },
  {
    id: "data",
    name: "Data Pipeline",
    description: "ETL & analytics systems",
    icon: "ph:chart-bar",
  },
] as const;

export const TEAM_CONTEXT_OPTIONS = [
  {
    id: "solo" as const,
    name: "Solo Developer",
    description: "Just me",
    detail: "Simple, maintainable by one person",
  },
  {
    id: "small" as const,
    name: "Small Team",
    description: "2-10 developers",
    detail: "Collaborative with clear boundaries",
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    description: "10+ developers",
    detail: "Team collaboration with governance",
  },
] as const;

// ============================================================================
// Step 2: Technology Stack Options - Expanded with Modern Tech
// ============================================================================

export const TECH_STACK_OPTIONS = {
  cloud: [
    { id: "aws", name: "AWS", icon: "logos:aws" },
    { id: "vercel", name: "Vercel", icon: "logos:vercel-icon" },
    { id: "railway", name: "Railway", icon: "logos:railway-icon" },
    { id: "gcp", name: "GCP", icon: "logos:google-cloud" },
    { id: "azure", name: "Azure", icon: "logos:azure-icon" },
    { id: "fly", name: "Fly.io", icon: "logos:fly-icon" },
    { id: "hetzner", name: "Hetzner", icon: "logos:hetzner" },
    {
      id: "digitalocean",
      name: "DigitalOcean",
      icon: "logos:digital-ocean-icon",
    },
    { id: "linode", name: "Linode", icon: "logos:linode" },
    { id: "cloudflare", name: "Cloudflare", icon: "logos:cloudflare-icon" },
    { id: "heroku", name: "Heroku", icon: "logos:heroku-icon" },
    { id: "netlify", name: "Netlify", icon: "logos:netlify-icon" },
    { id: "render", name: "Render", icon: "logos:render-icon" },
    { id: "supabase", name: "Supabase", icon: "logos:supabase-icon" },
    { id: "coolify", name: "Coolify", icon: "logos:coolify-icon" },
  ],
  languages: [
    { id: "typescript", name: "TypeScript", icon: "logos:typescript-icon" },
    { id: "javascript", name: "JavaScript", icon: "logos:javascript" },
    { id: "python", name: "Python", icon: "logos:python" },
    { id: "go", name: "Go", icon: "logos:go" },
    { id: "rust", name: "Rust", icon: "logos:rust" },
    { id: "java", name: "Java", icon: "logos:java" },
    { id: "csharp", name: "C#", icon: "logos:c-sharp" },
    { id: "ruby", name: "Ruby", icon: "logos:ruby" },
    { id: "php", name: "PHP", icon: "logos:php" },
    { id: "bun", name: "Bun", icon: "logos:bun" },
    { id: "deno", name: "Deno", icon: "logos:deno" },
    { id: "elixir", name: "Elixir", icon: "logos:elixir" },
    { id: "kotlin", name: "Kotlin", icon: "logos:kotlin-icon" },
    { id: "swift", name: "Swift", icon: "logos:swift" },
    { id: "zig", name: "Zig", icon: "logos:zig" },
    { id: "c", name: "C", icon: "logos:c" },
    { id: "cpp", name: "C++", icon: "logos:cpp" },
    { id: "scala", name: "Scala", icon: "logos:scala" },
    { id: "haskell", name: "Haskell", icon: "logos:haskell-icon" },
    { id: "lua", name: "Lua", icon: "logos:lua" },
  ],
  frameworks: [
    // Frontend
    { id: "nextjs", name: "Next.js", icon: "logos:nextjs-icon" },
    { id: "react", name: "React", icon: "logos:react" },
    { id: "vue", name: "Vue", icon: "logos:vue" },
    { id: "svelte", name: "Svelte", icon: "logos:svelte-icon" },
    { id: "sveltekit", name: "SvelteKit", icon: "logos:svelte-icon" },
    { id: "astro", name: "Astro", icon: "logos:astro-icon" },
    { id: "nuxt", name: "Nuxt", icon: "logos:nuxt-icon" },
    { id: "remix", name: "Remix", icon: "logos:remix-icon" },
    { id: "vite", name: "Vite", icon: "logos:vitejs" },
    { id: "htmx", name: "HTMX", icon: "logos:htmx-icon" },
    { id: "solid", name: "SolidJS", icon: "logos:solidjs-icon" },
    { id: "qwik", name: "Qwik", icon: "logos:qwik" },
    // Backend
    { id: "fastapi", name: "FastAPI", icon: "logos:fastapi-icon" },
    { id: "django", name: "Django", icon: "logos:django-icon" },
    { id: "flask", name: "Flask", icon: "logos:flask" },
    { id: "spring", name: "Spring", icon: "logos:spring-icon" },
    { id: "laravel", name: "Laravel", icon: "logos:laravel" },
    { id: "rails", name: "Rails", icon: "logos:rails" },
    { id: "gin", name: "Gin", icon: "logos:go" },
    { id: "fiber", name: "Fiber", icon: "logos:go" },
    { id: "echo", name: "Echo", icon: "logos:go" },
    { id: "hono", name: "Hono", icon: "logos:hono" },
    { id: "elysia", name: "Elysia", icon: "logos:elysia" },
    { id: "express", name: "Express", icon: "logos:express" },
    { id: "fastify", name: "Fastify", icon: "logos:fastify-icon" },
    { id: "nestjs", name: "NestJS", icon: "logos:nestjs" },
    { id: "adonisjs", name: "AdonisJS", icon: "logos:adonisjs-icon" },
    { id: "phoenix", name: "Phoenix", icon: "logos:phoenix" },
    { id: "actix", name: "Actix", icon: "logos:rust" },
    { id: "axum", name: "Axum", icon: "logos:rust" },
    { id: "rocket", name: "Rocket", icon: "logos:rust" },
    // Mobile
    { id: "flutter", name: "Flutter", icon: "logos:flutter" },
    { id: "react-native", name: "React Native", icon: "logos:react" },
    { id: "swiftui", name: "SwiftUI", icon: "logos:swift" },
    {
      id: "jetpack-compose",
      name: "Jetpack Compose",
      icon: "logos:android-icon",
    },
    { id: "expo", name: "Expo", icon: "logos:expo-icon" },
    // AI/ML
    { id: "langchain", name: "LangChain", icon: "simple-icons:langchain" },
    { id: "llamaindex", name: "LlamaIndex", icon: "simple-icons:llamaindex" },
    { id: "tensorflow", name: "TensorFlow", icon: "logos:tensorflow" },
    { id: "pytorch", name: "PyTorch", icon: "logos:pytorch-icon" },
  ],
} as const;

// ============================================================================
// Step 3: Generation Mode Options
// ============================================================================

export const GENERATION_MODE_OPTIONS = [
  {
    id: "startup" as const,
    name: "Startup",
    badge: "MVP",
    description: "MVP-focused, cost-optimized",
    detail: "3-5 components • Speed first",
    features: ["Quick deployment", "Minimal complexity", "Cost-effective"],
    icon: "ph:rocket-launch",
  },
  {
    id: "default" as const,
    name: "Standard",
    badge: "RECOMMENDED",
    description: "Balanced approach",
    detail: "4-8 components • Best practices",
    features: ["Production-ready", "Scalable design", "Industry standards"],
    icon: "ph:scales",
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    badge: "PROD",
    description: "Full redundancy, compliance-ready",
    detail: "6-15 components • Production grade",
    features: ["High availability", "Full observability", "Security-first"],
    icon: "ph:buildings",
  },
] as const;

// ============================================================================
// Helper Types
// ============================================================================

export type ExperienceLevel = (typeof EXPERIENCE_LEVEL_OPTIONS)[number]["id"];
export type ProjectType = (typeof PROJECT_TYPE_OPTIONS)[number]["id"];
export type TeamContext = (typeof TEAM_CONTEXT_OPTIONS)[number]["id"];
export type GenerationMode = (typeof GENERATION_MODE_OPTIONS)[number]["id"];
