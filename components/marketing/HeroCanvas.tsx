"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
    Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DatabaseNode } from "@/components/canvas/nodes/DatabaseNode";
import { GatewayNode } from "@/components/canvas/nodes/GatewayNode";
import { ServiceNode } from "@/components/canvas/nodes/ServiceNode";
import { QueueNode } from "@/components/canvas/nodes/QueueNode";
import { LoadbalancerNode } from "@/components/canvas/nodes/LoadbalancerNode";
import { CacheNode } from "@/components/canvas/nodes/CacheNode";
import { ClientNode } from "@/components/canvas/nodes/ClientNode";
import { FunctionNode } from "@/components/canvas/nodes/FunctionNode";
import { StorageNode } from "@/components/canvas/nodes/StorageNode";
import { AINode } from "@/components/canvas/nodes/AINode";
import { SimulationEdge } from "@/components/canvas/edges/SimulationEdge";
import { cn } from "@/lib/utils";
import { Monitor, Cpu, Globe, Server, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Templates ---

const TEMPLATES = {
    webapp: {
        label: "Web App",
        icon: <Globe className="w-4 h-4" />,
        nodes: [
            {
                id: "client",
                type: "client",
                position: { x: 50, y: 150 },
                data: {
                    label: "Users",
                    tech: "Browser",
                    logo: "logos:chrome",
                    description: "Global edge traffic originating from user regions via HTTPS."
                },
            },
            {
                id: "lb",
                type: "loadbalancer",
                position: { x: 300, y: 150 },
                data: {
                    label: "Traffic Control",
                    tech: "AWS ELB",
                    logo: "logos:aws",
                    description: "High-availability Layer 7 load balancing with dynamic routing."
                },
            },
            {
                id: "app",
                type: "service",
                position: { x: 550, y: 50 },
                data: {
                    label: "Core API",
                    tech: "Bun.js",
                    serviceType: "backend",
                    logo: "logos:bun",
                    description: "High-performance edge runtime for authenticated business logic."
                },
            },
            {
                id: "app-2",
                type: "service",
                position: { x: 550, y: 250 },
                data: {
                    label: "Worker",
                    tech: "Go",
                    serviceType: "backend",
                    logo: "logos:go",
                    description: "Concurrent background processor for long-running compute tasks."
                },
            },
            {
                id: "db",
                type: "database",
                position: { x: 800, y: 150 },
                data: {
                    label: "Primary DB",
                    tech: "Postgres",
                    logo: "logos:postgresql",
                    description: "ACID-compliant relational persistence with multi-region replicas."
                },
            },
        ],
        edges: [
            { id: "e1", source: "client", target: "lb", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e2", source: "lb", target: "app", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e3", source: "lb", target: "app-2", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e4", source: "app", target: "db", animated: true, data: { protocol: "sql" }, type: "simulation" },
            { id: "e5", source: "app-2", target: "db", animated: true, data: { protocol: "sql" }, type: "simulation" },
        ],
    },
    ai: {
        label: "AI Pipeline",
        icon: <Cpu className="w-4 h-4" />,
        nodes: [
            {
                id: "api",
                type: "gateway",
                position: { x: 50, y: 150 },
                data: {
                    label: "API Gateway",
                    tech: "Kong",
                    logo: "logos:kong-icon",
                    description: "Authenticated entry point for AI inference orchestration."
                },
            },
            {
                id: "queue",
                type: "queue",
                position: { x: 300, y: 150 },
                data: {
                    label: "Task Queue",
                    tech: "Kafka",
                    logo: "logos:kafka-icon",
                    description: "Distributed event log for asynchronous inference pipeline."
                },
            },
            {
                id: "worker",
                type: "ai",
                position: { x: 550, y: 150 },
                data: {
                    label: "Inference",
                    tech: "PyTorch",
                    serviceType: "GPU",
                    logo: "logos:pytorch-icon",
                    description: "Neural network execution on high-density H100 GPU clusters."
                },
            },
            {
                id: "vector",
                type: "storage",
                position: { x: 800, y: 150 },
                data: {
                    label: "Vector Store",
                    tech: "pgvector",
                    logo: "logos:postgresql",
                    description: "High-dimensional embedding storage for semantic retrieval."
                },
            },
        ],
        edges: [
            { id: "e1", source: "api", target: "queue", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e2", source: "queue", target: "worker", animated: true, data: { protocol: "queue", complexity: "high" }, type: "simulation" },
            { id: "e3", source: "worker", target: "vector", animated: true, data: { protocol: "grpc" }, type: "simulation" },
        ],
    },
    microservices: {
        label: "Microservices",
        icon: <Server className="w-4 h-4" />,
        nodes: [
            {
                id: "gw",
                type: "gateway",
                position: { x: 400, y: 10 },
                data: {
                    label: "Gateway",
                    tech: "Envoy",
                    logo: "logos:envoy-icon",
                    description: "Intelligent reverse proxy and service discovery gateway."
                },
            },
            {
                id: "auth",
                type: "function",
                position: { x: 100, y: 200 },
                data: {
                    label: "Auth",
                    tech: "Lambda",
                    logo: "logos:aws-lambda",
                    description: "Serverless identity management and JWT verification."
                },
            },
            {
                id: "pay",
                type: "service",
                position: { x: 400, y: 200 },
                data: {
                    label: "Payments",
                    tech: "Rust",
                    logo: "logos:rust",
                    description: "Memory-safe transaction processing and ledger integration."
                },
            },
            {
                id: "inv",
                type: "service",
                position: { x: 700, y: 200 },
                data: {
                    label: "Inventory",
                    tech: "Java",
                    logo: "logos:java",
                    description: "Global stock synchronization and warehouse management logic."
                },
            },
            {
                id: "cache",
                type: "cache",
                position: { x: 400, y: 400 },
                data: {
                    label: "Cache",
                    tech: "Redis",
                    logo: "logos:redis",
                    description: "Sub-millisecond data retrieval for hot inventory items."
                },
            },
        ],
        edges: [
            { id: "e1", source: "gw", target: "auth", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e2", source: "gw", target: "pay", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e3", source: "gw", target: "inv", animated: true, data: { protocol: "http" }, type: "simulation" },
            { id: "e4", source: "pay", target: "cache", animated: true, data: { protocol: "tcp" }, type: "simulation" },
        ],
    },
};

type TemplateKey = keyof typeof TEMPLATES;

function HeroCanvasInner() {
    const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("webapp");
    const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATES.webapp.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(TEMPLATES.webapp.edges);

    const nodeTypes = useMemo(
        () => ({
            database: DatabaseNode,
            gateway: GatewayNode,
            service: ServiceNode,
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

    const edgeTypes = useMemo(
        () => ({
            simulation: SimulationEdge,
        }),
        []
    );

    // Switch template
    const handleTemplateChange = (key: TemplateKey) => {
        setActiveTemplate(key);
        const template = TEMPLATES[key];
        setNodes(template.nodes);
        setEdges(template.edges);
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'simulation', animated: true }, eds)),
        [setEdges]
    );

    return (
        <div className="w-full h-full relative bg-[#faf9f5]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
                // Interaction settings for "Hero" feel
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={true}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                className="drafting-grid"
            >
                <Background color="#e8e6dc" gap={20} size={1} />

                <Panel position="top-center" className="mt-4">
                    <div className="flex bg-white/80 backdrop-blur-md p-1 rounded-lg border border-brand-charcoal/10 shadow-sm gap-1">
                        {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => {
                            const template = TEMPLATES[key];
                            const isActive = activeTemplate === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleTemplateChange(key)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-all",
                                        isActive
                                            ? "bg-brand-charcoal text-white shadow-sm"
                                            : "text-brand-charcoal/60 hover:bg-brand-charcoal/5 hover:text-brand-charcoal"
                                    )}
                                >
                                    {template.icon}
                                    <span>{template.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

export function HeroCanvas() {
    return (
        <ReactFlowProvider>
            <HeroCanvasInner />
        </ReactFlowProvider>
    );
}
