import dagre, { graphlib } from "dagre";

interface LayoutNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}

self.onmessage = (
  event: MessageEvent<{
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    options?: Record<string, unknown>;
  }>,
) => {
  const { nodes, edges, options } = event.data;

  const direction = String(options?.direction ?? "TB");
  const nodeWidth = Number(options?.nodeWidth ?? 350);
  const nodeHeight = Number(options?.nodeHeight ?? 250);
  const rankSep = Number(options?.rankSep ?? 150);
  const nodeSep = Number(options?.nodeSep ?? 150);

  try {
    // Use graphlib from imported module
    const g = new graphlib.Graph({ multigraph: true });
    g.setGraph({
      rankdir: direction,
      nodesep: nodeSep,
      ranksep: rankSep,
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    for (const node of nodes) {
      try {
        g.setNode(node.id, {
          width: nodeWidth,
          height: nodeHeight,
          label: node.id,
        });
      } catch (e) {
        console.warn(`[Worker] Failed to add node ${node.id}`, e);
      }
    }

    // Add edges
    for (const edge of edges) {
      try {
        g.setEdge(edge.source, edge.target, {}, edge.id);
      } catch (e) {
        // Ignore edge errors
      }
    }

    if (g.nodes().length === 0) {
      self.postMessage({ nodes, edges });
      return;
    }

    dagre.layout(g);

    const positionedNodes = nodes.map((node: LayoutNode) => {
      try {
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
      } catch (e) {
        // Ignore
      }
      return node;
    });

    self.postMessage({ nodes: positionedNodes, edges });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Worker] Layout error:", errorMessage);
    self.postMessage({ nodes, edges, error: errorMessage });
  }
};
