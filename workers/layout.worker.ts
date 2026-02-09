import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

self.onmessage = async (event: MessageEvent) => {
  const { nodes, edges, direction = "DOWN" } = event.data;

  // Configuration for different layout styles
  const layoutOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': direction, // 'DOWN' (Hierarchical) or 'RIGHT' (Tiered)

    // Spacing
    'elk.spacing.nodeNode': '100', // Wider horizontal spacing
    'elk.layered.spacing.nodeNodeBetweenLayers': '120', // Taller vertical spacing

    // Aesthetic & Flow
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    'elk.edgeRouting': 'ORTHOGONAL', // Circuit-board style edges
    'elk.layered.spacing.edgeNodeBetweenLayers': '50',

    // Port handling (Mocking center ports)
    'elk.portConstraints': 'FIXED_SIDE',
  };

  const graph = {
    id: "root",
    layoutOptions,
    children: nodes.map((node: any) => ({
      id: node.id,
      // Better heuristic for Node dimensions (BaseNode is approx 240x160 with padding)
      width: node.measured?.width ?? 240,
      height: node.measured?.height ?? 160
    })),
    edges: edges.map((edge: any) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    // Map back to React Flow
    const layoutNodes = nodes.map((node: any) => {
      // @ts-ignore
      const layoutNode = layoutedGraph.children?.find((n: any) => n.id === node.id);
      if (!layoutNode) return node;

      return {
        ...node,
        position: {
          x: layoutNode.x,
          y: layoutNode.y,
        }
      };
    });

    self.postMessage({ nodes: layoutNodes });
  } catch (err) {
    console.error("ELK Layout Error", err);
    // Return original nodes on error to avoid crash
    self.postMessage({ nodes });
  }
};
