import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

interface LayoutOptions {
    direction?: "TB" | "LR" | "BT" | "RL";
    nodeWidth?: number;
    nodeHeight?: number;
    spacing?: number;
    rankSep?: number;
    nodeSep?: number;
}

/**
 * Apply Dagre layout to nodes and edges for automatic positioning
 * This is a lightweight alternative to ELKjs for simple hierarchical layouts
 */
export function applyLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
    // Return original if no nodes
    if (!nodes || nodes.length === 0) {
        return { nodes, edges };
    }

    // Updated defaults: Nodes are much larger in the UI than 180x100
    // We use 350x250 as a safer estimate for the cards with descriptions
    const {
        direction = "TB",
        nodeWidth = 350,
        nodeHeight = 250,
        rankSep = 150,
        nodeSep = 150,
    } = options;

    try {
        // Create graph with explicit settings
        // We use multigraph: true to support multiple edges between same nodes
        const g = new dagre.graphlib.Graph({ multigraph: true });
        g.setGraph({
            rankdir: direction,
            nodesep: nodeSep,
            ranksep: rankSep,
        });

        // IMPORTANT: This is required for Dagre to initialize edge objects
        // It prevents the "Cannot set properties of undefined (setting 'points')" error
        g.setDefaultEdgeLabel(() => ({}));

        // Create a set of valid node IDs for quick lookup
        const validNodeIds = new Set(nodes.map((n) => n.id));

        // Add nodes with proper label
        for (const node of nodes) {
            try {
                g.setNode(node.id, {
                    width: nodeWidth,
                    height: nodeHeight,
                    label: node.id,
                });
            } catch {
                // Skip nodes that fail to add
                console.warn(`Failed to add node ${node.id} to layout graph`);
            }
        }

        // Add edges only if both source and target exist
        for (const edge of edges) {
            if (validNodeIds.has(edge.source) && validNodeIds.has(edge.target)) {
                try {
                    // Use edge.id as the name to support multigraphs (multiple edges between same nodes)
                    g.setEdge(edge.source, edge.target, {}, edge.id);
                } catch {
                    // Skip edges that fail to add
                }
            }
        }

        // Check if graph has nodes before layout
        if (g.nodes().length === 0) {
            console.warn("Layout graph has no nodes, skipping layout");
            return { nodes, edges };
        }

        // Compute layout with error handling
        try {
            dagre.layout(g);
        } catch (layoutError) {
            console.error("Dagre layout computation failed:", layoutError);
            return { nodes, edges };
        }

        // Apply positions back to nodes
        const positionedNodes = nodes.map((node) => {
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
            } catch {
                // Ignore errors for individual nodes
            }
            return node;
        });

        return { nodes: positionedNodes, edges };
    } catch (error) {
        console.error("Layout error:", error);
        return { nodes, edges };
    }
}

/**
 * Quick layout function for immediate application
 */
export function quickLayout(nodes: Node[], edges: Edge[], direction: "TB" | "LR" = "TB") {
    return applyLayout(nodes, edges, { direction });
}

/**
 * Async layout using Web Worker to prevent UI freezing
 */
export function applyLayoutAsync(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    if (typeof Worker === "undefined") {
        console.warn("Web Workers not supported, falling back to synchronous layout");
        return Promise.resolve(applyLayout(nodes, edges, options));
    }

    return new Promise((resolve, reject) => {
        const worker = new Worker(new URL("../workers/layout.worker.ts", import.meta.url));

        worker.onmessage = (event) => {
            const { nodes: layoutNodes, error } = event.data;
            worker.terminate();

            if (error) {
                console.error("Worker layout failed:", error);
                // Fallback to sync layout on error? Or just reject?
                // Rejecting allows the UI to handle it or show error
                reject(error);
            } else {
                resolve({ nodes: layoutNodes, edges });
            }
        };

        worker.onerror = (error) => {
            worker.terminate();
            console.error("Worker error:", error);
            reject(error);
        };

        worker.postMessage({ nodes, edges, options });
    });
}
