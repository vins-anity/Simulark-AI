"use client";

import {
  addEdge,
  Background,
  type Connection,
  type Edge,
  type Node,
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
  useState,
} from "react";
import "@xyflow/react/dist/style.css";

import { AlertTriangle } from "lucide-react";
import { saveProject } from "@/actions/projects";
import { toast } from "sonner";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { GatewayNode } from "./nodes/GatewayNode";
import { ServiceNode } from "./nodes/ServiceNode";
import { QueueNode } from "./nodes/QueueNode";
import { LoadbalancerNode } from "./nodes/LoadbalancerNode";
import { CacheNode } from "./nodes/CacheNode";
import { ClientNode } from "./nodes/ClientNode";
import { FunctionNode } from "./nodes/FunctionNode";
import { StorageNode } from "./nodes/StorageNode";
import { AINode } from "./nodes/AINode";
import { NodeProperties } from "./nodes/NodeProperties";
import { SimulationEdge } from "./edges/SimulationEdge";
import { useSimulationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { applyLayout, applyLayoutAsync } from "@/lib/layout";
import { generateMermaidCode } from "@/lib/utils";

interface FlowEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  projectId: string;
}

const FlowEditorInner = forwardRef<FlowEditorRef, FlowEditorProps>(
  ({ initialNodes = [], initialEdges = [], projectId }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { fitView, getNodes, getEdges } = useReactFlow();
    const { chaosMode } = useSimulationStore();
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);

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
            const { nodes: layoutNodes } = await applyLayoutAsync(currentNodes, currentEdges, { direction: layoutDirection });
            setNodes(layoutNodes);
          } catch (asyncError) {
            console.warn("[FlowEditor] Async layout failed, using sync fallback:", asyncError);
            const { nodes: syncNodes } = applyLayout(currentNodes, currentEdges, { direction: layoutDirection });
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
            const { nodes: fallbackNodes } = applyLayout(currentNodes, currentEdges, { direction: layoutDirection });
            setNodes(fallbackNodes);
            setTimeout(() => fitView({ duration: 500 }), 100);
          } catch (fallbackError) {
            console.error("[FlowEditor] All layout methods failed:", fallbackError);
          }
        }
      },
      get nodes() { return getNodes(); },
      get edges() { return getEdges(); },
      exportGraph: async (format: 'mermaid' | 'png' | 'pdf' | 'svg') => {
        if (format === 'mermaid') {
          const mermaidCode = generateMermaidCode(getNodes(), getEdges());
          navigator.clipboard.writeText(mermaidCode);
          toast.success('Mermaid code copied to clipboard!');
        } else {
          const element = document.querySelector('.react-flow') as HTMLElement;
          if (!element) return;

          const { toPng, toSvg } = await import("html-to-image");

          switch (format) {
            case 'png': {
              const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `architecture-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
              break;
            }
            case 'svg': {
              const dataUrl = await toSvg(element, { cacheBust: true, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `architecture-${Date.now()}.svg`;
              link.href = dataUrl;
              link.click();
              break;
            }
            case 'pdf': {
              const { jsPDF } = await import("jspdf");
              const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#ffffff' });
              const pdf = new jsPDF({ orientation: 'landscape' });
              const imgProps = pdf.getImageProperties(dataUrl);
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
              pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`architecture-${Date.now()}.pdf`);
              break;
            }
          }
        }
      }
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
      }),
      []
    );

    const edgeTypes = useMemo(() => ({
      default: SimulationEdge,
      simulation: SimulationEdge
    }), []);

    const augmentedEdges = useMemo(() => {
      const fanIn = new Map<string, number>();
      edges.forEach((e) => {
        fanIn.set(e.target, (fanIn.get(e.target) || 0) + 1);
      });

      return edges.map((edge) => {
        const sourceFanIn = fanIn.get(edge.source) || 0;
        if (sourceFanIn > 2) {
          return { ...edge, data: { ...edge.data, congestion: true }, animated: true };
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

    const selectedNodes = useMemo(() =>
      nodes.filter((n): n is any & { selected: true } => n.selected === true),
      [nodes]
    );

    return (
      <div className={cn("h-full w-full relative group transition-colors duration-500 font-sans", chaosMode && "bg-black/90")}>
        <ReactFlow
          nodes={nodes}
          edges={augmentedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          className="drafting-grid"
        >
          <Background
            gap={24}
            size={1.5}
            color={chaosMode ? "#330000" : "#d4d4d8"}
            className="transition-colors duration-500 opacity-60"
          />

          {chaosMode && (
            <Panel position="bottom-center" className="mb-8">
              <div className="bg-red-950/90 text-red-100 px-6 py-2 border-t-2 border-red-500 text-xs font-mono uppercase tracking-widest shadow-2xl flex items-center gap-3">
                <AlertTriangle size={14} className="text-red-500 animate-bounce" />
                <span>Failure Simulation Active // Click nodes to inject faults</span>
              </div>
            </Panel>
          )}

          {selectedNodes.map(node => (
            <Panel key={node.id} position="top-right" className="mr-4 mt-16">
              <NodeProperties id={node.id} data={node.data} type={node.type} />
            </Panel>
          ))}
        </ReactFlow>
      </div>
    );
  },
);

FlowEditorInner.displayName = "FlowEditorInner";

export interface FlowEditorRef {
  updateGraph: (data: { nodes: any[]; edges: any[] }) => void;
  autoLayout: (direction?: "DOWN" | "RIGHT") => Promise<void>;
  exportGraph: (format: 'mermaid' | 'png' | 'pdf' | 'svg') => Promise<void>;
  nodes: any[];
  edges: any[];
}

export const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} ref={ref} />
    </ReactFlowProvider>
  );
});

FlowEditor.displayName = "FlowEditor";
