import type { Edge, Node } from "@xyflow/react";
import { useCallback, useRef, useState } from "react";

/**
 * Partial architecture data for streaming updates
 */
interface PartialArchitecture {
  nodes?: Node[];
  edges?: Edge[];
  metadata?: {
    architectureType?: string;
    complexity?: string;
    reasoning?: string;
  };
}

/**
 * Hook for managing incremental architecture streaming
 * Allows nodes and edges to appear progressively on the canvas
 */
export function useVisualStreaming() {
  const [streamingNodes, setStreamingNodes] = useState<Node[]>([]);
  const [streamingEdges, setStreamingEdges] = useState<Edge[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const accumulatedTextRef = useRef("");
  const lastLayoutTimeRef = useRef(0);

  /**
   * Start visual streaming mode
   */
  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setStreamingNodes([]);
    setStreamingEdges([]);
    setStreamingProgress(0);
    accumulatedTextRef.current = "";
    lastLayoutTimeRef.current = Date.now();
  }, []);

  /**
   * Stop visual streaming mode
   */
  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    setStreamingProgress(100);
  }, []);

  /**
   * Reset streaming state
   */
  const resetStreaming = useCallback(() => {
    setStreamingNodes([]);
    setStreamingEdges([]);
    setIsStreaming(false);
    setStreamingProgress(0);
    accumulatedTextRef.current = "";
  }, []);

  /**
   * Process incoming text chunk and extract nodes/edges
   */
  const processChunk = useCallback(
    (chunk: string): { nodes: Node[]; edges: Edge[] } | null => {
      accumulatedTextRef.current += chunk;
      const text = accumulatedTextRef.current;

      // Try to extract JSON from accumulated text
      try {
        // Look for complete node objects
        const nodeMatches = text.matchAll(
          /\{\s*"id"\s*:\s*"([^"]+)"[^}]*"type"\s*:\s*"([^"]+)"[^}]*\}/g,
        );

        const nodes: Node[] = [];
        for (const match of nodeMatches) {
          try {
            // Find the full node object by looking for matching braces
            const startIndex = text.indexOf(match[0]);
            if (startIndex === -1) continue;

            let braceCount = 0;
            let endIndex = startIndex;
            for (let i = startIndex; i < text.length; i++) {
              if (text[i] === "{") braceCount++;
              if (text[i] === "}") braceCount--;
              if (braceCount === 0) {
                endIndex = i + 1;
                break;
              }
            }

            const nodeJson = text.substring(startIndex, endIndex);
            const node = JSON.parse(nodeJson);

            // Validate node has required fields
            if (node.id && node.type && node.position) {
              nodes.push(node as Node);
            }
          } catch {
            // Invalid node JSON, skip
          }
        }

        // Look for edge objects
        const edgeMatches = text.matchAll(
          /\{\s*"id"\s*:\s*"([^"]+)"[^}]*"source"\s*:\s*"([^"]+)"[^}]*"target"\s*:\s*"([^"]+)"[^}]*\}/g,
        );

        const edges: Edge[] = [];
        for (const match of edgeMatches) {
          try {
            const startIndex = text.indexOf(match[0]);
            if (startIndex === -1) continue;

            let braceCount = 0;
            let endIndex = startIndex;
            for (let i = startIndex; i < text.length; i++) {
              if (text[i] === "{") braceCount++;
              if (text[i] === "}") braceCount--;
              if (braceCount === 0) {
                endIndex = i + 1;
                break;
              }
            }

            const edgeJson = text.substring(startIndex, endIndex);
            const edge = JSON.parse(edgeJson);

            if (edge.id && edge.source && edge.target) {
              edges.push(edge as Edge);
            }
          } catch {
            // Invalid edge JSON, skip
          }
        }

        return { nodes, edges };
      } catch {
        return null;
      }
    },
    [],
  );

  /**
   * Update streaming state with new chunk
   * Returns true if layout should be triggered
   */
  const updateStreaming = useCallback(
    (chunk: string): boolean => {
      const result = processChunk(chunk);
      if (!result) return false;

      let shouldLayout = false;
      const now = Date.now();

      // Update nodes (only add new ones)
      if (result.nodes.length > 0) {
        setStreamingNodes((prev) => {
          const newNodes = result.nodes.filter(
            (n) => !prev.some((p) => p.id === n.id),
          );
          if (newNodes.length > 0) {
            shouldLayout = true;
            return [...prev, ...newNodes];
          }
          return prev;
        });
      }

      // Update edges (only add new ones)
      if (result.edges.length > 0) {
        setStreamingEdges((prev) => {
          const newEdges = result.edges.filter(
            (e) => !prev.some((p) => p.id === e.id),
          );
          if (newEdges.length > 0) {
            return [...prev, ...newEdges];
          }
          return prev;
        });
      }

      // Throttle layout updates (max once per 500ms)
      if (shouldLayout && now - lastLayoutTimeRef.current > 500) {
        lastLayoutTimeRef.current = now;
        return true;
      }

      return false;
    },
    [processChunk],
  );

  /**
   * Set complete architecture (when streaming finishes)
   */
  const setCompleteArchitecture = useCallback(
    (architecture: PartialArchitecture) => {
      if (architecture.nodes) {
        setStreamingNodes(architecture.nodes);
      }
      if (architecture.edges) {
        setStreamingEdges(architecture.edges);
      }
      setStreamingProgress(100);
    },
    [],
  );

  return {
    streamingNodes,
    streamingEdges,
    isStreaming,
    streamingProgress,
    startStreaming,
    stopStreaming,
    resetStreaming,
    updateStreaming,
    setCompleteArchitecture,
  };
}

/**
 * Auto-layout configuration for progressive rendering
 */
export const STREAMING_LAYOUT_CONFIG = {
  // Layout algorithm settings
  algorithm: "dagre",
  direction: "TB", // Top to Bottom
  nodeSep: 80,
  rankSep: 120,

  // Animation settings
  animationDuration: 300,

  // Throttling
  layoutDebounceMs: 500,

  // Progressive reveal
  revealDelayMs: 100,
};
