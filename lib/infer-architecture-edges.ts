/**
 * Heuristic edge inference when the model returns nodes without connections.
 * Keeps diagrams usable — star topology from a primary compute hub.
 */

export interface ArchitectureNodeLike {
  id: string;
  type?: string;
  data?: {
    label?: string;
    tech?: string;
    serviceType?: string;
  };
}

export interface ArchitectureEdgeLike {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  data?: {
    protocol?: string;
    label?: string;
  };
}

export interface EnsureEdgesResult {
  edges: ArchitectureEdgeLike[];
  inferred: boolean;
  appliedFixes: string[];
}

type NodeLayer =
  | "entry"
  | "frontend"
  | "compute"
  | "auth"
  | "data"
  | "cache"
  | "queue"
  | "payment"
  | "messaging"
  | "monitoring"
  | "external"
  | "unknown";

const FULLSTACK_TECH = new Set([
  "nextjs",
  "nuxt",
  "sveltekit",
  "remix",
  "blazor",
  "rails",
  "django",
  "laravel",
]);

const ENTRY_TECH = new Set(["cloudflare", "nginx", "kong", "traefik", "envoy"]);

const MONITORING_TECH = new Set([
  "datadog",
  "prometheus",
  "grafana",
  "newrelic",
  "sentry",
  "dynatrace",
]);

function nodeType(node: ArchitectureNodeLike): string {
  return (
    node.type?.toLowerCase() ||
    node.data?.serviceType?.toLowerCase() ||
    ""
  );
}

function nodeTech(node: ArchitectureNodeLike): string {
  return node.data?.tech?.toLowerCase() ?? "";
}

function classifyNode(node: ArchitectureNodeLike): NodeLayer {
  const type = nodeType(node);
  const tech = nodeTech(node);

  if (
    type === "gateway" ||
    type === "loadbalancer" ||
    type === "security" ||
    ENTRY_TECH.has(tech)
  ) {
    return "entry";
  }
  if (type === "frontend" || type === "client") {
    return "frontend";
  }
  if (FULLSTACK_TECH.has(tech)) {
    return "compute";
  }
  if (type === "auth" || tech.includes("auth")) {
    return "auth";
  }
  if (type === "database" || type === "vector-db" || type === "storage") {
    return "data";
  }
  if (type === "cache" || tech.includes("redis")) {
    return "cache";
  }
  if (type === "queue" || tech.includes("qstash") || tech === "kafka") {
    return "queue";
  }
  if (type === "payment" || tech === "stripe") {
    return "payment";
  }
  if (
    type === "messaging" ||
    tech.includes("sendgrid") ||
    tech.includes("resend") ||
    tech === "twilio"
  ) {
    return "messaging";
  }
  if (type === "monitoring" || MONITORING_TECH.has(tech)) {
    return "monitoring";
  }
  if (
    type === "backend" ||
    type === "service" ||
    type === "function" ||
    type === "ai" ||
    type === "ai-model"
  ) {
    return "compute";
  }
  if (type === "external" || type === "saas" || type === "third-party") {
    return "external";
  }
  if (tech.includes("postgres") || tech === "supabase" || tech === "turso") {
    return "data";
  }

  return "unknown";
}

function pickHub(nodes: ArchitectureNodeLike[]): string | null {
  if (nodes.length === 0) return null;

  const byLayer = (layer: NodeLayer) =>
    nodes.find((n) => classifyNode(n) === layer);

  const fullstack = nodes.find((n) => FULLSTACK_TECH.has(nodeTech(n)));
  if (fullstack) return fullstack.id;

  const frontend = byLayer("frontend");
  if (frontend) return frontend.id;

  const compute = byLayer("compute");
  if (compute) return compute.id;

  return nodes[0]?.id ?? null;
}

function edgeKey(source: string, target: string): string {
  return `${source}->${target}`;
}

function protocolForLayer(layer: NodeLayer): string {
  switch (layer) {
    case "data":
      return "database";
    case "cache":
      return "cache";
    case "queue":
      return "queue";
    default:
      return "https";
  }
}

function labelForLayer(layer: NodeLayer, target: ArchitectureNodeLike): string {
  const name = target.data?.label ?? target.data?.tech ?? target.id;
  switch (layer) {
    case "auth":
      return "Auth session";
    case "data":
      return `${name} queries`;
    case "cache":
      return "Cache read/write";
    case "queue":
      return "Background jobs";
    case "payment":
      return "Payment events";
    case "messaging":
      return "Transactional email";
    case "monitoring":
      return "Metrics & traces";
    case "external":
      return `${name} API`;
    default:
      return `${name} traffic`;
  }
}

/**
 * Infer a minimal connected graph when edges are missing or incomplete.
 */
export function inferArchitectureEdges(
  nodes: ArchitectureNodeLike[],
): ArchitectureEdgeLike[] {
  if (nodes.length < 2) return [];

  const hubId = pickHub(nodes);
  if (!hubId) return [];

  const edges: ArchitectureEdgeLike[] = [];
  const seen = new Set<string>();
  let edgeIndex = 0;

  const addEdge = (
    source: string,
    target: string,
    layer: NodeLayer,
    targetNode: ArchitectureNodeLike,
  ) => {
    if (source === target) return;
    const key = edgeKey(source, target);
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: `edge-inferred-${edgeIndex++}`,
      source,
      target,
      animated: true,
      data: {
        protocol: protocolForLayer(layer),
        label: labelForLayer(layer, targetNode),
      },
    });
  };

  const layers: NodeLayer[] = [
    "entry",
    "frontend",
    "compute",
    "auth",
    "data",
    "cache",
    "queue",
    "payment",
    "messaging",
    "monitoring",
    "external",
    "unknown",
  ];

  const byLayer = new Map<NodeLayer, ArchitectureNodeLike[]>();
  for (const layer of layers) {
    byLayer.set(layer, []);
  }
  for (const node of nodes) {
    const layer = classifyNode(node);
    byLayer.get(layer)?.push(node);
  }

  const hub = nodes.find((n) => n.id === hubId);
  const hubLayer = hub ? classifyNode(hub) : "compute";

  // Entry → frontend or hub
  const frontends = byLayer.get("frontend") ?? [];
  const entries = byLayer.get("entry") ?? [];
  if (entries.length > 0) {
    if (frontends.length > 0) {
      for (const entry of entries) {
        for (const fe of frontends) {
          addEdge(entry.id, fe.id, "frontend", fe);
        }
      }
    } else {
      for (const entry of entries) {
        addEdge(entry.id, hubId, hubLayer, hub ?? entry);
      }
    }
  }

  // Frontend → hub (when hub is not the frontend itself)
  for (const fe of frontends) {
    if (fe.id !== hubId) {
      addEdge(fe.id, hubId, "compute", hub ?? fe);
    }
  }

  // Hub → satellites
  const satelliteLayers: NodeLayer[] = [
    "auth",
    "data",
    "cache",
    "queue",
    "payment",
    "messaging",
    "monitoring",
    "external",
  ];

  for (const layer of satelliteLayers) {
    for (const node of byLayer.get(layer) ?? []) {
      if (node.id !== hubId) {
        addEdge(hubId, node.id, layer, node);
      }
    }
  }

  // Secondary compute nodes → hub
  for (const node of byLayer.get("compute") ?? []) {
    if (node.id !== hubId) {
      addEdge(hubId, node.id, "compute", node);
    }
  }

  // Connect any remaining orphans to the hub
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  for (const node of nodes) {
    if (node.id !== hubId && !connected.has(node.id)) {
      addEdge(hubId, node.id, "unknown", node);
    }
  }

  return edges;
}

function mergeUniqueEdges(
  existing: ArchitectureEdgeLike[],
  supplemental: ArchitectureEdgeLike[],
): { edges: ArchitectureEdgeLike[]; added: number } {
  const seen = new Set(existing.map((e) => edgeKey(e.source, e.target)));
  const merged = [...existing];
  let added = 0;

  for (const edge of supplemental) {
    const key = edgeKey(edge.source, edge.target);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(edge);
    added += 1;
  }

  return { edges: merged, added };
}

function countOrphanNodes(
  nodes: ArchitectureNodeLike[],
  edges: ArchitectureEdgeLike[],
): number {
  if (nodes.length === 0) return 0;
  const connected = new Set<string>();
  for (const edge of edges) {
    connected.add(edge.source);
    connected.add(edge.target);
  }
  return nodes.filter((node) => !connected.has(node.id)).length;
}

/**
 * Ensure edges exist; infer when the model returns none or leaves nodes disconnected.
 */
export function ensureArchitectureEdges(
  nodes: ArchitectureNodeLike[],
  edges: ArchitectureEdgeLike[],
): EnsureEdgesResult {
  if (nodes.length < 2) {
    return { edges, inferred: false, appliedFixes: [] };
  }

  const validEdges = edges.filter(
    (e) =>
      e.source &&
      e.target &&
      nodes.some((n) => n.id === e.source) &&
      nodes.some((n) => n.id === e.target),
  );

  const orphanCount = countOrphanNodes(nodes, validEdges);
  const minSpanningEdges = nodes.length - 1;
  const underConnected = validEdges.length < minSpanningEdges;

  if (orphanCount === 0 && !underConnected) {
    return { edges: validEdges, inferred: false, appliedFixes: [] };
  }

  const inferredEdges = inferArchitectureEdges(nodes);
  const { edges: merged, added } = mergeUniqueEdges(validEdges, inferredEdges);

  if (added === 0) {
    return { edges: validEdges, inferred: false, appliedFixes: [] };
  }

  const fixes: string[] = [];
  if (validEdges.length === 0) {
    fixes.push(`Inferred ${added} connections (model returned 0 edges)`);
  } else {
    fixes.push(
      `Added ${added} connections (${validEdges.length} from model, ${orphanCount} orphaned nodes)`,
    );
  }

  return {
    edges: merged,
    inferred: true,
    appliedFixes: fixes,
  };
}
