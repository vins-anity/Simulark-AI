import type { OperationType } from "@/lib/intent-detector";

const AGENT_OPERATIONS: Set<OperationType> = new Set([
  "modify",
  "extend",
  "remove",
  "simplify",
  "optimize",
]);

/**
 * Route to ToolLoopAgent for surgical edits; structured generation for create.
 */
export function shouldUseAgentPath(
  operationType: OperationType,
  currentNodeCount: number,
  currentEdgeCount = 0,
): boolean {
  if (currentNodeCount === 0) {
    return false;
  }
  // Disconnected or sparse graphs need full structured regen — agent tool wiring is unreliable
  if (currentEdgeCount === 0) {
    return false;
  }
  if (currentNodeCount > 2 && currentEdgeCount < currentNodeCount - 2) {
    return false;
  }
  return AGENT_OPERATIONS.has(operationType);
}
