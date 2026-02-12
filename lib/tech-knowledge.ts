export interface TechKnowledge {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  category:
    | "frontend"
    | "backend"
    | "database"
    | "ai"
    | "devops"
    | "cloud"
    | "tooling";
}

export const TECH_KNOWLEDGE_BASE: Record<string, TechKnowledge> = {
  // --- Frontend Frameworks ---
  nextjs: {
    id: "nextjs",
    name: "Next.js 15",
    description:
      "React framework with Server Components, Server Actions, and hybrid static/dynamic rendering.",
    pros: [
      "React Server Components (RSC)",
      "Excellent SEO",
      "Vercel integration",
      "Huge ecosystem",
    ],
    cons: [
      "High complexity",
      "Vendor lock-in risk (Vercel)",
      "Cold starts on serverless",
    ],
    bestFor: [
      "Large-scale web apps",
      "E-commerce",
      "Marketing sites",
      "SEO-heavy projects",
    ],
    category: "frontend",
  },
  remix: {
    id: "remix",
    name: "Remix (React Router v7)",
    description:
      "Full-stack React framework focused on web standards, HTTP caching, and nested routing.",
    pros: [
      "Web standards first",
      "No waterfall fetching",
      "Excellent for dynamic data",
      "Cleaner mutation model",
    ],
    cons: [
      "Smaller ecosystem than Next.js",
      "Less 'magic' (manual setup sometimes)",
    ],
    bestFor: ["Dashboards", "SaaS apps", "Data-heavy applications"],
    category: "frontend",
  },
  sveltekit: {
    id: "sveltekit",
    name: "SvelteKit",
    description:
      "Full-stack framework for Svelte. Compiles to tiny, highly optimized JavaScript.",
    pros: [
      "Extremely performant",
      "Small bundle sizes",
      "Simple mental model",
      "Built-in state management",
    ],
    cons: ["Smaller ecosystem", "Svelte 5 breaking changes adoption curve"],
    bestFor: [
      "Interactive apps",
      "Low-bandwidth environments",
      "High-performance UIs",
    ],
    category: "frontend",
  },
  "solid-start": {
    id: "solid-start",
    name: "SolidStart",
    description:
      "Meta-framework for SolidJS. Fine-grained reactivity with 0kb runtime overhead.",
    pros: [
      "Fastest rendering performance",
      "Fine-grained reactivity",
      "Isomorphic RPC",
    ],
    cons: ["Niche ecosystem", "Smaller community"],
    bestFor: [
      "Real-time dashboards",
      "High-frequency trading UIs",
      "Performance-critical apps",
    ],
    category: "frontend",
  },
  "tanstack-start": {
    id: "tanstack-start",
    name: "TanStack Start",
    description:
      "Full-stack React framework built on TanStack Router. Type-safe fro end-to-end.",
    pros: [
      "Best-in-class type safety",
      "Agnostic deployment",
      "TanStack ecosystem integration",
    ],
    cons: ["New/Beta status", "Learning curve for router concepts"],
    bestFor: [
      "Enterprise apps",
      "Complex routing requirements",
      "Type-safe enthusiasts",
    ],
    category: "frontend",
  },

  // --- Backend Runtimes & Frameworks ---
  bun: {
    id: "bun",
    name: "Bun",
    description:
      "All-in-one JavaScript runtime, bundler, and package manager. Drop-in Node.js replacement.",
    pros: [
      "Extremely fast startup",
      "Built-in tools (test, bundle)",
      "TypeScript support out-of-box",
    ],
    cons: ["Newer/less stable than Node", "Some Node.js compatibility gaps"],
    bestFor: ["Edge functions", "CLI tools", "High-performance scripts"],
    category: "backend",
  },
  hono: {
    id: "hono",
    name: "Hono",
    description:
      "Small, fast, standard-compliant web framework. Runs on Cloudflare, Bun, Node, Deno.",
    pros: [
      "Ultra-fast",
      "Runs anywhere (Edge/Node)",
      "Type-safe middleware",
      "Zero dependencies",
    ],
    cons: [
      "Minimalist (bring your own ORM/Auth)",
      "Not a full framework like NestJS",
    ],
    bestFor: [
      "Edge APIs",
      "Serverless functions",
      "High-performance microservices",
    ],
    category: "backend",
  },
  elysia: {
    id: "elysia",
    name: "Elysia",
    description:
      "Ergonomic, type-safe web framework for Bun. End-to-end type safety with Eden.",
    pros: [
      "Fastest Bun framework",
      "End-to-end type safety",
      "Plugin ecosystem",
    ],
    cons: ["Bun-only (mostly)", "Newer ecosystem"],
    bestFor: [
      "Bun-native apps",
      "Performance-critical APIs",
      "Type-safe backends",
    ],
    category: "backend",
  },
  hattip: {
    id: "hattip",
    name: "Hattip",
    description:
      "Modern, universal HTTP server for JavaScript. Runs on any platform.",
    pros: ["Platform agnostic", "Modern web standards", "Minimalist"],
    cons: ["Niche adoption"],
    bestFor: ["Universal libraries", "Cross-platform middleware"],
    category: "backend",
  },
  nitro: {
    id: "nitro",
    name: "Nitro",
    description:
      "The next-generation server toolkit used by Nuxt. Builds for any provider.",
    pros: ["Builds for every cloud", "File-based routing", "Auto-imports"],
    cons: ["Coupled with UnJS ecosystem"],
    bestFor: ["Universal deployments", "Server-side rendering servers"],
    category: "backend",
  },

  // --- Database & Data ---
  turso: {
    id: "turso",
    name: "Turso (libSQL)",
    description:
      "Edge-hosted, distributed database based on SQLite. Fork of SQLite for the edge.",
    pros: [
      "Zero latency at the edge",
      "Cheap/generous free tier",
      "One file = one DB model",
    ],
    cons: ["Relatively new", "Eventual consistency considerations in replicas"],
    bestFor: ["Edge apps", "Global low-latency", "Personal projects"],
    category: "database",
  },
  neon: {
    id: "neon",
    name: "Neon (Serverless Postgres)",
    description:
      "Serverless PostgreSQL with separation of storage and compute. Supports branching.",
    pros: ["Real Postgres", "Database branching (like Git)", "Scale to zero"],
    cons: [
      "Cold starts (though fast)",
      "Connection pooling needed for serverless",
    ],
    bestFor: [
      "Serverless apps",
      "Dev/Test workflows",
      "General purpose Postgres",
    ],
    category: "database",
  },
  convex: {
    id: "convex",
    name: "Convex",
    description:
      "The backend application platform. Database + functions + realtime + storage.",
    pros: [
      "Real-time by default",
      "End-to-end type safety",
      "No backend boilerplate",
    ],
    cons: ["Vendor lock-in", "Custom query language (not SQL)"],
    bestFor: ["Real-time apps", "Rapid prototyping", "React apps"],
    category: "database",
  },
  upstash: {
    id: "upstash",
    name: "Upstash",
    description:
      "Serverless Redis, Kafka, and QStash (scheduling). HTTP-based APIs.",
    pros: [
      "Serverless pricing",
      "HTTP API (no connection limits)",
      "Global replication",
    ],
    cons: ["Cost at high scale vs managed EC2"],
    bestFor: ["Serverless caching", "Rate limiting", "Job scheduling"],
    category: "database",
  },

  // --- AI & Agents ---
  langgraph: {
    id: "langgraph",
    name: "LangGraph",
    description:
      "Library for building stateful, multi-actor applications with LLMs.",
    pros: [
      "Cyclic graphs (loops)",
      "State persistence",
      "Human-in-the-loop support",
    ],
    cons: ["Python-first (JS lagging)", "Complexity for simple chains"],
    bestFor: [
      "Agentic workflows",
      "Chatbots with memory",
      "Complex reasoning tasks",
    ],
    category: "ai",
  },
  crewai: {
    id: "crewai",
    name: "CrewAI",
    description:
      "Framework for orchestrating role-playing autonomous AI agents.",
    pros: [
      "Role-based design",
      "Easy to get started",
      "Structured team dynamics",
    ],
    cons: ["can be rigid", "Python-only (mostly)"],
    bestFor: ["Multi-agent simulations", "Task delegation systems"],
    category: "ai",
  },
  "pydantic-ai": {
    id: "pydantic-ai",
    name: "PydanticAI",
    description:
      "Type-safe AI framework leveraging Pydantic for validation and structure.",
    pros: [
      "Structuring outputs",
      "Integration with Python ecosystem",
      "Validation first",
    ],
    cons: ["Python specific"],
    bestFor: ["Structured data extraction", "Robust AI pipelines"],
    category: "ai",
  },
  "openai-o1": {
    id: "openai-o1",
    name: "OpenAI o1",
    description:
      "Reasoning model designed to spend more time thinking before responding.",
    pros: [
      "Superior reasoning",
      "Solves complex logic",
      "Reduced hallucinations",
    ],
    cons: ["Slower latency", "Higher cost"],
    bestFor: [
      "Math/Coding tasks",
      "Complex architecture design",
      "Scientific reasoning",
    ],
    category: "ai",
  },

  // --- Real-time & Synchronization ---
  partykit: {
    id: "partykit",
    name: "PartyKit",
    description:
      "Deployment platform for AI agents and multiplayer apps. Stateful serverless.",
    pros: [
      "WebSockets made easy",
      "Stateful edge objects",
      "Great for collaboration",
    ],
    cons: ["Niche use case (multiplayer/agents)"],
    bestFor: ["Collaboration tools", "Multiplayer games", "Signaling servers"],
    category: "backend",
  },
  liveblocks: {
    id: "liveblocks",
    name: "Liveblocks",
    description: "Real-time collaboration infrastructure for developers.",
    pros: [
      "Pre-built UI components",
      "Conflict resolution",
      "Presence/Cursors",
    ],
    cons: ["SaaS pricing"],
    bestFor: [
      "Adding collaboration to existing apps",
      "Whiteboards",
      "Comments",
    ],
    category: "tooling",
  },

  // --- Platform & DevOps ---
  backstage: {
    id: "backstage",
    name: "Backstage",
    description:
      "Open platform for building developer portals. Created by Spotify.",
    pros: ["Centralized catalog", "Plugin ecosystem", "Standardized templates"],
    cons: ["High maintenance effort", "Steep learning curve"],
    bestFor: ["Large engineering orgs", "Service catalogs", "Internal docs"],
    category: "devops",
  },
  opentofu: {
    id: "opentofu",
    name: "OpenTofu",
    description: "Open-source fork of Terraform. Infrastructure as Code tool.",
    pros: ["Open source (Linux Foundation)", "Drop-in Terraform replacement"],
    cons: ["Newer than Terraform"],
    bestFor: ["Infrastructure provisioning", "Open source purists"],
    category: "devops",
  },
  dagger: {
    id: "dagger",
    name: "Dagger",
    description: "Programmable CI/CD engine that runs in containers.",
    pros: [
      "Write pipelines in code (Go/TS/Python)",
      "Local == CI execution",
      "Portable",
    ],
    cons: ["Paradigm shift from YAML"],
    bestFor: ["Complex CI/CD pipelines", "DevEx improvement"],
    category: "devops",
  },
};
