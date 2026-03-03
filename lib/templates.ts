import type { Edge, Node } from "@xyflow/react";

// --- SAAS STARTER KIT ---
// 9 nodes, 8 edges
export const SAAS_TEMPLATE = {
  nodes: [
    { id: "cdn", type: "gateway", position: { x: 400, y: 0 }, data: { label: "CDN / WAF", tech: "cloudflare", description: "Edge caching and DDoS protection." } },
    { id: "frontend", type: "frontend", position: { x: 400, y: 160 }, data: { label: "Web App", tech: "nextjs", description: "Next.js App Router with SSR." } },
    { id: "auth", type: "auth", position: { x: 100, y: 160 }, data: { label: "Auth Provider", tech: "supabase", description: "JWT-based identity and session management." } },
    { id: "api-gw", type: "gateway", position: { x: 400, y: 320 }, data: { label: "API Gateway", tech: "hono", description: "Rate limiting, routing, and middleware." } },
    { id: "core-api", type: "backend", position: { x: 400, y: 480 }, data: { label: "Core Services", tech: "nodejs", description: "Main business logic layer." } },
    { id: "billing", type: "payment", position: { x: 700, y: 480 }, data: { label: "Billing", tech: "stripe", description: "Subscription lifecycle management." } },
    { id: "db-primary", type: "database", position: { x: 250, y: 640 }, data: { label: "Primary DB", tech: "postgres", description: "Multi-tenant relational data store." } },
    { id: "cache", type: "cache", position: { x: 550, y: 640 }, data: { label: "Redis Cache", tech: "redis", description: "Session and query result caching." } },
    { id: "email", type: "automation", position: { x: 100, y: 480 }, data: { label: "Email Service", tech: "resend", description: "Transactional email automation." } },
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
// 9 nodes, 8 edges
export const ECOMMERCE_TEMPLATE = {
  nodes: [
    { id: "edge", type: "gateway", position: { x: 350, y: 0 }, data: { label: "Edge Network", tech: "vercel", description: "Global edge delivery and routing." } },
    { id: "storefront", type: "frontend", position: { x: 350, y: 160 }, data: { label: "Storefront", tech: "nextjs", description: "SSR product pages and checkout UI." } },
    { id: "cms", type: "backend", position: { x: 100, y: 320 }, data: { label: "Headless CMS", tech: "sanity", description: "Product catalog and content management." } },
    { id: "cart-api", type: "backend", position: { x: 350, y: 320 }, data: { label: "Order & Cart API", tech: "go", description: "High-throughput checkout service." } },
    { id: "search", type: "service", position: { x: 600, y: 320 }, data: { label: "Search Engine", tech: "algolia", description: "Instant product search and faceting." } },
    { id: "payment", type: "payment", position: { x: 600, y: 480 }, data: { label: "Payments", tech: "stripe", description: "PCI-compliant payment processing." } },
    { id: "broker", type: "messaging", position: { x: 350, y: 480 }, data: { label: "Event Bus", tech: "kafka", description: "Order processing event stream." } },
    { id: "db-orders", type: "database", position: { x: 200, y: 640 }, data: { label: "Orders DB", tech: "postgresql", description: "ACID-compliant transaction store." } },
    { id: "inventory", type: "backend", position: { x: 500, y: 640 }, data: { label: "Inventory Service", tech: "python", description: "Real-time stock level management." } },
  ],
  edges: [
    { id: "e1", source: "edge", target: "storefront", data: { protocol: "https" } },
    { id: "e2", source: "storefront", target: "cms", data: { protocol: "graphql" } },
    { id: "e3", source: "storefront", target: "search", data: { protocol: "https" } },
    { id: "e4", source: "storefront", target: "cart-api", data: { protocol: "https" } },
    { id: "e5", source: "cart-api", target: "payment", data: { protocol: "https" } },
    { id: "e6", source: "cart-api", target: "broker", data: { protocol: "tcp" } },
    { id: "e7", source: "cart-api", target: "db-orders", data: { protocol: "tcp" } },
    { id: "e8", source: "broker", target: "inventory", data: { protocol: "tcp" } },
  ],
};

// --- IOT DATA PIPELINE ---
// 7 nodes, 6 edges
export const IOT_TEMPLATE = {
  nodes: [
    { id: "devices", type: "client", position: { x: 350, y: 0 }, data: { label: "IoT Devices", tech: "linux", description: "Edge sensors and embedded devices." } },
    { id: "mqtt-gw", type: "gateway", position: { x: 350, y: 160 }, data: { label: "MQTT Gateway", tech: "mosquitto", description: "High-throughput pub/sub message broker." } },
    { id: "stream", type: "backend", position: { x: 350, y: 320 }, data: { label: "Stream Processor", tech: "flink", description: "Real-time aggregations and anomaly alerts." } },
    { id: "tsdb", type: "database", position: { x: 200, y: 480 }, data: { label: "Time-Series DB", tech: "timescaledb", description: "Optimised for point-in-time sensor data." } },
    { id: "alerting", type: "monitoring", position: { x: 500, y: 480 }, data: { label: "Alerting Engine", tech: "grafana", description: "Threshold breach and anomaly notifications." } },
    { id: "queue", type: "queue", position: { x: 500, y: 320 }, data: { label: "Alert Queue", tech: "rabbitmq", description: "Decouples alerting from stream processing." } },
    { id: "dashboard", type: "frontend", position: { x: 200, y: 640 }, data: { label: "Live Dashboard", tech: "react", description: "Real-time fleet monitoring UI." } },
  ],
  edges: [
    { id: "e1", source: "devices", target: "mqtt-gw", data: { protocol: "mqtt" } },
    { id: "e2", source: "mqtt-gw", target: "stream", data: { protocol: "tcp" } },
    { id: "e3", source: "stream", target: "tsdb", data: { protocol: "postgres" } },
    { id: "e4", source: "stream", target: "queue", data: { protocol: "amqp" } },
    { id: "e5", source: "queue", target: "alerting", data: { protocol: "amqp" } },
    { id: "e6", source: "dashboard", target: "tsdb", data: { protocol: "postgres" } },
  ],
};

// --- HEADLESS CMS BLOG ---
// 6 nodes, 5 edges
export const BLOG_TEMPLATE = {
  nodes: [
    { id: "cdn", type: "gateway", position: { x: 350, y: 0 }, data: { label: "Global CDN", tech: "cloudfront", description: "Static asset and HTML delivery." } },
    { id: "frontend", type: "frontend", position: { x: 350, y: 160 }, data: { label: "Blog Frontend", tech: "nextjs", description: "SSG/ISR Next.js with fast page loads." } },
    { id: "cms", type: "backend", position: { x: 200, y: 320 }, data: { label: "Headless CMS", tech: "sanity", description: "Content authoring and structured data APIs." } },
    { id: "search", type: "service", position: { x: 500, y: 320 }, data: { label: "Search", tech: "meilisearch", description: "Full-text article and tag search." } },
    { id: "storage", type: "storage", position: { x: 100, y: 480 }, data: { label: "Media Storage", tech: "s3", description: "Images, videos, and file assets." } },
    { id: "db", type: "database", position: { x: 300, y: 480 }, data: { label: "CMS Database", tech: "postgres", description: "Structured content persistence." } },
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
// 7 nodes, 6 edges
export const CHAT_TEMPLATE = {
  nodes: [
    { id: "client", type: "client", position: { x: 350, y: 0 }, data: { label: "Web / Mobile App", tech: "react", description: "Real-time messaging UI with WebSocket client." } },
    { id: "lb", type: "loadbalancer", position: { x: 350, y: 160 }, data: { label: "Load Balancer", tech: "nginx", description: "WebSocket sticky-session routing." } },
    { id: "ws-server", type: "backend", position: { x: 350, y: 320 }, data: { label: "WebSocket Cluster", tech: "nodejs", description: "Socket.io connection and presence management." } },
    { id: "pubsub", type: "cache", position: { x: 150, y: 480 }, data: { label: "Pub/Sub Bus", tech: "redis", description: "Inter-node message fan-out." } },
    { id: "db-messages", type: "database", position: { x: 350, y: 480 }, data: { label: "Message Store", tech: "mongodb", description: "High-volume persistent chat history." } },
    { id: "db-users", type: "database", position: { x: 550, y: 480 }, data: { label: "User Store", tech: "postgres", description: "Profiles and authentication records." } },
    { id: "auth", type: "auth", position: { x: 150, y: 320 }, data: { label: "Auth Service", tech: "jwt", description: "Token-based authentication and session validation." } },
  ],
  edges: [
    { id: "e1", source: "client", target: "lb", data: { protocol: "wss" } },
    { id: "e2", source: "lb", target: "ws-server", data: { protocol: "tcp" } },
    { id: "e3", source: "ws-server", target: "auth", data: { protocol: "https" } },
    { id: "e4", source: "ws-server", target: "pubsub", data: { protocol: "tcp" } },
    { id: "e5", source: "ws-server", target: "db-messages", data: { protocol: "mongodb" } },
    { id: "e6", source: "ws-server", target: "db-users", data: { protocol: "tcp" } },
  ],
};

// --- RAG AI AGENT ---
// 8 nodes, 9 edges
export const RAG_TEMPLATE = {
  nodes: [
    { id: "ui", type: "frontend", position: { x: 350, y: 0 }, data: { label: "Chat Assistant", tech: "react", description: "Conversational UI with streaming responses." } },
    { id: "api", type: "backend", position: { x: 350, y: 160 }, data: { label: "Orchestration API", tech: "python", description: "LangChain/LangGraph orchestration backend." } },
    { id: "vec-db", type: "vector-db", position: { x: 100, y: 320 }, data: { label: "Vector Database", tech: "pinecone", description: "Semantic embedding store for retrieval." } },
    { id: "llm", type: "ai-model", position: { x: 600, y: 320 }, data: { label: "LLM Provider", tech: "openai", description: "Text generation and embedding models." } },
    { id: "queue", type: "queue", position: { x: 350, y: 320 }, data: { label: "Ingestion Queue", tech: "rabbitmq", description: "Async document processing pipeline." } },
    { id: "worker", type: "function", position: { x: 350, y: 480 }, data: { label: "Ingestion Worker", tech: "python", description: "Chunks PDFs, generates embeddings." } },
    { id: "storage", type: "storage", position: { x: 100, y: 480 }, data: { label: "Raw Documents", tech: "s3", description: "Unstructured PDF and text file storage." } },
    { id: "monitoring", type: "monitoring", position: { x: 600, y: 480 }, data: { label: "Trace & Monitor", tech: "langsmith", description: "LLM call tracing and evaluation." } },
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
    { id: "e9", source: "api", target: "monitoring", data: { protocol: "https" } },
  ],
};

// --- EXPORT MAPPING ---
// MUST MATCH THE IDs in app/dashboard/templates/page.tsx EXACTLY
export const TEMPLATE_GRAPHS: Record<string, { nodes: Node[]; edges: Edge[] }> =
  {
    "saas-starter": SAAS_TEMPLATE,
    "e-commerce": ECOMMERCE_TEMPLATE,
    "iot-dashboard": IOT_TEMPLATE,
    "blog-cms": BLOG_TEMPLATE,
    "chat-app": CHAT_TEMPLATE,
    "ai-rag": RAG_TEMPLATE,
  };
