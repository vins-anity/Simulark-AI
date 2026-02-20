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
import { calculateGraphExportBounds } from "@/lib/canvas-export";
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
import { StressTestPanel } from "./StressTestPanel";

interface FlowEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  projectId: string;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
}

function serializeGraphForSave(nodes: any[], edges: any[]): string {
  const stableNodes = nodes
    .map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      style: node.style,
      parentId: node.parentId,
      extent: node.extent,
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition,
      zIndex: node.zIndex,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const stableEdges = edges
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      data: edge.data,
      label: edge.label,
      animated: edge.animated,
      style: edge.style,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      markerStart: edge.markerStart,
      markerEnd: edge.markerEnd,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return JSON.stringify({ nodes: stableNodes, edges: stableEdges });
}

const FlowEditorInner = forwardRef<FlowEditorRef, FlowEditorProps>(
  (
    { initialNodes = [], initialEdges = [], projectId, onViewportChange },
    ref,
  ) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, getNodes, getEdges, zoomIn, zoomOut } = useReactFlow();
    const { chaosMode, stressMode } = useSimulationStore();
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedSnapshotRef = useRef<string>("");
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
      lastSavedSnapshotRef.current = serializeGraphForSave(
        initialNodes,
        initialEdges,
      );
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
        const snapshot = serializeGraphForSave(nodes, edges);
        await saveProject(projectId, { nodes, edges });
        lastSavedSnapshotRef.current = snapshot;
        toast.success("Project saved");
      } catch (_error) {
        toast.error("Failed to save");
      }
    }, [projectId, nodes, edges]);

    // Handle export
    const exportGraphFile = useCallback(
      async (format: "png" | "pdf" | "svg") => {
        const flowRoot = document.querySelector(".react-flow") as HTMLElement;
        const viewport = flowRoot?.querySelector(
          ".react-flow__viewport",
        ) as HTMLElement;

        if (!flowRoot || !viewport) {
          toast.error("Could not find canvas to export");
          return;
        }

        const currentNodes = getNodes();
        if (currentNodes.length === 0) {
          toast.error("No nodes to export");
          return;
        }

        const bgColor = resolvedTheme === "dark" ? "#0f0f0f" : "#faf9f5";
        const bounds = calculateGraphExportBounds(currentNodes, 50);
        const width = Math.ceil(bounds.width);
        const height = Math.ceil(bounds.height);

        const exportRoot = document.createElement("div");
        exportRoot.style.position = "fixed";
        exportRoot.style.left = "-100000px";
        exportRoot.style.top = "0";
        exportRoot.style.width = `${width}px`;
        exportRoot.style.height = `${height}px`;
        exportRoot.style.overflow = "hidden";
        exportRoot.style.backgroundColor = bgColor;
        exportRoot.style.pointerEvents = "none";
        exportRoot.style.zIndex = "-1";

        const viewportClone = viewport.cloneNode(true) as HTMLElement;
        viewportClone.style.transformOrigin = "0 0";
        viewportClone.style.transform = `translate(${bounds.translateX}px, ${bounds.translateY}px) scale(1)`;
        viewportClone.style.width = "100%";
        viewportClone.style.height = "100%";

        exportRoot.appendChild(viewportClone);
        document.body.appendChild(exportRoot);

        try {
          const { toPng, toSvg } = await import("html-to-image");

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });

          switch (format) {
            case "png": {
              const dataUrl = await toPng(exportRoot, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
                pixelRatio: 2,
              });
              const link = document.createElement("a");
              link.download = `architecture-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("PNG exported successfully!");
              break;
            }
            case "svg": {
              const dataUrl = await toSvg(exportRoot, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
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
              const dataUrl = await toPng(exportRoot, {
                cacheBust: true,
                backgroundColor: bgColor,
                width,
                height,
                pixelRatio: 2,
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
        } finally {
          exportRoot.remove();
        }
      },
      [getNodes, resolvedTheme],
    );

    const handleExport = useCallback(async () => {
      await exportGraphFile("png");
    }, [exportGraphFile]);

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

        const snapshot = serializeGraphForSave(nodes, edges);
        if (snapshot === lastSavedSnapshotRef.current) {
          return;
        }

        try {
          await saveProject(projectId, { nodes, edges });
          lastSavedSnapshotRef.current = snapshot;
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
          await exportGraphFile(format);
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
        external: ServiceNode,
        saas: ServiceNode,
        "third-party": ServiceNode,
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
          stressMode && !chaosMode && "bg-amber-950/5",
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
            color={
              chaosMode
                ? "#330000"
                : stressMode
                  ? "rgba(217,119,6,0.3)"
                  : "var(--canvas-dot)"
            }
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
        <StressTestPanel />
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
