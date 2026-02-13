import type { Edge, Node } from "@xyflow/react";

// --- Wrapper to enforce generic types for template nodes ---
// We use 'any' for data to avoid strict type checking against the dynamic Node type here,
// but in the app it will be cast to AppNode.
const _createNode = (node: any) => node;

export const SAAS_TEMPLATE = {
  nodes: [
    {
      id: "nxt-1",
      type: "frontend",
      position: { x: 250, y: 0 },
      data: {
        label: "Web App",
        tech: "nextjs",
        description: "Next.js 14 App Router with React Server Components.",
      },
    },
    {
      id: "auth-1",
      type: "service",
      position: { x: 0, y: 100 },
      data: {
        label: "Auth Service",
        tech: "clerk",
        description: "User management and authentication.",
      },
    },
    {
      id: "db-1",
      type: "database",
      position: { x: 250, y: 300 },
      data: {
        label: "Primary DB",
        tech: "postgres",
        description: "Relational data with Prisma ORM.",
      },
    },
    {
      id: "pay-1",
      type: "service",
      position: { x: 500, y: 100 },
      data: {
        label: "Payments",
        tech: "stripe",
        description: "Subscription billing and invoicing.",
      },
    },
    {
      id: "email-1",
      type: "service",
      position: { x: 500, y: 300 },
      data: {
        label: "Email",
        tech: "resend",
        description: "Transactional emails.",
      },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "nxt-1",
      target: "db-1",
      data: { protocol: "postgres" },
    },
    { id: "e2", source: "nxt-1", target: "auth-1", data: { protocol: "http" } },
    { id: "e3", source: "nxt-1", target: "pay-1", data: { protocol: "http" } },
    {
      id: "e4",
      source: "nxt-1",
      target: "email-1",
      data: { protocol: "http" },
    },
  ],
};

export const ECOMMERCE_TEMPLATE = {
  nodes: [
    {
      id: "sf-1",
      type: "frontend",
      position: { x: 250, y: 0 },
      data: {
        label: "Storefront",
        tech: "remix",
        description: "High-performance e-commerce frontend.",
      },
    },
    {
      id: "cms-1",
      type: "backend",
      position: { x: 0, y: 150 },
      data: {
        label: "Headless CMS",
        tech: "strapi",
        description: "Product content management.",
      },
    },
    {
      id: "search-1",
      type: "service",
      position: { x: 500, y: 150 },
      data: {
        label: "Search Engine",
        tech: "algolia",
        description: "Instant product search.",
      },
    },
    {
      id: "db-1",
      type: "database",
      position: { x: 250, y: 300 },
      data: {
        label: "Orders DB",
        tech: "mysql",
        description: "Transactional order data.",
      },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "sf-1",
      target: "cms-1",
      data: { protocol: "graphql" },
    },
    {
      id: "e2",
      source: "sf-1",
      target: "search-1",
      data: { protocol: "http" },
    },
    { id: "e3", source: "sf-1", target: "db-1", data: { protocol: "tcp" } },
  ],
};

export const RAG_TEMPLATE = {
  nodes: [
    {
      id: "ui-1",
      type: "frontend",
      position: { x: 250, y: 0 },
      data: {
        label: "Chat UI",
        tech: "react",
        description: "AI Chat Interface.",
      },
    },
    {
      id: "api-1",
      type: "backend",
      position: { x: 250, y: 150 },
      data: {
        label: "LangChain API",
        tech: "python",
        description: "Orchestration and chain logic.",
      },
    },
    {
      id: "vec-1",
      type: "database",
      position: { x: 50, y: 300 },
      data: {
        label: "Vector Store",
        tech: "pinecone",
        description: "Embeddings storage.",
      },
    },
    {
      id: "llm-1",
      type: "ai",
      position: { x: 450, y: 300 },
      data: { label: "LLM", tech: "openai", description: "GPT-4 Inference." },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "ui-1",
      target: "api-1",
      data: { protocol: "websocket" },
    },
    { id: "e2", source: "api-1", target: "vec-1", data: { protocol: "grpc" } },
    { id: "e3", source: "api-1", target: "llm-1", data: { protocol: "http" } },
  ],
};

export const TEMPLATE_GRAPHS: Record<string, { nodes: Node[]; edges: Edge[] }> =
  {
    "saas-starter": SAAS_TEMPLATE,
    "e-commerce": ECOMMERCE_TEMPLATE,
    "rag-pipeline": RAG_TEMPLATE,
  };
