/**
 * @deprecated Import from @/lib/agent/diagram-tools instead.
 */
export {
  createDiagramTools,
  applyToolResults,
} from "@/lib/agent/diagram-tools";

// Legacy export shape — use createDiagramTools() for new code
import { createDiagramTools } from "@/lib/agent/diagram-tools";
import type { GraphMutationState } from "@/lib/agent/types";
import type { ArchitectureMode } from "@/lib/prompt-engineering";

const emptyState: GraphMutationState = {
  nodes: [],
  edges: [],
  messages: [],
};

export const diagramTools = createDiagramTools(emptyState, "default");

export function getToolsForOperation(operation: string) {
  return createDiagramTools(emptyState, "default");
}
