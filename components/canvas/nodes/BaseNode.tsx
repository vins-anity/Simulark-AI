"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSimulationStore } from "@/lib/store";
import { Skull, ZapOff, Activity, Cpu, Database, Server, Component } from "lucide-react";
import { Icon } from "@iconify/react";

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
  const nodeLabel = (data?.label as string) || label || "Node";
  const nodeLogo = (data?.logo as string) || null;
  const nodeTechLabel = (data?.techLabel as string) || null;

  const isKilled = nodeStatus[id] === "killed";

  const handleChaosClick = (e: React.MouseEvent) => {
    if (chaosMode) {
      e.stopPropagation(); // Prevent selection
      toggleNodeStatus(id);
    }
  };

  // --- C-LEVEL VIEW (Abstract, Simple) ---
  if (viewMode === "concept") {
    return (
      <div
        onClick={handleChaosClick}
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 ease-out group",
          "w-[120px] h-[120px] rounded-full",
          "glass-card backdrop-blur-md shadow-sm",
          !isKilled && "bg-white/80 border border-brand-charcoal/10 hover:border-brand-orange/50",
          !isKilled && selected && "ring-2 ring-brand-orange border-brand-orange shadow-brand-orange/20 shadow-xl scale-105",
          chaosMode && !isKilled && "cursor-crosshair hover:bg-red-500/10 hover:border-red-500",
          isKilled && "bg-red-950/20 border-red-500 grayscale opacity-70",
          className
        )}
      >
        {/* Handles hidden but functional */}
        <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full border-0 !bg-transparent" />
        <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full border-0 !bg-transparent" />

        <div className="flex flex-col items-center gap-2 pointer-events-none">
          {isKilled ? (
            <Skull className="text-red-500 w-8 h-8 animate-pulse" />
          ) : nodeLogo ? (
            <Icon icon={nodeLogo} className="w-8 h-8 text-brand-charcoal" />
          ) : (
            <div className="text-brand-charcoal/60">{icon || <Component size={24} />}</div>
          )}
          <span className="font-poppins font-medium text-[10px] text-center max-w-[90px] leading-tight text-brand-charcoal/80">
            {nodeLabel}
          </span>
        </div>

        {/* Status Dot */}
        <div className={cn(
          "absolute top-2 right-2 w-2 h-2 rounded-full",
          isKilled ? "bg-red-500" : "bg-green-500 animate-pulse shadow-green-400/50 shadow-sm"
        )} />
      </div>
    );
  }

  // --- TECH-LEVEL VIEW (Detailed, "Wow", Official Logos) ---
  return (
    <div
      onClick={handleChaosClick}
      className={cn(
        "relative transition-all duration-300 ease-out group min-w-[280px]",
        // Shape & Base
        "rounded-sm border-l-[3px]",
        "bg-[#faf9f5] border-y border-r border-brand-charcoal/10 shadow-sm",
        // Selection
        !isKilled && selected && "shadow-brand-orange/20 shadow-xl border-brand-charcoal/40 ring-1 ring-brand-charcoal/10",
        // Chaos
        chaosMode && !isKilled && "cursor-crosshair hover:border-red-500",
        // Killed
        isKilled && "bg-red-50 grayscale opacity-80 border-l-red-500",
        className,
      )}
    >
      {/* Connection Points (Explicit Visual Ports) */}
      <Handle type="target" position={Position.Top} className={cn(
        "!w-3 !h-3 !-top-1.5 !bg-brand-charcoal !border-2 !border-white !rounded-full transition-all",
        selected && "!bg-brand-orange !scale-125"
      )} />

      {/* Header Section */}
      <div className="flex items-center gap-3 p-3 border-b border-brand-charcoal/5 bg-white/50">
        {/* Logo Box */}
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded-sm bg-white border border-brand-charcoal/10 shadow-sm",
          isKilled && "bg-red-100"
        )}>
          {isKilled ? (
            <ZapOff size={20} className="text-red-500" />
          ) : nodeLogo ? (
            <Icon icon={nodeLogo} className="w-6 h-6" />
          ) : (
            <div className="text-brand-charcoal/60">{icon || <Cpu size={20} />}</div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/40 leading-none mb-1">
            Component ID: {id.slice(0, 4)}
          </span>
          <span className="font-poppins font-bold text-sm text-brand-charcoal truncate">
            {nodeLabel}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase",
            isKilled ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
          )}>
            {isKilled ? (
              <>Offline <Activity size={8} /></>
            ) : (
              <>Active <Activity size={8} className="animate-pulse" /></>
            )}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3 bg-[#faf9f5]">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex flex-col bg-white border border-brand-charcoal/5 p-1.5 rounded-sm">
            <span className="text-[8px] font-mono uppercase text-brand-charcoal/40">Technology</span>
            <span className="text-[10px] font-semibold text-brand-charcoal truncate">
              {nodeTechLabel || nodeLabel}
            </span>
          </div>
          <div className="flex flex-col bg-white border border-brand-charcoal/5 p-1.5 rounded-sm">
            <span className="text-[8px] font-mono uppercase text-brand-charcoal/40">Tier / Size</span>
            <span className="text-[10px] font-semibold text-brand-charcoal truncate">
              {(data?.tier as string) || "Standard"}
            </span>
          </div>
        </div>

        {/* Custom Children (Technical Details) */}
        {children && (
          <div className="text-[10px] font-mono text-brand-charcoal/70 bg-brand-charcoal/5 p-2 rounded-sm border border-brand-charcoal/5 whitespace-pre-wrap">
            {children}
          </div>
        )}
      </div>

      {/* Connection Points (Explicit Visual Ports) */}
      <Handle type="source" position={Position.Bottom} className={cn(
        "!w-3 !h-3 !-bottom-1.5 !bg-brand-charcoal !border-2 !border-white !rounded-full transition-all",
        selected && "!bg-brand-orange !scale-125"
      )} />
    </div>
  );
}
