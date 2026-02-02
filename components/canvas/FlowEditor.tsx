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
} from "react";
import "@xyflow/react/dist/style.css";

import { Play, Save, Skull, Eye, EyeOff, Activity, Share2, ZoomIn, ZoomOut, Maximize, AlertTriangle } from "lucide-react";
import { saveProject } from "@/actions/projects";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { GatewayNode } from "./nodes/GatewayNode";
import { ServiceNode } from "./nodes/ServiceNode";
import { QueueNode } from "./nodes/QueueNode";
import { LoadbalancerNode } from "./nodes/LoadbalancerNode";
import { CacheNode } from "./nodes/CacheNode";
import { SimulationEdge } from "./edges/SimulationEdge";
import { useSimulationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ContextBridge } from "./ContextBridge";
import { Icon } from "@iconify/react";

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
    // Ensure all nodes and edges have unique ids to prevent React key warnings
    const nodesWithIds = useMemo(() => {
      return (initialNodes as Node[]).map((node, index) => ({
        ...node,
        id: node.id || `node-${index}-${Date.now()}`,
      }));
    }, [initialNodes]);

    const edgesWithIds = useMemo(() => {
      return (initialEdges as Edge[]).map((edge, index) => ({
        ...edge,
        id: edge.id || `edge-${index}-${Date.now()}`,
      }));
    }, [initialEdges]);

    const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithIds);
    const [edges, setEdges, onEdgesChange] = useEdgesState(edgesWithIds);
    const workerRef = useRef<Worker | null>(null);
    const { fitView } = useReactFlow();

    // Simulation Store
    const { chaosMode, setChaosMode, viewMode, setViewMode } = useSimulationStore();

    useImperativeHandle(ref, () => ({
      updateGraph: (data: { nodes: Node[]; edges: Edge[] }) => {
        setNodes(data.nodes);
        setEdges(data.edges);

        setTimeout(() => {
          if (workerRef.current) {
            workerRef.current.postMessage({
              nodes: data.nodes,
              edges: data.edges,
            });
          }
        }, 100);
      },
    }));


    const nodeTypes = useMemo(
      () => ({
        gateway: GatewayNode,
        service: ServiceNode,
        database: DatabaseNode,
        queue: QueueNode,
        loadbalancer: LoadbalancerNode,
        cache: CacheNode,
      }),
      [],
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
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    useEffect(() => {
      workerRef.current = new Worker(
        new URL("../../workers/layout.worker.ts", import.meta.url),
      );

      workerRef.current.onmessage = (event) => {
        const { nodes: layoutNodes } = event.data;
        setNodes(layoutNodes);
        setTimeout(() => fitView({ duration: 500 }), 100);
      };

      return () => {
        workerRef.current?.terminate();
      };
    }, [setNodes, fitView]);

    const handleLayout = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ nodes, edges });
      }
    };

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
            key="background"
            gap={24}
            size={1.5}
            color={chaosMode ? "#330000" : "#d4d4d8"}
            className="transition-colors duration-500 opacity-60"
          />

          {/* Custom Controls removed (handled by parent ToolRail mostly, except specific canvas actions) */}

          {/* Top Center: Simulation State HUD */}
          <Panel position="top-center" className="mt-6 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto bg-white/90 backdrop-blur-md rounded-none border border-brand-charcoal/10 shadow-sm p-1.5 transition-all">
              {/* View Mode Toggle */}
              <div className="flex bg-[#faf9f5] border border-brand-charcoal/5 p-0.5">
                <button
                  onClick={() => setViewMode('concept')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-all hover:text-brand-charcoal",
                    viewMode === 'concept' ? "bg-white text-brand-charcoal border border-brand-charcoal/10 shadow-sm" : "text-brand-charcoal/40"
                  )}
                >
                  C-Level
                </button>
                <button
                  onClick={() => setViewMode('implementation')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-all hover:text-brand-charcoal",
                    viewMode === 'implementation' ? "bg-white text-brand-charcoal border border-brand-charcoal/10 shadow-sm" : "text-brand-charcoal/40"
                  )}
                >
                  Tech-Level
                </button>
              </div>

              <div className="w-px h-4 bg-brand-charcoal/10" />

              {/* Chaos Toggle */}
              <button
                onClick={() => setChaosMode(!chaosMode)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-all border",
                  chaosMode
                    ? "bg-red-500 text-white border-red-600 animate-pulse"
                    : "bg-transparent text-brand-charcoal/60 border-transparent hover:bg-red-50 hover:text-red-500"
                )}
              >
                <Activity className="w-3 h-3" />
                {chaosMode ? "CHAOS: ACTIVE" : "SIM: STABLE"}
              </button>
            </div>
          </Panel>

          {/* Top Right: Actions */}
          <Panel position="top-right" className="m-4">
            <div className="flex gap-2">
              <button
                onClick={handleLayout}
                className="h-8 w-8 bg-white border border-brand-charcoal/10 flex items-center justify-center text-brand-charcoal/60 hover:text-brand-orange hover:border-brand-orange transition-all shadow-sm"
                title="Auto Layout"
              >
                <Icon icon="lucide:wand-2" className="w-4 h-4" />
              </button>
              <div className="h-8 w-px bg-transparent" /> {/* Spacer */}
              <ContextBridge projectId={projectId} />
            </div>
          </Panel>

          {/* Bottom Center: Chaos Warning */}
          {chaosMode && (
            <Panel position="bottom-center" className="mb-8">
              <div className="bg-red-950/90 text-red-100 px-6 py-2 border-t-2 border-red-500 text-xs font-mono uppercase tracking-widest shadow-2xl flex items-center gap-3">
                <AlertTriangle size={14} className="text-red-500 animate-bounce" />
                <span>Failure Simulation Active // Click nodes to inject faults</span>
              </div>
            </Panel>
          )}

        </ReactFlow>
      </div>
    );
  },
);

FlowEditorInner.displayName = "FlowEditorInner";

export interface FlowEditorRef {
  updateGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

export const FlowEditor = forwardRef<FlowEditorRef, FlowEditorProps>((props, ref) => {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} ref={ref} />
    </ReactFlowProvider>
  );
});

FlowEditor.displayName = "FlowEditor";
