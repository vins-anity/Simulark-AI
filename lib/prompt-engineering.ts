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
  };
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

/**
 * Get mode-specific component constraints
 */
function getModeConstraints(mode: ArchitectureMode): string {
  const constraints = MODE_CONSTRAINTS[mode];

  let guidelines = `MODE: ${mode.toUpperCase()}
${constraints.description}

CONSTRAINTS:
- Minimum components: ${constraints.minComponents}
- Maximum components: ${constraints.maxComponents}`;

  if (mode === "startup") {
    guidelines += `
- PREFER FULL-STACK FRAMEWORKS (Next.js, Laravel, Django, Rails, AdonisJS)
- AVOID unnecessary infrastructure (skip CDN, Load Balancer for simple apps)
- Focus on SPEED and COST (use managed services, avoid self-hosted)
- Single database is fine (no need for separate cache layer for small apps)
- Simple auth solution (Clerk, Supabase Auth, not self-hosted)`;
  } else if (mode === "enterprise") {
    guidelines += `
- REQUIRE full redundancy and failover
- Include monitoring/observability (Datadog, New Relic, or Grafana)
- Separate concerns (frontend/backend)
- Include CDN and Load Balancer
- Security-first approach (WAF, encryption at rest/transit)
- Compliance considerations (GDPR, SOC2)`;
  } else {
    guidelines += `
- Balance between simplicity and best practices
- Use CDN for static assets
- Include basic monitoring
- Right-size infrastructure for expected scale`;
  }

  return guidelines;
}

/**
 * Get framework compatibility rules
 */
function getFrameworkCompatibilityRules(): string {
  return `FRAMEWORK COMPATIBILITY RULES (CRITICAL):

INCOMPATIBLE COMBINATIONS - NEVER USE THESE TOGETHER:
1. Full-stack frameworks + Backend frameworks:
   - ❌ Next.js + Express (Next.js has API routes)
   - ❌ Nuxt + Fastify (Nuxt has server API)
   - ❌ SvelteKit + NestJS (SvelteKit handles backend)

2. Traditional MVC + Modern frameworks:
   - ❌ Laravel + Express (different ecosystems)
   - ❌ Django + Fastify (use Django's built-in)
   - ❌ Rails + Hono (Rails is full-stack)

CORRECT APPROACHES:
1. Full-stack single framework:
   - ✅ Next.js (handles frontend + API)
   - ✅ Laravel (handles frontend + backend)
   - ✅ Django (handles frontend + backend)
   - ✅ AdonisJS (handles frontend + backend)

2. Frontend + Backend separation:
   - ✅ React + Express
   - ✅ Vue + Fastify
   - ✅ React + Hono
   - ✅ Svelte + Elysia

3. API-only backend:
   - ✅ Express (REST API)
   - ✅ Fastify (high-performance API)
   - ✅ Hono (lightweight, Bun-optimized)
   - ✅ Elysia (Bun-optimized, type-safe)`;
}

/**
 * Get complexity-based architecture guidelines
 */
function getComplexityGuidelines(complexity: ComplexityLevel): string {
  const guidelines: Record<ComplexityLevel, string> = {
    simple: `COMPLEXITY: SIMPLE (3-5 components max)
- Minimal infrastructure
- Single database sufficient
- No message queues unless explicitly requested
- Simple auth (managed service)
- Skip CDN for truly simple apps (< 1000 users)`,
    medium: `COMPLEXITY: MEDIUM (4-7 components)
- Include CDN for static assets
- Add Redis cache for performance
- Include monitoring basics
- Proper auth service separation
- Add message queue if async processing needed`,
    complex: `COMPLEXITY: COMPLEX (6-12 components)
- Full microservices or highly scalable monolith
- Multiple data stores (primary + cache + search)
- Message queues for async processing
- Load balancing and auto-scaling
- Comprehensive observability
- Security layers (WAF, encryption)`,
  };

  return guidelines[complexity];
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
    architectureType,
    detectedIntent,
    currentNodes,
    currentEdges,
    mode,
    conversationHistory,
    operationType,
    userPreferences,
  } = context;

  // Detect complexity if not provided
  const complexity = detectComplexity(userInput);
  const detection = detectArchitectureType(userInput);

  // Get constraints
  const modeConstraints = MODE_CONSTRAINTS[mode];
  const countAdjustment = getComponentCountAdjustment(
    operationType || "create",
  );
  const shouldRelax = shouldRelaxConstraints(operationType || "create");

  // Format existing nodes for context
  let currentArchitectureContext = "";
  let architectureNodes: any[] = [];
  let customNodes: any[] = [];
  let nodeCount = 0;
  let edgeCount = 0;

  if (currentNodes && currentNodes.length > 0) {
    const nodes = currentNodes;
    const edges = currentEdges || [];
    nodeCount = nodes.length;
    edgeCount = edges.length;

    // Separate functional nodes from decorative/custom nodes
    architectureNodes = nodes.filter(
      (n: any) =>
        n.type !== "stickyNote" &&
        n.type !== "text" &&
        n.type !== "group" &&
        n.type !== "frame",
    );
    customNodes = nodes.filter(
      (n: any) =>
        n.type === "stickyNote" ||
        n.type === "text" ||
        n.type === "group" ||
        n.type === "frame",
    );

    const operationInstructions = getOperationInstructions(
      operationType || "modify",
    );

    currentArchitectureContext = `
CURRENT STATE:
You are MODIFYING an existing architecture with ${nodeCount} components and ${edgeCount} connections.

Existing Architecture Components (${architectureNodes.length}):
${architectureNodes
  .map(
    (n: any) =>
      `- ${n.data?.label || n.id} (${n.type}): ${n.data?.description || "No description"}`,
  )
  .join("\n")}

${
  customNodes.length > 0
    ? `
Custom Annotations & Shapes (${customNodes.length}):
${customNodes
  .map(
    (n: any) =>
      `- ${n.type === "text" ? `Text: "${n.data?.label || ""}"` : `Shape: ${n.data?.label || n.id} (${n.type})`}`,
  )
  .join("\n")}

NOTE: Preserve these custom annotations when modifying the architecture. They represent user-added notes and visual elements.
`
    : ""
}

IMPORTANT: ${operationInstructions}

PRESERVATION RULES:
1. Keep existing node IDs where possible
2. Only modify components explicitly mentioned in the request
3. Maintain connections unless they involve removed components
4. Preserve the overall architecture pattern unless changing it entirely
5. Always preserve custom shapes and text annotations - these are user-created elements`;
  }

  // Build conversation context analysis
  let conversationContext = "";
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    const history = context.conversationHistory.slice(-10); // Last 10 messages
    const previousRequests = history
      .filter((m) => m.role === "user")
      .map((m) => m.content.substring(0, 150));

    if (previousRequests.length > 0) {
      conversationContext = `
CONVERSATION CONTEXT:
This is a continuing conversation. Previous requests:
${previousRequests.map((req, i) => `${i + 1}. "${req}"`).join("\n")}

Current request: "${context.userInput}"

INSTRUCTION: Build upon or modify the previous architecture based on this conversation flow. If the user is changing direction (e.g., from "todo app" to "Netflix"), acknowledge the pivot and adapt the architecture accordingly.`;
    }
  }

  // Adjust component constraints for operations like simplify/remove
  const adjustedMin = Math.max(
    1,
    modeConstraints.minComponents + countAdjustment.minAdjustment,
  );
  const adjustedMax = Math.max(
    adjustedMin,
    modeConstraints.maxComponents + countAdjustment.maxAdjustment,
  );

  // Skip complexity-based component limits for now
  const componentGuidelines = `COMPONENT GUIDELINES:
${getModeConstraints(context.mode)}
${getComplexityGuidelines(complexity)}

${getFrameworkCompatibilityRules()}`;

  let techRecommendations = getTechRecommendations(
    detection.type,
    context.mode,
    complexity,
  );

  const architectureGuidelines = getArchitectureGuidelines(detection.type);

  if (context.userPreferences) {
    const { cloudProviders, languages, frameworks } = context.userPreferences;
    const prefParts = [];

    // Handle Cloud Providers
    if (cloudProviders && cloudProviders.length > 0) {
      const clouds = cloudProviders
        .filter((c) => c !== "Generic")
        .map((c) => c.toUpperCase())
        .join(", ");
      if (clouds) prefParts.push(`- Cloud Providers: ${clouds}`);
    } else if (
      context.userPreferences.cloudProvider &&
      context.userPreferences.cloudProvider !== "Generic"
    ) {
      // Legacy fallback
      prefParts.push(
        `- Cloud Provider: ${context.userPreferences.cloudProvider.toUpperCase()}`,
      );
    }

    // Handle Languages
    if (languages && languages.length > 0) {
      prefParts.push(
        `- Programming Languages: ${languages.map((l) => l.toUpperCase()).join(", ")}`,
      );
    } else if (context.userPreferences.language) {
      // Legacy fallback
      prefParts.push(
        `- Programming Language: ${context.userPreferences.language.toUpperCase()}`,
      );
    }

    // Handle Frameworks
    if (frameworks && frameworks.length > 0) {
      prefParts.push(
        `- Core Frameworks: ${frameworks.map((f) => f.toUpperCase()).join(", ")}`,
      );
    } else if (context.userPreferences.framework) {
      // Legacy fallback
      prefParts.push(
        `- Core Framework: ${context.userPreferences.framework.toUpperCase()}`,
      );
    }

    if (prefParts.length > 0) {
      techRecommendations += `\n\nUSER PREFERRED STACK (MANDATORY):\n${prefParts.join("\n")}\n\nPrioritize these technologies. If conflicting options are present, choose the best fit for the detected pattern.`;
    }

    // Handle Architecture Preferences (Patterns)
    if (
      context.userPreferences.architectureTypes &&
      context.userPreferences.architectureTypes.length > 0
    ) {
      techRecommendations += `\n\nPREFERRED ARCHITECTURE PATTERNS:\n${context.userPreferences.architectureTypes.join(", ")}\n\nincorporate these architectural styles where applicable.`;
    }

    // Handle Application Type
    if (
      context.userPreferences.applicationType &&
      context.userPreferences.applicationType.length > 0
    ) {
      techRecommendations += `\n\nTARGET APPLICATION TYPE:\n${context.userPreferences.applicationType.join(", ")}\n\nOptimize the architecture for this specific type of application.`;
    }

    // Handle Custom User Instructions
    if (context.userPreferences.customInstructions) {
      techRecommendations += `\n\nCUSTOM USER INSTRUCTIONS:\n"${context.userPreferences.customInstructions}"\n\nFollow these specific instructions strictly.`;
    }
  }

  // Full prompt
  return `You are an expert Solutions Architect specializing in ${detection.type.replace("-", " ")} design.

USER REQUEST: "${context.userInput}"
${currentArchitectureContext}
${conversationContext}

OPERATION TYPE: ${operationType ? operationType.toUpperCase() : "CREATE"}
DETECTED ARCHITECTURE: ${detection.type}
CONFIDENCE: ${Math.round(detection.confidence * 100)}%

${componentGuidelines}

${architectureGuidelines}

${componentGuidelines}

${getTechKnowledgeInjection(detection.type, context.userInput)}

${architectureGuidelines}

${techRecommendations}

TECHNOLOGY ECOSYSTEM:
Use these exact technology IDs when possible:
- Full-stack: nextjs, nuxt, sveltekit, laravel, django, rails, adonisjs
- Frontend: react, vue, angular, svelte
- Backend: express, fastify, nestjs, hono, elysia
- Database: postgresql, mysql, mongodb, redis, sqlite
- Cloud: aws, vercel, railway, render, cloudflare
- AI/ML: openai, anthropic, pinecone, weaviate
- Auth: clerk, auth0, firebase-auth
- Cache: redis, memcached
- Queue: rabbitmq, kafka, sqs
- Storage: s3, cloudflare-r2
- Monitoring: datadog, newrelic, grafana

IMPORTANT: Always include the "tech" field with the specific technology ID (e.g., "tech": "nextjs" or "tech": "postgresql"). This enables proper icon rendering.

POSITIONING GUIDELINES:
- Layer 1 (Entry): y: 50-150 (CDN, Load Balancer, API Gateway, Frontend)
- Layer 2 (Application): y: 200-350 (Services, Auth, Workers, AI)
- Layer 3 (Data): y: 400-500 (Databases, Cache, Storage, Queues)
- Spread horizontally: x spacing 200-300px

CRITICAL RULES:
1. Never exceed ${adjustedMax} components
2. Never use less than ${adjustedMin} components${shouldRelax ? ` (relaxed for ${operationType})` : ""}
3. Never mix full-stack frameworks with separate backend frameworks
4. Match complexity to request (simple apps don't need CDN/load balancer)
5. Prefer managed services in startup mode
6. Include monitoring only if complexity warrants it
7. ${context.currentNodes && context.currentNodes.length > 0 ? "Preserve existing node IDs when possible - only modify what was requested" : "Generate all new components with unique IDs"}

OUTPUT FORMAT - CRITICAL:
You MUST return a complete JSON object with BOTH nodes AND edges arrays. Without edges, the architecture is incomplete and unusable.

REQUIRED JSON STRUCTURE:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "frontend|backend|database|gateway|cache|queue|ai|storage",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Display Name",
        "description": "Brief purpose",
        "tech": "technology-id-from-ecosystem",
        "serviceType": "same-as-type"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "animated": true,
      "data": { "protocol": "https" }
    }
  ]
}

CONNECTION REQUIREMENTS - VERY IMPORTANT:
1. EVERY node (except the entry point) MUST have at least ONE incoming edge
2. Create edges showing data flow: Load Balancer → Frontend → Backend → Database
3. Use "animated": true on all edges to show active connections
4. Protocol options: "https", "http", "websocket", "grpc", "database", "cache", "queue"
5. Example edge: { "id": "edge-1", "source": "gateway-1", "target": "frontend-1", "animated": true, "data": { "protocol": "https" } }

CRITICAL RULES:
1. Never exceed ${adjustedMax} components
2. Never use less than ${adjustedMin} components${shouldRelax ? ` (relaxed for ${operationType})` : ""}
3. Never mix full-stack frameworks with separate backend frameworks
4. Match complexity to request (simple apps don't need CDN/load balancer)
5. Prefer managed services in startup mode
6. Include monitoring only if complexity warrants it
7. ${context.currentNodes && context.currentNodes.length > 0 ? "Preserve existing node IDs when possible - only modify what was requested" : "Generate all new components with unique IDs"}

Generate the complete JSON architecture now.`;
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

  return `
Tech Stack Selection Guidelines:
1. UNBIASED SELECTION: Do NOT blindly favor trending tools. "New" != "Best".
2. MATCH REQUIREMENTS:
   - For PREDICTABILITY/STABILITY: Choose proven stacks (e.g., Laravel, Rails, Django, Go, Java).
   - For PERFORMANCE/EDGE: Choose modern runtimes (e.g., Bun, Hono, Rust, Go).
   - For RAPID MVP: Choose all-inclusive frameworks (e.g., Next.js, Laravel, Rails).
3. 2026 KNOWLEDGE BASE (Use if relevant to constraints):
${knowledgeEntries}
`;
}
