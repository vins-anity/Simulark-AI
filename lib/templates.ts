import type { Edge, Node } from "@xyflow/react";

// --- SAAS STARTER KIT ---
export const SAAS_TEMPLATE = {
  nodes: [
    { id: "cdn", type: "cloud", position: { x: 400, y: 0 }, data: { label: "CDN / WAF", tech: "cloudflare", description: "Edge caching and security." } },
    { id: "frontend", type: "frontend", position: { x: 400, y: 150 }, data: { label: "Web App", tech: "nextjs", description: "Next.js 14 App Router (SSR)." } },
    { id: "auth", type: "service", position: { x: 100, y: 150 }, data: { label: "Auth Provider", tech: "clerk", description: "Identity and session management." } },
    { id: "api-gw", type: "backend", position: { x: 400, y: 300 }, data: { label: "API Gateway", tech: "kong", description: "Rate limiting & routing." } },
    { id: "core-api", type: "backend", position: { x: 400, y: 450 }, data: { label: "Core Services", tech: "nodejs", description: "Main business logic." } },
    { id: "billing", type: "service", position: { x: 700, y: 450 }, data: { label: "Billing", tech: "stripe", description: "Subscription management." } },
    { id: "db-primary", type: "database", position: { x: 250, y: 600 }, data: { label: "Primary DB", tech: "postgres", description: "Multi-tenant relational data." } },
    { id: "cache", type: "database", position: { x: 550, y: 600 }, data: { label: "Redis Cache", tech: "redis", description: "Session & query caching." } },
    { id: "email", type: "service", position: { x: 100, y: 450 }, data: { label: "Transactional Email", tech: "resend", description: "Automated emails." } },
  ],
  edges: [
    { id: "e1", source: "cdn", target: "frontend", data: { protocol: "https" } },
    { id: "e2", source: "frontend", target: "auth", data: { protocol: "https" } },
    { id: "e3", source: "frontend", target: "api-gw", data: { protocol: "https" } },
    { id: "e4", source: "api-gw", target: "core-api", data: { protocol: "grpc" } },
    { id: "e5", source: "core-api", target: "billing", data: { protocol: "https" } },
    { id: "e6", source: "core-api", target: "email", data: { protocol: "https" } },
    { id: "e7", source: "core-api", target: "db-primary", data: { protocol: "tcp" } },
    { id: "e8", source: "core-api", target: "cache", data: { protocol: "tcp" } },
  ],
};

// --- E-COMMERCE PLATFORM ---
export const ECOMMERCE_TEMPLATE = {
  nodes: [
    { id: "edge", type: "cloud", position: { x: 350, y: 0 }, data: { label: "Edge Network", tech: "vercel", description: "Global edge delivery." } },
    { id: "storefront", type: "frontend", position: { x: 350, y: 150 }, data: { label: "Storefront", tech: "remix", description: "High-performance Remix frontend." } },
    { id: "cms", type: "backend", position: { x: 100, y: 300 }, data: { label: "Headless CMS", tech: "strapi", description: "Product data management." } },
    { id: "cart-api", type: "backend", position: { x: 350, y: 300 }, data: { label: "Order & Cart API", tech: "go", description: "High-throughput checkout service." } },
    { id: "search", type: "service", position: { x: 600, y: 300 }, data: { label: "Search Engine", tech: "algolia", description: "Instant product search & facets." } },
    { id: "broker", type: "service", position: { x: 350, y: 450 }, data: { label: "Event Broker", tech: "kafka", description: "Order processing events." } },
    { id: "db-orders", type: "database", position: { x: 200, y: 600 }, data: { label: "Orders DB", tech: "postgresql", description: "ACID transactions." } },
    { id: "inventory", type: "backend", position: { x: 500, y: 600 }, data: { label: "Inventory Service", tech: "python", description: "Stock level management." } },
  ],
  edges: [
    { id: "e1", source: "edge", target: "storefront", data: { protocol: "https" } },
    { id: "e2", source: "storefront", target: "cms", data: { protocol: "graphql" } },
    { id: "e3", source: "storefront", target: "search", data: { protocol: "https" } },
    { id: "e4", source: "storefront", target: "cart-api", data: { protocol: "https" } },
    { id: "e5", source: "cart-api", target: "broker", data: { protocol: "tcp" } },
    { id: "e6", source: "cart-api", target: "db-orders", data: { protocol: "tcp" } },
    { id: "e7", source: "broker", target: "inventory", data: { protocol: "tcp" } },
  ],
};

// --- IOT DATA PIPELINE ---
export const IOT_TEMPLATE = {
  nodes: [
    { id: "devices", type: "client", position: { x: 350, y: 0 }, data: { label: "IoT Devices", tech: "linux", description: "Sensors and edge devices." } },
    { id: "mqtt-gw", type: "service", position: { x: 350, y: 150 }, data: { label: "MQTT Gateway", tech: "mqtt", description: "High-throughput message broker." } },
    { id: "stream", type: "backend", position: { x: 350, y: 300 }, data: { label: "Stream Processor", tech: "flink", description: "Real-time aggregations & alerts." } },
    { id: "tsdb", type: "database", position: { x: 200, y: 450 }, data: { label: "Time-Series DB", tech: "timescaledb", description: "Optimized for point-in-time data." } },
    { id: "alerting", type: "service", position: { x: 500, y: 450 }, data: { label: "Alerting Engine", tech: "pagerduty", description: "Threshold anomaly alerts." } },
    { id: "dashboard", type: "frontend", position: { x: 200, y: 600 }, data: { label: "Real-time Dashboard", tech: "react", description: "Live fleet monitoring." } },
  ],
  edges: [
    { id: "e1", source: "devices", target: "mqtt-gw", data: { protocol: "mqtt" } },
    { id: "e2", source: "mqtt-gw", target: "stream", data: { protocol: "tcp" } },
    { id: "e3", source: "stream", target: "tsdb", data: { protocol: "postgres" } },
    { id: "e4", source: "stream", target: "alerting", data: { protocol: "https" } },
    { id: "e5", source: "dashboard", target: "tsdb", data: { protocol: "postgres" } },
  ],
};

// --- HEADLESS CMS BLOG ---
export const BLOG_TEMPLATE = {
  nodes: [
    { id: "cdn", type: "cloud", position: { x: 350, y: 0 }, data: { label: "Global CDN", tech: "cloudfront", description: "Static asset & HTML delivery." } },
    { id: "frontend", type: "frontend", position: { x: 350, y: 150 }, data: { label: "Blog Frontend", tech: "nextjs", description: "SSG/ISR Next.js implementation." } },
    { id: "cms", type: "backend", position: { x: 200, y: 300 }, data: { label: "Headless CMS", tech: "sanity", description: "Content authoring & APIs." } },
    { id: "search", type: "service", position: { x: 500, y: 300 }, data: { label: "Search", tech: "meilisearch", description: "Full-text article search." } },
    { id: "storage", type: "storage", position: { x: 100, y: 450 }, data: { label: "Media Storage", tech: "s3", description: "Images and video assets." } },
    { id: "db", type: "database", position: { x: 300, y: 450 }, data: { label: "CMS Database", tech: "postgres", description: "Content persistence." } },
  ],
  edges: [
    { id: "e1", source: "cdn", target: "frontend", data: { protocol: "https" } },
    { id: "e2", source: "frontend", target: "cms", data: { protocol: "graphql" } },
    { id: "e3", source: "frontend", target: "search", data: { protocol: "https" } },
    { id: "e4", source: "cms", target: "storage", data: { protocol: "s3" } },
    { id: "e5", source: "cms", target: "db", data: { protocol: "tcp" } },
  ],
};

// --- REAL-TIME CHAT APP ---
export const CHAT_TEMPLATE = {
  nodes: [
    { id: "client", type: "frontend", position: { x: 350, y: 0 }, data: { label: "Web/Mobile App", tech: "react", description: "Real-time messaging UI." } },
    { id: "lb", type: "cloud", position: { x: 350, y: 150 }, data: { label: "Load Balancer", tech: "nginx", description: "WebSocket connection routing." } },
    { id: "ws-server", type: "backend", position: { x: 350, y: 300 }, data: { label: "WebSocket Cluster", tech: "nodejs", description: "Connection management." } },
    { id: "pubsub", type: "database", position: { x: 150, y: 450 }, data: { label: "Pub/Sub Bus", tech: "redis", description: "Inter-node message broadcasting." } },
    { id: "db-messages", type: "database", position: { x: 350, y: 450 }, data: { label: "Message Store", tech: "mongodb", description: "High-volume chat history." } },
    { id: "db-users", type: "database", position: { x: 550, y: 450 }, data: { label: "User Store", tech: "postgres", description: "Profiles & authentication." } },
  ],
  edges: [
    { id: "e1", source: "client", target: "lb", data: { protocol: "wss" } },
    { id: "e2", source: "lb", target: "ws-server", data: { protocol: "tcp" } },
    { id: "e3", source: "ws-server", target: "pubsub", data: { protocol: "tcp" } },
    { id: "e4", source: "ws-server", target: "db-messages", data: { protocol: "mongodb" } },
    { id: "e5", source: "ws-server", target: "db-users", data: { protocol: "postgres" } },
  ],
};

// --- RAG AI AGENT ---
export const RAG_TEMPLATE = {
  nodes: [
    { id: "ui", type: "frontend", position: { x: 350, y: 0 }, data: { label: "Chat Assistant", tech: "react", description: "AI conversation interface." } },
    { id: "api", type: "backend", position: { x: 350, y: 150 }, data: { label: "Orchestration API", tech: "python", description: "LangChain/LlamaIndex backend." } },
    { id: "vec-db", type: "database", position: { x: 150, y: 300 }, data: { label: "Vector Database", tech: "pinecone", description: "Semantic embeddings store." } },
    { id: "llm", type: "ai", position: { x: 550, y: 300 }, data: { label: "LLM Provider", tech: "openai", description: "Text generation & embeddings." } },
    { id: "queue", type: "service", position: { x: 350, y: 300 }, data: { label: "Job Queue", tech: "rabbitmq", description: "Async document processing." } },
    { id: "worker", type: "backend", position: { x: 350, y: 450 }, data: { label: "Ingestion Worker", tech: "python", description: "Chunks and embeds PDFs/Docs." } },
    { id: "storage", type: "storage", position: { x: 150, y: 450 }, data: { label: "Raw Docs", tech: "s3", description: "Unstructured file storage." } },
  ],
  edges: [
    { id: "e1", source: "ui", target: "api", data: { protocol: "https" } },
    { id: "e2", source: "api", target: "vec-db", data: { protocol: "https" } },
    { id: "e3", source: "api", target: "llm", data: { protocol: "https" } },
    { id: "e4", source: "api", target: "queue", data: { protocol: "amqp" } },
    { id: "e5", source: "queue", target: "worker", data: { protocol: "amqp" } },
    { id: "e6", source: "worker", target: "llm", data: { protocol: "https" } },
    { id: "e7", source: "worker", target: "vec-db", data: { protocol: "https" } },
    { id: "e8", source: "worker", target: "storage", data: { protocol: "s3" } },
  ],
};

// --- EXPORT MAPPING ---
// MUST MATCH THE IDs In app/dashboard/templates/page.tsx EXACTLY
export const TEMPLATE_GRAPHS: Record<string, { nodes: Node[]; edges: Edge[] }> =
  {
    "saas-starter": SAAS_TEMPLATE,
    "e-commerce": ECOMMERCE_TEMPLATE,
    "iot-dashboard": IOT_TEMPLATE,
    "blog-cms": BLOG_TEMPLATE,
    "chat-app": CHAT_TEMPLATE,
    "ai-rag": RAG_TEMPLATE,
  };
