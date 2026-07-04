/**
 * Dynamic tech validation matrix for prompt injection (per-request candidates only).
 */

import { TECH_BY_ID } from "@/lib/tech/registry";
import { resolveDefaultNodeType } from "@/lib/schema/node-type";

export function generateTechValidationMatrix(candidateIds: string[]): string {
  const lines = candidateIds
    .map((id) => {
      const item = TECH_BY_ID.get(id);
      if (!item) return null;
      const nodeType =
        resolveDefaultNodeType(item.defaultType) || item.category;
      return `| ${id} | ${nodeType} | ${item.label} |`;
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return "No specific tech constraints for this request.";
  }

  return [
    "ALLOWED TECH (id | node type | label):",
    "| tech_id | node_type | label |",
    "|---------|-----------|-------|",
    ...lines,
  ].join("\n");
}
