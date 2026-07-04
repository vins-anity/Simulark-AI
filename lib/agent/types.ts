import type { ArchitectureMode } from "@/lib/prompt-engineering";
import type { OperationType } from "@/lib/intent-detector";

export interface GraphNode {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  data?: Record<string, unknown>;
}

export interface SimularkAgentContext {
  userInput: string;
  mode: ArchitectureMode;
  operationType: OperationType;
  nodes: GraphNode[];
  edges: GraphEdge[];
  userId: string;
  architectureType: string;
  complexity: string;
  userPreferences?: Record<string, unknown>;
  systemPrompt?: string;
  candidateTechIds?: string[];
}

export interface GraphMutationState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  messages: string[];
}

export function createGraphState(
  nodes: unknown[],
  edges: unknown[],
): GraphMutationState {
  return {
    nodes: (nodes as GraphNode[]) ?? [],
    edges: (edges as GraphEdge[]) ?? [],
    messages: [],
  };
}
