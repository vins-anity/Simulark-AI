/**
 * Onboarding types and data structures
 */

export interface OnboardingData {
  experienceLevel?: "beginner" | "intermediate" | "expert";
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    auth: string[];
    cloud: string[];
  };
  projectTypes: string[];
  defaultMode?: "startup" | "default" | "enterprise";
}

export const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "experience", title: "Experience" },
  { id: "techstack", title: "Tech Stack" },
  { id: "projecttype", title: "Projects" },
  { id: "mode", title: "Mode" },
  { id: "complete", title: "Complete" },
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number]["id"];

// Tech stack options
export const TECH_STACK_OPTIONS = {
  frontend: [
    { id: "react", name: "React", icon: "⚛️" },
    { id: "vue", name: "Vue", icon: "🟢" },
    { id: "angular", name: "Angular", icon: "🅰️" },
    { id: "svelte", name: "Svelte", icon: "🔥" },
    { id: "nextjs", name: "Next.js", icon: "▲" },
    { id: "nuxt", name: "Nuxt", icon: "⛰️" },
    { id: "remix", name: "Remix", icon: "🎸" },
    { id: "astro", name: "Astro", icon: "🚀" },
  ],
  backend: [
    { id: "nodejs", name: "Node.js", icon: "🟩" },
    { id: "python", name: "Python", icon: "🐍" },
    { id: "go", name: "Go", icon: "🐹" },
    { id: "rust", name: "Rust", icon: "🦀" },
    { id: "java", name: "Java", icon: "☕" },
    { id: "dotnet", name: ".NET", icon: "🔷" },
    { id: "ruby", name: "Ruby", icon: "💎" },
    { id: "php", name: "PHP", icon: "🐘" },
  ],
  database: [
    { id: "postgresql", name: "PostgreSQL", icon: "🐘" },
    { id: "mysql", name: "MySQL", icon: "🐬" },
    { id: "mongodb", name: "MongoDB", icon: "🍃" },
    { id: "redis", name: "Redis", icon: "🔴" },
    { id: "supabase", name: "Supabase", icon: "⚡" },
    { id: "dynamodb", name: "DynamoDB", icon: "📦" },
    { id: "sqlite", name: "SQLite", icon: "💿" },
    { id: "elasticsearch", name: "Elastic", icon: "🔍" },
  ],
  auth: [
    { id: "supabase-auth", name: "Supabase Auth", icon: "⚡" },
    { id: "clerk", name: "Clerk", icon: "🔑" },
    { id: "auth0", name: "Auth0", icon: "🔒" },
    { id: "nextauth", name: "NextAuth.js", icon: "▲" },
    { id: "firebase-auth", name: "Firebase Auth", icon: "🔥" },
    { id: "custom", name: "Custom/JWT", icon: "🛠️" },
  ],
  cloud: [
    { id: "aws", name: "AWS", icon: "☁️" },
    { id: "vercel", name: "Vercel", icon: "▲" },
    { id: "railway", name: "Railway", icon: "🚂" },
    { id: "gcp", name: "GCP", icon: "☁️" },
    { id: "azure", name: "Azure", icon: "🔷" },
    { id: "fly", name: "Fly.io", icon: "🪰" },
    { id: "digitalocean", name: "DigitalOcean", icon: "🦈" },
    { id: "heroku", name: "Heroku", icon: "🟣" },
  ],
} as const;

export const PROJECT_TYPE_OPTIONS = [
  { id: "saas", name: "SaaS", icon: "☁️", description: "Software as a Service" },
  {
    id: "ecommerce",
    name: "E-commerce",
    icon: "🛒",
    description: "Online stores & marketplaces",
  },
  {
    id: "api",
    name: "API / Backend",
    icon: "🔌",
    description: "REST & GraphQL APIs",
  },
  {
    id: "mobile",
    name: "Mobile App",
    icon: "📱",
    description: "iOS & Android apps",
  },
  {
    id: "ai-ml",
    name: "AI / ML",
    icon: "🤖",
    description: "Machine learning & AI",
  },
  {
    id: "data",
    name: "Data Pipeline",
    icon: "📊",
    description: "ETL & data processing",
  },
  { id: "iot", name: "IoT", icon: "🔌", description: "Internet of Things" },
] as const;

export const DEFAULT_MODE_OPTIONS = [
  {
    id: "startup",
    name: "Startup",
    icon: "🚀",
    description: "MVP-focused, cost-optimized",
    details: "3-5 components • Speed first",
  },
  {
    id: "default",
    name: "Default",
    icon: "⚖️",
    description: "Balanced approach",
    details: "4-8 components • Best practices",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: "🏢",
    description: "Full redundancy, compliance-ready",
    details: "6-15 components • Production grade",
  },
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  {
    id: "beginner",
    name: "Beginner",
    icon: "🌱",
    description: "I prefer simple, proven technology stacks",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    icon: "⚖️",
    description: "I want balanced, modern choices",
  },
  {
    id: "expert",
    name: "Expert",
    icon: "🚀",
    description: "Show me cutting-edge, complex architectures",
  },
] as const;
