import type { Edge, Node } from "@xyflow/react";

interface MermaidNodeLike {
  id: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface MermaidEdgeLike {
  source: string;
  target: string;
  data?: Record<string, unknown>;
}

interface MermaidGenerationOptions {
  direction?: "TD" | "LR";
  includeSubgraphs?: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  frontend: "Frontend Layer",
  gateway: "Ingress Layer",
  loadbalancer: "Ingress Layer",
  backend: "Application Services",
  service: "Application Services",
  function: "Application Services",
  ai: "AI Services",
  "ai-model": "AI Services",
  auth: "Security & Identity",
  security: "Security & Identity",
  database: "Data Layer",
  "vector-db": "Data Layer",
  cache: "Data Layer",
  queue: "Messaging Layer",
  messaging: "Messaging Layer",
  payment: "Business Integrations",
  automation: "Automation",
  monitoring: "Observability",
  cicd: "Delivery Pipeline",
  bucket: "Storage",
  storage: "Storage",
};

function sanitizeLabel(raw: string): string {
  return raw
    .replace(/[\n\r"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNodeLabel(node: MermaidNodeLike): string {
  const raw = node.data?.label;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return sanitizeLabel(raw);
  }
  return sanitizeLabel(node.id);
}

function normalizeNodeType(node: MermaidNodeLike): string {
  if (typeof node.data?.serviceType === "string" && node.data.serviceType) {
    return node.data.serviceType.toLowerCase();
  }
  return (node.type || "service").toLowerCase();
}

function toMermaidId(raw: string, index: number): string {
  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    return `node_${index + 1}`;
  }
  if (/^[0-9]/.test(normalized)) {
    return `node_${normalized}`;
  }
  return normalized;
}

function formatNodeShape(nodeType: string, label: string): string {
  switch (nodeType) {
    case "database":
    case "vector-db":
    case "bucket":
    case "storage":
      return `[("${label}")]`;
    case "queue":
    case "messaging":
      return `{{"${label}"}}`;
    case "gateway":
    case "loadbalancer":
    case "security":
      return `{"${label}"}`;
    case "ai":
    case "ai-model":
      return `[${JSON.stringify(`AI: ${label}`)}]`;
    case "function":
    case "cicd":
    case "automation":
      return `[[${JSON.stringify(label)}]]`;
    default:
      return `[${JSON.stringify(label)}]`;
  }
}

function buildNodeAliasMap(nodes: MermaidNodeLike[]): Map<string, string> {
  const used = new Set<string>();
  const aliasMap = new Map<string, string>();

  nodes.forEach((node, index) => {
    const baseAlias = toMermaidId(node.id, index);
    let alias = baseAlias;
    let suffix = 1;
    while (used.has(alias)) {
      alias = `${baseAlias}_${suffix}`;
      suffix += 1;
    }
    used.add(alias);
    aliasMap.set(node.id, alias);
  });

  return aliasMap;
}

function getEdgeLabel(edge: MermaidEdgeLike): string | null {
  const candidate =
    (typeof edge.data?.label === "string" && edge.data.label) ||
    (typeof edge.data?.protocol === "string" && edge.data.protocol) ||
    "";
  const sanitized = sanitizeLabel(candidate);
  return sanitized.length > 0 ? sanitized : null;
}

export function generateMermaidFlowchart(
  nodes: MermaidNodeLike[],
  edges: MermaidEdgeLike[],
  options: MermaidGenerationOptions = {},
): string {
  const direction = options.direction || "TD";
  const includeSubgraphs = options.includeSubgraphs ?? true;
  const aliasMap = buildNodeAliasMap(nodes);
  const lines: string[] = [`flowchart ${direction}`];

  const grouped = new Map<string, MermaidNodeLike[]>();
  const ungrouped: MermaidNodeLike[] = [];

  for (const node of nodes) {
    const type = normalizeNodeType(node);
    const group = GROUP_LABELS[type];
    if (!group || !includeSubgraphs) {
      ungrouped.push(node);
      continue;
    }
    const bucket = grouped.get(group) || [];
    bucket.push(node);
    grouped.set(group, bucket);
  }

  for (const [groupName, groupNodes] of grouped.entries()) {
    lines.push(
      `  subgraph ${toMermaidId(groupName, 0)}[${JSON.stringify(groupName)}]`,
    );
    for (const node of groupNodes) {
      const alias = aliasMap.get(node.id) || toMermaidId(node.id, 0);
      const nodeType = normalizeNodeType(node);
      const label = getNodeLabel(node);
      lines.push(`    ${alias}${formatNodeShape(nodeType, label)}`);
    }
    lines.push("  end");
  }

  for (const node of ungrouped) {
    const alias = aliasMap.get(node.id) || toMermaidId(node.id, 0);
    const nodeType = normalizeNodeType(node);
    const label = getNodeLabel(node);
    lines.push(`  ${alias}${formatNodeShape(nodeType, label)}`);
  }

  for (const edge of edges) {
    const sourceAlias = aliasMap.get(edge.source);
    const targetAlias = aliasMap.get(edge.target);
    if (!sourceAlias || !targetAlias) continue;

    const edgeLabel = getEdgeLabel(edge);
    if (edgeLabel) {
      lines.push(
        `  ${sourceAlias} -->|${JSON.stringify(edgeLabel)}| ${targetAlias}`,
      );
    } else {
      lines.push(`  ${sourceAlias} --> ${targetAlias}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function generateMermaidCode(nodes: Node[], edges: Edge[]): string {
  return generateMermaidFlowchart(nodes, edges, {
    direction: "TD",
    includeSubgraphs: true,
  });
}
