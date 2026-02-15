"use client";

import {
  addEdge,
  Background,
  type Connection,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import "@xyflow/react/dist/style.css";

import { Redo2, Undo2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { saveProject } from "@/actions/projects";
import { useGraphHistory } from "@/lib/history-store";
import { useCanvasShortcuts } from "@/lib/keyboard-shortcuts";
import {
  applyLayout,
  applyLayoutAsync,
  type LayoutAlgorithm,
} from "@/lib/layout";
import { useSimulationStore } from "@/lib/store";
import { cn, generateMermaidCode } from "@/lib/utils";
import { ChaosModePanel } from "./ChaosModePanel";
import { SimulationEdge } from "./edges/SimulationEdge";
import { AIModelNode } from "./nodes/AIModelNode";
import { AINode } from "./nodes/AINode";
import { AuthNode } from "./nodes/AuthNode";
import { AutomationNode } from "./nodes/AutomationNode";
import { CacheNode } from "./nodes/CacheNode";
import { CICDNode } from "./nodes/CICDNode";
import { ClientNode } from "./nodes/ClientNode";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { FunctionNode } from "./nodes/FunctionNode";
import { GatewayNode } from "./nodes/GatewayNode";
import { LoadbalancerNode } from "./nodes/LoadbalancerNode";
import { MessagingNode } from "./nodes/MessagingNode";
import { MonitoringNode } from "./nodes/MonitoringNode";
import { PaymentNode } from "./nodes/PaymentNode";
import { QueueNode } from "./nodes/QueueNode";
import { SecurityNode } from "./nodes/SecurityNode";
import { ServiceNode } from "./nodes/ServiceNode";
import { ShapeNode } from "./nodes/ShapeNode";
import { StorageNode } from "./nodes/StorageNode";
import { TextNode } from "./nodes/TextNode";
import { VectorDBNode } from "./nodes/VectorDBNode";

interface FlowEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  projectId: string;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

const FlowEditorInner = forwardRef<FlowEditorRef, FlowEditorProps>(
  (
    { initialNodes = [], initialEdges = [], projectId, onViewportChange },
    ref,
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, getNodes, getEdges, zoomIn, zoomOut } = useReactFlow();
    const { chaosMode } = useSimulationStore();
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);
    const isUndoRedoRef = useRef(false);
    const { resolvedTheme } = useTheme();

    // History store for undo/redo
    const {
      pushState,
      undo,
      redo,
      canUndo,
      canRedo,
      clear: clearHistory,
    } = useGraphHistory();

    // Push initial state to history
    useEffect(() => {
      if (initialNodes.length > 0 || initialEdges.length > 0) {
        pushState({ nodes: initialNodes, edges: initialEdges }, "initial");
      }
    }, [initialEdges, initialNodes, pushState]);

    // Track changes and push to history (debounced)
    const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
      // Skip if this is an undo/redo operation
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }

      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }

      historyTimerRef.current = setTimeout(() => {
        if (nodes.length > 0 || edges.length > 0) {
          pushState({ nodes, edges });
        }
      }, 500);

      return () => {
        if (historyTimerRef.current) {
          clearTimeout(historyTimerRef.current);
        }
      };
    }, [nodes, edges, pushState]);

    // Handle undo
    const handleUndo = useCallback(() => {
      const previousState = undo();
      if (previousState) {
        isUndoRedoRef.current = true;
        setNodes(previousState.nodes);
        setEdges(previousState.edges);
        toast.success("Undo");
      }
    }, [undo, setNodes, setEdges]);

    // Handle redo
    const handleRedo = useCallback(() => {
      const nextState = redo();
      if (nextState) {
        isUndoRedoRef.current = true;
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
        toast.success("Redo");
      }
    }, [redo, setNodes, setEdges]);

    // Handle delete selected
    const handleDelete = useCallback(() => {
      const selectedNodes = getNodes().filter((n) => n.selected);
      const selectedEdges = getEdges().filter((e) => e.selected);
      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
        toast.success(
          `Deleted ${selectedNodes.length} node(s) and ${selectedEdges.length} edge(s)`,
        );
      }
    }, [getNodes, getEdges, setNodes, setEdges]);

    // Handle select all
    const handleSelectAll = useCallback(() => {
      setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
    }, [setNodes, setEdges]);

    // Handle save
    const handleSave = useCallback(async () => {
      try {
        await saveProject(projectId, { nodes, edges });
        toast.success("Project saved");
      } catch (_error) {
        toast.error("Failed to save");
      }
    }, [projectId, nodes, edges]);

    // Handle export
    const handleExport = useCallback(async () => {
      // Export as PNG by default
      const element = document.querySelector(".react-flow") as HTMLElement;
      if (!element) return;

      const { toPng } = await import("html-to-image");
      const bgColor = resolvedTheme === "dark" ? "#0f0f0f" : "#faf9f5";
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: bgColor,
      });
      const link = document.createElement("a");
      link.download = `architecture-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Exported as PNG");
    }, [resolvedTheme]);

    // Setup keyboard shortcuts
    useCanvasShortcuts({
      undo: handleUndo,
      redo: handleRedo,
      delete: handleDelete,
      selectAll: handleSelectAll,
      zoomIn: () => zoomIn({ duration: 200 }),
      zoomOut: () => zoomOut({ duration: 200 }),
      fitView: () => fitView({ duration: 300 }),
      save: handleSave,
      export: handleExport,
    });

    useEffect(() => {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        return;
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        if (nodes.length === 0 && edges.length === 0) {
          return;
        }

        try {
          await saveProject(projectId, { nodes, edges });
        } catch (error) {
          console.error("[FlowEditor] Auto-save failed:", error);
          toast.error("Failed to save changes. Please try again.");
        }
      }, 1500);

      return () => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
      };
    }, [nodes, edges, projectId]);

    useImperativeHandle(ref, () => ({
      updateGraph: (data: { nodes: any[]; edges: any[] }) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      },
      autoLayout: async (direction: "DOWN" | "RIGHT" = "DOWN") => {
        try {
          const currentNodes = getNodes();
          const currentEdges = getEdges();
          const layoutDirection = direction === "DOWN" ? "TB" : "LR";

          // Try async layout first, fallback to sync on error
          try {
            const { nodes: layoutNodes } = await applyLayoutAsync(
              currentNodes,
              currentEdges,
              { direction: layoutDirection },
            );
            setNodes(layoutNodes);
          } catch (asyncError) {
            console.warn(
              "[FlowEditor] Async layout failed, using sync fallback:",
              asyncError,
            );
            const { nodes: syncNodes } = applyLayout(
              currentNodes,
              currentEdges,
              { direction: layoutDirection },
            );
            setNodes(syncNodes);
          }

          setTimeout(() => fitView({ duration: 500 }), 100);
        } catch (error) {
          console.error("[FlowEditor] AutoLayout error:", error);
          // Final fallback: try sync layout
          try {
            const currentNodes = getNodes();
            const currentEdges = getEdges();
            const layoutDirection = direction === "DOWN" ? "TB" : "LR";
            const { nodes: fallbackNodes } = applyLayout(
              currentNodes,
              currentEdges,
              { direction: layoutDirection },
            );
            setNodes(fallbackNodes);
            setTimeout(() => fitView({ duration: 500 }), 100);
          } catch (fallbackError) {
            console.error(
              "[FlowEditor] All layout methods failed:",
              fallbackError,
            );
          }
        }
      },
      autoLayoutWithAlgorithm: async (algorithm: LayoutAlgorithm) => {
        try {
          const currentNodes = getNodes();
          const currentEdges = getEdges();

          const { nodes: layoutNodes } = applyLayout(
            currentNodes,
            currentEdges,
            {
              algorithm,
            },
          );
          setNodes(layoutNodes);
          setTimeout(() => fitView({ duration: 500 }), 100);
        } catch (error) {
          console.error("[FlowEditor] AutoLayout with algorithm error:", error);
        }
      },
      get nodes() {
        return getNodes();
      },
      get edges() {
        return getEdges();
      },
      exportGraph: async (format: "mermaid" | "png" | "pdf" | "svg") => {
        if (format === "mermaid") {
          const mermaidCode = generateMermaidCode(getNodes(), getEdges());
          navigator.clipboard.writeText(mermaidCode);
          toast.success("Mermaid code copied to clipboard!");
        } else {
          const element = document.querySelector(".react-flow") as HTMLElement;
          if (!element) return;

          // Get all nodes to calculate the full bounds
          const nodes = getNodes();
          if (nodes.length === 0) {
            toast.error("No nodes to export");
            return;
          }

          // Calculate bounding box of all nodes
          const padding = 50;
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;

          nodes.forEach((node) => {
            const x = node.position.x;
            const y = node.position.y;
            const width = node.measured?.width || 200;
            const height = node.measured?.height || 100;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
          });

          const width = maxX - minX + padding * 2;
          const height = maxY - minY + padding * 2;

          const { toPng, toSvg } = await import("html-to-image");
          const bgColor = resolvedTheme === "dark" ? "#0f0f0f" : "#faf9f5";

          switch (format) {
            case "png": {
              const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
                filter: (node) => {
                  // Filter out any UI overlays
                  if (
                    node.classList?.contains("react-flow__panel") ||
                    node.classList?.contains("react-flow__attribution")
                  ) {
                    return false;
                  }
                  return true;
                },
              });
              const link = document.createElement("a");
              link.download = `architecture-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("PNG exported successfully!");
              break;
            }
            case "svg": {
              const dataUrl = await toSvg(element, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
                filter: (node) => {
                  if (
                    node.classList?.contains("react-flow__panel") ||
                    node.classList?.contains("react-flow__attribution")
                  ) {
                    return false;
                  }
                  return true;
                },
              });
              const link = document.createElement("a");
              link.download = `architecture-${Date.now()}.svg`;
              link.href = dataUrl;
              link.click();
              toast.success("SVG exported successfully!");
              break;
            }
            case "pdf": {
              const { jsPDF } = await import("jspdf");
              const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
                style: {
                  transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
                },
                filter: (node) => {
                  if (
                    node.classList?.contains("react-flow__panel") ||
                    node.classList?.contains("react-flow__attribution")
                  ) {
                    return false;
                  }
                  return true;
                },
              });
              const pdf = new jsPDF({
                orientation: width > height ? "landscape" : "portrait",
                unit: "px",
                format: [width, height],
              });
              pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
              pdf.save(`architecture-${Date.now()}.pdf`);
              toast.success("PDF exported successfully!");
              break;
            }
          }
        }
      },
      zoomIn: () => {
        zoomIn({ duration: 200 });
      },
      zoomOut: () => {
        zoomOut({ duration: 200 });
      },
    }));

    const nodeTypes = useMemo(
      () => ({
        database: DatabaseNode,
        gateway: GatewayNode,
        service: ServiceNode,
        frontend: ServiceNode,
        backend: ServiceNode,
        queue: QueueNode,
        loadbalancer: LoadbalancerNode,
        cache: CacheNode,
        client: ClientNode,
        function: FunctionNode,
        storage: StorageNode,
        ai: AINode,
        "ai-model": AIModelNode,
        auth: AuthNode,
        "vector-db": VectorDBNode,
        payment: PaymentNode,
        automation: AutomationNode,
        messaging: MessagingNode,
        monitoring: MonitoringNode,
        cicd: CICDNode,
        security: SecurityNode,
        // Custom shape and text nodes
        "shape-rect": ShapeNode,
        "shape-circle": ShapeNode,
        "shape-diamond": ShapeNode,
        text: TextNode,
      }),
      [],
    );

    const edgeTypes = useMemo(
      () => ({
        default: SimulationEdge,
        simulation: SimulationEdge,
      }),
      [],
    );

    const augmentedEdges = useMemo(() => {
      const fanIn = new Map<string, number>();
      edges.forEach((e) => {
        fanIn.set(e.target, (fanIn.get(e.target) || 0) + 1);
      });

      return edges.map((edge) => {
        const sourceFanIn = fanIn.get(edge.source) || 0;
        if (sourceFanIn > 2) {
          return {
            ...edge,
            data: { ...edge.data, congestion: true },
            animated: true,
          };
        }
        return edge;
      });
    }, [edges]);

    const onConnect = useCallback(
      (params: Connection) => {
        setEdges((eds) => addEdge(params, eds));
      },
      [setEdges],
    );

    return (
      <div
        className={cn(
          "h-full w-full relative group transition-colors duration-500 font-sans",
          chaosMode && "bg-black/90",
        )}
      >
        <ReactFlow
          nodes={nodes}
          edges={augmentedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          colorMode={resolvedTheme === "dark" ? "dark" : "light"}
          onConnect={onConnect}
          onMove={(_e, viewport) => onViewportChange?.(viewport)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          minZoom={0.1}
          className="drafting-grid-enhanced"
          onNodeClick={(_e, _node) => {
            // Optionally select node on click
          }}
        >
          {/* Enhanced Background with drafting texture */}
          <Background
            id="dots"
            gap={20}
            size={1}
            color={chaosMode ? "#330000" : "var(--canvas-dot)"}
            className="transition-colors duration-500"
          />

          {/* Undo/Redo Toolbar - Modern HUD Style */}
          <Panel position="top-left" className="ml-4 mt-4">
            <div className="flex items-center gap-0.5 bg-bg-secondary/90 backdrop-blur-sm border border-border-primary p-1 shadow-lg">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo()}
                className={cn(
                  "p-2.5 transition-all duration-200 hover:bg-bg-tertiary",
                  canUndo()
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-text-muted cursor-not-allowed",
                )}
                title="Undo (⌘Z)"
              >
                <Undo2 size={18} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo()}
                className={cn(
                  "p-2.5 transition-all duration-200 hover:bg-bg-tertiary",
                  canRedo()
                    ? "text-text-secondary hover:text-text-primary"
                    : "text-text-muted cursor-not-allowed",
                )}
                title="Redo (⌘⇧Z)"
              >
                <Redo2 size={18} />
              </button>
            </div>
          </Panel>
        </ReactFlow>

        {/* Chaos Mode Panel */}
        <ChaosModePanel />
      </div>
    );
  },
);

FlowEditorInner.displayName = "FlowEditorInner";

export interface FlowEditorRef {
  updateGraph: (data: { nodes: any[]; edges: any[] }) => void;
  autoLayout: (direction?: "DOWN" | "RIGHT") => Promise<void>;
  autoLayoutWithAlgorithm: (algorithm: LayoutAlgorithm) => Promise<void>;
  exportGraph: (format: "mermaid" | "png" | "pdf" | "svg") => Promise<void>;
  zoomIn: () => void;
  zoomOut: () => void;
  nodes: any[];
  edges: any[];
}

export const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>(
  (props, ref) => {
    return (
      <ReactFlowProvider>
        <FlowEditorInner {...props} ref={ref} />
      </ReactFlowProvider>
    );
  },
);

FlowEditor.displayName = "FlowEditor";
