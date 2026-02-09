"use client";

import { Handle, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSimulationStore } from "@/lib/store";
import { Skull, ZapOff, Activity, Cpu, Database, Server, Component } from "lucide-react";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { NodeContextMenu } from "./NodeContextMenu";
import { NodeProperties } from "./NodeProperties";
import { toast } from "sonner";
import { NodeToolbar } from "@xyflow/react";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type BaseNodeProps = NodeProps & {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  logo?: string; // Iconify icon string
  techLabel?: string; // e.g. "Next.js 14", "Postgres 16"
  tier?: string; // e.g. "Serverless", "vCPU 2"
};

export function BaseNode({
  id,
  selected,
  data,
  children,
  className,
  icon,
  label,
  type,
}: BaseNodeProps) {
  const { viewMode, chaosMode, nodeStatus, toggleNodeStatus } = useSimulationStore();
  const { setNodes, getNodes } = useReactFlow();
  const nodeLabel = (data?.label as string) || label || "Node";
  const nodeLogo = (data?.logo as string) || null;
  const nodeTechLabel = (data?.techLabel as string) || null;

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(nodeLabel);
  const isKilled = nodeStatus[id] === "killed";

  // Click vs Drag detection
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Reset properties open state when node is deselected
  useEffect(() => {
    if (!selected) {
      setIsPropertiesOpen(false);
    }
  }, [selected]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    // Chaos mode handling
    if (chaosMode) {
      e.stopPropagation();
      toggleNodeStatus(id);
      return;
    }

    // Check for drag
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Only open properties if moved less than 10px (pure click/tap)
    if (dist < 10) {
      setIsPropertiesOpen(true);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleEditLabel = () => {
    setIsEditingLabel(true);
    setEditedLabel(nodeLabel);
  };

  const handleSaveLabel = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: editedLabel } } : node
      )
    );
    setIsEditingLabel(false);
  };

  const handleDuplicate = () => {
    const currentNode = getNodes().find((n) => n.id === id);
    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${id}-copy-${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        data: {
          ...currentNode.data,
          label: `${nodeLabel} (Copy)`,
        },
      };
      setNodes((nodes) => [...nodes, newNode]);
      toast.success("Node duplicated");
    }
  };

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    toast.success("Node deleted");
  };

  // ============================================
  // UNIFIED VIEW: "Strategic Island" card focus
  // ============================================
  return (
    <>
      <NodeToolbar position={Position.Bottom} isVisible={selected && isPropertiesOpen} offset={20}>
        <NodeProperties id={id} data={data} type={(data?.serviceType as string) || type} />
      </NodeToolbar>
      <div
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative flex flex-col transition-all duration-300 ease-out group",
          "w-72 h-auto rounded-lg overflow-hidden bg-white",
          "border border-brand-charcoal/10 shadow-sm",
          !isKilled && "hover:border-brand-orange/40 hover:shadow-md",
          !isKilled && selected && "ring-2 ring-brand-orange/20 border-brand-orange shadow-brand-orange/10",
          chaosMode && !isKilled && "cursor-crosshair hover:bg-red-500/10",
          isKilled && "bg-red-50 border-red-200 grayscale opacity-80",
          className
        )}
      >
        {/* Handles for edges - Transparent but functional */}
        <Handle type="target" position={Position.Top} className="opacity-0 w-full h-4 border-0 !bg-transparent z-50" />
        <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-4 border-0 !bg-transparent z-50" />

        {/* Top Resize Handle Visual */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[3px] w-1.5 h-1.5 rounded-full bg-brand-charcoal/20 z-10" />

        <div className="p-4 flex flex-col gap-3">
          {/* Header: Icon + Title + Tech */}
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-brand-charcoal/5 shadow-sm flex items-center justify-center text-brand-orange">
              {nodeLogo ? (
                <Icon icon={nodeLogo} className="w-6 h-6 text-brand-charcoal" />
              ) : (
                icon || <Component size={20} />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col min-w-0 flex-1 relative">
              <div className="flex justify-between items-start w-full">
                {isEditingLabel ? (
                  <input
                    type="text"
                    value={editedLabel}
                    onChange={(e) => setEditedLabel(e.target.value)}
                    onBlur={handleSaveLabel}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveLabel();
                      if (e.key === "Escape") setIsEditingLabel(false);
                    }}
                    className="font-poppins font-bold text-sm text-brand-charcoal leading-tight bg-white border border-brand-orange rounded px-1 focus:outline-none focus:ring-1 focus:ring-brand-orange w-[70%]"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-poppins font-bold text-sm text-brand-charcoal leading-snug cursor-text truncate pr-2 max-w-[70%]"
                    onDoubleClick={handleEditLabel}
                    title={nodeLabel}
                  >
                    {nodeLabel}
                  </h3>
                )}

                {/* Service Name (Tech) - Top Right */}
                <div className="text-[10px] text-brand-charcoal/50 font-medium font-mono uppercase tracking-wider truncate max-w-[30%] text-right">
                  {nodeTechLabel || (data?.tech as string) || "Service"}
                </div>
              </div>

              {/* Node Type Badge - Below Title */}
              <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-[10px] font-mono uppercase tracking-wider bg-brand-charcoal/5 text-brand-charcoal/60 w-fit">
                {(data?.serviceType as string) || (data?.tier as string) || type || "SERVICE"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-brand-charcoal/5" />

          {/* Description */}
          <div className="text-[11px] text-brand-charcoal/60 leading-relaxed font-sans line-clamp-3">
            {(data?.description as string) || "Core infrastructure component."}
          </div>
        </div>

        {/* Bottom Resize Handle Visual */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[3px] w-1.5 h-1.5 rounded-full bg-brand-charcoal/20 z-10" />
      </div>

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={handleEditLabel}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
