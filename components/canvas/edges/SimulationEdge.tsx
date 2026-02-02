"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { useSimulationStore } from "@/lib/store";

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
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const { nodeStatus } = useSimulationStore();

    // Check if either connected node is killed
    const isBlocked = nodeStatus[source] === "killed" || nodeStatus[target] === "killed";

    // Protocol Logic
    // HTTP = Fast, solid particles
    // Queue = Slow, squares
    // Stream = Very fast, continuous line? 
    // Default to standard slow flow if unspecified.
    const protocol = (data?.protocol as string) || "http";

    const isQueue = protocol === 'queue';
    const isStream = protocol === 'stream';
    const isCongested = (data?.congestion as boolean) || false;

    return (
        <g id={id}>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: isBlocked ? "#ef4444" : isCongested ? "#f97316" : "#b0aea5", // Red if blocked, Orange if congested, Gray default
                    strokeOpacity: isBlocked ? 0.5 : 0.8,
                }}
            />

            {/* Particle Animation Overlay */}
            {!isBlocked && (
                <circle r="3" fill={isCongested ? "#ef4444" : "#d97757"}>
                    <animateMotion dur={isQueue ? "3s" : isStream ? "0.5s" : "1.5s"} repeatCount="indefinite" path={edgePath}>
                    </animateMotion>
                </circle>
            )}

            {/* Queue Visualization (Hollow Box) */}
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

            {/* Blocked Indicator label */}
            {isBlocked && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 font-bold shadow-sm"
                    >
                        BLOCKED
                    </div>
                </EdgeLabelRenderer>
            )}
        </g>
    );
}
