"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from "@xyflow/react";
import { useSimulationStore } from "@/lib/store";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { ConnectionLabelDialog } from "./ConnectionLabelDialog";

export function SimulationEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    source,
    target,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 10,
    });

    const { nodeStatus } = useSimulationStore();
    const { setEdges } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isBlocked = nodeStatus[source] === "killed" || nodeStatus[target] === "killed";
    const protocol = (data?.protocol as string) || "http";
    const isQueue = protocol === 'queue';
    const isStream = protocol === 'stream';
    const isCongested = (data?.congestion as boolean) || false;
    const label = (data?.label as string) || "";

    const handleLabelClick = () => {
        setIsDialogOpen(true);
    };

    const handleSaveLabel = (newLabel: string) => {
        setEdges((edges) =>
            edges.map((edge) =>
                edge.id === id
                    ? { ...edge, data: { ...edge.data, label: newLabel } }
                    : edge
            )
        );
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: isBlocked ? "#ef4444" : isCongested ? "#f97316" : "#b0aea5",
                    strokeOpacity: isBlocked ? 0.5 : 0.8,
                }}
            />

            {/* Protocol-specific animations */}
            {!isBlocked && (
                <svg>
                    {/* HTTP: Fast small dots */}
                    {protocol === 'http' && (
                        <>
                            <circle r="2.5" fill="#d97757">
                                <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
                            </circle>
                            <circle r="2.5" fill="#d97757" opacity="0.6">
                                <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} begin="0.4s" />
                            </circle>
                        </>
                    )}

                    {/* Stream: Continuous flowing gradient line */}
                    {protocol === 'stream' && (
                        <g>
                            <circle r="3" fill="url(#streamGradient)">
                                <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} />
                            </circle>
                            <circle r="2" fill="#6a9bcc" opacity="0.8">
                                <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} begin="0.2s" />
                            </circle>
                            <circle r="2" fill="#6a9bcc" opacity="0.6">
                                <animateMotion dur="0.8s" repeatCount="indefinite" path={edgePath} begin="0.4s" />
                            </circle>
                            <defs>
                                <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6a9bcc" />
                                    <stop offset="100%" stopColor="#4a7ba0" />
                                </linearGradient>
                            </defs>
                        </g>
                    )}

                    {/* Queue: Default slow particle (handled separately below) */}
                    {protocol !== 'http' && protocol !== 'stream' && protocol !== 'queue' && (
                        <circle r="3" fill={isCongested ? "#ef4444" : "#d97757"}>
                            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
                        </circle>
                    )}
                </svg>
            )}

            {/* Queue Visualization */}
            {!isBlocked && isQueue && (
                <rect
                    width="8"
                    height="8"
                    fill="transparent"
                    stroke={isCongested ? "#ef4444" : "#6a9bcc"}
                    strokeWidth="2"
                    x="-4"
                    y="-4"
                >
                    <animateMotion dur="4s" repeatCount="indefinite" path={edgePath} begin="1s" />
                </rect>
            )}

            {/* Connection Label */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleLabelClick}
                    className="group cursor-pointer"
                >
                    {isBlocked ? (
                        <div className="bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 font-bold shadow-sm text-xs font-mono">
                            BLOCKED
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-brand-charcoal/10 px-2 py-0.5 rounded-sm shadow-sm hover:border-brand-orange/50 transition-all">
                            <span className="text-[10px] font-mono text-brand-charcoal/70">
                                {label || `${protocol.toUpperCase()}`}
                            </span>
                            {isHovered && (
                                <Pencil className="w-2.5 h-2.5 text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    )}
                </div>
            </EdgeLabelRenderer>

            <ConnectionLabelDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                currentLabel={label}
                onSave={handleSaveLabel}
            />
        </>
    );
}
