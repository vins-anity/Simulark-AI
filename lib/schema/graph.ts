import * as v from "valibot";

// --- Enums ---

export const NodeTypeSchema = v.picklist([
  "gateway",
  "service",
  "frontend",
  "backend",
  "database",
  "queue",
  "ai",
  "auth",
  "payment",
  "automation",
  "messaging",
  "search",
  "monitoring",
  "cicd",
  "security",
  "vector-db",
  "ai-model",
  "idp",
  "function", // Serverless functions
  "bucket", // Object storage
  "external", // External API / SaaS
  "saas",
  "third-party",
]);

export const ProviderSchema = v.picklist(["AWS", "GCP", "Azure", "Generic"]);

export const ValidationStatusSchema = v.picklist(["valid", "warning", "error"]);

// --- Node Schemas ---

export const NodeDataSchema = v.object({
  label: v.string(),
  description: v.optional(v.string()), // Add description which is used in prompt
  justification: v.optional(v.string()), // AI reasoning for the node
  tech: v.optional(v.string()), // Technology ID for icon rendering (e.g., "nextjs", "postgres", "redis")
  serviceType: NodeTypeSchema,
  validationStatus: v.optional(ValidationStatusSchema, "valid"),
  costEstimate: v.optional(v.number(), 0),
});

export const NodeSchema = v.object({
  id: v.string(),
  type: v.string(), // Maps to React Flow node types (e.g., 'customNode')
  position: v.optional(
    v.object({
      x: v.number(),
      y: v.number(),
    }),
  ),
  data: NodeDataSchema,
});

// --- Edge Schemas ---

export const EdgeProtocolSchema = v.picklist([
  "http",
  "https",
  "graphql",
  "websocket",
  "queue",
  "stream",
  "database",
  "cache",
  "oauth",
  "grpc",
  "webrtc",
  "crdt", // Conflict-free Replicated Data Type sync
  "rsc", // React Server Components wire format
  "ipc", // Inter-process communication (for local AI)
]);

export const EdgeDataSchema = v.object({
  protocol: v.optional(EdgeProtocolSchema, "http"),
  latency: v.optional(v.number()),
  label: v.optional(v.string()), // Connection name/label
});

export const EdgeSchema = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  data: v.optional(EdgeDataSchema),
  animated: v.optional(v.boolean(), true),
});

// --- Graph & Project Schema ---

export const ArchitectureGraphSchema = v.object({
  nodes: v.array(NodeSchema),
  edges: v.array(EdgeSchema),
});

export const ProjectSchema = v.object({
  id: v.string(), // UUID
  user_id: v.string(), // UUID
  name: v.string(),
  provider: v.optional(ProviderSchema, "Generic"),
  nodes: v.array(NodeSchema),
  edges: v.array(EdgeSchema),
  metadata: v.optional(v.record(v.string(), v.any()), {}), // Project-specific UI settings
});

export type NodeType = v.InferOutput<typeof NodeTypeSchema>;
export type NodeData = v.InferOutput<typeof NodeDataSchema>;
export type ArchitectureGraph = v.InferOutput<typeof ArchitectureGraphSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;
     