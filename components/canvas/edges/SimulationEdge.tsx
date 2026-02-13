"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { Pencil } from "lucide-react";
import { useState } from "react";
import {
  CONNECTOR_COLORS,
  getAnimationDuration,
  getProtocolConfig,
  getProtocolLabel,
} from "@/lib/schema/connectors";
import { useSimulationStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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

  const { nodeStatus, chaosMode } = useSimulationStore();
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isBlocked =
    nodeStatus[source] === "killed" || nodeStatus[target] === "killed";
  const protocol = (data?.protocol as string) || "http";
  const protocolConfig = getProtocolConfig(protocol);
  // Determine base color based on Chaos Mode
  const baseColor = chaosMode ? "#e4e4e7" : CONNECTOR_COLORS.default;
  const isQueue = protocol === "queue";
  const isCongested = (data?.congestion as boolean) || false;
  const label = (data?.label as string) || "";
  const protocolLabel = getProtocolLabel(protocol);
  const animationDuration = getAnimationDuration(protocol);

  const handleLabelClick = () => {
    setIsDialogOpen(true);
  };

  const handleSaveLabel = (newLabel: string) => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, label: newLabel } }
          : edge,
      ),
    );
  };

  // Get dash array from config
  const strokeDasharray = protocolConfig.style?.strokeDasharray || undefined;

  return (
    <>
      {/* Glow effect layer */}
      {!isBlocked && (
        <BaseEdge
          path={edgePath}
          style={{
            ...style,
            strokeWidth:
              ((protocolConfig.style as any)?.strokeWidth || 1.5) + 4,
            stroke: isCongested ? CONNECTOR_COLORS.error : baseColor,
            strokeOpacity: 0.1,
            filter: "blur(2px)",
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        className={cn(
          "react-flow__edge-path",
          !isBlocked && "transition-all duration-200",
        )}
        style={{
          ...style,
          strokeWidth: (protocolConfig.style as any)?.strokeWidth || 1.5,
          stroke: isBlocked
            ? CONNECTOR_COLORS.error
            : isCongested
              ? CONNECTOR_COLORS.active
              : baseColor,
          strokeOpacity: isBlocked ? 0.5 : chaosMode ? 0.6 : 0.85,
          strokeDasharray: strokeDasharray,
        }}
      />

      {/* Speed-based animated particle */}
      {!isBlocked && (
        <svg>
          {/* Single particle with speed based on protocol */}
          <circle
            r={isQueue ? 4 : 2.5}
            fill={isCongested ? CONNECTOR_COLORS.error : baseColor}
          >
            <animateMotion
              dur={`${animationDuration}ms`}
              repeatCount="indefinite"
              path={edgePath}
            />
          </circle>
          {/* Second particle for fast connections */}
          {protocolConfig.animationSpeed === "fast" && (
            <circle r="2" fill={baseColor} opacity="0.5">
              <animateMotion
                dur={`${animationDuration}ms`}
                repeatCount="indefinite"
                path={edgePath}
                begin={`${animationDuration / 3}ms`}
              />
            </circle>
          )}
        </svg>
      )}

      {/* Queue Visualization */}
      {!isBlocked && isQueue && (
        <rect
          width="6"
          height="6"
          fill="transparent"
          stroke={isCongested ? CONNECTOR_COLORS.error : baseColor}
          strokeWidth="1.5"
          x="-3"
          y="-3"
        >
          <animateMotion
            dur={`${animationDuration * 1.5}ms`}
            repeatCount="indefinite"
            path={edgePath}
            begin="500ms"
          />
        </rect>
      )}

      {/* Connection Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleLabelClick}
          className="group cursor-pointer"
        >
          {isBlocked ? (
            <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded border border-red-500/20 font-bold shadow-sm text-xs font-mono">
              BLOCKED
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-bg-secondary/95 backdrop-blur-sm border border-brand-charcoal/10 px-2 py-0.5 rounded-sm shadow-sm hover:border-brand-orange/50 transition-all">
              <span className="text-[10px] font-mono text-text-primary/70">
                {label || protocolLabel}
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
