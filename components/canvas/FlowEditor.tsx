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

import { Play, Save, Skull, Eye, EyeOff } from "lucide-react";
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
import { ContextBridge } from "./ContextBridge"; // Import ContextBridge

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
    const [nodes, setNodes, onNodesChange] = useNodesState(
      initialNodes as Node[],
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState(
      initialEdges as Edge[],
    );
    const workerRef = useRef<Worker | null>(null);

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
      };

      return () => {
        workerRef.current?.terminate();
      };
    }, [setNodes]);

    const handleLayout = () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ nodes, edges });
      }
    };

    const handleSave = async () => {
      const result = await saveProject(projectId, {
        nodes: nodes as any[],
        edges: edges as any[],
      });
      if (result.success) {
        console.log("Project saved successfully");
      } else {
        console.error("Failed to save project:", result.error);
      }
    };

    return (
      <div className={cn("h-full w-full relative group transition-colors duration-500", chaosMode && "bg-black/90")}>
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
            gap={20}
            size={1}
            color={chaosMode ? "#330000" : "var(--brand-gray-light)"}
            className="transition-colors duration-500"
          />
          <Controls key="controls" className="!bg-white/80 !backdrop-blur-md !border-white/20 !rounded-xl !shadow-lg !m-4" />

          {/* Simulation Controls Panel */}
          <Panel
            key="sim-panel"
            position="top-center"
            className="flex gap-2 p-1.5 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl m-4 mt-6"
          >
            {/* Semantic Zoom Toggle */}
            <div className="flex bg-brand-gray-light/20 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('concept')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-poppins font-semibold transition-all flex items-center gap-1.5",
                  viewMode === 'concept' ? "bg-white shadow-sm text-foreground" : "text-brand-gray-mid hover:text-foreground"
                )}
              >
                <EyeOff size={14} /> Concept
              </button>
              <button
                onClick={() => setViewMode('implementation')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-poppins font-semibold transition-all flex items-center gap-1.5",
                  viewMode === 'implementation' ? "bg-white shadow-sm text-foreground" : "text-brand-gray-mid hover:text-foreground"
                )}
              >
                <Eye size={14} /> Detailed
              </button>
            </div>

            <div className="w-px h-6 bg-brand-gray-light/50 my-auto" />

            {/* Chaos Mode Toggle */}
            <button
              onClick={() => setChaosMode(!chaosMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold font-poppins transition-all border",
                chaosMode
                  ? "bg-red-500 text-white border-red-600 shadow-red-500/20 shadow-md animate-pulse"
                  : "bg-transparent text-foreground border-transparent hover:bg-black/5"
              )}
            >
              <Skull size={14} />
              {chaosMode ? "CHAOS ACTIVE" : "Chaos Mode"}
            </button>
          </Panel>

          {/* Standard Controls Panel */}
          <Panel
            key="panel"
            position="top-right"
            className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl m-4"
          >
            <button
              onClick={handleLayout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 rounded-xl text-sm font-semibold font-poppins transition-all group"
            >
              <Play
                size={16}
                className="text-brand-orange transition-transform group-hover:scale-110"
              />
              Auto Layout
            </button>

            <div className="w-px h-6 bg-brand-gray-light/50 my-auto" />

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 rounded-xl text-sm font-semibold font-poppins transition-all"
            >
              <Save size={16} className="text-foreground/70" />
              Save
            </button>

            {/* Context Bridge Component */}
            <ContextBridge projectId={projectId} />
          </Panel>

          {/* Chaos Instruction Overlay */}
          {chaosMode && (
            <Panel key="chaos-overlay" position="bottom-center" className="mb-8">
              <div className="bg-red-950/80 text-red-200 px-6 py-3 rounded-full backdrop-blur-md border border-red-500/30 text-sm font-mono flex items-center gap-2 animate-bounce-slight shadow-red-900/50 shadow-lg">
                <Skull size={16} />
                TAP ANY NODE TO TRIGGER FAILURE
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
