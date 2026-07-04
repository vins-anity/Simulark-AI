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
): boolean {
  if (currentNodeCount === 0) {
    return false;
  }
  return AGENT_OPERATIONS.has(operationType);
}
