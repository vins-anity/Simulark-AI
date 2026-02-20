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
  CircleHelp,
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
import { shouldInvertIcon } from "@/lib/icons";
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

// Type for the data prop
type BaseNodeData = {
  label?: string;
  tech?: string;
  techLabel?: string;
  techIcon?: string;
  logo?: string;
  tier?: string;
  serviceType?: string;
  description?: string;
  [key: string]: unknown;
};

export function BaseNode({
  id,
  selected,
  data,
  children,
  className,
  icon,
  logo,
  label,
  type,
}: BaseNodeProps) {
  const nodeData = data as BaseNodeData;
  const {
    chaosMode,
    stressMode,
    stressHotNodes,
    nodeStatus,
    toggleNodeStatus,
  } = useSimulationStore();
  const { setNodes, getNodes } = useReactFlow();
  const nodeLabel = nodeData?.label || label || "Node";
  // Check for logo (prop), logo (data), techIcon (from enrichment), or fallback
  const nodeLogo = logo || nodeData?.logo || nodeData?.techIcon || null;
  const nodeTechLabel = nodeData?.techLabel || null;

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(nodeLabel);
  const [showGuide, setShowGuide] = useState(false);
  const isKilled = nodeStatus[id] === "killed";
  const isDegraded = nodeStatus[id] === "degraded";
  const isRecovering = nodeStatus[id] === "recovering";
  const isStressHot = stressMode && stressHotNodes.includes(id);

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
          data={nodeData}
          type={(nodeData?.serviceType as string) || type}
        />
      </NodeToolbar>
      <div
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "relative flex flex-col transition-all duration-300 ease-out group",
          "w-80 h-auto rounded-none overflow-hidden",
          "border-2 border-brand-charcoal bg-bg-secondary dark:bg-zinc-800 dark:border-white/20",
          // Normal state - hard brutalist shadow
          !chaosMode &&
            !isKilled &&
            "shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px]",
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
            "bg-bg-tertiary border-neutral-600 grayscale opacity-75 cursor-not-allowed shadow-none",
          // Degraded state
          isDegraded && "border-brand-orange/60",
          // Recovering state
          isRecovering && "border-brand-green/60 animate-pulse",
          isStressHot &&
            !chaosMode &&
            "border-amber-500 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]",
          className,
        )}
      >
        <button
          type="button"
          className="nodrag nopan absolute top-[12px] right-2 z-20 h-5 w-5 border border-brand-charcoal/20 bg-bg-secondary/95 text-brand-charcoal/60 hover:text-brand-charcoal flex items-center justify-center"
          title="Node usage guide"
          onClick={(event) => {
            event.stopPropagation();
            setShowGuide((current) => !current);
          }}
        >
          <CircleHelp className="w-3 h-3" />
        </button>

        {showGuide && (
          <div className="nodrag nopan absolute top-8 right-8 z-20 max-w-[220px] border border-brand-charcoal/20 bg-bg-secondary/95 px-2 py-1.5 shadow-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50 mb-1">
              Node Controls
            </p>
            <p className="text-[10px] leading-tight text-brand-charcoal/70">
              Click to open properties, drag to move, double-click title to
              rename, right-click for actions.
            </p>
            {chaosMode && (
              <p className="text-[10px] leading-tight text-red-600 mt-1">
                Chaos mode: click node to inject failure.
              </p>
            )}
          </div>
        )}

        {/* Handles for edges - Technical Crosshairs */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 border-2 border-brand-charcoal bg-bg-secondary rounded-none !top-[-6px] z-50"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 border-2 border-brand-charcoal bg-bg-secondary rounded-none !bottom-[-6px] z-50"
        />

        {/* Technical Header Band */}
        <div className="h-2 border-b-2 border-brand-charcoal bg-brand-charcoal/80 flex items-center justify-between px-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-bg-secondary/20" />
            <div className="w-1.5 h-1.5 bg-bg-secondary/20" />
          </div>
          <span className="font-mono text-[9px] text-bg-secondary/40 uppercase tracking-[0.2em]">
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

        {isStressHot && !isKilled && (
          <div className="absolute top-8 right-2 flex items-center gap-1.5 px-2 py-1 bg-amber-500 text-black text-[9px] font-mono font-bold uppercase tracking-wider rounded-none z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Activity className="w-3 h-3" />
            STRESS_HOTSPOT
          </div>
        )}

        <div className="p-3 flex flex-col gap-3">
          {/* Header: Icon + Title + Tech */}
          <div className="flex items-start gap-4">
            {/* Icon Container - Technical Monochromatic */}
            <div className="shrink-0 w-12 h-12 border-2 border-brand-charcoal bg-bg-secondary dark:bg-stone-200 flex items-center justify-center transition-all">
              {nodeLogo ? (
                <Icon
                  icon={nodeLogo as string}
                  className="w-7 h-7 text-brand-charcoal transition-all"
                />
              ) : (
                icon || <Component size={24} className="text-brand-charcoal" />
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-mono text-brand-charcoal/40 uppercase tracking-widest">
                  {nodeTechLabel || (nodeData?.tech as string) || "GENERIC_SRV"}
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
                    className="font-poppins font-black text-base text-brand-charcoal leading-tight bg-bg-secondary border-b-2 border-brand-orange focus:outline-none w-full uppercase"
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
                {(nodeData?.serviceType as string) || type || "SERVICE"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[8px] opacity-40 uppercase">Status</span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase",
                  isKilled
                    ? "text-red-500"
                    : isStressHot
                      ? "text-amber-500"
                      : "text-brand-green",
                )}
              >
                {isKilled ? "OFFLINE" : isStressHot ? "STRESSED" : "STABLE"}
              </span>
            </div>
          </div>

          {/* Infrastructure Metrics and Justification */}
          {(nodeData?.description || nodeData?.justification) && (
            <div className="bg-bg-tertiary border border-brand-charcoal/5 p-1.5 font-mono text-[9px] opacity-80 leading-tight flex flex-col gap-1.5 mt-1">
              {nodeData?.description && (
                <span
                  className="font-bold text-brand-charcoal dark:text-text-primary uppercase"
                  title={nodeData.description as string}
                >
                  {">"} {nodeData.description as string}
                </span>
              )}
              {nodeData?.justification && (
                <span
                  className="italic opacity-70"
                  title={nodeData.justification as string}
                >
                  // {nodeData.justification as string}
                </span>
              )}
            </div>
          )}
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
