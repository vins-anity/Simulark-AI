import { z } from "zod";

/**
 * Zod schemas for structured architecture generation
 * These ensure type-safe outputs from the AI
 */

// Node position schema
export const PositionSchema = z.object({
  x: z.number().describe("X coordinate (0-800)"),
  y: z.number().describe("Y coordinate (0-600)"),
});

// Node data schema
export const NodeDataSchema = z.object({
  label: z.string().describe("Display name of the component"),
  tech: z
    .string()
    .optional()
    .describe(
      "Technology ID for icon rendering (e.g., 'nextjs', 'postgresql')",
    ),
  description: z
    .string()
    .optional()
    .describe("Brief description of the component's purpose"),
  serviceType: z
    .enum([
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
      "cache",
      "storage",
      "function",
    ])
    .describe("Type of the component"),
  costEstimate: z.number().optional().describe("Estimated monthly cost in USD"),
});

// Node schema
export const NodeSchema = z.object({
  id: z.string().describe("Unique identifier for the node"),
  type: z
    .enum([
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
      "cache",
      "storage",
      "function",
      "client",
      "loadbalancer",
    ])
    .describe("Visual type of the node"),
  position: PositionSchema.describe("Position of the node on the canvas"),
  data: NodeDataSchema.describe("Component data and metadata"),
});

// Edge data schema
export const EdgeDataSchema = z.object({
  protocol: z
    .enum([
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
    ])
    .optional()
    .describe("Communication protocol used"),
  label: z.string().optional().describe("Optional label for the connection"),
  latency: z.number().optional().describe("Expected latency in milliseconds"),
});

// Edge schema
export const EdgeSchema = z.object({
  id: z.string().describe("Unique identifier for the edge"),
  source: z.string().describe("ID of the source node"),
  target: z.string().describe("ID of the target node"),
  animated: z
    .boolean()
    .optional()
    .describe("Whether to animate the connection"),
  data: EdgeDataSchema.optional().describe("Edge metadata"),
});

// Complete architecture schema
export const ArchitectureSchema = z.object({
  nodes: z
    .array(NodeSchema)
    .min(1)
    .max(50)
    .describe("Array of components in the architecture"),
  edges: z
    .array(EdgeSchema)
    .optional()
    .describe("Array of connections between components"),
  metadata: z
    .object({
      architectureType: z
        .string()
        .optional()
        .describe("Type of architecture (web-app, microservices, etc.)"),
      complexity: z
        .enum(["simple", "medium", "complex"])
        .optional()
        .describe("Complexity level of the architecture"),
      totalCost: z
        .number()
        .optional()
        .describe("Total estimated monthly cost in USD"),
      reasoning: z
        .string()
        .optional()
        .describe("AI's reasoning for the architecture decisions"),
    })
    .optional()
    .describe("Additional metadata about the architecture"),
});

// Export types for TypeScript usage
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type EdgeData = z.infer<typeof EdgeDataSchema>;
export type Position = z.infer<typeof PositionSchema>;

/**
 * Validate architecture against schema
 */
export function validateArchitecture(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: Architecture;
} {
  const result = ArchitectureSchema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  } else {
    return {
      valid: false,
      errors: result.error.issues.map((e) => `${String(e.path)}: ${e.message}`),
    };
  }
}

/**
 * Partial validation for streaming updates
 */
export function validatePartialArchitecture(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  // Use partial() for streaming validation
  const partialSchema = ArchitectureSchema.partial();
  const result = partialSchema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: [] };
  } else {
    return {
      valid: false,
      errors: result.error.issues.map((e) => `${String(e.path)}: ${e.message}`),
    };
  }
}
