import {
  getValidationSummary,
  type ValidationIssue,
  validateArchitecture,
} from "@/lib/architecture-validator";
import type { ArchitectureMode } from "@/lib/prompt-engineering";

type QualityGrade = "A" | "B" | "C" | "D" | "F";
type QualityStatus = "healthy" | "warning" | "critical";

export interface ArchitectureQualitySummary {
  totalIssues: number;
  errors: number;
  warnings: number;
  suggestions: number;
  nodeCount: number;
  edgeCount: number;
  connectedComponents: number;
  isolatedNodes: number;
  density: number;
}

export interface ArchitectureQualityReport {
  mode: ArchitectureMode;
  score: number;
  grade: QualityGrade;
  status: QualityStatus;
  isExportBlocked: boolean;
  blockers: string[];
  summary: ArchitectureQualitySummary;
  topIssues: ValidationIssue[];
}

function normalizeMode(mode?: string): ArchitectureMode {
  if (mode === "startup" || mode === "enterprise") {
    return mode;
  }
  return "default";
}

function countConnectedComponents(nodes: any[], edges: any[]): number {
  if (nodes.length === 0) return 0;

  const adjacency = new Map<string, Set<string>>();
  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
      continue;
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  const visited = new Set<string>();
  let components = 0;

  for (const node of nodes) {
    const nodeId = node.id;
    if (visited.has(nodeId)) continue;
    components += 1;
    const stack = [nodeId];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const neighbors = adjacency.get(current);
      if (!neighbors) continue;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return components;
}

function countIsolatedNodes(nodes: any[], edges: any[]): number {
  if (nodes.length === 0) return 0;
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  return nodes.filter((node) => !connected.has(node.id)).length;
}

function scoreToGrade(score: number): QualityGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function calculateScore(input: {
  errors: number;
  warnings: number;
  suggestions: number;
  isolatedNodes: number;
  nodeCount: number;
  edgeCount: number;
  connectedComponents: number;
}): number {
  const {
    errors,
    warnings,
    suggestions,
    isolatedNodes,
    nodeCount,
    edgeCount,
    connectedComponents,
  } = input;

  let score = 100;

  score -= errors * 30;
  score -= warnings * 12;
  score -= suggestions * 4;
  score -= isolatedNodes * 7;

  if (nodeCount > 0) {
    const expectedEdges = Math.max(1, nodeCount - 1);
    const density = Math.min(1.5, edgeCount / expectedEdges);
    if (density < 0.4) {
      score -= 8;
    } else if (density > 0.9) {
      score += 4;
    }
  }

  if (connectedComponents <= 1 && isolatedNodes === 0 && nodeCount >= 4) {
    score += 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getIssuePriority(type: ValidationIssue["type"]): number {
  if (type === "error") return 0;
  if (type === "warning") return 1;
  return 2;
}

export function analyzeArchitectureQuality(
  nodes: any[],
  edges: any[],
  mode?: string,
): ArchitectureQualityReport {
  const normalizedMode = normalizeMode(mode);
  const validation = validateArchitecture(nodes, edges, normalizedMode);
  const summary = getValidationSummary(validation.issues);
  const connectedComponents = countConnectedComponents(nodes, edges);
  const isolatedNodes = countIsolatedNodes(nodes, edges);
  const density =
    nodes.length > 0 ? Number((edges.length / nodes.length).toFixed(2)) : 0;

  const score = calculateScore({
    errors: summary.errors,
    warnings: summary.warnings,
    suggestions: summary.suggestions,
    isolatedNodes,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    connectedComponents,
  });
  const grade = scoreToGrade(score);

  const blockers: string[] = [];
  if (summary.errors > 0) {
    blockers.push(
      `Architecture has ${summary.errors} blocking validation error${summary.errors === 1 ? "" : "s"}.`,
    );
  }
  if (isolatedNodes > Math.max(1, Math.floor(nodes.length * 0.35))) {
    blockers.push(
      `Too many isolated components (${isolatedNodes}/${nodes.length}) reduce architectural integrity.`,
    );
  }
  if (connectedComponents > Math.max(1, Math.floor(nodes.length / 3))) {
    blockers.push(
      `Graph is fragmented into ${connectedComponents} disconnected groups.`,
    );
  }
  if (score < 50) {
    blockers.push("Quality score is below minimum export threshold (50).");
  }

  const status: QualityStatus =
    summary.errors > 0 || score < 50
      ? "critical"
      : summary.warnings > 0 || score < 75
        ? "warning"
        : "healthy";

  const topIssues = [...validation.issues]
    .sort((a, b) => getIssuePriority(a.type) - getIssuePriority(b.type))
    .slice(0, 5);

  return {
    mode: normalizedMode,
    score,
    grade,
    status,
    isExportBlocked: blockers.length > 0,
    blockers,
    summary: {
      totalIssues: summary.total,
      errors: summary.errors,
      warnings: summary.warnings,
      suggestions: summary.suggestions,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      connectedComponents,
      isolatedNodes,
      density,
    },
    topIssues,
  };
}
