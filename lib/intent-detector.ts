import { logger } from "./logger";

/**
 * Operation types for dynamic architecture modifications
 */
export type OperationType =
  | "create" // Generate new architecture from scratch
  | "modify" // Make specific changes to existing architecture
  | "simplify" // Reduce complexity while maintaining functionality
  | "remove" // Remove specific components
  | "extend" // Add new components to existing architecture
  | "optimize"; // Improve performance/resource usage

/**
 * Detects the user's intent from their input
 * This helps the AI understand whether to create new or modify existing
 */
export function detectOperation(
  input: string,
  currentNodes: unknown[],
): OperationType {
  const normalizedInput = input.toLowerCase();
  const hasExisting = currentNodes.length > 0;

  // If no existing architecture, always create
  if (!hasExisting) {
    return "create";
  }

  // Check for simplification keywords
  const simplifyKeywords = [
    "simplify",
    "simpler",
    "less complex",
    "reduce complexity",
    "make it simpler",
    "easier",
    "basic",
    "minimal",
    "stripped down",
    "streamline",
  ];
  if (simplifyKeywords.some((kw) => normalizedInput.includes(kw))) {
    logger.info("Detected operation: simplify", { input: normalizedInput });
    return "simplify";
  }

  // Check for removal keywords
  const removeKeywords = [
    "remove",
    "delete",
    "drop",
    "get rid of",
    "take out",
    "eliminate",
    "without",
    "no more",
    "ditch",
  ];
  if (removeKeywords.some((kw) => normalizedInput.includes(kw))) {
    logger.info("Detected operation: remove", { input: normalizedInput });
    return "remove";
  }

  // Check for extension/addition keywords
  const extendKeywords = [
    "add",
    "include",
    "insert",
    "put in",
    "extension",
    "expand",
    "more",
    "additional",
    "extra",
    "also need",
    "as well",
    "plus",
  ];
  if (extendKeywords.some((kw) => normalizedInput.includes(kw))) {
    logger.info("Detected operation: extend", { input: normalizedInput });
    return "extend";
  }

  // Check for optimization keywords
  const optimizeKeywords = [
    "optimize",
    "improve",
    "better",
    "faster",
    "cheaper",
    "efficient",
    "performance",
    "scale",
    "upgrade",
    "enhance",
  ];
  if (optimizeKeywords.some((kw) => normalizedInput.includes(kw))) {
    logger.info("Detected operation: optimize", { input: normalizedInput });
    return "optimize";
  }

  // Check for modification keywords
  const modifyKeywords = [
    "change",
    "update",
    "modify",
    "replace",
    "switch",
    "instead",
    "different",
    "make it",
    "convert",
    "transform",
  ];
  if (modifyKeywords.some((kw) => normalizedInput.includes(kw))) {
    logger.info("Detected operation: modify", { input: normalizedInput });
    return "modify";
  }

  // Default to modify if there's existing architecture but no clear intent
  logger.info("Detected operation: modify (default)", {
    input: normalizedInput,
  });
  return "modify";
}

/**
 * Get operation-specific instructions for the AI
 */
export function getOperationInstructions(operation: OperationType): string {
  const instructions: Record<OperationType, string> = {
    create:
      "Create a completely new architecture from scratch based on the user's requirements. Generate all necessary components from the ground up.",

    modify:
      "Modify the existing architecture while preserving its core structure. Make targeted changes as requested while maintaining overall integrity.",

    simplify:
      "Simplify the existing architecture by removing non-essential components and reducing complexity. Focus on core functionality while maintaining the same basic capabilities. Remove redundancy, consolidate services, and use simpler alternatives where appropriate. You MAY go below the normal minimum component count for simplification.",

    remove:
      "Remove the specified components from the existing architecture. Ensure the remaining components can still function correctly without the removed parts. Update connections and dependencies as needed.",

    extend:
      "Add new components to the existing architecture while preserving all current functionality. Integrate new services seamlessly with existing ones. Maintain consistency with the current architecture style and patterns.",

    optimize:
      "Optimize the existing architecture for better performance, cost, or scalability. Keep the same components but improve their configuration, connections, or deployment strategy. Focus on efficiency gains.",
  };

  return instructions[operation];
}

/**
 * Check if the operation should relax mode constraints
 * (e.g., simplification can go below minimum component count)
 */
export function shouldRelaxConstraints(operation: OperationType): boolean {
  return operation === "simplify" || operation === "remove";
}

/**
 * Get minimum component count adjustment based on operation
 */
export function getComponentCountAdjustment(operation: OperationType): {
  minAdjustment: number;
  maxAdjustment: number;
} {
  switch (operation) {
    case "simplify":
      return { minAdjustment: -2, maxAdjustment: -3 }; // Can go 2-3 below normal minimum
    case "remove":
      return { minAdjustment: -1, maxAdjustment: 0 }; // Can go 1 below
    case "extend":
      return { minAdjustment: 0, maxAdjustment: 2 }; // Can go 2 above
    case "create":
    case "modify":
    case "optimize":
    default:
      return { minAdjustment: 0, maxAdjustment: 0 }; // No adjustment
  }
}
