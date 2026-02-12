"use client";

import {
  addEdge,
  Background,
  type Connection,
  Edge,
  Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cpu,
  CreditCard,
  Globe,
  Monitor,
  Server,
  ShoppingCart,
  Users,
} from "lucide-react";
import { SimulationEdge } from "@/components/canvas/edges/SimulationEdge";
import { AINode } from "@/components/canvas/nodes/AINode";
import { AuthNode } from "@/components/canvas/nodes/AuthNode";
import { CacheNode } from "@/components/canvas/nodes/CacheNode";
import { ClientNode } from "@/components/canvas/nodes/ClientNode";
import { DatabaseNode } from "@/components/canvas/nodes/DatabaseNode";
import { FunctionNode } from "@/components/canvas/nodes/FunctionNode";
import { GatewayNode } from "@/components/canvas/nodes/GatewayNode";
import { LoadbalancerNode } from "@/components/canvas/nodes/LoadbalancerNode";
import { PaymentNode } from "@/components/canvas/nodes/PaymentNode";
import { QueueNode } from "@/components/canvas/nodes/QueueNode";
import { ServiceNode } from "@/components/canvas/nodes/ServiceNode";
import { StorageNode } from "@/components/canvas/nodes/StorageNode";
import { cn } from "@/lib/utils";

// ============================================
// TEMPLATES - 5 Professional Architecture Examples
// ============================================

const TEMPLATES = {
  webapp: {
    label: "Modern Web App",
    description: "Next.js 15 + Turso (Edge) + Upstash (Redis)",
    icon: Globe,
    color: "#6a9bcc",
    nodes: [
      {
        id: "client",
        type: "client",
        position: { x: 50, y: 200 },
        data: {
          label: "Users",
          tech: "Browser",
          logo: "logos:chrome",
          description:
            "Global edge traffic originating from user regions via HTTPS.",
        },
      },
      {
        id: "edge",
        type: "gateway",
        position: { x: 450, y: 200 },
        data: {
          label: "Vercel Edge",
          tech: "Next.js 15",
          logo: "logos:nextjs-icon",
          description:
            "Edge Middleware for auth, routing, and personalization.",
        },
      },
      {
        id: "app",
        type: "service",
        position: { x: 850, y: 50 },
        data: {
          label: "Server Actions",
          tech: "React Server Components",
          serviceType: "backend",
          logo: "logos:react",
          description:
            "Zero-bundle-size backend logic running on serverless compute.",
        },
      },
      {
        id: "turso",
        type: "database",
        position: { x: 1250, y: 50 },
        data: {
          label: "Edge SQL",
          tech: "Turso (libSQL)",
          logo: "logos:sqlite", // Fallback if turso missing
          description: "Distributed SQLite database replicated to the edge.",
        },
      },
      {
        id: "upstash",
        type: "cache",
        position: { x: 1250, y: 350 },
        data: {
          label: "Serverless Redis",
          tech: "Upstash",
          logo: "logos:redis",
          description: "Low-latency global state and rate limiting.",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "client",
        target: "edge",
        animated: true,
        data: { protocol: "HTTPS" },
        type: "simulation",
      },
      {
        id: "e2",
        source: "edge",
        target: "app",
        animated: true,
        data: { protocol: "RSC Payload" },
        type: "simulation",
      },
      {
        id: "e3",
        source: "app",
        target: "turso",
        animated: true,
        data: { protocol: "HTTP/3" },
        type: "simulation",
      },
      {
        id: "e4",
        source: "app",
        target: "upstash",
        animated: true,
        data: { protocol: "REST" },
        type: "simulation",
      },
    ],
  },
  ai: {
    label: "RAG Pipeline",
    description: "GenAI with LangChain, Pinecone & OpenAI",
    icon: Cpu,
    color: "#d97757",
    nodes: [
      {
        id: "user",
        type: "client",
        position: { x: 50, y: 200 },
        data: {
          label: "User Query",
          tech: "Chat UI",
          logo: "lucide:message-square",
          description: "Natural language question from the user interface.",
        },
      },
      {
        id: "api",
        type: "gateway",
        position: { x: 450, y: 200 },
        data: {
          label: "Inference API",
          tech: "FastAPI",
          logo: "logos:fastapi-icon",
          description:
            "High-performance async Python backend for AI orchestration.",
        },
      },
      {
        id: "orchestrator",
        type: "ai",
        position: { x: 850, y: 200 },
        data: {
          label: "LangGraph Agent",
          tech: "LangChain",
          serviceType: "backend",
          logo: "simple-icons:langchain",
          description:
            "Stateful agentic workflow managing retrieval and generation.",
        },
      },
      {
        id: "vector",
        type: "vector-db",
        position: { x: 850, y: 500 },
        data: {
          label: "Knowledge Base",
          tech: "Pinecone",
          logo: "logos:pinecone", // Fallback: logos:elasticsearch or similar if missing
          description:
            "Vector database for semantic search and context retrieval.",
        },
      },
      {
        id: "llm",
        type: "ai-model",
        position: { x: 1250, y: 200 },
        data: {
          label: "Reasoning Model",
          tech: "OpenAI o1",
          logo: "logos:openai-icon",
          description: "Advanced reasoning model for final answer generation.",
        },
      },
      {
        id: "unstructured",
        type: "function",
        position: { x: 1250, y: 500 },
        data: {
          label: "ETL Pipeline",
          tech: "Unstructured",
          logo: "lucide:file-text",
          description: "Document processing and chunking for vector ingestion.",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "user",
        target: "api",
        animated: true,
        data: { protocol: "SSE" },
        type: "simulation",
      },
      {
        id: "e2",
        source: "api",
        target: "orchestrator",
        animated: true,
        data: { protocol: "Internal" },
        type: "simulation",
      },
      {
        id: "e3",
        source: "orchestrator",
        target: "vector",
        animated: true,
        data: { protocol: "K-NN" },
        type: "simulation",
      },
      {
        id: "e4",
        source: "orchestrator",
        target: "llm",
        animated: true,
        data: { protocol: "JSON" },
        type: "simulation",
      },
      {
        id: "e5",
        source: "unstructured",
        target: "vector",
        animated: true,
        data: { protocol: "Upsert" },
        type: "simulation",
      },
    ],
  },
  microservices: {
    label: "High-Perf Microservices",
    description: "Bun + Elysia + Rust + Redpanda",
    icon: Server,
    color: "#788c5d",
    nodes: [
      {
        id: "gateway",
        type: "gateway",
        position: { x: 50, y: 250 },
        data: {
          label: "Edge Gateway",
          tech: "Elysia (Bun)",
          logo: "logos:bun",
          description: "Ultra-fast HTTP framework running on Bun runtime.",
        },
      },
      {
        id: "kafka",
        type: "queue",
        position: { x: 450, y: 250 },
        data: {
          label: "Event Bus",
          tech: "Apache Kafka",
          logo: "logos:kafka-icon",
          description:
            "Distributed streaming platform for high-throughput data pipelines.",
        },
      },
      {
        id: "compute",
        type: "service",
        position: { x: 850, y: 100 },
        data: {
          label: "Core Engine",
          tech: "Rust",
          serviceType: "backend",
          logo: "logos:rust",
          description: "Memory-safe, high-performance business logic.",
        },
      },
      {
        id: "analytics",
        type: "service",
        position: { x: 850, y: 400 },
        data: {
          label: "Analytics Consumer",
          tech: "Go",
          serviceType: "backend",
          logo: "logos:go",
          description: "High-throughput data ingestion and processing.",
        },
      },
      {
        id: "scylla",
        type: "database",
        position: { x: 1250, y: 100 },
        data: {
          label: "Wide Column Store",
          tech: "ScyllaDB",
          logo: "simple-icons:scylladb", // Fallback required often
          description:
            "NoSQL database compatible with Cassandra, rewritten in C++.",
        },
      },
      {
        id: "clickhouse",
        type: "database",
        position: { x: 1250, y: 400 },
        data: {
          label: "OLAP DB",
          tech: "ClickHouse",
          logo: "simple-icons:clickhouse",
          description: "Real-time analytics database for massive scale.",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "gateway",
        target: "kafka",
        animated: true,
        data: { protocol: "TCP" },
        type: "simulation",
      },
      {
        id: "e2",
        source: "kafka",
        target: "compute",
        animated: true,
        data: { protocol: "Consumer Group A" },
        type: "simulation",
      },
      {
        id: "e3",
        source: "kafka",
        target: "analytics",
        animated: true,
        data: { protocol: "Consumer Group B" },
        type: "simulation",
      },
      {
        id: "e4",
        source: "compute",
        target: "scylla",
        animated: true,
        data: { protocol: "CQL" },
        type: "simulation",
      },
      {
        id: "e5",
        source: "analytics",
        target: "clickhouse",
        animated: true,
        data: { protocol: "Batch Insert" },
        type: "simulation",
      },
    ],
  },
  ecommerce: {
    label: "Composable Commerce",
    description: "Astro + Medusa.js + Meilisearch",
    icon: ShoppingCart,
    color: "#8b5cf6",
    nodes: [
      {
        id: "cdn",
        type: "gateway",
        position: { x: 50, y: 200 },
        data: {
          label: "Global CDN",
          tech: "Cloudflare",
          logo: "logos:cloudflare",
          description: "Edge caching and image optimization.",
        },
      },
      {
        id: "storefront",
        type: "service",
        position: { x: 450, y: 200 },
        data: {
          label: "Storefront",
          tech: "Astro",
          serviceType: "frontend",
          logo: "logos:astro-icon",
          description: "Islands architecture for maximum frontend performance.",
        },
      },
      {
        id: "headless",
        type: "service",
        position: { x: 850, y: 50 },
        data: {
          label: "Headless Backend",
          tech: "Medusa.js",
          serviceType: "backend",
          logo: "simple-icons:medusa",
          description: "Open-source headless commerce engine.",
        },
      },
      {
        id: "search",
        type: "service",
        position: { x: 850, y: 350 },
        data: {
          label: "Search Engine",
          tech: "Meilisearch",
          serviceType: "backend",
          logo: "simple-icons:meilisearch",
          description: "Typo-tolerant, lightning-fast search API.",
        },
      },
      {
        id: "cms",
        type: "storage",
        position: { x: 1250, y: 50 },
        data: {
          label: "Content Lake",
          tech: "Sanity",
          logo: "logos:sanity",
          description: "Structured content platform for product storytelling.",
        },
      },
      {
        id: "payments",
        type: "payment",
        position: { x: 1250, y: 250 },
        data: {
          label: "Payments",
          tech: "Stripe",
          logo: "logos:stripe",
          description: "Global payment processing infrastructure.",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "cdn",
        target: "storefront",
        animated: true,
        data: { protocol: "HTTPS" },
        type: "simulation",
      },
      {
        id: "e2",
        source: "storefront",
        target: "headless",
        animated: true,
        data: { protocol: "REST" },
        type: "simulation",
      },
      {
        id: "e3",
        source: "storefront",
        target: "search",
        animated: true,
        data: { protocol: "InstantSearch" },
        type: "simulation",
      },
      {
        id: "e4",
        source: "headless",
        target: "cms",
        animated: true,
        data: { protocol: "GROQ" },
        type: "simulation",
      },
      {
        id: "e5",
        source: "headless",
        target: "payments",
        animated: true,
        data: { protocol: "PCI-DSS" },
        type: "simulation",
      },
    ],
  },
  realtime: {
    label: "Real-time Sync",
    description: "PartyKit + Hono + Automerge",
    icon: Users,
    color: "#ec4899",
    nodes: [
      {
        id: "client-a",
        type: "client",
        position: { x: 50, y: 100 },
        data: {
          label: "Client A",
          tech: "WASM",
          logo: "logos:webassembly",
          description: "Local-first client with CRDT state.",
        },
      },
      {
        id: "client-b",
        type: "client",
        position: { x: 50, y: 300 },
        data: {
          label: "Client B",
          tech: "WASM",
          logo: "logos:webassembly",
          description: "Local-first client with CRDT state.",
        },
      },
      {
        id: "partykit",
        type: "gateway",
        position: { x: 450, y: 200 },
        data: {
          label: "Stateful Edge",
          tech: "PartyKit",
          logo: "lucide:party-popper", // Fallback
          description:
            "deployed to Cloudflare Workers for low-latency collaboration.",
        },
      },
      {
        id: "api",
        type: "service",
        position: { x: 850, y: 50 },
        data: {
          label: "Edge API",
          tech: "Hono",
          serviceType: "backend",
          logo: "simple-icons:hono",
          description: "Ultrafast web framework on the edge.",
        },
      },
      {
        id: "bucket",
        type: "storage",
        position: { x: 1250, y: 200 },
        data: {
          label: "Object Storage",
          tech: "R2",
          logo: "logos:cloudflare-icon",
          description: "Egress-free object storage for snapshots.",
        },
      },
    ],
    edges: [
      {
        id: "e1",
        source: "client-a",
        target: "partykit",
        animated: true,
        data: { protocol: "WebSocket" },
        type: "simulation",
      },
      {
        id: "e2",
        source: "client-b",
        target: "partykit",
        animated: true,
        data: { protocol: "WebSocket" },
        type: "simulation",
      },
      {
        id: "e3",
        source: "partykit",
        target: "bucket",
        animated: true,
        data: { protocol: "Durable Objects" },
        type: "simulation",
      },
      {
        id: "e4",
        source: "partykit",
        target: "api",
        animated: true,
        data: { protocol: "RPC" },
        type: "simulation",
      },
    ],
  },
};

type TemplateKey = keyof typeof TEMPLATES;

// Mobile fallback component
function MobileArchitecturePreview({ template }: { template: TemplateKey }) {
  const templateData = TEMPLATES[template];
  const Icon = templateData.icon;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-bg-secondary">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${templateData.color}20` }}
      >
        <Icon className="w-10 h-10" style={{ color: templateData.color }} />
      </div>
      <h3 className="text-lg font-poppins font-semibold text-text-primary mb-2">
        {templateData.label}
      </h3>
      <p className="text-sm text-text-secondary text-center max-w-xs">
        {templateData.description}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-mono text-text-muted">
        <span>{templateData.nodes.length} nodes</span>
        <span>{templateData.edges.length} connections</span>
      </div>
    </div>
  );
}

function HeroCanvasInner() {
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateKey>("ecommerce");
  const [isMobile, setIsMobile] = useState(false);
  const template = TEMPLATES[activeTemplate];

  const [nodes, setNodes, onNodesChange] = useNodesState(template.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(template.edges);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update nodes/edges when template changes
  useEffect(() => {
    const template = TEMPLATES[activeTemplate];
    setNodes(template.nodes);
    setEdges(template.edges);
  }, [activeTemplate, setNodes, setEdges]);

  const nodeTypes = useMemo(
    () => ({
      database: DatabaseNode,
      gateway: GatewayNode,
      service: ServiceNode,
      queue: QueueNode,
      loadbalancer: LoadbalancerNode,
      cache: CacheNode,
      client: ClientNode,
      function: FunctionNode,
      storage: StorageNode,
      ai: AINode,
      payment: PaymentNode,
      auth: AuthNode,
    }),
    [],
  );

  const edgeTypes = useMemo(
    () => ({
      simulation: SimulationEdge,
    }),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "simulation", animated: true }, eds),
      ),
    [setEdges],
  );

  if (isMobile) {
    return (
      <div className="w-full h-full bg-bg-primary">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTemplate}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <MobileArchitecturePreview template={activeTemplate} />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Template Switcher */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-bg-secondary/90 backdrop-blur-md border border-border-primary p-2 flex justify-around">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => {
              const t = TEMPLATES[key];
              const Icon = t.icon;
              const isActive = activeTemplate === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTemplate(key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 transition-all",
                    isActive ? "text-brand-orange" : "text-text-muted",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-mono uppercase">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-bg-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.2}
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        className="drafting-grid"
      >
        <Background color="var(--canvas-dot)" gap={20} size={1} />

        <Panel
          position="top-center"
          className="mt-4 w-full max-w-4xl px-4 pointer-events-none"
        >
          <div className="flex flex-wrap justify-center bg-bg-secondary/90 backdrop-blur-md p-1.5 border border-border-primary shadow-lg gap-1 rounded-md pointer-events-auto">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => {
              const t = TEMPLATES[key];
              const Icon = t.icon;
              const isActive = activeTemplate === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTemplate(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all duration-200 rounded-sm",
                    isActive
                      ? "bg-brand-charcoal text-white shadow-md transform scale-105"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )}
                  title={t.description}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? undefined : t.color }}
                  />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function HeroCanvas() {
  return (
    <ReactFlowProvider>
      <HeroCanvasInner />
    </ReactFlowProvider>
  );
}
