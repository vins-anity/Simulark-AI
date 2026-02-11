import type { Edge, Node } from "@xyflow/react";
import dagre from "dagre";

/**
 * Architecture pattern types for intelligent layout
 */
export type ArchitecturePattern =
  | "layered" // N-tier: Web → API → Service → Data
  | "microservices" // Gateway with services fan-out
  | "event-driven" // Event bus center with pub/sub
  | "client-server" // Clients → Load Balancer → Server
  | "pipeline" // Data flow: Source → Process → Sink
  | "modular"; // Domain-driven modules

/**
 * Available layout algorithms
 */
export type LayoutAlgorithm =
  | "dagre-hierarchy" // Dagre hierarchical
  | "radial" // Circular around center
  | "force" // Physics-based organic
  | "grid" // Matrix layout
  | "arch-pattern"; // Architecture-aware pattern layout

interface LayoutOptions {
  algorithm?: LayoutAlgorithm;
  pattern?: ArchitecturePattern;
  direction?: "TB" | "LR" | "BT" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
  spacing?: number;
  rankSep?: number;
  nodeSep?: number;
  animate?: boolean;
}

/**
 * Get node type safely
 */
function getNodeType(node: Node): string {
  return (
    node.type ||
    (node.data as { serviceType?: string })?.serviceType ||
    "unknown"
  );
}

/**
 * Detect architecture pattern from nodes and edges
 */
function detectArchitecturePattern(
  nodes: Node[],
  edges: Edge[],
): ArchitecturePattern {
  const typeCounts = new Map<string, number>();
  nodes.forEach((n) => {
    const type = getNodeType(n);
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });

  const hasGateway =
    typeCounts.get("gateway") || typeCounts.get("loadbalancer");
  const hasQueue = typeCounts.get("queue") || 0;
  const hasDatabase = typeCounts.get("database") || 0;
  const hasClient = typeCounts.get("client") || 0;
  const serviceCount =
    typeCounts.get("service") || typeCounts.get("backend") || 0;

  // Detect pipeline pattern (linear flow)
  if (edges.length > 0) {
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();

    edges.forEach((e) => {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
    });

    const sources = nodes.filter(
      (n) => (outDegree.get(n.id) || 0) > 0 && (inDegree.get(n.id) || 0) === 0,
    ).length;
    const sinks = nodes.filter(
      (n) => (inDegree.get(n.id) || 0) > 0 && (outDegree.get(n.id) || 0) === 0,
    ).length;

    if (sources === 1 && sinks === 1 && edges.length >= nodes.length - 1) {
      return "pipeline";
    }
  }

  // Detect microservices (multiple services + gateway)
  if (hasGateway && serviceCount >= 2) {
    return "microservices";
  }

  // Detect event-driven (queue as central hub)
  if (hasQueue >= 1 && serviceCount >= 2) {
    return "event-driven";
  }

  // Detect client-server (client + server separation)
  if (hasClient && serviceCount >= 1) {
    return "client-server";
  }

  // Default to layered for typical web apps
  if (hasDatabase && serviceCount >= 1) {
    return "layered";
  }

  return "modular";
}

/**
 * Apply intelligent layout based on architecture pattern
 */
export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  if (!nodes || nodes.length === 0) {
    return { nodes, edges };
  }

  const {
    algorithm = "arch-pattern",
    pattern: forcedPattern,
    direction = "TB",
    nodeWidth = 350,
    nodeHeight = 250,
    rankSep = 180,
    nodeSep = 180,
  } = options;

  try {
    // Detect or use forced pattern
    const pattern = forcedPattern || detectArchitecturePattern(nodes, edges);

    // Choose layout based on pattern and algorithm
    switch (algorithm) {
      case "arch-pattern":
        return applyArchitecturePatternLayout(nodes, edges, pattern, {
          nodeWidth,
          nodeHeight,
          rankSep,
          nodeSep,
        });
      case "dagre-hierarchy":
        return applyDagreLayout(nodes, edges, {
          direction,
          nodeWidth,
          nodeHeight,
          rankSep,
          nodeSep,
        });
      case "radial":
        return applyRadialLayout(nodes, edges, { nodeWidth, nodeHeight });
      case "force":
        return applyForceDirectedLayout(nodes, edges, {
          nodeWidth,
          nodeHeight,
        });
      case "grid":
        return applyGridLayout(nodes, edges, { nodeWidth, nodeHeight });
      default:
        return applyArchitecturePatternLayout(nodes, edges, pattern, {
          nodeWidth,
          nodeHeight,
          rankSep,
          nodeSep,
        });
    }
  } catch (error) {
    console.error("Layout error:", error);
    return { nodes, edges };
  }
}

/**
 * Architecture-aware pattern layout - THE MAIN INTELLIGENT LAYOUT
 */
function applyArchitecturePatternLayout(
  nodes: Node[],
  edges: Edge[],
  pattern: ArchitecturePattern,
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, rankSep, nodeSep } = options;

  switch (pattern) {
    case "layered":
      return applyLayeredLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
    case "microservices":
      return applyMicroservicesLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
    case "event-driven":
      return applyEventDrivenLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
    case "client-server":
      return applyClientServerLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
    case "pipeline":
      return applyPipelineLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
    case "modular":
    default:
      return applyModularLayout(nodes, edges, {
        nodeWidth,
        nodeHeight,
        rankSep,
        nodeSep,
      });
  }
}

/**
 * LAYERED LAYOUT (N-Tier Architecture)
 * Layer 1: CDN/Gateway/Load Balancer (Top)
 * Layer 2: Web/API Layer
 * Layer 3: Business Logic/Services
 * Layer 4: Data/Cache/Storage (Bottom)
 */
function applyLayeredLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;
  const canvasWidth = 1200;
  const startY = 50;

  // Categorize nodes by layer
  const layers: Node[][] = [[], [], [], []];

  nodes.forEach((node) => {
    const type = getNodeType(node);

    // Layer 0: Edge/Gateway/CDN
    if (["gateway", "loadbalancer", "cdn"].includes(type)) {
      layers[0].push(node);
    }
    // Layer 1: Frontend/Web/API
    else if (["frontend", "api", "client"].includes(type)) {
      layers[1].push(node);
    }
    // Layer 2: Services/Business Logic
    else if (
      ["service", "backend", "ai", "auth", "payment", "function"].includes(type)
    ) {
      layers[2].push(node);
    }
    // Layer 3: Data/Storage
    else if (
      ["database", "cache", "storage", "queue", "vector-db"].includes(type)
    ) {
      layers[3].push(node);
    }
    // Default to service layer
    else {
      layers[2].push(node);
    }
  });

  // Position nodes in layers
  const positionedNodes: Node[] = [];
  let currentY = startY;

  layers.forEach((layer) => {
    if (layer.length === 0) return;

    const totalWidth = layer.length * (nodeWidth + nodeSep) - nodeSep;
    const startX = (canvasWidth - totalWidth) / 2;

    layer.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + index * (nodeWidth + nodeSep),
          y: currentY,
        },
      });
    });

    currentY += nodeHeight + 150;
  });

  return { nodes: positionedNodes, edges };
}

/**
 * MICROSERVICES LAYOUT
 * API Gateway on top
 * Services fan out below in a grid
 * Databases under their respective services
 */
function applyMicroservicesLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;
  const canvasWidth = 1400;

  const gateways: Node[] = [];
  const services: Node[] = [];
  const databases: Node[] = [];

  // Group nodes
  nodes.forEach((node) => {
    const type = getNodeType(node);
    if (["gateway", "loadbalancer"].includes(type)) {
      gateways.push(node);
    } else if (["database", "cache", "storage", "queue"].includes(type)) {
      databases.push(node);
    } else {
      services.push(node);
    }
  });

  const positionedNodes: Node[] = [];

  // Position gateway(s) at top center
  if (gateways.length > 0) {
    const totalWidth = gateways.length * (nodeWidth + nodeSep) - nodeSep;
    const startX = (canvasWidth - totalWidth) / 2;
    gateways.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + index * (nodeWidth + nodeSep),
          y: 50,
        },
      });
    });
  }

  // Position services in a grid below
  if (services.length > 0) {
    const cols = Math.min(4, Math.ceil(Math.sqrt(services.length)));
    const totalWidth = cols * (nodeWidth + nodeSep) - nodeSep;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 300;

    services.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      positionedNodes.push({
        ...node,
        position: {
          x: startX + col * (nodeWidth + nodeSep),
          y: startY + row * (nodeHeight + 100),
        },
      });
    });
  }

  // Position databases at bottom
  if (databases.length > 0) {
    const totalWidth = databases.length * (nodeWidth + nodeSep) - nodeSep;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 600;

    databases.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: startX + index * (nodeWidth + nodeSep),
          y: startY,
        },
      });
    });
  }

  return { nodes: positionedNodes, edges };
}

/**
 * EVENT-DRIVEN LAYOUT
 * Event Bus in center
 * Publishers on left
 * Subscribers/Consumers on right
 * Databases below
 */
function applyEventDrivenLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;
  const centerX = 600;
  const centerY = 350;

  const eventBus: Node[] = [];
  const publishers: Node[] = [];
  const consumers: Node[] = [];
  const storage: Node[] = [];

  nodes.forEach((node) => {
    const type = getNodeType(node);
    if (["queue", "messaging", "kafka"].includes(type)) {
      eventBus.push(node);
    } else if (["database", "cache", "storage"].includes(type)) {
      storage.push(node);
    } else {
      // Determine if publisher or consumer by edge direction
      const outgoing = edges.filter((e) => e.source === node.id).length;
      const incoming = edges.filter((e) => e.target === node.id).length;

      if (outgoing > incoming) {
        publishers.push(node);
      } else {
        consumers.push(node);
      }
    }
  });

  const positionedNodes: Node[] = [];

  // Event Bus in center
  if (eventBus.length > 0) {
    eventBus.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x:
            centerX +
            index * (nodeWidth + 50) -
            ((eventBus.length - 1) * (nodeWidth + 50)) / 2,
          y: centerY,
        },
      });
    });
  }

  // Publishers on left
  if (publishers.length > 0) {
    publishers.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 100,
          y: 100 + index * (nodeHeight + nodeSep),
        },
      });
    });
  }

  // Consumers on right
  if (consumers.length > 0) {
    consumers.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 1000,
          y: 100 + index * (nodeHeight + nodeSep),
        },
      });
    });
  }

  // Storage at bottom
  if (storage.length > 0) {
    storage.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x:
            centerX +
            index * (nodeWidth + nodeSep) -
            ((storage.length - 1) * (nodeWidth + nodeSep)) / 2,
          y: 600,
        },
      });
    });
  }

  return { nodes: positionedNodes, edges };
}

/**
 * CLIENT-SERVER LAYOUT
 * Clients on left
 * Load Balancer in middle-left
 * Server/Application tier in middle-right
 * Database at far right
 */
function applyClientServerLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;

  const clients: Node[] = [];
  const loadBalancers: Node[] = [];
  const servers: Node[] = [];
  const databases: Node[] = [];

  nodes.forEach((node) => {
    const type = getNodeType(node);
    if (type === "client") {
      clients.push(node);
    } else if (["gateway", "loadbalancer"].includes(type)) {
      loadBalancers.push(node);
    } else if (["database", "cache", "storage"].includes(type)) {
      databases.push(node);
    } else {
      servers.push(node);
    }
  });

  const positionedNodes: Node[] = [];
  const midY = 300;

  // Clients on far left
  if (clients.length > 0) {
    clients.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 50,
          y: midY + (index - clients.length / 2) * (nodeHeight + nodeSep),
        },
      });
    });
  }

  // Load Balancers
  if (loadBalancers.length > 0) {
    loadBalancers.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 400,
          y: midY + (index - loadBalancers.length / 2) * (nodeHeight + nodeSep),
        },
      });
    });
  }

  // Server/Application tier
  if (servers.length > 0) {
    servers.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 750,
          y: midY + (index - servers.length / 2) * (nodeHeight + nodeSep),
        },
      });
    });
  }

  // Databases on far right
  if (databases.length > 0) {
    databases.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: {
          x: 1100,
          y: midY + (index - databases.length / 2) * (nodeHeight + nodeSep),
        },
      });
    });
  }

  return { nodes: positionedNodes, edges };
}

/**
 * PIPELINE LAYOUT
 * Sequential flow from left to right
 * Source → [Processing Steps] → Sink
 */
function applyPipelineLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;
  const startX = 100;
  const midY = 300;

  // Find the linear order
  const order: Node[] = [];
  const visited = new Set<string>();

  // Find source (no incoming edges)
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => { inDegree.set(n.id, 0); });
  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  let current = nodes.find((n) => inDegree.get(n.id) === 0);

  while (current && !visited.has(current.id)) {
    order.push(current);
    visited.add(current.id);

    const nextEdge = edges.find((e) => e.source === current!.id);
    if (nextEdge) {
      current = nodes.find((n) => n.id === nextEdge.target);
    } else {
      current = undefined;
    }
  }

  // Position in a line
  const positionedNodes = order.map((node, index) => ({
    ...node,
    position: {
      x: startX + index * (nodeWidth + nodeSep),
      y: midY,
    },
  }));

  // Add any remaining nodes below
  const remaining = nodes.filter((n) => !visited.has(n.id));
  remaining.forEach((node, index) => {
    positionedNodes.push({
      ...node,
      position: {
        x: startX + index * (nodeWidth + nodeSep),
        y: midY + nodeHeight + 100,
      },
    });
  });

  return { nodes: positionedNodes, edges };
}

/**
 * MODULAR LAYOUT
 * Group by domain/module using Dagre
 */
function applyModularLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight, nodeSep } = options;

  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({
    rankdir: "TB",
    nodesep: nodeSep,
    ranksep: 120,
  });

  g.setDefaultEdgeLabel(() => ({}));

  const validNodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      label: node.id,
    });
  }

  for (const edge of edges) {
    if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target, {}, edge.id);
    }
  }

  dagre.layout(g);

  const positionedNodes = nodes.map((node) => {
    const nodeData = g.node(node.id);
    if (
      nodeData &&
      typeof nodeData.x === "number" &&
      typeof nodeData.y === "number"
    ) {
      return {
        ...node,
        position: {
          x: nodeData.x - nodeWidth / 2,
          y: nodeData.y - nodeHeight / 2,
        },
      };
    }
    return node;
  });

  return { nodes: positionedNodes, edges };
}

/**
 * Standard Dagre layout (fallback)
 */
function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: {
    direction: "TB" | "LR" | "BT" | "RL";
    nodeWidth: number;
    nodeHeight: number;
    rankSep: number;
    nodeSep: number;
  },
): { nodes: Node[]; edges: Edge[] } {
  const { direction, nodeWidth, nodeHeight, rankSep, nodeSep } = options;

  const g = new dagre.graphlib.Graph({ multigraph: true });
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSep,
    ranksep: rankSep,
  });

  g.setDefaultEdgeLabel(() => ({}));

  const validNodeIds = new Set(nodes.map((n) => n.id));

  for (const node of nodes) {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
      label: node.id,
    });
  }

  for (const edge of edges) {
    if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target, {}, edge.id);
    }
  }

  dagre.layout(g);

  const positionedNodes = nodes.map((node) => {
    const nodeData = g.node(node.id);
    if (
      nodeData &&
      typeof nodeData.x === "number" &&
      typeof nodeData.y === "number"
    ) {
      return {
        ...node,
        position: {
          x: nodeData.x - nodeWidth / 2,
          y: nodeData.y - nodeHeight / 2,
        },
      };
    }
    return node;
  });

  return { nodes: positionedNodes, edges };
}

/**
 * Radial layout - Circular arrangement
 */
function applyRadialLayout(
  nodes: Node[],
  edges: Edge[],
  options: { nodeWidth: number; nodeHeight: number },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight } = options;
  const centerX = 600;
  const centerY = 350;

  const levels: string[][] = [];
  const visited = new Set<string>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  const incomingCounts = new Map<string, number>();
  nodes.forEach((n) => { incomingCounts.set(n.id, 0); });
  edges.forEach((e) => {
    if (nodeIds.has(e.target)) {
      incomingCounts.set(e.target, (incomingCounts.get(e.target) || 0) + 1);
    }
  });

  let currentLevel = nodes
    .filter((n) => incomingCounts.get(n.id) === 0)
    .map((n) => n.id);

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    currentLevel.forEach((id) => { visited.add(id); });

    const nextLevel: string[] = [];
    currentLevel.forEach((nodeId) => {
      edges
        .filter((e) => e.source === nodeId && !visited.has(e.target))
        .forEach((e) => {
          if (!nextLevel.includes(e.target)) {
            nextLevel.push(e.target);
          }
        });
    });

    currentLevel = nextLevel;
  }

  const unvisited = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
  if (unvisited.length > 0) {
    levels.push(unvisited);
  }

  const positionedNodes: Node[] = [];

  levels.forEach((levelNodes, levelIndex) => {
    const radius = (levelIndex + 1) * 250;
    const angleStep = (2 * Math.PI) / levelNodes.length;

    levelNodes.forEach((nodeId, nodeIndex) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const angle = nodeIndex * angleStep;
        positionedNodes.push({
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle) - nodeWidth / 2,
            y: centerY + radius * Math.sin(angle) - nodeHeight / 2,
          },
        });
      }
    });
  });

  return { nodes: positionedNodes, edges };
}

/**
 * Force-directed layout
 */
function applyForceDirectedLayout(
  nodes: Node[],
  edges: Edge[],
  options: { nodeWidth: number; nodeHeight: number },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight } = options;
  const centerX = 600;
  const centerY = 350;

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const radius = 200 + Math.random() * 100;
    positions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  for (let iteration = 0; iteration < 50; iteration++) {
    const forces = new Map<string, { fx: number; fy: number }>();

    nodes.forEach((node) => {
      forces.set(node.id, { fx: 0, fy: 0 });
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const posA = positions.get(nodeA.id)!;
        const posB = positions.get(nodeB.id)!;

        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = 5000 / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        const forceA = forces.get(nodeA.id)!;
        const forceB = forces.get(nodeB.id)!;
        forceA.fx += fx;
        forceA.fy += fy;
        forceB.fx -= fx;
        forceB.fy -= fy;
      }
    }

    edges.forEach((edge) => {
      const posA = positions.get(edge.source);
      const posB = positions.get(edge.target);
      if (!posA || !posB) return;

      const dx = posB.x - posA.x;
      const dy = posB.y - posA.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = (distance - 200) * 0.01;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      const forceA = forces.get(edge.source)!;
      const forceB = forces.get(edge.target)!;
      forceA.fx += fx;
      forceA.fy += fy;
      forceB.fx -= fx;
      forceB.fy -= fy;
    });

    const damping = 0.8;
    nodes.forEach((node) => {
      const pos = positions.get(node.id)!;
      const force = forces.get(node.id)!;
      pos.x += force.fx * damping;
      pos.y += force.fy * damping;

      pos.x = Math.max(50, Math.min(1150, pos.x));
      pos.y = Math.max(50, Math.min(650, pos.y));
    });
  }

  const positionedNodes = nodes.map((node) => {
    const pos = positions.get(node.id)!;
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: positionedNodes, edges };
}

/**
 * Grid layout
 */
function applyGridLayout(
  nodes: Node[],
  edges: Edge[],
  options: { nodeWidth: number; nodeHeight: number },
): { nodes: Node[]; edges: Edge[] } {
  const { nodeWidth, nodeHeight } = options;
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacingX = nodeWidth + 100;
  const spacingY = nodeHeight + 100;

  const positionedNodes = nodes.map((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...node,
      position: {
        x: col * spacingX + 50,
        y: row * spacingY + 50,
      },
    };
  });

  return { nodes: positionedNodes, edges };
}

/**
 * Quick layout - INSTANT application (no animation)
 */
export function quickLayout(
  nodes: Node[],
  edges: Edge[],
  algorithm: LayoutAlgorithm = "arch-pattern",
  pattern?: ArchitecturePattern,
) {
  return applyLayout(nodes, edges, { algorithm, pattern, animate: false });
}

/**
 * Async layout using Web Worker
 */
export function applyLayoutAsync(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {},
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(applyLayout(nodes, edges, options));
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/layout.worker.ts", import.meta.url),
    );

    worker.onmessage = (event) => {
      const { nodes: layoutNodes, error } = event.data;
      worker.terminate();

      if (error) {
        reject(error);
      } else {
        resolve({ nodes: layoutNodes, edges });
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      const syncResult = applyLayout(nodes, edges, options);
      resolve(syncResult);
    };

    worker.postMessage({ nodes, edges, options });
  });
}

/**
 * Detected pattern info
 */
export function detectPattern(
  nodes: Node[],
  edges: Edge[],
): ArchitecturePattern {
  return detectArchitecturePattern(nodes, edges);
}

/**
 * Layout algorithms metadata for UI
 */
export const LAYOUT_ALGORITHMS = [
  {
    id: "arch-pattern" as LayoutAlgorithm,
    name: "Auto (Pattern-Aware)",
    description:
      "Automatically detects architecture pattern and applies best layout",
    icon: "lucide:brain",
  },
  {
    id: "dagre-hierarchy" as LayoutAlgorithm,
    name: "Hierarchical",
    description: "Classic DAG layout with clear parent-child relationships",
    icon: "lucide:git-branch",
  },
  {
    id: "radial" as LayoutAlgorithm,
    name: "Radial",
    description: "Circular arrangement around a central point",
    icon: "lucide:circle-dot",
  },
  {
    id: "force" as LayoutAlgorithm,
    name: "Force-Directed",
    description: "Organic physics-based layout",
    icon: "lucide:atom",
  },
  {
    id: "grid" as LayoutAlgorithm,
    name: "Grid",
    description: "Organized rows and columns",
    icon: "lucide:layout-grid",
  },
];

/**
 * Architecture patterns metadata for UI
 */
export const ARCHITECTURE_PATTERNS = [
  {
    id: "layered" as ArchitecturePattern,
    name: "Layered (N-Tier)",
    description: "Presentation → Business → Data layers",
    icon: "lucide:layers",
  },
  {
    id: "microservices" as ArchitecturePattern,
    name: "Microservices",
    description: "Gateway with independent services",
    icon: "lucide:boxes",
  },
  {
    id: "event-driven" as ArchitecturePattern,
    name: "Event-Driven",
    description: "Event bus with publishers and subscribers",
    icon: "lucide:radio",
  },
  {
    id: "client-server" as ArchitecturePattern,
    name: "Client-Server",
    description: "Clients → Load Balancer → Server → Database",
    icon: "lucide:server",
  },
  {
    id: "pipeline" as ArchitecturePattern,
    name: "Pipeline",
    description: "Sequential data processing stages",
    icon: "lucide:arrow-right",
  },
  {
    id: "modular" as ArchitecturePattern,
    name: "Modular",
    description: "Domain-driven modules",
    icon: "lucide:box",
  },
];
