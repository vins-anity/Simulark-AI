import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { validateArchitecture } from "@/lib/architecture-validator";
import { ensureArchitectureEdges } from "@/lib/infer-architecture-edges";
import type { ArchitectureMode } from "@/lib/prompt-engineering";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";
import type { GraphMutationState, GraphNode } from "@/lib/agent/types";

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Build diagram manipulation tools bound to mutable graph state.
 */
export function createDiagramTools(
  state: GraphMutationState,
  mode: ArchitectureMode,
): ToolSet {
  return {
    addNode: tool({
      description:
        "Add a component to the architecture canvas with semantic type and label",
      inputSchema: z.object({
        type: z.string(),
        label: z.string(),
        tech: z.string().optional(),
        description: z.string().optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
      }),
      execute: async ({ type, label, tech, description, position }) => {
        const id = nextId(type);
        const node = {
          id,
          type,
          position: position ?? { x: 200, y: 200 },
          data: {
            label,
            tech: tech ?? "",
            description: description ?? "",
            serviceType: type,
          },
        };
        const enriched = enrichNodesWithTech([node]);
        const enrichedNode = enriched[0] as unknown as GraphNode;
        state.nodes.push(enrichedNode);
        const message = `Added ${label} (${type})`;
        state.messages.push(message);
        return { node: enriched[0], message };
      },
    }),

    removeNode: tool({
      description: "Remove a node from the architecture by id",
      inputSchema: z.object({
        nodeId: z.string(),
        cascade: z.boolean().optional(),
      }),
      execute: async ({ nodeId, cascade = true }) => {
        const before = state.nodes.length;
        state.nodes = state.nodes.filter((n) => n.id !== nodeId);
        if (cascade) {
          state.edges = state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          );
        }
        const message =
          before === state.nodes.length
            ? `Node ${nodeId} not found`
            : `Removed node ${nodeId}`;
        state.messages.push(message);
        return { removed: nodeId, message };
      },
    }),

    connectNodes: tool({
      description: "Connect two nodes with a labeled edge",
      inputSchema: z.object({
        sourceId: z.string(),
        targetId: z.string(),
        protocol: z.string().optional(),
        label: z.string().optional(),
      }),
      execute: async ({ sourceId, targetId, protocol, label }) => {
        const edge = {
          id: nextId("edge"),
          source: sourceId,
          target: targetId,
          animated: true,
          data: {
            protocol: protocol ?? "https",
            label: label ?? protocol ?? "https",
          },
        };
        state.edges.push(edge);
        const message = `Connected ${sourceId} → ${targetId}`;
        state.messages.push(message);
        return { edge, message };
      },
    }),

    disconnectNodes: tool({
      description: "Remove an edge by id",
      inputSchema: z.object({
        edgeId: z.string(),
      }),
      execute: async ({ edgeId }) => {
        state.edges = state.edges.filter((e) => e.id !== edgeId);
        const message = `Removed edge ${edgeId}`;
        state.messages.push(message);
        return { edgeId, message };
      },
    }),

    updateNode: tool({
      description: "Update properties of an existing node",
      inputSchema: z.object({
        nodeId: z.string(),
        updates: z.object({
          label: z.string().optional(),
          tech: z.string().optional(),
          description: z.string().optional(),
        }),
      }),
      execute: async ({ nodeId, updates }) => {
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node) {
          return { success: false, message: `Node ${nodeId} not found` };
        }
        node.data = { ...node.data, ...updates };
        if (updates.tech) {
          const enriched = enrichNodesWithTech([
            node as unknown as Record<string, unknown>,
          ]);
          Object.assign(node, enriched[0]);
        }
        const message = `Updated node ${nodeId}`;
        state.messages.push(message);
        return { success: true, node, message };
      },
    }),

    validateGraph: tool({
      description:
        "Run architecture validation on the current graph and optionally auto-fix",
      inputSchema: z.object({
        autoFix: z.boolean().optional(),
      }),
      execute: async ({ autoFix = false }) => {
        const result = validateArchitecture(state.nodes, state.edges, mode, {
          autoFix,
        });
        if (result.fixed) {
          state.nodes = result.fixed.nodes as typeof state.nodes;
          state.edges = result.fixed.edges as typeof state.edges;
        }

        if (autoFix) {
          const edgeEnsured = ensureArchitectureEdges(state.nodes, state.edges);
          if (edgeEnsured.inferred) {
            state.edges = edgeEnsured.edges as typeof state.edges;
            result.appliedFixes.push(...edgeEnsured.appliedFixes);
          }
        }

        const message = `Found ${result.issues.length} issues`;
        state.messages.push(message);
        return {
          valid: result.valid,
          issues: result.issues,
          appliedFixes: result.appliedFixes,
          message,
        };
      },
    }),

    getArchitectureSummary: tool({
      description: "Get a summary of the current architecture state",
      inputSchema: z.object({}),
      execute: async () => {
        const types = Array.from(new Set(state.nodes.map((n) => n.type)));
        return {
          nodeCount: state.nodes.length,
          edgeCount: state.edges.length,
          componentTypes: types,
          summary: `${state.nodes.length} nodes, ${state.edges.length} edges`,
        };
      },
    }),
  };
}

/**
 * Apply accumulated tool results to graph arrays.
 */
export function applyToolResults(
  state: GraphMutationState,
  currentNodes: unknown[],
  currentEdges: unknown[],
): { nodes: unknown[]; edges: unknown[] } {
  if (state.nodes.length === 0 && state.edges.length === 0) {
    return { nodes: currentNodes, edges: currentEdges };
  }
  return { nodes: state.nodes, edges: state.edges };
}
