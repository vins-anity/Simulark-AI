export interface ExportableNode {
  position: { x: number; y: number };
  measured?: { width?: number; height?: number };
  width?: number;
  height?: number;
  style?: {
    width?: number | string;
    height?: number | string;
  };
}

export interface GraphExportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  translateX: number;
  translateY: number;
}

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 100;

function parseStyleDimension(value: number | string | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function getNodeDimension(
  node: ExportableNode,
  axis: "width" | "height",
): number {
  const fallback = axis === "width" ? DEFAULT_NODE_WIDTH : DEFAULT_NODE_HEIGHT;

  const measured = node.measured?.[axis];
  if (
    typeof measured === "number" &&
    Number.isFinite(measured) &&
    measured > 0
  ) {
    return measured;
  }

  const direct = node[axis];
  if (typeof direct === "number" && Number.isFinite(direct) && direct > 0) {
    return direct;
  }

  const fromStyle = parseStyleDimension(node.style?.[axis]);
  if (fromStyle > 0) {
    return fromStyle;
  }

  return fallback;
}

export function calculateGraphExportBounds(
  nodes: ExportableNode[],
  padding = 50,
): GraphExportBounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: padding * 2,
      height: padding * 2,
      translateX: padding,
      translateY: padding,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const width = getNodeDimension(node, "width");
    const height = getNodeDimension(node, "height");
    const { x, y } = node.position;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  const width = Math.max(1, maxX - minX + padding * 2);
  const height = Math.max(1, maxY - minY + padding * 2);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    translateX: -minX + padding,
    translateY: -minY + padding,
  };
}
