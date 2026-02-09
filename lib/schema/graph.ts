import * as v from "valibot";

// --- Enums ---

export const NodeTypeSchema = v.picklist([
  "gateway",
  "service",
  "database",
  "queue",
]);

export const ProviderSchema = v.picklist(["AWS", "GCP", "Azure", "Generic"]);

export const ValidationStatusSchema = v.picklist(["valid", "warning", "error"]);

// --- Node Schemas ---

export const NodeDataSchema = v.object({
  label: v.string(),
  serviceType: NodeTypeSchema,
  validationStatus: v.optional(ValidationStatusSchema, "valid"),
  costEstimate: v.optional(v.number(), 0),
});

export const NodeSchema = v.object({
  id: v.string(),
  type: v.string(), // Maps to React Flow node types (e.g., 'customNode')
  position: v.optional(v.object({
    x: v.number(),
    y: v.number(),
  })),
  data: NodeDataSchema,
});

// --- Edge Schemas ---

export const EdgeProtocolSchema = v.picklist(["http", "queue", "stream"]);

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
});

export type NodeType = v.InferOutput<typeof NodeTypeSchema>;
export type NodeData = v.InferOutput<typeof NodeDataSchema>;
export type ArchitectureGraph = v.InferOutput<typeof ArchitectureGraphSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;
