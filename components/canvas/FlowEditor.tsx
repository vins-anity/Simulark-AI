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

import { Play, Save, Share2 } from "lucide-react";
import { saveProject } from "@/actions/projects";
import { DatabaseNode } from "./nodes/DatabaseNode";
import { GatewayNode } from "./nodes/GatewayNode";
import { ServiceNode } from "./nodes/ServiceNode";

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

    useImperativeHandle(ref, () => ({
      updateGraph: (data: { nodes: Node[]; edges: Edge[] }) => {
        setNodes(data.nodes);
        setEdges(data.edges);

        // Auto-layout after 100ms to allow React Flow to initialize new nodes
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
      }),
      [],
    );

    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    useEffect(() => {
      // Initialize Web Worker
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
      <div className="h-full w-full relative group">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          className="drafting-grid"
        >
          <Background key="background" gap={20} size={1} color="var(--brand-gray-light)" />
          <Controls key="controls" className="!bg-white/80 !backdrop-blur-md !border-white/20 !rounded-xl !shadow-lg !m-4" />

          {/* Floating Controls Panel */}
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

            <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-bold font-poppins hover:bg-brand-orange transition-all shadow-md">
              <Share2 size={16} />
              Share
            </button>
          </Panel>
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
