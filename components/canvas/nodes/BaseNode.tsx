"use client";

import { Icon } from "@iconify/react";
import {
  Handle,
  type NodeProps,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { clsx } from "clsx";
import {
  Activity,
  Component,
  Cpu,
  Database,
  Server,
  Skull,
  ZapOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useSimulationStore } from "@/lib/store";
import { NodeContextMenu } from "./NodeContextMenu";
import { NodeProperties } from "./NodeProperties";

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
  const { viewMode, chaosMode, nodeStatus, toggleNodeStatus } =
    useSimulationStore();
  const { setNodes, getNodes } = useReactFlow();
  const nodeLabel = (data?.label as string) || label || "Node";
  // Check for logo (direct), techIcon (from enrichment), or fallback
  const nodeLogo = (data?.logo as string) || (data?.techIcon as string) || null;
  const nodeTechLabel = (data?.techLabel as string) || null;

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(nodeLabel);
  const isKilled = nodeStatus[id] === "killed";
  const isDegraded = nodeStatus[id] === "degraded";
  const isRecovering = nodeStatus[id] === "recovering";

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
        node.id === id
          ? { ...node, data: { ...node.data, label: editedLabel } }
          : node,
      ),
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
      <NodeToolbar
        position={Position.Bottom}
        isVisible={selected && isPropertiesOpen}
        offset={20}
      >
        <NodeProperties
          id={id}
          data={data}
          type={(data?.serviceType as string) || type}
        />
      </NodeToolbar>
      <div
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative flex flex-col transition-all duration-300 ease-out group",
          "w-72 h-auto rounded-none overflow-hidden",
          "border-2 border-brand-charcoal bg-white",
          // Normal state - hard brutalist shadow
          !chaosMode &&
            !isKilled &&
            "shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
          !chaosMode &&
            !isKilled &&
            selected &&
            "border-brand-orange shadow-[3px_3px_0px_0px_#FF5733]",
          // Chaos mode - active
          chaosMode &&
            !isKilled &&
            !isDegraded &&
            "cursor-crosshair border-brand-charcoal hover:border-red-500",
          // Killed state
          isKilled &&
            "bg-neutral-100 border-neutral-400 grayscale opacity-75 cursor-not-allowed shadow-none",
          // Degraded state
          isDegraded && "border-brand-orange/60",
          // Recovering state
          isRecovering && "border-brand-green/60 animate-pulse",
          className,
        )}
      >
        {/* Handles for edges - Technical Crosshairs */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 border-2 border-brand-charcoal bg-white rounded-none !top-[-6px] z-50"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 border-2 border-brand-charcoal bg-white rounded-none !bottom-[-6px] z-50"
        />

        {/* Technical Header Band */}
        <div className="h-2 border-b-2 border-brand-charcoal bg-brand-charcoal/80 flex items-center justify-between px-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-white/20" />
            <div className="w-1.5 h-1.5 bg-white/20" />
          </div>
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">
            SYSTEM_NODE // ARCH_{id.slice(0, 4)}
          </span>
        </div>

        {/* Chaos Mode Status Indicators */}
        {isKilled && (
          <div className="absolute top-8 right-2 flex items-center gap-1.5 px-2 py-1 bg-red-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider rounded-none z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Skull className="w-3 h-3" />
            CRITICAL_FAILURE
          </div>
        )}

        <div className="p-4 flex flex-col gap-4">
          {/* Header: Icon + Title + Tech */}
          <div className="flex items-start gap-4">
            {/* Icon Container - Technical Monochromatic */}
            <div className="shrink-0 w-12 h-12 border-2 border-brand-charcoal bg-white flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
              {nodeLogo ? (
                <Icon icon={nodeLogo} className="w-7 h-7 text-brand-charcoal" />
              ) : (
                icon || <Component size={24} className="text-brand-charcoal" />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
                  {nodeTechLabel || (data?.tech as string) || "GENERIC_SRV"}
                </span>
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
                    className="font-poppins font-black text-base text-brand-charcoal leading-tight bg-white border-b-2 border-brand-orange focus:outline-none w-full uppercase"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-poppins font-black text-base text-brand-charcoal leading-none cursor-text truncate uppercase tracking-tighter"
                    onDoubleClick={handleEditLabel}
                    title={nodeLabel}
                  >
                    {nodeLabel}
                  </h3>
                )}
              </div>
            </div>
          </div>

          {/* Technical Data Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-brand-charcoal/10 pt-4 px-1 font-mono">
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] opacity-40 uppercase">Class</span>
              <span className="text-[10px] font-bold uppercase truncate">
                {(data?.serviceType as string) || type || "SERVICE"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[8px] opacity-40 uppercase">Status</span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase",
                  isKilled ? "text-red-500" : "text-brand-green",
                )}
              >
                {isKilled ? "OFFLINE" : "STABLE"}
              </span>
            </div>
          </div>

          {/* Infrastructure Metrics (Mock Readout) */}
          <div className="bg-neutral-50 border border-brand-charcoal/5 p-2 font-mono text-[9px] flex items-center justify-between opacity-60">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span>LOAD: {isKilled ? "0.00" : "1.42"}%</span>
            </div>
            <span>0x{id.slice(-4).toUpperCase()}</span>
          </div>
        </div>

        {/* Decorative HUD Corner */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-brand-charcoal opacity-20 group-hover:opacity-100 transition-opacity" />
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
