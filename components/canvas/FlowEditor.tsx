"use client";

import {
  addEdge,
  Background,
  type Connection,
  Controls,
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

import { Activity, AlertTriangle, Info, X, Download, ChevronDown } from "lucide-react";
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
import { Icon } from "@iconify/react";
import { applyLayout, applyLayoutAsync } from "@/lib/layout";
// Note: toPng, toSvg, and jsPDF are now imported dynamically inside exportGraph to prevent Turbopack panics.
import { generateMermaidCode } from "@/lib/utils";
// Note: generateMermaidCode helper was previously at the bottom of this file. Using it from utils if available is cleaner.
// If it's not in utils, I should inline it. I will assume it's NOT in utils and I need to define it or import the local one.
// Actually, I should just remove these comments and ensure function exists. I will define it if missing.


interface FlowEditorProps {
  initialNodes?: any[];
  initialEdges?: any[];
  projectId: string;
}

const FlowEditorInner = forwardRef(
  (
    { initialNodes = [], initialEdges = [], projectId }: FlowEditorProps,
    ref,
  ) => {
    // Ensure all nodes and edges have unique ids and default positions
    const nodesWithIds = useMemo(() => {
      return (initialNodes as Node[]).map((node, index) => ({
        ...node,
        id: node.id || `node-${index}-${Date.now()}`,
        // Provide default position if missing
        position: node.position || { x: 100 + (index * 250), y: 100 + (index % 3) * 150 },
      }));
    }, [initialNodes]);

    const edgesWithIds = useMemo(() => {
      return (initialEdges as Edge[]).map((edge, index) => ({
        ...edge,
        id: edge.id || `edge - ${index} -${Date.now()} `,
      }));
    }, [initialEdges]);

    const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithIds);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgesWithIds);
    // Selected Node State Removed (handled by BaseNode internal toolbar)
    const [showExportMenu, setShowExportMenu] = useState(false);
    const { fitView, getNodes, getEdges } = useReactFlow();

    // Simulation Store
    const { chaosMode, setChaosMode, viewMode, setViewMode } = useSimulationStore();

    // Auto-save: Debounced persistence for node/edge changes
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = useRef(false);
    const prevNodesLengthRef = useRef(nodesWithIds.length);
    const prevEdgesLengthRef = useRef(edgesWithIds.length);

    useEffect(() => {
      // Skip initial mount to avoid saving the same data we just loaded
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        prevNodesLengthRef.current = nodes.length;
        prevEdgesLengthRef.current = edges.length;
        return;
      }

      // Debounce save to prevent excessive API calls
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        // Only save if there's actual content
        if (nodes.length === 0 && edges.length === 0) {
          console.log('[FlowEditor] Skipping save: empty graph');
          return;
        }
        console.log(`[FlowEditor] Auto-saving... (${nodes.length} nodes, ${edges.length} edges)`);
        try {
          await saveProject(projectId, { nodes: nodes as any, edges: edges as any });
          console.log('[FlowEditor] Auto-save complete.');
        } catch (error) {
          console.error('[FlowEditor] Auto-save failed:', error);
          toast.error('Failed to save changes. Please try again.');
        }
      }, 1500); // 1.5 second debounce

      return () => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
      };
    }, [nodes, edges, projectId]);

    useImperativeHandle(ref, () => ({
      updateGraph: (data: { nodes: Node[]; edges: Edge[] }) => {
        // Ensure all AI-provided nodes have default positions if missing
        const nodesWithPositions = data.nodes.map((node, index) => ({
          ...node,
          position: node.position || { x: 100 + (index * 250), y: 100 + (index % 3) * 150 },
        }));
        setNodes(nodesWithPositions);
        setEdges(data.edges);
      },
      autoLayout: async (direction: "DOWN" | "RIGHT" = "DOWN") => {
        try {
          const currentNodes = getNodes();
          const currentEdges = getEdges();
          const layoutDirection = direction === "DOWN" ? "TB" : "LR";
          const { nodes: layoutNodes } = await applyLayoutAsync(currentNodes, currentEdges, { direction: layoutDirection });
          setNodes(layoutNodes);
          setTimeout(() => fitView({ duration: 500 }), 100);
          // Save removed - debounced useEffect handles persistence
        } catch (error) {
          console.error("AutoLayout error:", error);
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

          // Dynamic imports to prevent Turbopack/SSR issues with DOM-heavy libraries
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
              const pdf = new jsPDF({
                orientation: 'landscape',
              });
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
        // Map new types to ServiceNode (shared visual structure)
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

    // Register Custom Edge
    const edgeTypes = useMemo(() => ({
      default: SimulationEdge,
      simulation: SimulationEdge
    }), []);

    // Congestion Logic
    const augmentedEdges = useMemo(() => {
      const fanIn = new Map<string, number>();
      edges.forEach((e) => {
        fanIn.set(e.target, (fanIn.get(e.target) || 0) + 1);
      });

      return edges.map((edge) => {
        const sourceFanIn = fanIn.get(edge.source) || 0;
        // If source node is overloaded (fan-in > 2), mark outgoing edge as congested
        if (sourceFanIn > 2) {
          return {
            ...edge,
            data: { ...edge.data, congestion: true },
            animated: true, // Force animation
          };
        }
        return edge;
      });
    }, [edges]);

    const onConnect = useCallback(
      (params: Connection) => {
        const newEdges = addEdge(params, edges);
        setEdges(newEdges);
        // Save removed - debounced useEffect handles persistence
      },
      [edges, setEdges],
    );

    const onNodeDragStop = useCallback(
      (_: React.MouseEvent, node: Node, nodes: Node[]) => {
        // Save removed - debounced useEffect handles persistence
        // Note: React Flow auto-updates state via onNodesChange during drag
      },
      []
    );

    const handleLayout = async () => {
      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const { nodes: layoutNodes } = await applyLayoutAsync(currentNodes, currentEdges);
      setNodes(layoutNodes);
      setTimeout(() => fitView({ duration: 500 }), 100);
      // Save removed - debounced useEffect handles persistence
    };

    return (
      <div className={cn("h-full w-full relative group transition-colors duration-500 font-sans", chaosMode && "bg-black/90")}>
        <ReactFlow
          nodes={nodes}
          edges={augmentedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          className="drafting-grid"
        >
          <Background
            key="background"
            gap={24}
            size={1.5}
            color={chaosMode ? "#330000" : "#d4d4d8"}
            className="transition-colors duration-500 opacity-60"
          />

          {/* Controls removed to prevent duplication */}

          {/* Custom Controls removed (handled by parent ToolRail mostly, except specific canvas actions) */}

          {/* Simulation State HUD Panel Removed - Logic moved to Header */}


          {/* Top Right: Actions Panel Removed (Consolidated into WorkstationHeader) */}

          {/* Bottom Center: Chaos Warning */}
          {chaosMode && (
            <Panel position="bottom-center" className="mb-8">
              <div className="bg-red-950/90 text-red-100 px-6 py-2 border-t-2 border-red-500 text-xs font-mono uppercase tracking-widest shadow-2xl flex items-center gap-3">
                <AlertTriangle size={14} className="text-red-500 animate-bounce" />
                <span>Failure Simulation Active // Click nodes to inject faults</span>
              </div>
            </Panel>
          )}

          {/* Node Details Panel Removed (Replaced by floating NodeProperties) */}
          {nodes.filter(n => n.selected).map(node => (
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
  updateGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
  autoLayout: (direction?: "DOWN" | "RIGHT") => Promise<void>;
  exportGraph: (format: 'mermaid' | 'png' | 'pdf' | 'svg') => Promise<void>;
  nodes: Node[];
  edges: Edge[];
}

export const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} ref={ref} />
    </ReactFlowProvider>
  );
});

FlowEditor.displayName = "FlowEditor";
