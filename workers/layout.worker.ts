import dagre, { graphlib } from "dagre";

self.onmessage = (event: MessageEvent) => {
  const { nodes, edges, options } = event.data;

  const {
    direction = "TB",
    nodeWidth = 350,
    nodeHeight = 250,
    rankSep = 150,
    nodeSep = 150,
  } = options || {};

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

    const positionedNodes = nodes.map((node: any) => {
      try {
        const nodeData = g.node(node.id);
        if (nodeData && typeof nodeData.x === "number" && typeof nodeData.y === "number") {
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
