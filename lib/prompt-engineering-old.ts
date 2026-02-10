import { logger } from "@/lib/logger";

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
  mode: "default" | "startup" | "corporate";
  quickMode: boolean;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

// Architecture detection patterns
const ARCHITECTURE_PATTERNS: Record<ArchitectureType, string[]> = {
  "web-app": [
    "web app",
    "website",
    "web application",
    "frontend",
    "backend",
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
    "pipeline",
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
    "fastapi",
  ],
  serverless: [
    "serverless",
    "lambda",
    "cloud function",
    "edge function",
    "faas",
    "event-driven",
    "aws lambda",
    "vercel",
    "cloudflare workers",
    "deno deploy",
  ],
  "data-pipeline": [
    "data pipeline",
    "etl",
    "elt",
    "data warehouse",
    "data lake",
    "analytics",
    "bi",
    "business intelligence",
    "apache spark",
    "hadoop",
    "airflow",
    "dbt",
    "snowflake",
    "bigquery",
  ],
  "mobile-app": [
    "mobile app",
    "ios",
    "android",
    "react native",
    "flutter",
    "swift",
    "kotlin",
    "capacitor",
    "ionic",
    "pwa",
  ],
  "desktop-app": [
    "desktop app",
    "electron",
    "tauri",
    "wails",
    "qt",
    "native app",
    "windows",
    "macos",
    "linux",
  ],
  "iot-system": [
    "iot",
    "internet of things",
    "sensor",
    "device",
    "mqtt",
    "coap",
    "edge computing",
    "raspberry pi",
    "arduino",
    "embedded",
  ],
  blockchain: [
    "blockchain",
    "crypto",
    "web3",
    "smart contract",
    "defi",
    "nft",
    "ethereum",
    "solidity",
    "node",
    "validator",
    "consensus",
  ],
  mixed: [],
  unknown: [],
};

// Probing questions for each architecture type
const ARCHITECTURE_QUESTIONS: Record<ArchitectureType, string[]> = {
  "web-app": [
    "What type of web application is this? (e.g., e-commerce, dashboard, social media, CMS)",
    "Do you need real-time features like chat or notifications?",
    "What's your expected traffic volume? (low, medium, high)",
    "Any specific frontend framework preference?",
  ],
  "ai-pipeline": [
    "What type of AI/ML workload? (e.g., text generation, image processing, recommendation)",
    "Do you need real-time inference or batch processing?",
    "What's your expected request volume?",
    "Any specific model requirements? (e.g., LLM, vision, embedding)",
  ],
  microservices: [
    "How many services do you expect to have?",
    "What's your team's DevOps maturity? (beginner, intermediate, advanced)",
    "Do you need service mesh or API gateway?",
    "What's your data consistency requirements? (eventual, strong)",
  ],
  monolithic: [
    "Is this a greenfield project or migrating from existing code?",
    "What's your team size?",
    "Any specific framework preference?",
    "Do you anticipate needing to scale specific components independently in the future?",
  ],
  serverless: [
    "What's your cold start tolerance?",
    "Do you have long-running processes?",
    "What's your budget preference? (pay-per-use vs fixed)",
    "Any vendor lock-in concerns?",
  ],
  "data-pipeline": [
    "What's your data volume? (GB, TB, PB per day)",
    "What's your latency requirement? (real-time, near real-time, batch)",
    "What's your data source? (databases, APIs, files, streams)",
    "Do you need data transformation or just movement?",
  ],
  "mobile-app": [
    "Is this native or cross-platform?",
    "Do you need offline capabilities?",
    "What's your backend requirement? (REST, GraphQL, real-time)",
    "Any specific integrations? (payments, push notifications, maps)",
  ],
  "desktop-app": [
    "Which platforms? (Windows, macOS, Linux)",
    "Do you need auto-updates?",
    "Will it connect to a backend?",
    "Any native OS integrations required?",
  ],
  "iot-system": [
    "How many devices?",
    "What's the data frequency from devices?",
    "Any edge computing requirements?",
    "What's your connectivity scenario? (always online, intermittent)",
  ],
  blockchain: [
    "Public or private blockchain?",
    "What's the consensus mechanism?",
    "Do you need smart contracts?",
    "What's your transaction volume expectation?",
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
const MIN_MEANINGFUL_WORDS = 2;

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
 * Detect architecture type from user input
 */
export function detectArchitectureType(input: string): ArchitectureDetection {
  const lowerInput = input.toLowerCase();
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
  const detectedKeywords: string[] = [];

  // Score each architecture type
  for (const [type, patterns] of Object.entries(ARCHITECTURE_PATTERNS)) {
    if (type === "mixed" || type === "unknown") continue;

    for (const pattern of patterns) {
      if (lowerInput.includes(pattern.toLowerCase())) {
        scores[type as ArchitectureType] += 1;
        if (!detectedKeywords.includes(pattern)) {
          detectedKeywords.push(pattern);
        }
      }
    }
  }

  // Find the highest score
  let maxScore = 0;
  let detectedType: ArchitectureType = "unknown";

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as ArchitectureType;
    }
  }

  // Calculate confidence
  const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0;

  // Get suggested questions
  let suggestedQuestions: string[] = [];
  if (confidence < 0.7) {
    // Low confidence - ask general questions
    suggestedQuestions = [
      ...ARCHITECTURE_QUESTIONS.unknown.slice(0, 2),
      ...(detectedType !== "unknown"
        ? ARCHITECTURE_QUESTIONS[detectedType].slice(0, 1)
        : []),
    ];
  } else if (confidence < 0.9) {
    // Medium confidence - ask specific questions
    suggestedQuestions = ARCHITECTURE_QUESTIONS[detectedType].slice(0, 2);
  }

  // Check for mixed patterns
  const highScoreTypes = Object.entries(scores)
    .filter(([_, score]) => score >= 2)
    .map(([type, _]) => type as ArchitectureType);

  if (highScoreTypes.length > 1) {
    detectedType = "mixed";
    suggestedQuestions = [
      "I detected multiple architecture patterns. Which one is your primary focus?",
      ...highScoreTypes.map((t) => `- ${t.replace("-", " ")}`),
      ...ARCHITECTURE_QUESTIONS.mixed,
    ];
  }

  logger.debug("[ArchitectureDetector] Detection result:", {
    input: input.slice(0, 100),
    detectedType,
    confidence,
    keywords: detectedKeywords,
  });

  return {
    type: detectedType,
    confidence,
    detectedKeywords,
    suggestedQuestions,
  };
}

/**
 * Get architecture-specific guidelines
 */
function getArchitectureGuidelines(type: ArchitectureType): string {
  const guidelines: Record<ArchitectureType, string> = {
    "web-app": `
WEB APPLICATION ARCHITECTURE:
- Use standard 3-tier architecture: Client → API → Database
- Include CDN for static assets
- Consider caching layer (Redis) for performance
- Add load balancer for high traffic
- Use JWT or session-based auth
- Include monitoring and logging`,

    "ai-pipeline": `
AI/ML PIPELINE ARCHITECTURE:
- Design for async processing with message queues
- Include model versioning and A/B testing capability
- Add vector database for embeddings if using RAG
- Design GPU clusters or serverless inference endpoints
- Include data preprocessing and post-processing stages
- Add monitoring for model drift and performance`,

    microservices: `
MICROSERVICES ARCHITECTURE:
- Use API Gateway as single entry point
- Include service discovery and registry
- Design event-driven communication (Kafka/RabbitMQ)
- Add distributed tracing and logging
- Include circuit breakers and retry logic
- Design for independent deployment of services`,

    monolithic: `
MONOLITHIC ARCHITECTURE:
- Keep it simple with MVC or layered architecture
- Use modular design for future extraction
- Include caching at multiple levels
- Design for vertical scaling initially
- Add background job processing
- Include comprehensive logging`,

    serverless: `
SERVERLESS ARCHITECTURE:
- Design for stateless functions
- Use managed services (DB, cache, storage)
- Include event triggers (S3, DynamoDB, Schedule)
- Design for cold start optimization
- Use step functions for workflows
- Include retry and dead letter queues`,

    "data-pipeline": `
DATA PIPELINE ARCHITECTURE:
- Design for scalability with distributed processing
- Include data validation and quality checks
- Add lineage tracking and metadata management
- Design for idempotent operations
- Include data partitioning strategy
- Add monitoring for data freshness and quality`,

    "mobile-app": `
MOBILE APPLICATION ARCHITECTURE:
- Design for offline-first capabilities
- Include push notification service
- Add analytics and crash reporting
- Design for app store compliance
- Include backend for frontend (BFF) pattern
- Add CDN for media assets`,

    "desktop-app": `
DESKTOP APPLICATION ARCHITECTURE:
- Design for auto-update mechanism
- Include local database (SQLite/IndexedDB)
- Add offline capabilities
- Include OS-specific integrations
- Design for security (code signing)
- Add telemetry and analytics`,

    "iot-system": `
IOT SYSTEM ARCHITECTURE:
- Design for device management and provisioning
- Include MQTT or CoAP for messaging
- Add edge computing capabilities
- Design for data aggregation and filtering
- Include OTA update mechanism
- Add device authentication and security`,

    blockchain: `
BLOCKCHAIN ARCHITECTURE:
- Design for node synchronization
- Include wallet and key management
- Add smart contract deployment pipeline
- Design for consensus mechanism
- Include blockchain explorer
- Add layer 2 scaling if needed`,

    mixed: `
MIXED ARCHITECTURE:
- Identify the primary component and optimize for it
- Use clear boundaries between different patterns
- Include appropriate communication mechanisms
- Design for the most critical use case`,

    unknown: `
GENERAL ARCHITECTURE:
- Start with simple monolithic design
- Use standard patterns (REST API, relational DB)
- Include basic security and monitoring
- Design for future scalability`,
  };

  return guidelines[type] || guidelines.unknown;
}

/**
 * Build an enhanced system prompt based on detected architecture
 */
export function buildEnhancedSystemPrompt(context: PromptContext): string {
  const detection = detectArchitectureType(context.userInput);
  const architectureGuidelines = getArchitectureGuidelines(detection.type);

  let roleDescription = "Senior Fullstack Solutions Architect";
  let focusArea =
    "scalability, fault tolerance, cost-efficiency, and rapid delivery";

  // Adjust based on mode
  if (context.mode === "startup") {
    roleDescription = "Lean Startup CTO";
    focusArea = "MVP speed, minimal costs, and rapid iteration";
  } else if (context.mode === "corporate") {
    roleDescription = "Enterprise Architect";
    focusArea = "high availability, compliance, security, and redundancy";
  }

  // Architecture-specific role adjustments
  const architectureRoles: Record<ArchitectureType, string> = {
    "web-app": "Fullstack Web Architect",
    "ai-pipeline": "AI/ML Systems Architect",
    microservices: "Distributed Systems Architect",
    monolithic: "Application Architect",
    serverless: "Cloud-Native Architect",
    "data-pipeline": "Data Platform Architect",
    "mobile-app": "Mobile Solutions Architect",
    "desktop-app": "Desktop Application Architect",
    "iot-system": "IoT Systems Architect",
    blockchain: "Blockchain Solutions Architect",
    mixed: "Solutions Architect",
    unknown: "Fullstack Solutions Architect",
  };

  const specificRole = architectureRoles[detection.type] || roleDescription;

  // Build context about existing architecture
  const contextPrompt =
    context.currentNodes && context.currentNodes.length > 0
      ? `\n\nCURRENT ARCHITECTURE STATE:\nThe user already has an existing diagram with ${context.currentNodes.length} nodes.\nExisting Nodes: ${JSON.stringify(context.currentNodes.map((n: any) => ({ id: n.id, type: n.type, label: n.data?.label })))}\n\nYour task is to MODIFY or IMPROVE this architecture based on the user's prompt. Maintain context of existing components.`
      : "";

  // Quick mode prompt
  if (context.quickMode) {
    return `You are a ${specificRole}. Generate a JSON architecture for: "${context.userInput}"

DETECTED ARCHITECTURE: ${detection.type.replace("-", " ")} (confidence: ${Math.round(detection.confidence * 100)}%)

${architectureGuidelines}

${contextPrompt}

OUTPUT ONLY JSON (no markdown, no explanation):
{
  "nodes": [{ "id": "string", "type": "gateway|service|frontend|backend|database|queue|ai", "position": {"x": number, "y": number}, "data": { "label": "string", "description": "brief purpose", "tech": "nextjs|react|nodejs|postgres|redis|supabase|vercel|etc", "serviceType": "same as type" }}],
  "edges": [{ "id": "string", "source": "string", "target": "string", "animated": boolean, "data": { "protocol": "http|https|graphql|websocket|queue|stream|database|cache|oauth|grpc" }}]
}

ALL nodes MUST be connected. No orphaned nodes!`;
  }

  // Full detailed prompt
  return `You are a ${specificRole} specializing in ${detection.type.replace("-", " ")} architectures. ${focusArea}.

ARCHITECTURE DETECTION:
Detected Type: ${detection.type.replace("-", " ")}
Confidence: ${Math.round(detection.confidence * 100)}%
Matched Keywords: ${detection.detectedKeywords.join(", ") || "None"}

${architectureGuidelines}

${contextPrompt}

INTELLIGENT TECH SELECTION:
Based on the detected architecture type "${detection.type}", choose the most appropriate technologies:

${getTechRecommendations(detection.type)}

CRITICAL INSTRUCTIONS:
1. LAYERING PATTERN (Top to Bottom, Left to Right):
   - Layer 1 (Top/Left): ENTRY - Load Balancers, API Gateways, CDN, Frontend Clients, External APIs
   - Layer 2 (Middle): APP - Core Services, Auth, Business Logic, Workers, AI Agents, Background Jobs
   - Layer 3 (Bottom/Right): DATA - Databases, Caches, Object Storage, Message Queues, External Services

2. Position nodes with appropriate spacing (x: 0-800, y: 0-600)
   - Gateway/Frontend at top (y: 50-150)
   - Services in middle (y: 200-350)
   - Databases at bottom (y: 400-500)
   - Left-to-right flow for related components

3. THINKING vs CONTENT:
   - Use reasoning/thinking for your analysis (NOT in final JSON)
   - OUTPUT ONLY THE FINAL JSON in the content field
   - NO markdown code blocks, NO explanations in content

4. NODE REQUIREMENTS:
   - Every node MUST have: id, type, position, data (with label, description, tech, serviceType)
   - Use REAL technology IDs from the ecosystem
   - Include meaningful descriptions explaining what each component does
   - Set appropriate serviceType matching the node's purpose

5. EDGE REQUIREMENTS:
   - Every service must connect to at least one database or external service
   - Gateways connect to services
   - Services connect to databases, caches, or queues
   - Use appropriate protocol for each connection type
   - ALL nodes MUST be connected. No orphaned nodes allowed!

6. COMPLETENESS:
   - Include ALL necessary components for a production system
   - Don't forget: Monitoring, Logging, Auth, CDN, Load Balancer (for production)
   - For ${detection.type}: ${getRequiredComponents(detection.type)}

JSON Schema:
{
  "nodes": [{ 
    "id": "unique-string", 
    "type": "gateway" | "service" | "frontend" | "backend" | "database" | "queue" | "ai", 
    "position": { "x": number, "y": number }, 
    "data": { 
      "label": "Human Readable Name", 
      "description": "Detailed explanation of what this component does and why it's needed",
      "tech": "exact-tech-id-from-ecosystem",
      "serviceType": "gateway" | "service" | "frontend" | "backend" | "database" | "queue" | "ai"
    } 
  }],
  "edges": [{ 
    "id": "source-target", 
    "source": "source-node-id", 
    "target": "target-node-id", 
    "animated": boolean, 
    "data": { 
      "protocol": "http" | "https" | "graphql" | "websocket" | "queue" | "stream" | "database" | "cache" | "oauth" | "grpc" 
    } 
  }]
}

Output the complete JSON architecture in the content field. Start with "{" and end with "}". No markdown, no code blocks.`;
}

/**
 * Get technology recommendations based on architecture type
 */
function getTechRecommendations(type: ArchitectureType): string {
  const recommendations: Record<ArchitectureType, string> = {
    "web-app": `- Frontend: Next.js/React (SSR/SSG), Vue, or Angular
- Backend: Node.js/Express, Python/FastAPI, Go, or Java/Spring
- Database: PostgreSQL (primary), Redis (cache), MongoDB (if NoSQL needed)
- Hosting: Vercel, AWS, or Google Cloud
- CDN: Cloudflare or AWS CloudFront`,

    "ai-pipeline": `- API Gateway: Kong, AWS API Gateway, or custom
- AI/ML: OpenAI, Anthropic, or self-hosted models
- Vector DB: Pinecone, Weaviate, or pgvector
- Message Queue: Kafka, RabbitMQ, or AWS SQS
- Compute: Kubernetes (GPU nodes) or serverless
- Storage: S3 for models and data`,

    microservices: `- API Gateway: Kong, Ambassador, or AWS API Gateway
- Service Mesh: Istio or Linkerd (optional)
- Container Orchestration: Kubernetes
- Message Bus: Kafka, NATS, or RabbitMQ
- Service Discovery: Consul, etcd, or Kubernetes DNS
- Monitoring: Prometheus + Grafana + Jaeger`,

    monolithic: `- Framework: Next.js, Django, Rails, Laravel, or Spring Boot
- Database: PostgreSQL or MySQL
- Cache: Redis
- Background Jobs: Bull, Celery, or Sidekiq
- Hosting: Traditional VPS or PaaS (Heroku, Railway)`,

    serverless: `- Functions: AWS Lambda, Vercel Functions, or Cloudflare Workers
- API: API Gateway or Function URLs
- Database: DynamoDB, PlanetScale, or Supabase
- Storage: S3 or R2
- Auth: Auth0, Clerk, or Cognito`,

    "data-pipeline": `- Orchestration: Apache Airflow, Prefect, or Dagster
- Processing: Spark, dbt, or custom Python
- Warehouse: Snowflake, BigQuery, or Redshift
- Lake: S3 + Delta Lake or Iceberg
- Streaming: Kafka, Kinesis, or Pub/Sub`,

    "mobile-app": `- Cross-platform: React Native, Flutter, or Ionic
- Native: Swift (iOS), Kotlin (Android)
- Backend: Firebase, Supabase, or custom API
- Push: Firebase Cloud Messaging, OneSignal
- Storage: Firebase Storage, S3`,

    "desktop-app": `- Framework: Electron, Tauri, or Wails
- State: Redux, Zustand, or Vuex
- Storage: SQLite, IndexedDB, or local files
- Updates: Electron-updater or custom solution
- Build: Electron Builder or Tauri CLI`,

    "iot-system": `- Protocol: MQTT (Mosquitto, EMQX) or CoAP
- Gateway: AWS IoT Core, Azure IoT Hub
- Edge: AWS Greengrass or custom
- Database: InfluxDB (time-series), PostgreSQL
- Analytics: AWS IoT Analytics or custom pipeline`,

    blockchain: `- Network: Ethereum, Polygon, or Solana
- Smart Contracts: Solidity or Rust
- Node: Geth, Parity, or managed (Infura, Alchemy)
- Wallet: MetaMask, WalletConnect
- Indexing: The Graph`,

    mixed: `- Identify primary component and use its stack
- Use API Gateway to bridge different patterns
- Consider event-driven communication between patterns`,

    unknown: `- Frontend: Next.js or React
- Backend: Node.js/Express or Python/FastAPI
- Database: PostgreSQL
- Hosting: Vercel or Railway`,
  };

  return recommendations[type] || recommendations.unknown;
}

/**
 * Get required components for each architecture type
 */
function getRequiredComponents(type: ArchitectureType): string {
  const components: Record<ArchitectureType, string> = {
    "web-app":
      "Include CDN, Load Balancer, API Gateway, Auth service, Application servers, Database, Cache",
    "ai-pipeline":
      "Include API Gateway, Model serving infrastructure, Vector DB, Message Queue, Object Storage",
    microservices:
      "Include API Gateway, Service Discovery, Message Bus, Distributed Tracing, Centralized Logging",
    monolithic:
      "Include Load Balancer, Application server, Database, Cache, Background Job processor",
    serverless:
      "Include API Gateway, Functions, Event triggers, Managed Database, Object Storage",
    "data-pipeline":
      "Include Data sources, Extract/Transform/Load services, Data Warehouse, Orchestration, Monitoring",
    "mobile-app":
      "Include Mobile clients, Backend API, Push notification service, Analytics, CDN for assets",
    "desktop-app":
      "Include Desktop client, Auto-update service, Local storage, Telemetry, Backend API (optional)",
    "iot-system":
      "Include Devices, MQTT Broker, Edge Gateway, Data processing, Time-series Database, Dashboard",
    blockchain:
      "Include Blockchain nodes, Smart contracts, Wallet integration, Indexing service, Frontend",
    mixed:
      "Include clear boundaries and appropriate integrations between patterns",
    unknown: "Include basic web architecture components",
  };

  return components[type] || components.unknown;
}

/**
 * Check if we need to ask clarifying questions
 */
export function shouldAskQuestions(detection: ArchitectureDetection): boolean {
  return detection.confidence < 0.7 || detection.type === "mixed";
}

/**
 * Generate follow-up questions based on detection and conversation history
 */
export function generateFollowUpQuestions(
  detection: ArchitectureDetection,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
): string[] {
  // Start with architecture-specific questions
  let questions = [...detection.suggestedQuestions];

  // If we have conversation history, avoid repeating questions
  if (conversationHistory && conversationHistory.length > 0) {
    const askedQuestions = conversationHistory
      .filter((m) => m.role === "assistant")
      .map((m) => m.content.toLowerCase());

    questions = questions.filter(
      (q) => !askedQuestions.some((asked) => asked.includes(q.toLowerCase())),
    );
  }

  // Limit to 2-3 most important questions
  return questions.slice(0, 3);
}

/**
 * Create a probing prompt when we need more information
 */
export function createProbingPrompt(
  detection: ArchitectureDetection,
  userInput: string,
): string {
  const questions = detection.suggestedQuestions;

  if (questions.length === 0) {
    return "";
  }

  return `I want to help you design the best architecture for your needs. I detected this might be a **${detection.type.replace("-", " ")}** system, but I need a bit more clarity.

${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Feel free to answer any or all of these, or just tell me more about what you're building!

Your original request: "${userInput}"`;
}

export default {
  detectArchitectureType,
  buildEnhancedSystemPrompt,
  shouldAskQuestions,
  generateFollowUpQuestions,
  createProbingPrompt,
};
