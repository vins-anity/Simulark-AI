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
  // C-LEVEL VIEW: "Strategic Island" / Business Focus
  // ============================================
  if (viewMode === "concept") {
    return (
      <>
        <NodeToolbar position={Position.Bottom} isVisible={selected && isPropertiesOpen} offset={20}>
          <NodeProperties id={id} data={data} type={data?.serviceType as string} />
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
            {/* Header: Icon + Title */}
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-brand-charcoal/5 shadow-sm flex items-center justify-center text-brand-orange">
                {nodeLogo ? (
                  <Icon icon={nodeLogo} className="w-6 h-6 text-brand-charcoal" />
                ) : (
                  icon || <Component size={20} />
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col min-w-0 flex-1">
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
                    className="font-poppins font-bold text-sm text-brand-charcoal leading-tight bg-white border border-brand-orange rounded px-1 focus:outline-none focus:ring-1 focus:ring-brand-orange w-full"
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-poppins font-bold text-sm text-brand-charcoal leading-snug cursor-text truncate"
                    onDoubleClick={handleEditLabel}
                    title={nodeLabel}
                  >
                    {nodeLabel}
                  </h3>
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-charcoal/50 truncate">
                  {(data?.tier as string) || "SERVICE"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-brand-charcoal/5" />

            {/* Description / Metadata */}
            <div className="text-[11px] text-brand-charcoal/60 leading-relaxed font-sans">
              {(data?.description as string) || "Core infrastructure component handling request processing and data flow management."}
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

  // ============================================
  // TECH-LEVEL VIEW: "Circuit Schematic" / Technical Focus
  // ============================================
  return (
    <>
      <NodeToolbar position={Position.Bottom} isVisible={selected && isPropertiesOpen} offset={20}>
        <NodeProperties id={id} data={data} type={data?.serviceType as string} />
      </NodeToolbar>
      <div
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative transition-all duration-300 ease-out group",
          "min-w-[200px] max-w-[280px]",
          // Circuit board aesthetic with softer colors
          "bg-[#0f172a] border-2 shadow-lg",
          "hover:shadow-xl hover:scale-[1.01]",
          !isKilled && "border-sky-500/30 hover:border-sky-400/50",
          !isKilled && selected && "border-sky-400 ring-2 ring-sky-400/20 shadow-sky-400/15 shadow-2xl",
          chaosMode && !isKilled && "cursor-crosshair hover:border-red-500",
          isKilled && "bg-red-950/20 border-red-500/50 grayscale opacity-70",
          className,
        )}
      >
        {/* Connection Ports (Visual) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
          <div className={cn("w-1.5 h-1.5 rounded-full border", selected ? "bg-sky-400 border-sky-300" : "bg-slate-500/40 border-slate-400/60")} />
          <div className={cn("w-1.5 h-1.5 rounded-full border", selected ? "bg-sky-400 border-sky-300" : "bg-slate-500/40 border-slate-400/60")} />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          <div className={cn("w-1.5 h-1.5 rounded-full border", selected ? "bg-sky-400 border-sky-300" : "bg-slate-500/40 border-slate-400/60")} />
          <div className={cn("w-1.5 h-1.5 rounded-full border", selected ? "bg-sky-400 border-sky-300" : "bg-slate-500/40 border-slate-400/60")} />
        </div>

        <Handle type="target" position={Position.Top} className="!w-3 !h-3 !-top-1.5 !bg-sky-500 !border-2 !border-sky-300 opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !-bottom-1.5 !bg-sky-500 !border-2 !border-sky-300 opacity-0" />

        {/* Header: Technical ID */}
        <div className="flex items-center gap-2 p-2 border-b border-sky-500/15 bg-gradient-to-r from-sky-500/5 to-transparent">
          <div className={cn(
            "w-7 h-7 flex items-center justify-center rounded border shrink-0",
            isKilled ? "bg-red-900/50 border-red-500" : "bg-sky-950/50 border-sky-500/30"
          )}>
            {isKilled ? (
              <ZapOff size={14} className="text-red-400" />
            ) : nodeLogo ? (
              <Icon icon={nodeLogo} className="w-4 h-4 text-sky-400" />
            ) : (
              <Cpu size={14} className="text-sky-400" />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-mono text-[7px] uppercase tracking-widest text-sky-400/50 leading-none">
              NODE-{id.slice(0, 6).toUpperCase()}
            </span>
            <span className="font-mono font-bold text-[11px] text-slate-200 truncate mt-0.5">
              {nodeLabel}
            </span>
          </div>

          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            isKilled ? "bg-red-500 animate-pulse" : "bg-sky-400 shadow-sm shadow-sky-400/30"
          )} />
        </div>

        {/* Technical Specs */}
        <div className="p-2 space-y-1.5">
          {/* Tech Stack */}
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-sky-400/50 uppercase tracking-wider">Stack</span>
            <span className="text-slate-300 font-semibold">{nodeTechLabel || nodeLabel}</span>
          </div>

          {/* Instance Type */}
          <div className="flex items-center justify-between text-[8px] font-mono">
            <span className="text-sky-400/50 uppercase tracking-wider">Type</span>
            <span className="text-slate-300">{(data?.tier as string) || "Standard"}</span>
          </div>

          {/* Latency/Performance */}
          <div className="flex items-center justify-between text-[8px] font-mono pt-1 border-t border-sky-500/10">
            <span className="text-sky-400/50 uppercase tracking-wider">Latency</span>
            <span className="text-sky-300 font-bold">~12ms</span>
          </div>

          {/* Custom Technical Details */}
          {children && (
            <div className="mt-2 p-1.5 bg-black/40 border border-sky-500/15 rounded text-[8px] font-mono text-sky-300/70 leading-tight">
              {children}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className={cn(
          "h-1 w-full",
          isKilled ? "bg-red-500" : "bg-gradient-to-r from-sky-500/60 via-sky-400/60 to-sky-500/60"
        )} />
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
