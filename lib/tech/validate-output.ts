/**
 * Post-generation tech ID validation and correction.
 */

import { normalizeTechName } from "@/lib/tech/aliases";
import { isValidTechId, TECH_BY_ID } from "@/lib/tech/registry";

export interface TechValidationIssue {
  nodeId: string;
  originalTech: string;
  resolvedTech?: string;
  message: string;
}

export function validateTechOutput(
  nodes: Array<{ id: string; data?: { tech?: string } }>,
  candidateIds: string[],
): { nodes: typeof nodes; issues: TechValidationIssue[] } {
  const allowed = new Set(candidateIds);
  const issues: TechValidationIssue[] = [];

  const fixed = nodes.map((node) => {
    const tech = node.data?.tech;
    if (!tech) return node;

    if (allowed.has(tech) && isValidTechId(tech)) return node;

    const normalized = normalizeTechName(tech);
    if (normalized && (allowed.has(normalized) || isValidTechId(normalized))) {
      if (normalized !== tech) {
        issues.push({
          nodeId: node.id,
          originalTech: tech,
          resolvedTech: normalized,
          message: `Normalized tech "${tech}" → "${normalized}"`,
        });
      }
      return {
        ...node,
        data: { ...node.data, tech: normalized },
      };
    }

    // Closest allowed match by prefix
    const closest = candidateIds.find(
      (id) => id.startsWith(tech.toLowerCase()) || tech.toLowerCase().includes(id),
    );

    if (closest) {
      issues.push({
        nodeId: node.id,
        originalTech: tech,
        resolvedTech: closest,
        message: `Mapped unknown tech "${tech}" → "${closest}"`,
      });
      return {
        ...node,
        data: { ...node.data, tech: closest },
      };
    }

    issues.push({
      nodeId: node.id,
      originalTech: tech,
      message: `Removed invalid tech "${tech}" (not in catalog)`,
    });

    const { tech: _removed, ...restData } = node.data || {};
    return {
      ...node,
      data: restData,
    };
  });

  return { nodes: fixed, issues };
}

export function getCompactTechLine(id: string): string | null {
  const item = TECH_BY_ID.get(id);
  if (!item) return null;
  return `${item.id} | ${item.defaultType || item.category}`;
}
