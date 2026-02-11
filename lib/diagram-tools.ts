import { tool } from "ai";
import { z } from "zod";
import { logger } from "./logger";

/**
 * Schema for adding a node to the architecture
 */
const AddNodeSchema = z.object({
  type: z.enum([
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
  ]),
  label: z.string(),
  tech: z.string().optional(),
  description: z.string().optional(),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

/**
 * Schema for removing a node
 */
const RemoveNodeSchema = z.object({
  nodeId: z.string(),
  cascade: z.boolean().optional(), // Whether to remove connected edges
});

/**
 * Schema for connecting nodes
 */
const ConnectNodesSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
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
    .optional(),
  label: z.string().optional(),
});

/**
 * Schema for disconnecting nodes
 */
const DisconnectNodesSchema = z.object({
  edgeId: z.string(),
});

/**
 * Schema for updating a node
 */
const UpdateNodeSchema = z.object({
  nodeId: z.string(),
  updates: z.object({
    label: z.string().optional(),
    tech: z.string().optional(),
    description: z.string().optional(),
  }),
});

/**
 * Schema for validating the architecture
 */
const ValidateArchitectureSchema = z.object({
  checkConnectivity: z.boolean().optional(),
  checkModeConstraints: z.boolean().optional(),
});

/**
 * Type definitions for tool results
 */
interface NodeResult {
  id: string;
  type: string;
  label: string;
  success: boolean;
  message?: string;
}

interface EdgeResult {
  id: string;
  source: string;
  target: string;
  success: boolean;
  message?: string;
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Diagram manipulation tools for AI
 * These tools allow the AI to make precise changes to the architecture
 */
export const diagramTools = {
  /**
   * Add a new component/node to the architecture
   */
  addNode: tool({
    description:
      "Add a new component/node to the architecture. Use this when the user wants to add a new service, database, or other component. Returns the created node with its ID.",
    inputSchema: AddNodeSchema,
    execute: async ({
      type,
      label,
      tech,
      description,
      position,
    }): Promise<NodeResult> => {
      const nodeId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      logger.info("Tool: addNode executed", {
        nodeId,
        type,
        label,
        tech,
      });

      return {
        id: nodeId,
        type,
        label,
        success: true,
        message: `Added ${type} component "${label}" with ID ${nodeId}`,
      };
    },
  }),

  /**
   * Remove a component/node from the architecture
   */
  removeNode: tool({
    description:
      "Remove a component/node from the architecture. Use this when the user wants to delete or remove a specific component. The nodeId should match an existing component's ID.",
    inputSchema: RemoveNodeSchema,
    execute: async ({ nodeId, cascade }): Promise<NodeResult> => {
      logger.info("Tool: removeNode executed", { nodeId, cascade });

      return {
        id: nodeId,
        type: "removed",
        label: "Removed",
        success: true,
        message: `Removed node ${nodeId}${cascade ? " and its connected edges" : ""}`,
      };
    },
  }),

  /**
   * Create a connection between two components
   */
  connectNodes: tool({
    description:
      "Create a connection/edge between two components. Use this to establish communication between services. Provide the source and target node IDs, and optionally specify the protocol (http, https, websocket, grpc, queue, etc.).",
    inputSchema: ConnectNodesSchema,
    execute: async ({
      sourceId,
      targetId,
      protocol,
      label,
    }): Promise<EdgeResult> => {
      const edgeId = `edge-${sourceId}-${targetId}-${Date.now()}`;

      logger.info("Tool: connectNodes executed", {
        edgeId,
        sourceId,
        targetId,
        protocol,
      });

      return {
        id: edgeId,
        source: sourceId,
        target: targetId,
        success: true,
        message: `Connected ${sourceId} to ${targetId} via ${protocol || "http"}`,
      };
    },
  }),

  /**
   * Remove a connection between components
   */
  disconnectNodes: tool({
    description:
      "Remove a connection/edge from the architecture. Use this to disconnect two components that no longer need to communicate.",
    inputSchema: DisconnectNodesSchema,
    execute: async ({ edgeId }): Promise<EdgeResult> => {
      logger.info("Tool: disconnectNodes executed", { edgeId });

      return {
        id: edgeId,
        source: "",
        target: "",
        success: true,
        message: `Removed connection ${edgeId}`,
      };
    },
  }),

  /**
   * Update an existing component's properties
   */
  updateNode: tool({
    description:
      "Update an existing component's properties such as label, technology, or description. Use this when the user wants to change details about a component without replacing it entirely.",
    inputSchema: UpdateNodeSchema,
    execute: async ({
      nodeId,
      updates,
    }): Promise<{
      nodeId: string;
      updates: object;
      success: boolean;
      message: string;
    }> => {
      logger.info("Tool: updateNode executed", { nodeId, updates });

      return {
        nodeId,
        updates,
        success: true,
        message: `Updated node ${nodeId} with changes: ${Object.keys(updates).join(", ")}`,
      };
    },
  }),

  /**
   * Validate the current architecture
   */
  validateArchitecture: tool({
    description:
      "Validate the current architecture for issues like disconnected components, invalid configurations, or mode constraint violations. Returns a list of any problems found.",
    inputSchema: ValidateArchitectureSchema,
    execute: async ({
      checkConnectivity,
      checkModeConstraints,
    }): Promise<ValidationResult> => {
      logger.info("Tool: validateArchitecture executed", {
        checkConnectivity,
        checkModeConstraints,
      });

      // This would perform actual validation in a real implementation
      return {
        valid: true,
        issues: [],
        warnings: [],
      };
    },
  }),

  /**
   * Get current architecture summary
   */
  getArchitectureSummary: tool({
    description:
      "Get a summary of the current architecture including component count, types, and key connections. Use this to understand the current state before making modifications.",
    inputSchema: z.object({}), // No parameters needed
    execute: async (): Promise<{
      nodeCount: number;
      edgeCount: number;
      componentTypes: string[];
      summary: string;
    }> => {
      logger.info("Tool: getArchitectureSummary executed");

      // This would return actual data in a real implementation
      return {
        nodeCount: 0,
        edgeCount: 0,
        componentTypes: [],
        summary: "Architecture summary retrieved",
      };
    },
  }),
};

/**
 * Get available tools for a specific operation type
 * Some operations may only need a subset of tools
 */
export function getToolsForOperation(operation: string): typeof diagramTools {
  switch (operation) {
    case "create":
      // For creation, we mainly need addNode and connectNodes
      return {
        addNode: diagramTools.addNode,
        connectNodes: diagramTools.connectNodes,
        validateArchitecture: diagramTools.validateArchitecture,
        getArchitectureSummary: diagramTools.getArchitectureSummary,
        updateNode: diagramTools.updateNode,
        removeNode: diagramTools.removeNode,
        disconnectNodes: diagramTools.disconnectNodes,
      };

    case "simplify":
    case "remove":
      // For simplification/removal, we need remove and disconnect
      return {
        removeNode: diagramTools.removeNode,
        disconnectNodes: diagramTools.disconnectNodes,
        validateArchitecture: diagramTools.validateArchitecture,
        getArchitectureSummary: diagramTools.getArchitectureSummary,
        updateNode: diagramTools.updateNode,
        connectNodes: diagramTools.connectNodes,
        addNode: diagramTools.addNode,
      };

    case "extend":
    case "modify":
    case "optimize":
    default:
      // For modifications, provide all tools
      return diagramTools;
  }
}

/**
 * Convert tool results to architecture changes
 * This would be used to apply tool results to the actual diagram
 */
export function applyToolResults(
  results: unknown[],
  currentNodes: unknown[],
  currentEdges: unknown[],
): { nodes: unknown[]; edges: unknown[] } {
  // This is a placeholder - actual implementation would modify the arrays
  // based on the tool execution results
  logger.info("Applying tool results", { resultCount: results.length });

  return {
    nodes: currentNodes,
    edges: currentEdges,
  };
}
