import { createLogger } from "@/lib/logger";
import {
  getComponentCountAdjustment,
  getOperationInstructions,
  type OperationType,
  shouldRelaxConstraints,
} from "./intent-detector";
import { TECH_KNOWLEDGE_BASE } from "./tech-knowledge";

const _logger = createLogger("prompt-engineering");

export type ArchitectureType =
  | "web-app"
  | "ai-pipeline"
  | "microservices"
  | "monolithic"
  | "serverless"
  | "data-pipeline"
  | "mobile-app"
  | "desktop-app"
  | "iot-system"
  | "blockchain"
  | "mixed"
  | "unknown";

export type ComplexityLevel = "simple" | "medium" | "complex";

export interface ArchitectureDetection {
  type: ArchitectureType;
  confidence: number; // 0-1
  detectedKeywords: string[];
  suggestedQuestions: string[];
}

export interface PromptContext {
  userInput: string;
  architectureType: ArchitectureType;
  detectedIntent: string;
  currentNodes?: unknown[];
  currentEdges?: unknown[];
  mode: ArchitectureMode;

  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  operationType?: OperationType; // Type of operation (create/modify/simplify/remove/extend)
  userPreferences?: {
    cloudProviders?: string[];
    languages?: string[];
    frameworks?: string[];
    architectureTypes?: string[];
    applicationType?: string[];
    customInstructions?: string;
    // Legacy fields for backward compatibility
    cloudProvider?: string;
    language?: string;
    framework?: string;
    onboardingMetadata?: {
      role: string;
      useCase: string;
      teamSize: string;
      experienceLevel: string;
      includeServices: Record<string, boolean>;
    };
  };
  preferenceFitSummary?: PreferenceFitSummary;
}

export interface PreferenceFitSummary {
  normalizedPreferences: string[];
  overlapOpportunities: string[];
  likelyConflicts: string[];
  promptDirective: string;
}

// Complexity indicators
const COMPLEXITY_INDICATORS: Record<ComplexityLevel, string[]> = {
  simple: [
    "todo",
    "blog",
    "simple",
    "basic",
    "small",
    "personal",
    "portfolio",
    "landing page",
    "static",
    "single page",
    "crud",
    "notes",
    "bookmark",
    "url shortener",
  ],
  medium: [
    "e-commerce",
    "saas",
    "dashboard",
    "crm",
    "cms",
    "marketplace",
    "social",
    "chat",
    "messaging",
    "analytics",
    "booking",
    "reservation",
    "payment",
  ],
  complex: [
    "microservices",
    "enterprise",
    "distributed",
    "scalable",
    "high availability",
    "kubernetes",
    "multi-tenant",
    "platform",
    "infrastructure",
    "ai pipeline",
    "data pipeline",
  ],
};

// Mode-specific constraints
export type ArchitectureMode = "default" | "startup" | "enterprise";
export type LegacyArchitectureMode = ArchitectureMode | "corporate";

export const MODE_CONSTRAINTS: Record<
  ArchitectureMode,
  {
    maxComponents: number;
    minComponents: number;
    preferFullStack: boolean;
    requireCDN: boolean;
    requireLoadBalancer: boolean;
    requireObservability: boolean;
    costFocus: "low" | "balanced" | "high";
    description: string;
    focus: string;
  }
> = {
  default: {
    maxComponents: 10,
    minComponents: 4,
    preferFullStack: false,
    requireCDN: true,
    requireLoadBalancer: false,
    requireObservability: true,
    costFocus: "balanced",
    description:
      "Default (Balanced) - Production-ready with balanced accuracy, comprehensiveness, and efficiency. Best for most use cases.",
    focus: "Balanced approach - accuracy, speed, and completeness",
  },
  startup: {
    maxComponents: 5,
    minComponents: 3,
    preferFullStack: true,
    requireCDN: false,
    requireLoadBalancer: false,
    requireObservability: false,
    costFocus: "low",
    description:
      "Startup MVP - Ship fast, validate ideas, minimize costs. Use managed services with free tiers.",
    focus: "Speed to market, cost optimization, rapid iteration",
  },
  enterprise: {
    maxComponents: 20,
    minComponents: 6,
    preferFullStack: false,
    requireCDN: true,
    requireLoadBalancer: true,
    requireObservability: true,
    costFocus: "high",
    description:
      "Enterprise - Multi-region, compliant, resilient architecture. Full observability, security, and governance.",
    focus: "Global scale, compliance (SOC2/GDPR), high availability",
  },
};

/**
 * Normalize requested mode (including legacy aliases) into a supported mode.
 */
export function normalizeArchitectureMode(
  mode?: string | null,
): ArchitectureMode {
  if (!mode) return "default";

  const normalized = mode.toLowerCase();
  if (normalized === "corporate") {
    return "enterprise";
  }

  if (normalized in MODE_CONSTRAINTS) {
    return normalized as ArchitectureMode;
  }

  return "default";
}

// Framework compatibility rules
const FRAMEWORK_GROUPS = {
  fullstack: ["nextjs", "nuxt", "sveltekit", "remix", "blitz"],
  backend: ["express", "fastify", "nestjs", "hono", "elysia", "koa"],
  traditional: ["laravel", "django", "rails", "spring", "adonisjs"],
  frontend: ["react", "vue", "angular", "svelte"],
};

const _INCOMPATIBLE_PAIRS: Array<[string[], string[]]> = [
  [FRAMEWORK_GROUPS.fullstack, FRAMEWORK_GROUPS.backend], // Next.js + Express
  [FRAMEWORK_GROUPS.traditional, FRAMEWORK_GROUPS.backend], // Laravel + Express
  [FRAMEWORK_GROUPS.traditional, FRAMEWORK_GROUPS.fullstack], // Laravel + Next.js
  [FRAMEWORK_GROUPS.traditional, FRAMEWORK_GROUPS.fullstack], // Laravel + Next.js
];

// Architecture detection patterns
const ARCHITECTURE_PATTERNS: Record<ArchitectureType, string[]> = {
  "web-app": [
    "web app",
    "website",
    "web application",
    "frontend",
    "fullstack",
    "nextjs",
    "react",
    "vue",
    "angular",
    "dashboard",
    "portal",
    "saas",
    "e-commerce",
    "blog",
    "cms",
  ],
  "ai-pipeline": [
    "ai",
    "machine learning",
    "ml",
    "deep learning",
    "llm",
    "gpt",
    "openai",
    "anthropic",
    "vector database",
    "embedding",
    "rag",
    "inference",
    "model serving",
    "training",
    "ai pipeline",
    "ml pipeline",
    "gpu",
    "tensorflow",
    "pytorch",
  ],
  microservices: [
    "microservices",
    "micro-service",
    "distributed",
    "service mesh",
    "kubernetes",
    "k8s",
    "docker",
    "container",
    "grpc",
    "service discovery",
    "api gateway",
    "event-driven",
    "message queue",
    "kafka",
    "rabbitmq",
  ],
  monolithic: [
    "monolithic",
    "monolith",
    "single application",
    "mvc",
    "django",
    "rails",
    "laravel",
    "spring boot",
    "express",
    "fastify",
  ],
  serverless: [
    "serverless",
    "lambda",
    "cloudflare workers",
    "vercel edge",
    "netlify functions",
    "faas",
    "function as a service",
    "edge computing",
  ],
  "data-pipeline": [
    "data pipeline",
    "etl",
    "elt",
    "data warehouse",
    "data lake",
    "apache airflow",
    "spark",
    "kafka streaming",
    "real-time analytics",
    "batch processing",
  ],
  "mobile-app": [
    "mobile app",
    "ios app",
    "android app",
    "react native",
    "flutter",
    "swift",
    "kotlin",
    "cross-platform mobile",
    "pwa",
  ],
  "desktop-app": [
    "desktop app",
    "desktop software",
    "electron",
    "tauri",
    "wails",
    "native desktop",
    "windows app",
    "macos app",
    "linux app",
  ],
  "iot-system": [
    "iot",
    "internet of things",
    "mqtt",
    "sensor",
    "device management",
    "edge device",
    "embedded",
    "hardware",
    "raspberry pi",
    "arduino",
  ],
  blockchain: [
    "blockchain",
    "smart contract",
    "web3",
    "defi",
    "nft",
    "ethereum",
    "solana",
    "polygon",
    "solidity",
    "cryptocurrency",
  ],
  mixed: ["hybrid", "mixed", "multiple systems", "complex ecosystem"],
  unknown: [],
};

// Follow-up questions by architecture type
const FOLLOW_UP_QUESTIONS: Record<ArchitectureType, string[]> = {
  "web-app": [
    "What's the expected traffic volume?",
    "Do you need real-time features?",
    "Any specific tech preferences?",
  ],
  "ai-pipeline": [
    "What's the model size/complexity?",
    "Batch or real-time inference?",
    "GPU requirements?",
  ],
  microservices: [
    "How many services approximately?",
    "Synchronous or async communication?",
    "Existing tech stack?",
  ],
  monolithic: [
    "Team size?",
    "Expected scale in 1 year?",
    "Monolith-first or migration?",
  ],
  serverless: [
    "Cold start tolerance?",
    "Expected request volume?",
    "Stateful or stateless?",
  ],
  "data-pipeline": [
    "Data volume (GB/TB/PB)?",
    "Batch or streaming?",
    "Real-time requirements?",
  ],
  "mobile-app": [
    "Native or cross-platform?",
    "Offline capabilities needed?",
    "Push notifications?",
  ],
  "desktop-app": ["Which platforms?", "Auto-update needed?", "Local database?"],
  "iot-system": [
    "Number of devices?",
    "Data frequency?",
    "Edge computing needs?",
  ],
  blockchain: [
    "Public or private chain?",
    "Smart contracts needed?",
    "Expected TPS?",
  ],
  mixed: [
    "Can you clarify the primary use case?",
    "Which aspect is most critical?",
  ],
  unknown: [
    "Could you describe what you're building in more detail?",
    "Is this for web, mobile, or something else?",
    "What's the main problem you're solving?",
  ],
};

/**
 * Detect architecture type from user input
 */
export function detectArchitectureType(input: string): ArchitectureDetection {
  const normalizedInput = input.toLowerCase();
  const scores: Record<ArchitectureType, number> = {
    "web-app": 0,
    "ai-pipeline": 0,
    microservices: 0,
    monolithic: 0,
    serverless: 0,
    "data-pipeline": 0,
    "mobile-app": 0,
    "desktop-app": 0,
    "iot-system": 0,
    blockchain: 0,
    mixed: 0,
    unknown: 0,
  };
  const matchedKeywords: Record<ArchitectureType, string[]> = {
    "web-app": [],
    "ai-pipeline": [],
    microservices: [],
    monolithic: [],
    serverless: [],
    "data-pipeline": [],
    "mobile-app": [],
    "desktop-app": [],
    "iot-system": [],
    blockchain: [],
    mixed: [],
    unknown: [],
  };

  // Score each architecture type
  for (const [type, keywords] of Object.entries(ARCHITECTURE_PATTERNS)) {
    for (const keyword of keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        // Give 2 points for multi-word phrases, 1 point for single words
        const points = keyword.includes(" ") ? 2 : 1;
        scores[type as ArchitectureType] += points;
        matchedKeywords[type as ArchitectureType].push(keyword);
      }
    }
  }

  // Find the highest scoring type
  let maxScore = 0;
  let detectedType: ArchitectureType = "unknown";
  const highScoringTypes: ArchitectureType[] = [];

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as ArchitectureType;
      highScoringTypes.length = 0;
      highScoringTypes.push(type as ArchitectureType);
    } else if (score === maxScore && score > 0) {
      highScoringTypes.push(type as ArchitectureType);
    }
  }

  // Calculate confidence
  const confidence = Math.min(maxScore / 3, 1);

  // If multiple types have high scores, mark as mixed
  if (highScoringTypes.length > 1 && maxScore >= 2) {
    detectedType = "mixed";
  }

  return {
    type: detectedType,
    confidence,
    detectedKeywords: matchedKeywords[detectedType],
    suggestedQuestions: FOLLOW_UP_QUESTIONS[detectedType],
  };
}

/**
 * Detect complexity level from user input
 */
export function detectComplexity(input: string): ComplexityLevel {
  const normalized = input.toLowerCase();

  // Check for complex indicators
  for (const indicator of COMPLEXITY_INDICATORS.complex) {
    if (normalized.includes(indicator)) return "complex";
  }

  // Check for simple indicators
  for (const indicator of COMPLEXITY_INDICATORS.simple) {
    if (normalized.includes(indicator)) return "simple";
  }

  // Check for medium indicators
  for (const indicator of COMPLEXITY_INDICATORS.medium) {
    if (normalized.includes(indicator)) return "medium";
  }

  // Default based on length
  if (normalized.length < 20) return "simple";
  if (normalized.length > 60) return "medium";
  return "medium";
}

/**
 * Validation result for prompt quality check
 */
export interface PromptValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestedPrompts?: string[];
}

/**
 * Minimum requirements for a valid architecture prompt
 */
const MIN_PROMPT_LENGTH = 5;
const _MIN_MEANINGFUL_WORDS = 2;

/**
 * Validate if a prompt is meaningful enough to generate architecture
 */
export function validatePrompt(input: string): PromptValidation {
  const trimmed = input.trim();

  // Check minimum length
  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt is too short. Please provide at least ${MIN_PROMPT_LENGTH} characters describing your architecture.`,
      suggestedPrompts: [
        "Build a scalable e-commerce platform with microservices",
        "Create a real-time chat application with WebSockets",
        "Design an AI-powered recommendation system",
        "Build a serverless data processing pipeline",
      ],
    };
  }

  // Check for obvious gibberish only (like "aaaa", "bbbb", repetitive single characters)
  const trimmedLower = trimmed.toLowerCase();
  const obviousGibberish = /^(.)\1{4,}$/; // 5+ same characters: "aaaaa", "bbbbb"
  const repetitivePattern = /^(\w{1,2}\s+){3,}$/; // 3+ very short words only

  if (
    obviousGibberish.test(trimmedLower) ||
    repetitivePattern.test(trimmedLower)
  ) {
    return {
      isValid: false,
      error:
        "That doesn't look like a valid architecture description. Please describe what you want to build.",
      suggestedPrompts: [
        "Build a REST API with Node.js and PostgreSQL",
        "Create a full-stack application with React and FastAPI",
        "Design a cloud-native microservices architecture",
        "Build a data pipeline with Kafka and ClickHouse",
      ],
    };
  }

  // Check if it's just a greeting without requirements
  const greetings = ["hi", "hello", "hey", "help"];
  const words = trimmedLower.split(/\s+/).filter((w) => w.length > 0);
  const isJustGreeting =
    greetings.some((g) => trimmedLower.startsWith(g)) && words.length < 3;

  if (isJustGreeting) {
    return {
      isValid: true, // Allow but warn
      warning:
        "It looks like you're just saying hello! To generate an architecture, please describe what you want to build.",
      suggestedPrompts: [
        "Build a SaaS application with multi-tenant architecture",
        "Create an event-driven system with message queues",
        "Design a video streaming platform with CDN",
      ],
    };
  }

  return { isValid: true };
}

function normalizePreferenceValues(values?: string[]): string[] {
  return (values || [])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function summarizePreferenceFit(
  userPreferences: PromptContext["userPreferences"] | undefined,
  mode: ArchitectureMode,
  architectureType: ArchitectureType,
): PreferenceFitSummary {
  const cloudProviders = normalizePreferenceValues(
    userPreferences?.cloudProviders,
  );
  const frameworks = normalizePreferenceValues(userPreferences?.frameworks);
  const languages = normalizePreferenceValues(userPreferences?.languages);
  const architectureTypes = normalizePreferenceValues(
    userPreferences?.architectureTypes,
  );

  const normalizedPreferences = [
    ...cloudProviders.map((value) => `cloud: ${value}`),
    ...frameworks.map((value) => `frameworks: ${value}`),
    ...languages.map((value) => `languages: ${value}`),
    ...architectureTypes.map((value) => `patterns: ${value}`),
  ];

  const overlapOpportunities = [
    ...cloudProviders.filter((value) =>
      ["aws", "gcp", "google cloud", "azure", "cloudflare", "vercel"].includes(
        value,
      ),
    ),
    ...frameworks.filter((value) =>
      ["nextjs", "nestjs", "fastapi", "spring", "go"].includes(value),
    ),
  ];

  const likelyConflicts: string[] = [];
  if (mode === "enterprise") {
    if (
      frameworks.includes("laravel") &&
      architectureType === "microservices"
    ) {
      likelyConflicts.push(
        "laravel may constrain service decomposition for enterprise microservices",
      );
    }
    if (frameworks.includes("nextjs") && architectureType === "microservices") {
      likelyConflicts.push(
        "nextjs should not be stretched into the primary backend for enterprise microservices",
      );
    }
    if (languages.includes("php") && architectureType === "ai-pipeline") {
      likelyConflicts.push(
        "php is usually not the strongest primary language for enterprise AI pipelines",
      );
    }
  }

  const promptDirective =
    mode === "enterprise"
      ? "Use the best architecture first. User preferences are soft constraints. Reuse only compatible preferences, and provide a preference-aligned alternative when conflicts remain."
      : "Favor the best architecture for the request, while preserving compatible user preferences where practical.";

  return {
    normalizedPreferences,
    overlapOpportunities,
    likelyConflicts,
    promptDirective,
  };
}

/**
 * Hard tech-to-node-type validation matrix.
 * Replaces the old prose-based framework compatibility rules.
 * Tabular format is processed more reliably by all LLMs.
 */
function getTechValidationMatrix(): string {
  return `TECH VALIDATION MATRIX (BINDING — a node with tech outside its allowed set is an INVALID output):

| Node Type  | Allowed tech values                                                                                   |
|------------|-------------------------------------------------------------------------------------------------------|
| frontend   | react, vue, angular, svelte, nextjs, nuxt, sveltekit, remix, solid-start, tanstack-start,             |
|            | livewire, inertia, blade, htmx, stimulus, astro, qwik                                                |
| backend    | express, fastify, nestjs, hono, elysia, django, flask, fastapi, laravel, rails, spring,               |
|            | adonisjs, go, rust, dotnet, bun, deno, nitro, hattip                                                 |
| database   | postgresql, mysql, mongodb, sqlite, redis, dynamodb, cassandra, cockroachdb, supabase,                |
|            | firebase, planetscale, turso, neon, convex, faunadb, tidb, surrealdb                                 |
| cache      | redis, memcached, upstash, cloudflare-kv, varnish                                                    |
| queue      | kafka, rabbitmq, sqs, bullmq, celery, sidekiq, nats, pulsar, upstash-qstash                          |
| gateway    | kong, nginx, traefik, aws-apigw, cloudflare, ambassador, envoy, caddy                                |
| ai         | openai, anthropic, pinecone, weaviate, pgvector, langchain, langgraph, huggingface,                  |
|            | replicate, ollama, crewai, pydantic-ai, llamaindex                                                    |
| storage    | s3, cloudflare-r2, gcs, azure-blob, supabase-storage, backblaze, minio                               |
| external   | stripe, sendgrid, twilio, mailgun, pusher, algolia, mapbox, plaid, shippo                            |
| saas       | clerk, auth0, firebase-auth, cognito, okta, supabase-auth, nextauth, datadog, newrelic,               |
|            | grafana, sentry, posthog, segment, mixpanel, intercom, zendesk                                        |
| compute    | aws-lambda, vercel-functions, cloudflare-workers, netlify-functions, azure-functions                   |

FRAMEWORK ECOSYSTEM RULES (when user prefers a backend framework, use these for frontend nodes):
| User Prefers | Valid Frontend Tech                                          |
|--------------|--------------------------------------------------------------|
| laravel      | livewire (reactive server), inertia (SPA bridge),            |
|              | blade (templates), vue, react (decoupled SPA)                |
| django       | react, vue, htmx, django-templates                           |
| rails        | react, vue, stimulus, hotwire                                |
| spring       | react, angular, vue                                          |
| express/fastify/nestjs/hono | react, vue, angular, svelte               |
| fastapi      | react, vue, svelte                                           |

FULL-STACK FRAMEWORK RULE (critical — never pair these with a separate backend framework):
nextjs, nuxt, sveltekit, remix → these handle BOTH frontend AND API routes.
If user picks nextjs → DO NOT add express/fastify/nestjs as a separate backend node.`;
}

/**
 * Single authoritative component count decision tree.
 * Replaces getModeConstraints() + getComplexityGuidelines() signals.
 * Explicit precedence prevents competing constraints.
 */
function getComponentDecisionTree(
  mode: ArchitectureMode,
  complexity: ComplexityLevel,
  operationType: string,
  adjustedMin: number,
  adjustedMax: number,
): string {
  const modeGuidance: Record<ArchitectureMode, string> = {
    startup:
      "Bias toward LOWER end. Prefer full-stack frameworks that consolidate layers.",
    default:
      "Balance simplicity with best practices. Right-size for described scale.",
    enterprise:
      "Bias toward HIGHER end. Add monitoring, security, and redundancy nodes.",
  };

  const complexityRange: Record<ComplexityLevel, string> = {
    simple: "3–5 components",
    medium: "5–8 components",
    complex: "7–12 components",
  };

  const neverInclude = `NEVER include these unless explicitly requested or mode requires:
- CDN node: skip for <10K users, internal tools, or startup mode
- Load Balancer: skip for single-instance apps and startup mode
- Message Queue: skip unless async processing is explicitly needed
- Monitoring/Observability: skip for startup mode and simple apps
- WAF/Security node: only for enterprise mode
- API Gateway: only when multiple backend services need routing`;

  return `COMPONENT COUNT DECISION TREE (follow in order — do not skip steps):

STEP 1 — Start with complexity baseline: ${complexity.toUpperCase()} → ${complexityRange[complexity]}
STEP 2 — Apply mode modifier (${mode.toUpperCase()}): ${modeGuidance[mode]}
STEP 3 — Apply operation modifier: your adjusted range is MIN=${adjustedMin} to MAX=${adjustedMax}
STEP 4 — Final purpose check: for EVERY component you plan to include, ask:
          "Can I write a one-sentence justification for why this specific app needs this?"
          If NO → REMOVE IT.

${neverInclude}

ANTI-PATTERN EXAMPLES:
❌ WRONG — simple todo app with 9 nodes: Frontend + CDN + LB + Gateway + Backend + DB + Cache + Queue + Monitoring
   WHY WRONG: Simple apps don't need CDN/LB/Queue/Monitoring — this is cargo-cult architecture
✅ CORRECT — simple todo app with 3 nodes: Next.js App + PostgreSQL + Clerk Auth

❌ WRONG — enterprise SaaS with 3 nodes: Frontend + Backend + DB
   WHY WRONG: Enterprise mode requires observability, security, and redundancy
✅ CORRECT — enterprise SaaS with 8+ nodes: CDN + LB + Frontend + Backend + DB + Cache + Monitoring + WAF`;
}

/**
 * Mode-appropriate few-shot examples.
 * Shows the model exactly what correct output looks like.
 */
function getFewShotExamples(mode: ArchitectureMode): string {
  const startupExample = `EXAMPLE — Startup mode, simple todo app (prompt: "build a simple todo app"):
{
  "analysis": "Chose a Next.js monolith to eliminate ops overhead — a solo developer can ship and iterate without managing separate services.",
  "nodes": [
    { "id": "app-1", "type": "frontend", "position": {"x": 300, "y": 100},
      "data": { "label": "Next.js App", "description": "Full-stack app with API routes", "justification": "Handles both UI and API in one deployment — no separate backend needed for a todo app", "tech": "nextjs", "serviceType": "frontend" }},
    { "id": "db-1", "type": "database", "position": {"x": 200, "y": 350},
      "data": { "label": "PostgreSQL", "description": "Persistent task storage", "justification": "Relational DB for structured task data with user ownership queries", "tech": "postgresql", "serviceType": "database" }},
    { "id": "auth-1", "type": "saas", "position": {"x": 500, "y": 350},
      "data": { "label": "Clerk Auth", "description": "Managed user authentication", "justification": "Eliminates auth boilerplate — free tier covers startup scale", "tech": "clerk", "serviceType": "saas" }}
  ],
  "edges": [
    { "id": "e-1", "source": "app-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Read/Write Tasks" }},
    { "id": "e-2", "source": "app-1", "target": "auth-1", "animated": true, "data": { "protocol": "https", "label": "Auth Tokens & User Sessions" }}
  ]
}`;

  const defaultExample = `EXAMPLE — Default mode, SaaS dashboard (prompt: "build a SaaS analytics dashboard"):
{
  "analysis": "Separated frontend and backend to allow independent scaling of the API under analytics query load, with Redis caching to absorb repeated dashboard reads.",
  "nodes": [
    { "id": "cdn-1", "type": "gateway", "position": {"x": 300, "y": 50},
      "data": { "label": "Cloudflare CDN", "description": "Edge caching and DDoS protection", "justification": "Dashboard assets are static — CDN eliminates origin load for 80% of requests", "tech": "cloudflare", "serviceType": "gateway" }},
    { "id": "fe-1", "type": "frontend", "position": {"x": 300, "y": 200},
      "data": { "label": "React Dashboard", "description": "Interactive analytics UI with charts", "justification": "React ecosystem has the best charting libraries (Recharts, D3) for analytics use case", "tech": "react", "serviceType": "frontend" }},
    { "id": "api-1", "type": "backend", "position": {"x": 300, "y": 350},
      "data": { "label": "FastAPI Backend", "description": "REST API for analytics queries", "justification": "Python enables pandas/numpy for analytics processing; FastAPI is fastest Python framework", "tech": "fastapi", "serviceType": "backend" }},
    { "id": "db-1", "type": "database", "position": {"x": 150, "y": 500},
      "data": { "label": "PostgreSQL", "description": "Time-series analytics data", "justification": "TimescaleDB extension on Postgres handles time-series queries efficiently", "tech": "postgresql", "serviceType": "database" }},
    { "id": "cache-1", "type": "cache", "position": {"x": 450, "y": 500},
      "data": { "label": "Redis Cache", "description": "Dashboard query result cache", "justification": "Analytics queries are expensive — cache results for 5-minute windows to handle concurrent users", "tech": "redis", "serviceType": "cache" }}
  ],
  "edges": [
    { "id": "e-1", "source": "cdn-1", "target": "fe-1", "animated": true, "data": { "protocol": "https", "label": "Cached Assets" }},
    { "id": "e-2", "source": "fe-1", "target": "api-1", "animated": true, "data": { "protocol": "https", "label": "Analytics Queries" }},
    { "id": "e-3", "source": "api-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Raw Analytics Data" }},
    { "id": "e-4", "source": "api-1", "target": "cache-1", "animated": true, "data": { "protocol": "cache", "label": "Query Result Cache" }}
  ]
}`;

  const enterpriseExample = `EXAMPLE — Enterprise mode, fintech platform (prompt: "build an enterprise payment processing platform"):
{
  "analysis": "Separated auth, payment processing, and notifications into dedicated services behind a gateway to enable independent compliance auditing and zero-downtime updates to PCI-scoped components.",
  "nodes": [
    { "id": "waf-1", "type": "gateway", "position": {"x": 400, "y": 50},
      "data": { "label": "Cloudflare WAF", "description": "Web application firewall", "justification": "PCI-DSS requires WAF for cardholder data environments", "tech": "cloudflare", "serviceType": "gateway" }},
    { "id": "lb-1", "type": "gateway", "position": {"x": 400, "y": 150},
      "data": { "label": "Load Balancer", "description": "Traffic distribution with health checks", "justification": "Enterprise SLA requires zero single points of failure at the entry layer", "tech": "nginx", "serviceType": "gateway" }},
    { "id": "fe-1", "type": "frontend", "position": {"x": 200, "y": 280},
      "data": { "label": "React Frontend", "description": "Merchant dashboard and payment UI", "justification": "React with strict CSP headers for PCI-compliant cardholder data entry forms", "tech": "react", "serviceType": "frontend" }},
    { "id": "gw-1", "type": "gateway", "position": {"x": 500, "y": 280},
      "data": { "label": "API Gateway", "description": "Route and authenticate API requests", "justification": "Kong provides rate limiting, JWT validation, and audit logging required for PCI", "tech": "kong", "serviceType": "gateway" }},
    { "id": "pay-1", "type": "backend", "position": {"x": 300, "y": 420},
      "data": { "label": "Payment Service", "description": "PCI-scoped payment processing", "justification": "Isolated microservice limits PCI scope to a single deployable unit", "tech": "nestjs", "serviceType": "backend" }},
    { "id": "auth-1", "type": "backend", "position": {"x": 600, "y": 420},
      "data": { "label": "Auth Service", "description": "OAuth2/OIDC identity management", "justification": "Separate auth service enables SOC2-compliant access controls and audit trails", "tech": "nestjs", "serviceType": "backend" }},
    { "id": "db-1", "type": "database", "position": {"x": 200, "y": 570},
      "data": { "label": "PostgreSQL HA", "description": "Encrypted transaction storage", "justification": "Patroni HA cluster with column-level encryption for PCI cardholder data", "tech": "postgresql", "serviceType": "database" }},
    { "id": "monitor-1", "type": "saas", "position": {"x": 600, "y": 570},
      "data": { "label": "Datadog APM", "description": "Full-stack observability", "justification": "Enterprise SLA requires <1s P99 latency — Datadog provides distributed tracing across all services", "tech": "datadog", "serviceType": "saas" }}
  ],
  "edges": [
    { "id": "e-1", "source": "waf-1", "target": "lb-1", "animated": true, "data": { "protocol": "https", "label": "Filtered Traffic" }},
    { "id": "e-2", "source": "lb-1", "target": "fe-1", "animated": true, "data": { "protocol": "https", "label": "Web Requests" }},
    { "id": "e-3", "source": "lb-1", "target": "gw-1", "animated": true, "data": { "protocol": "https", "label": "API Requests" }},
    { "id": "e-4", "source": "gw-1", "target": "pay-1", "animated": true, "data": { "protocol": "https", "label": "Authenticated Payment Ops" }},
    { "id": "e-5", "source": "gw-1", "target": "auth-1", "animated": true, "data": { "protocol": "https", "label": "Token Validation" }},
    { "id": "e-6", "source": "pay-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Transaction Records" }},
    { "id": "e-7", "source": "pay-1", "target": "monitor-1", "animated": true, "data": { "protocol": "https", "label": "Metrics & Traces" }},
    { "id": "e-8", "source": "auth-1", "target": "monitor-1", "animated": true, "data": { "protocol": "https", "label": "Auth Events & Audit Log" }}
  ]
}`;

  if (mode === "startup") return startupExample;
  if (mode === "enterprise") return enterpriseExample;
  return defaultExample;
}

/**
 * Self-validation checklist appended at the end of the prompt.
 * Forces the model to verify its output before finalizing.
 */
function getSelfValidationChecklist(): string {
  return `SELF-VALIDATION — Before outputting JSON, verify ALL of these:
□ 1. Every node's "tech" is in the allowed set for its "type" (check the TECH VALIDATION MATRIX above)
□ 2. Component count is within the adjusted MIN–MAX range from the decision tree
□ 3. Every node (except the single entry point) has at least ONE incoming edge
□ 4. No full-stack framework (nextjs/nuxt/sveltekit/remix) is paired with a separate backend framework
□ 5. Backend frameworks (laravel/django/rails/spring/express/nestjs) are NEVER assigned to a "frontend" type node
□ 6. Edge "label" values describe actual data (e.g., "User Auth Tokens", "Task CRUD Ops") — NOT generic ("connects to", "API call")
□ 7. Edge "protocol" matches actual transport: database connections use "database", cache ops use "cache", queues use "queue"
□ 8. Every node has a non-empty "justification" explaining WHY this tech was chosen for THIS specific use case
□ 9. No unnecessary infrastructure (CDN/LB/WAF/Queue/Monitoring) for startup mode or simple complexity
□ 10. The "analysis" field is a SINGLE sentence that explains the most interesting design trade-off made

If ANY check fails → fix the output before returning it.`;
}

/**
 * Get architecture-specific guidelines
 */
function getArchitectureGuidelines(type: ArchitectureType): string {
  const guidelines: Record<ArchitectureType, string> = {
    "web-app": `Web Application Architecture:
- Layer 1: CDN (Cloudflare) → Load Balancer → Frontend (Next.js/React/Vue)
- Layer 2: API Gateway → Auth Service → Business Logic (Express/Fastify)
- Layer 3: Primary Database (PostgreSQL) → Cache (Redis) → Object Storage (S3)`,
    "ai-pipeline": `AI/ML Pipeline Architecture:
- Layer 1: API Gateway → Model Gateway → Rate Limiting
- Layer 2: Inference Service (GPU) → Queue (Kafka/SQS) → Training Pipeline
- Layer 3: Vector DB (Pinecone/pgvector) → Object Storage (S3) → Monitoring`,
    microservices: `Microservices Architecture:
- Layer 1: API Gateway (Kong/AWS) → Service Mesh (optional)
- Layer 2: Service Discovery → Auth Service → Business Services
- Layer 3: Message Bus (Kafka) → Event Store → Polyglot Persistence`,
    monolithic: `Monolithic Architecture:
- Layer 1: CDN → Load Balancer → Application Server
- Layer 2: Monolithic App (Django/Rails/Laravel/Next.js)
- Layer 3: Primary DB → Cache → Background Job Queue`,
    serverless: `Serverless Architecture:
- Layer 1: CDN → API Gateway → Authentication
- Layer 2: Functions (Lambda/Cloudflare Workers/Vercel)
- Layer 3: Managed DB (DynamoDB/PlanetScale) → Object Storage`,
    "data-pipeline": `Data Pipeline Architecture:
- Layer 1: Ingestion (Kafka/Kinesis/API) → Validation
- Layer 2: Processing (Spark/dbt/Airflow) → Transform
- Layer 3: Warehouse (Snowflake/BigQuery) → Analytics → Visualization`,
    "mobile-app": `Mobile Application Architecture:
- Layer 1: CDN → API Gateway → Push Notification Service
- Layer 2: Backend API → Auth → Business Logic
- Layer 3: Database → File Storage → Analytics`,
    "desktop-app": `Desktop Application Architecture:
- Layer 1: Auto-update Service → Analytics
- Layer 2: Desktop App (Electron/Tauri) → Local State
- Layer 3: Sync Service → Cloud Backup → Local DB (SQLite)`,
    "iot-system": `IoT System Architecture:
- Layer 1: Device Gateway (MQTT/CoAP) → Protocol Adapter
- Layer 2: Device Management → Rules Engine → Edge Computing
- Layer 3: Time-Series DB (InfluxDB) → Analytics → Dashboard`,
    blockchain: `Blockchain Architecture:
- Layer 1: Wallet Interface → DApp Frontend → Indexer
- Layer 2: Smart Contracts → Node RPC (Infura/Alchemy)
- Layer 3: Event Indexer (The Graph) → Off-chain Storage`,
    mixed: `Mixed Architecture:
Identify primary pattern and apply its guidelines. Use API Gateway to bridge different patterns if needed.`,
    unknown: `General Architecture:
Start with simple 3-tier: Frontend → API → Database. Add components based on scale requirements.`,
  };

  return guidelines[type];
}

/**
 * Get technology recommendations based on mode and complexity
 */
function getTechRecommendations(
  type: ArchitectureType,
  mode: ArchitectureMode,
  _complexity: ComplexityLevel,
): string {
  // Mode-specific tech preferences
  const startupTechs: Record<ArchitectureType, string> = {
    "web-app": `RECOMMENDED TECHNOLOGIES (Startup - Cost Optimized):
- Full-stack: Next.js (Vercel), Laravel (Railway), Django (Render)
- Database: PostgreSQL (managed), SQLite (very small apps)
- Auth: Clerk, Supabase Auth, NextAuth.js
- Hosting: Vercel, Railway, Render (free tiers available)
- Storage: Cloudflare R2 (free egress), Supabase Storage`,
    "ai-pipeline": `RECOMMENDED TECHNOLOGIES (Startup - Cost Optimized):
- Models: OpenAI API, Anthropic Claude (pay per use)
- Vector DB: Supabase pgvector (free tier), Pinecone (starter)
- Queue: Upstash Redis, Cloudflare Queues
- Hosting: Modal, Replicate (serverless GPU)`,
    microservices: `RECOMMENDED TECHNOLOGIES (Startup - SIMPLIFY):
⚠️ Consider monolith first! If microservices needed:
- Orchestration: Railway, Render (managed containers)
- Avoid Kubernetes (overkill for startups)
- Use managed message queues (Upstash, Cloudflare)`,
    monolithic: `RECOMMENDED TECHNOLOGIES (Startup - Perfect for MVPs):
- Framework: Next.js, Laravel, Django, AdonisJS, Ruby on Rails
- Database: PostgreSQL (managed)
- Cache: Redis (Upstash free tier)
- Hosting: Vercel, Railway, Render, Fly.io`,
    serverless: `RECOMMENDED TECHNOLOGIES (Startup - Cost Optimized):
- Functions: Vercel Functions, Cloudflare Workers, Netlify Functions
- Database: PlanetScale (MySQL), Supabase (PostgreSQL)
- Auth: Clerk, Auth0 (free tier)
- Perfect for variable traffic`,
    "data-pipeline": `RECOMMENDED TECHNOLOGIES (Startup - Managed Services):
- Orchestration: Airflow (managed), Prefect Cloud (free tier)
- Processing: Python + Pandas (small data), DuckDB
- Warehouse: BigQuery (sandbox), Snowflake (trial)
- Avoid self-hosting complex infrastructure`,
    "mobile-app": `RECOMMENDED TECHNOLOGIES (Startup - Fast to Market):
- Cross-platform: React Native (Expo), Flutter
- Backend: Firebase, Supabase (backend-as-a-service)
- Push: Firebase Cloud Messaging (free)
- Avoid building backend from scratch initially`,
    "desktop-app": `RECOMMENDED TECHNOLOGIES (Startup - Lightweight):
- Framework: Tauri (Rust, small bundle), Wails (Go)
- Avoid Electron (large bundle size)
- Updates: Tauri built-in updater
- Local DB: SQLite, libSQL (Turso)`,
    "iot-system": `RECOMMENDED TECHNOLOGIES (Startup - Managed IoT):
- Gateway: AWS IoT Core (pay per message), EMQX Cloud
- Protocol: MQTT (lightweight)
- Database: InfluxDB Cloud (time-series)
- Avoid self-hosting MQTT brokers initially`,
    blockchain: `RECOMMENDED TECHNOLOGIES (Startup - Web3):
- Network: Polygon (cheap), Base, Arbitrum
- Smart Contracts: Solidity, Hardhat
- RPC: Alchemy (free tier), Infura
- Indexing: The Graph (subgraphs)`,
    mixed: `RECOMMENDED TECHNOLOGIES (Startup):
- Focus on ONE primary stack
- Use managed services over self-hosted
- Prefer full-stack frameworks to reduce complexity`,
    unknown: `RECOMMENDED TECHNOLOGIES (Startup):
- Safest choice: Next.js + PostgreSQL + Vercel
- Alternative: Laravel + MySQL + Railway
- Both have generous free tiers and scale well`,
  };

  const defaultTechs: Record<ArchitectureType, string> = {
    "web-app": `RECOMMENDED TECHNOLOGIES:
- Frontend: Next.js, React, Vue, Angular
- Backend: Node.js/Express, Python/FastAPI, Go
- Database: PostgreSQL (primary), Redis (cache)
- Hosting: AWS, Vercel, Google Cloud
- CDN: Cloudflare or AWS CloudFront`,
    "ai-pipeline": `RECOMMENDED TECHNOLOGIES:
- API Gateway: Kong, AWS API Gateway
- AI/ML: OpenAI, Anthropic, self-hosted models
- Vector DB: Pinecone, Weaviate, pgvector
- Message Queue: Kafka, RabbitMQ, AWS SQS
- Compute: Kubernetes (GPU nodes) or serverless
- Storage: S3 for models and data`,
    microservices: `RECOMMENDED TECHNOLOGIES:
- API Gateway: Kong, Ambassador, AWS API Gateway
- Service Mesh: Istio or Linkerd (optional)
- Container Orchestration: Kubernetes
- Message Bus: Kafka, NATS, or RabbitMQ
- Service Discovery: Consul, etcd, or Kubernetes DNS
- Monitoring: Prometheus + Grafana + Jaeger`,
    monolithic: `RECOMMENDED TECHNOLOGIES:
- Framework: Next.js, Django, Rails, Laravel, Spring Boot
- Database: PostgreSQL or MySQL
- Cache: Redis
- Background Jobs: Bull, Celery, Sidekiq
- Hosting: Traditional VPS or PaaS (Heroku, Railway)`,
    serverless: `RECOMMENDED TECHNOLOGIES:
- Functions: AWS Lambda, Vercel Functions, Cloudflare Workers
- API: API Gateway or Function URLs
- Database: DynamoDB, PlanetScale, Supabase
- Storage: S3 or R2
- Auth: Auth0, Clerk, Cognito`,
    "data-pipeline": `RECOMMENDED TECHNOLOGIES:
- Orchestration: Apache Airflow, Prefect, Dagster
- Processing: Spark, dbt, custom Python
- Warehouse: Snowflake, BigQuery, Redshift
- Lake: S3 + Delta Lake or Iceberg
- Streaming: Kafka, Kinesis, Pub/Sub`,
    "mobile-app": `RECOMMENDED TECHNOLOGIES:
- Cross-platform: React Native, Flutter, Ionic
- Native: Swift (iOS), Kotlin (Android)
- Backend: Firebase, Supabase, custom API
- Push: Firebase Cloud Messaging, OneSignal
- Storage: Firebase Storage, S3`,
    "desktop-app": `RECOMMENDED TECHNOLOGIES:
- Framework: Electron, Tauri, Wails
- State: Redux, Zustand, Vuex
- Storage: SQLite, IndexedDB, local files
- Updates: Electron-updater, Tauri built-in
- Build: Electron Builder, Tauri CLI`,
    "iot-system": `RECOMMENDED TECHNOLOGIES:
- Protocol: MQTT (Mosquitto, EMQX) or CoAP
- Gateway: AWS IoT Core, Azure IoT Hub
- Edge: AWS Greengrass, custom
- Database: InfluxDB (time-series), PostgreSQL
- Analytics: AWS IoT Analytics, custom pipeline`,
    blockchain: `RECOMMENDED TECHNOLOGIES:
- Network: Ethereum, Polygon, Solana
- Smart Contracts: Solidity, Rust
- Node: Geth, Parity, managed (Infura, Alchemy)
- Wallet: MetaMask, WalletConnect
- Indexing: The Graph`,
    mixed: `RECOMMENDED TECHNOLOGIES:
- Identify primary component and use its stack
- Use API Gateway to bridge different patterns
- Consider event-driven communication`,
    unknown: `RECOMMENDED TECHNOLOGIES:
- Frontend: Next.js or React
- Backend: Node.js/Express or Python/FastAPI
- Database: PostgreSQL
- Hosting: Vercel or Railway`,
  };

  const corporateTechs: Record<ArchitectureType, string> = {
    "web-app": `RECOMMENDED TECHNOLOGIES (Enterprise):
- Frontend: Next.js (enterprise features), Angular
- Backend: Java/Spring, .NET, Node.js/NestJS
- Database: PostgreSQL (HA), Oracle, SQL Server
- Cache: Redis Cluster, Memcached
- CDN: AWS CloudFront, Akamai
- WAF: AWS WAF, Cloudflare Enterprise
- Monitoring: Datadog, New Relic, Dynatrace`,
    "ai-pipeline": `RECOMMENDED TECHNOLOGIES (Enterprise):
- Models: Self-hosted (security), Azure OpenAI
- Vector DB: Pinecone Enterprise, Weaviate
- Queue: Confluent Kafka, AWS MSK
- GPU: AWS SageMaker, Azure ML
- Security: VPC, encryption at rest/transit
- Compliance: SOC2, GDPR tooling`,
    microservices: `RECOMMENDED TECHNOLOGIES (Enterprise):
- Platform: Kubernetes (EKS, AKS, GKE)
- Service Mesh: Istio, Linkerd
- API Gateway: Kong Enterprise, AWS API Gateway
- Observability: Datadog, Splunk, ELK
- Security: Vault, cert-manager
- GitOps: ArgoCD, Flux`,
    monolithic: `RECOMMENDED TECHNOLOGIES (Enterprise):
- Framework: Spring Boot, .NET Core, Django
- Database: PostgreSQL (patroni), Oracle RAC
- Cache: Redis Sentinel/Cluster
- Message Queue: RabbitMQ, ActiveMQ
- Monitoring: APM tools, custom dashboards
- DR: Multi-region, automated backups`,
    serverless: `RECOMMENDED TECHNOLOGIES (Enterprise):
- Platform: AWS Lambda, Azure Functions
- API: API Gateway with WAF
- Database: DynamoDB (global tables), Aurora Serverless
- Security: IAM, KMS, Secrets Manager
- Compliance: CloudTrail, Config
- Monitoring: X-Ray, CloudWatch`,
    "data-pipeline": `RECOMMENDED TECHNOLOGIES (Enterprise):
- Orchestration: Airflow (MWAA), Prefect Enterprise
- Processing: Spark (EMR), Databricks
- Warehouse: Snowflake Enterprise, BigQuery
- Governance: Collibra, Alation
- Security: Column-level encryption, row-level security
- Lineage: Apache Atlas, DataHub`,
    "mobile-app": `RECOMMENDED TECHNOLOGIES (Enterprise):
- MDM: MobileIron, VMware Workspace ONE
- Security: Certificate pinning, app attestation
- Backend: Enterprise API Gateway
- Analytics: Segment, Amplitude
- Push: OneSignal Enterprise, Braze
- Testing: Firebase Test Lab, AWS Device Farm`,
    "desktop-app": `RECOMMENDED TECHNOLOGIES (Enterprise):
- Framework: Electron (signed), WPF, Cocoa
- Security: Code signing, sandboxing
- Updates: Enterprise auto-updater
- SSO: SAML, OIDC integration
- Analytics: Pendo, Amplitude
- Support: Intercom, Zendesk integration`,
    "iot-system": `RECOMMENDED TECHNOLOGIES (Enterprise):
- Platform: AWS IoT Core, Azure IoT Hub
- Security: Device certificates, JIT provisioning
- Edge: AWS Greengrass, Azure IoT Edge
- Database: InfluxDB Enterprise, TimescaleDB
- Analytics: AWS IoT Analytics, Azure Stream Analytics
- Device Management: AWS IoT Device Management`,
    blockchain: `RECOMMENDED TECHNOLOGIES (Enterprise):
- Platform: Hyperledger Fabric, R3 Corda
- Network: Private/consortium chains
- Security: HSM, multi-sig wallets
- Integration: Enterprise middleware
- Compliance: Transaction monitoring
- Governance: On-chain voting mechanisms`,
    mixed: `RECOMMENDED TECHNOLOGIES (Enterprise):
- API Gateway: Kong Enterprise, Apigee
- Integration: MuleSoft, Boomi
- Security: OAuth2, OIDC, mutual TLS
- Monitoring: Datadog, Splunk
- Compliance: Automated audit trails`,
    unknown: `RECOMMENDED TECHNOLOGIES (Enterprise):
- Platform: Kubernetes (EKS/AKS/GKE)
- Database: PostgreSQL Enterprise, Oracle
- Security: WAF, DDoS protection
- Monitoring: Datadog, New Relic
- Compliance: SOC2, ISO 27001 tooling`,
  };

  if (mode === "startup") return startupTechs[type];
  if (mode === "enterprise") return corporateTechs[type];
  return defaultTechs[type];
}

/**
 * Build an optimized system prompt based on context
 */
export function buildEnhancedSystemPrompt(context: PromptContext): string {
  const {
    userInput,
    currentNodes,
    currentEdges,
    mode,
    conversationHistory,
    operationType,
    userPreferences,
    preferenceFitSummary,
  } = context;

  const complexity = detectComplexity(userInput);
  const detection = detectArchitectureType(userInput);
  const effectiveMode = normalizeArchitectureMode(mode);
  const modeConstraints = MODE_CONSTRAINTS[effectiveMode];
  const countAdjustment = getComponentCountAdjustment(
    operationType || "create",
  );
  const shouldRelax = shouldRelaxConstraints(operationType || "create");

  const adjustedMin = Math.max(
    1,
    modeConstraints.minComponents + countAdjustment.minAdjustment,
  );
  const adjustedMax = Math.max(
    adjustedMin,
    modeConstraints.maxComponents + countAdjustment.maxAdjustment,
  );

  // ── CURRENT ARCHITECTURE CONTEXT (modification mode) ──────────────────────
  let currentArchitectureContext = "";
  if (currentNodes && currentNodes.length > 0) {
    const nodes = currentNodes;
    const edges = currentEdges || [];
    const architectureNodes = nodes.filter(
      (n: any) =>
        n.type !== "stickyNote" &&
        n.type !== "text" &&
        n.type !== "group" &&
        n.type !== "frame",
    );
    const customNodes = nodes.filter(
      (n: any) =>
        n.type === "stickyNote" ||
        n.type === "text" ||
        n.type === "group" ||
        n.type === "frame",
    );

    const operationInstructions = getOperationInstructions(
      operationType || "modify",
    );

    const archNodeLines = architectureNodes
      .map(
        (n: any) =>
          "  \u2022 " +
          (n.data?.label || n.id) +
          " [type=" +
          n.type +
          ", tech=" +
          (n.data?.tech || "unknown") +
          "]: " +
          (n.data?.description || ""),
      )
      .join("\n");

    const customNodeLines =
      customNodes.length > 0
        ? "\nUser annotations (preserve these exactly):\n" +
          customNodes
            .map((n: any) =>
              n.type === "text"
                ? `  \u2022 Text: "${n.data?.label || ""}"`
                : `  \u2022 Shape: ${n.data?.label || n.id} (${n.type})`,
            )
            .join("\n")
        : "";

    currentArchitectureContext = `
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
PHASE 0 \u2014 CURRENT STATE (you are MODIFYING, not creating from scratch)
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
Existing components (${architectureNodes.length} nodes, ${edges.length} edges):
${archNodeLines}${customNodeLines}

OPERATION: ${operationInstructions}

PRESERVATION RULES:
1. Keep existing node IDs where possible
2. Only modify components explicitly mentioned in the request
3. Maintain connections unless they involve removed/replaced components
4. Preserve ALL custom annotations/text shapes \u2014 they are user notes`;
  }

  // ── CONVERSATION CONTEXT ───────────────────────────────────────────────────
  let conversationContext = "";
  if (conversationHistory && conversationHistory.length > 0) {
    const history = conversationHistory.slice(-10);
    const previousRequests = history
      .filter((m) => m.role === "user")
      .map((m, i) => `  ${i + 1}. "${m.content.substring(0, 150)}"`);

    if (previousRequests.length > 0) {
      conversationContext = `
CONVERSATION HISTORY (build upon or adapt the previous direction):
${previousRequests.join("\n")}
→ Current request: "${userInput}"
NOTE: If the user is changing direction entirely (e.g. "todo app" → "Netflix clone"), acknowledge the pivot and redesign from scratch.`;
    }
  }

  // ── USER PREFERENCES ───────────────────────────────────────────────────────
  const resolvedPreferenceFit =
    preferenceFitSummary ||
    summarizePreferenceFit(userPreferences, effectiveMode, detection.type);
  let preferencesBlock = "";
  if (userPreferences) {
    const {
      cloudProviders,
      languages,
      frameworks,
      architectureTypes,
      applicationType,
      customInstructions,
      onboardingMetadata,
    } = userPreferences;
    const prefLines: string[] = [];

    const clouds = (cloudProviders || [])
      .filter((c) => c !== "Generic")
      .map((c) => c.toUpperCase());
    if (clouds.length > 0) prefLines.push(`  • Cloud: ${clouds.join(", ")}`);
    else if (
      userPreferences.cloudProvider &&
      userPreferences.cloudProvider !== "Generic"
    )
      prefLines.push(
        `  • Cloud: ${userPreferences.cloudProvider.toUpperCase()}`,
      );

    const langs =
      languages || (userPreferences.language ? [userPreferences.language] : []);
    if (langs.length > 0)
      prefLines.push(
        `  • Languages: ${langs.map((l) => l.toUpperCase()).join(", ")}`,
      );

    const fws =
      frameworks ||
      (userPreferences.framework ? [userPreferences.framework] : []);
    if (fws.length > 0)
      prefLines.push(
        `  • Frameworks: ${fws.map((f) => f.toUpperCase()).join(", ")} — see FRAMEWORK ECOSYSTEM RULES for correct frontend tech`,
      );

    if (architectureTypes && architectureTypes.length > 0)
      prefLines.push(
        `  • Architecture Patterns: ${architectureTypes.join(", ")} (apply where relevant)`,
      );

    if (applicationType && applicationType.length > 0)
      prefLines.push(`  • Application Type: ${applicationType.join(", ")}`);

    if (customInstructions?.trim())
      prefLines.push(
        `  • Custom Instructions (follow strictly): "${customInstructions}"`,
      );

    if (onboardingMetadata) {
      const { experienceLevel, teamSize, includeServices } = onboardingMetadata;
      if (experienceLevel === "beginner")
        prefLines.push(
          "  • Experience: Beginner — use well-documented, simple solutions",
        );
      if (experienceLevel === "advanced")
        prefLines.push(
          "  • Experience: Advanced — optimize for performance and production patterns",
        );
      if (teamSize === "solo")
        prefLines.push(
          "  • Team: Solo — keep architecture manageable by one developer",
        );
      if (teamSize === "enterprise")
        prefLines.push(
          "  • Team: Enterprise — design for team collaboration with clear service boundaries",
        );
      const enabledServices = Object.entries(includeServices || {})
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (enabledServices.length > 0)
        prefLines.push(`  • Required Services: ${enabledServices.join(", ")}`);
    }

    if (prefLines.length > 0) {
      preferencesBlock = `
USER PREFERENCES (apply contextually per layer — not blindly to every node):
${prefLines.join("\n")}

PREFERENCE FIT SUMMARY:
  • Normalized: ${resolvedPreferenceFit.normalizedPreferences.join(", ") || "none"}
  • Overlap opportunities: ${resolvedPreferenceFit.overlapOpportunities.join(", ") || "none"}
  • Likely conflicts: ${resolvedPreferenceFit.likelyConflicts.join(", ") || "none"}
  • Directive: ${resolvedPreferenceFit.promptDirective}`;
    }
  }

  // ── TECH KNOWLEDGE INJECTION ───────────────────────────────────────────────
  const techKnowledge = getTechKnowledgeInjection(detection.type, userInput);

  // ── ASSEMBLE FINAL PROMPT ──────────────────────────────────────────────────
  return `You are an expert Solutions Architect specializing in ${detection.type.replace(/-/g, " ")} design.
${currentArchitectureContext}
${conversationContext}

═══════════════════════════════════════════════════
PHASE 1 — UNDERSTAND THE REQUEST
═══════════════════════════════════════════════════
User Request: "${userInput}"
DETECTED ARCHITECTURE: ${detection.type}
Detected Architecture: ${detection.type} (${Math.round(detection.confidence * 100)}% confidence)
COMPLEXITY: ${complexity.toUpperCase()}
Detected Complexity: ${complexity.toUpperCase()}
Operation: ${(operationType || "create").toUpperCase()}
Mode: ${effectiveMode.toUpperCase()} — ${MODE_CONSTRAINTS[effectiveMode].description}
${preferencesBlock}

═══════════════════════════════════════════════════
PHASE 2 — DECIDE (think through these steps BEFORE writing any JSON)
═══════════════════════════════════════════════════
${getComponentDecisionTree(effectiveMode, complexity, operationType || "create", adjustedMin, adjustedMax)}

ARCHITECTURE DECISION PRIORITY:
1. Choose the best architecture for the requirements and selected mode.
2. In enterprise mode, best architecture comes first even when user preferences conflict.
3. User preferences are soft constraints unless the user explicitly marks them mandatory.
4. Reuse preferences only when they strengthen or do not materially weaken the architecture.
5. If there is conflict, produce the strongest recommendation first and then a preference-aligned alternative.

${techKnowledge}

═══════════════════════════════════════════════════
PHASE 3 — HARD CONSTRAINTS (never violate)
═══════════════════════════════════════════════════
${getTechValidationMatrix()}

FRAMEWORK COMPATIBILITY:
Use the framework ecosystem rules above. Never combine full-stack frameworks with redundant standalone backends.

POSITIONING GUIDELINES:
  Layer 1 (Entry/Edge): y: 50–150   → CDN, WAF, Load Balancer, API Gateway, Frontend
  Layer 2 (Application): y: 200–380 → Services, Auth, Workers, AI, Backend API
  Layer 3 (Data): y: 420–560        → Databases, Cache, Storage, Queues
  Horizontal spacing: 200–300px between nodes at the same layer
  NOTE: Full-stack frameworks (Next.js, Laravel, Django, Rails) often consolidate layers 1+2.
        Only separate them if high-scale distribution is explicitly needed.

CRITICAL OUTPUT RULES:
  - Minimum components: ${adjustedMin}
  - Maximum components: ${adjustedMax}
  1. Never exceed ${adjustedMax} components
  2. Never use fewer than ${adjustedMin} components${shouldRelax ? ` (relaxed for ${operationType} operation)` : ""}
  3. Never mix full-stack frameworks with separate backend frameworks (nextjs + express = INVALID)
  4. ${currentNodes && currentNodes.length > 0 ? "Preserve existing node IDs where possible — only change what was requested" : "Generate all new components with unique IDs"}
  5. EVERY third-party integration (Stripe, SendGrid, Twilio, etc.) must be its own "external" or "saas" node — never embed them in a backend node description

═══════════════════════════════════════════════════
PHASE 4 — BUILD (write the JSON architecture)
═══════════════════════════════════════════════════
Architecture pattern for ${detection.type}:
${getArchitectureGuidelines(detection.type)}

Technology context for your decisions:
${getTechRecommendations(detection.type, effectiveMode, complexity)}

═══════════════════════════════════════════════════
PHASE 5 — VALIDATE THEN OUTPUT
═══════════════════════════════════════════════════
${getSelfValidationChecklist()}

REQUIRED JSON FORMAT:
{
  "analysis": "Single sentence: the most important design trade-off or decision made",
  "selectedArchitectureStrategy": "Short explanation of why this architecture was selected first",
  "preferenceConflicts": ["Brief note for each user preference that was downgraded or rejected"],
  "recommendedStack": ["Primary stack choices optimized for the requested mode and requirements"],
  "preferenceAlignedAlternative": ["Closest viable stack variation that keeps compatible user preferences"],
  "nodes": [
    {
      "id": "unique-kebab-id",
      "type": "frontend|backend|database|gateway|cache|queue|ai|storage|external|saas|compute",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Display Name",
        "description": "One sentence: what this component does",
        "justification": "One sentence: WHY this specific tech for this specific use case",
        "tech": "technology-id-from-matrix",
        "serviceType": "same-value-as-type"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "animated": true,
      "data": {
        "protocol": "https|http|websocket|grpc|database|cache|queue",
        "label": "Specific data description (e.g. 'JWT Auth Token', 'User Cart State', 'Payment Events')"
      }
    }
  ]
}

REFERENCE EXAMPLE FOR THIS MODE (${effectiveMode.toUpperCase()}):
${getFewShotExamples(effectiveMode)}

CONNECTION REQUIREMENTS:
  1. EVERY node except the single entry point must have at least ONE incoming edge
  2. Edge labels must name SPECIFIC data (not generic "data" or "request")
  3. Use "animated": true on all edges
  4. Protocol must match transport: database connections → "database", Redis ops → "cache", queue sends → "queue"

Now generate the complete JSON architecture. Start directly with {"analysis":`;
}

export function getTechKnowledgeInjection(
  type: ArchitectureType,
  userInput: string,
): string {
  const categories = new Set<string>();
  const inputLower = userInput.toLowerCase();

  // Always include core categories
  categories.add("frontend");
  categories.add("backend");
  categories.add("database");
  categories.add("cloud");

  // Context-aware additions
  if (
    type.includes("ai") ||
    inputLower.includes("ai") ||
    inputLower.includes("agent")
  ) {
    categories.add("ai");
    categories.add("vector-db");
  }
  if (
    type === "microservices" ||
    inputLower.includes("platform") ||
    inputLower.includes("devops")
  ) {
    categories.add("devops");
    categories.add("container");
  }
  if (
    inputLower.includes("realtime") ||
    inputLower.includes("socket") ||
    inputLower.includes("collab")
  ) {
    categories.add("realtime");
  }

  const knowledgeEntries = Object.values(TECH_KNOWLEDGE_BASE)
    .filter(
      (tech) =>
        categories.has(tech.category) ||
        (categories.has("frontend") && tech.category === "frontend"),
    ) // Simpler filter for now, can refine
    .filter((_tech) => {
      // Optional: Filter by specific matching keywords if context is huge,
      // but for now we inject the curated list which is ~30 items.
      // We can optimize to top 3 per category if needed.
      return true;
    })
    .map(
      (tech) =>
        `- ${tech.name}: ${tech.description} (Best for: ${tech.bestFor.join(", ")})`,
    )
    .join("\n");

  return `Tech Stack Selection Guidelines:
1. UNBIASED SELECTION: Do NOT blindly favor trending tools. "New" != "Best".
2. MATCH REQUIREMENTS:
   - For PREDICTABILITY/STABILITY: Choose proven stacks (e.g., Laravel, Rails, Django, Go, Java).
   - For PERFORMANCE/EDGE: Choose modern runtimes (e.g., Bun, Hono, Rust, Go).
   - For RAPID MVP: Choose all-inclusive frameworks (e.g., Next.js, Laravel, Rails).
3. THIRD-PARTY INTEGRATIONS: If the user requests specific third-party integrations (e.g., Stripe, SendGrid, Twilio), you MUST create dedicated nodes for them of type 'external' or 'saas' rather than embedding them inside backend components.
4. 2026 KNOWLEDGE BASE (Use if relevant to constraints):
${knowledgeEntries}
`;
}

function generateInternalGuidance(metadata: {
  role: string;
  useCase: string;
  teamSize: string;
  experienceLevel: string;
  includeServices: Record<string, boolean>;
}): string {
  const parts: string[] = [];

  // Add experience context
  if (metadata.experienceLevel === "beginner") {
    parts.push(
      "- Focus on simple, well-documented solutions with clear explanations.",
    );
  } else if (metadata.experienceLevel === "advanced") {
    parts.push(
      "- Optimize for performance, scalability, and production-ready patterns.",
    );
  }

  // Add team context
  if (metadata.teamSize === "solo") {
    parts.push(
      "- Keep architecture simple and manageable by a single developer.",
    );
  } else if (metadata.teamSize === "enterprise") {
    parts.push(
      "- Design for team collaboration with clear service boundaries.",
    );
  }

  // Add service preferences
  const services = Object.entries(metadata.includeServices || {})
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);
  if (services.length > 0) {
    parts.push(
      `- Ensure ${services.join(", ")} are properly integrated into the architecture.`,
    );
  }

  return parts.join("\n");
}
