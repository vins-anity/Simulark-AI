import dagre from "dagre";

self.onmessage = (event: MessageEvent) => {
  const { nodes, edges, direction = "TB" } = event.data;

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node: any) => {
    // React Flow v12: Use measured dimensions if available, fallback to defaults
    const width = node.measured?.width ?? 150;
    const height = node.measured?.height ?? 50;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge: any) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutNodes = nodes.map((node: any) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.measured?.width ?? 150) / 2,
        y: nodeWithPosition.y - (node.measured?.height ?? 50) / 2,
      },
    };
  });

  self.postMessage({ nodes: layoutNodes });
};
