"use client";

import {
  Handle,
  type NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ShapeType =
  | "shape-rect"
  | "shape-circle"
  | "shape-diamond"
  | "shape-parallelogram"
  | "shape-hexagon";

interface ShapeNodeData {
  label?: string;
  shapeType: ShapeType;
  color?: string;
  width?: number;
  height?: number;
  notes?: string;
}

// Custom resize handle component
function ResizeHandle({ position }: { position: "nw" | "ne" | "sw" | "se" }) {
  const positionClasses = {
    nw: "top-0 left-0 cursor-nwse-resize",
    ne: "top-0 right-0 cursor-nesw-resize",
    sw: "bottom-0 left-0 cursor-nesw-resize",
    se: "bottom-0 right-0 cursor-nwse-resize",
  };

  return (
    <div
      className={cn(
        "absolute w-3 h-3 bg-brand-orange border border-white shadow-md z-10",
        positionClasses[position],
      )}
    />
  );
}

export function ShapeNode({ id, selected, data }: NodeProps) {
  const { setNodes, getNodes, getViewport } = useReactFlow();
  const [label, setLabel] = useState<string>(String(data?.label || "Shape"));
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: (data?.width as number) || 120,
    height: (data?.height as number) || 80,
  });

  const shapeType = (data?.shapeType as ShapeType) || "shape-rect";
  const color = (data?.color as string) || "#e5e5e5";
  const isResizing = useRef(false);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: dimensions.width,
        height: dimensions.height,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.current || !resizeStartRef.current) return;

        const dx = moveEvent.clientX - resizeStartRef.current.x;
        const dy = moveEvent.clientY - resizeStartRef.current.y;
        const scale = 1; // Could calculate from viewport zoom

        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;

        if (direction.includes("e")) {
          newWidth = Math.max(40, resizeStartRef.current.width + dx * scale);
        }
        if (direction.includes("s")) {
          newHeight = Math.max(30, resizeStartRef.current.height + dy * scale);
        }

        setDimensions({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        isResizing.current = false;
        resizeStartRef.current = null;

        // Persist new dimensions to node
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    width: dimensions.width,
                    height: dimensions.height,
                  },
                }
              : node,
          ),
        );

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [id, setNodes, dimensions],
  );

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node,
      ),
    );
  };

  const getShapeStyles = () => {
    const baseStyles = "transition-all duration-200";

    switch (shapeType) {
      case "shape-circle":
        return cn(
          baseStyles,
          "rounded-full",
          selected && "ring-2 ring-brand-orange ring-offset-1",
        );
      case "shape-diamond":
        return cn(
          baseStyles,
          "rotate-45",
          selected && "ring-2 ring-brand-orange ring-offset-1",
        );
      case "shape-parallelogram":
        return cn(
          baseStyles,
          "skew-x-12",
          selected && "ring-2 ring-brand-orange ring-offset-1",
        );
      case "shape-hexagon":
        return cn(
          baseStyles,
          "[clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]",
          selected && "ring-2 ring-brand-orange ring-offset-1",
        );
      case "shape-rect":
      default:
        return cn(
          baseStyles,
          "rounded-lg",
          selected && "ring-2 ring-brand-orange ring-offset-1",
        );
    }
  };

  return (
    <>
      <NodeToolbar
        position={Position.Bottom}
        isVisible={selected && isPropertiesOpen}
        offset={10}
      >
        <div className="bg-bg-elevated border border-brand-charcoal/20 shadow-lg rounded-lg p-3 min-w-48 z-50">
          <div className="text-[9px] uppercase tracking-widest text-brand-charcoal/50 font-mono mb-2">
            Shape Properties
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-brand-charcoal/60">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) =>
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === id
                          ? {
                              ...node,
                              data: { ...node.data, color: e.target.value },
                            }
                          : node,
                      ),
                    )
                  }
                  className="w-8 h-7 rounded-sm cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  readOnly
                  className="flex-1 h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm bg-bg-secondary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-mono text-brand-charcoal/60">
                  W
                </label>
                <input
                  type="number"
                  value={Math.round(dimensions.width)}
                  onChange={(e) => {
                    const val = Math.max(40, Number(e.target.value));
                    setDimensions((prev) => ({ ...prev, width: val }));
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === id
                          ? { ...node, data: { ...node.data, width: val } }
                          : node,
                      ),
                    );
                  }}
                  className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-mono text-brand-charcoal/60">
                  H
                </label>
                <input
                  type="number"
                  value={Math.round(dimensions.height)}
                  onChange={(e) => {
                    const val = Math.max(30, Number(e.target.value));
                    setDimensions((prev) => ({ ...prev, height: val }));
                    setNodes((nodes) =>
                      nodes.map((node) =>
                        node.id === id
                          ? { ...node, data: { ...node.data, height: val } }
                          : node,
                      ),
                    );
                  }}
                  className="w-full h-7 px-2 text-xs border border-brand-charcoal/20 rounded-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
          </div>
        </div>
      </NodeToolbar>

      <div
        onClick={() => selected && setIsPropertiesOpen(true)}
        className={cn("relative", getShapeStyles())}
        style={{
          width:
            shapeType === "shape-diamond"
              ? dimensions.height
              : dimensions.width,
          height: dimensions.height,
          backgroundColor: color,
          border: `2px solid ${selected ? "var(--brand-orange)" : "var(--brand-gray-mid)"}`,
        }}
      >
        {/* Resize handles - only visible when selected and not circle */}
        {selected && shapeType !== "shape-circle" && (
          <>
            <div
              onMouseDown={(e) => handleMouseDown(e, "nw")}
              className="absolute -top-1.5 -left-1.5"
            >
              <ResizeHandle position="nw" />
            </div>
            <div
              onMouseDown={(e) => handleMouseDown(e, "ne")}
              className="absolute -top-1.5 -right-1.5"
            >
              <ResizeHandle position="ne" />
            </div>
            <div
              onMouseDown={(e) => handleMouseDown(e, "sw")}
              className="absolute -bottom-1.5 -left-1.5"
            >
              <ResizeHandle position="sw" />
            </div>
            <div
              onMouseDown={(e) => handleMouseDown(e, "se")}
              className="absolute -bottom-1.5 -right-1.5"
            >
              <ResizeHandle position="se" />
            </div>
          </>
        )}

        {/* Connection handles - visible on hover or selection */}
        <Handle
          type="target"
          position={Position.Top}
          className="opacity-0 hover:opacity-100 transition-opacity w-3 h-3 -mt-1.5 !bg-brand-orange !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="opacity-0 hover:opacity-100 transition-opacity w-3 h-3 -mb-1.5 !bg-brand-orange !border-2 !border-white"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="opacity-0 hover:opacity-100 transition-opacity w-3 h-3 -ml-1.5 !bg-brand-orange !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="opacity-0 hover:opacity-100 transition-opacity w-3 h-3 -mr-1.5 !bg-brand-orange !border-2 !border-white"
        />

        {/* Label */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            shapeType === "shape-diamond" && "-rotate-45",
            shapeType === "shape-parallelogram" && "skew-x-12",
          )}
        >
          <span className="text-xs font-medium text-brand-charcoal/80 px-2 text-center truncate max-w-full">
            {label}
          </span>
        </div>
      </div>
    </>
  );
}
