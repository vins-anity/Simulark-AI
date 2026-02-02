"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSimulationStore } from "@/lib/store";
import { Skull, ZapOff } from "lucide-react";
import { Icon } from "@iconify/react"; // Import Iconify
import { getTechIcon } from "@/lib/icons"; // Import mapping

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type BaseNodeProps = NodeProps & {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
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
  const isKilled = nodeStatus[id] === "killed";

  const handleChaosClick = (e: React.MouseEvent) => {
    if (chaosMode) {
      e.stopPropagation(); // Prevent selection
      toggleNodeStatus(id);
    }
  };

  return (
    <div
      onClick={handleChaosClick}
      className={cn(
        "relative transition-all duration-300 ease-out",
        viewMode === "concept" ? "w-[150px]" : "w-[220px]",
        "glass-card rounded-xl",
        "border backdrop-blur-xl",
        // Normal State
        !isKilled && "bg-white/40 border-white/30",
        // Selected State (Normal)
        !isKilled && selected && "ring-2 ring-brand-orange border-brand-orange shadow-lg scale-[1.02]",
        // Chaos Mode Hover
        chaosMode && !isKilled && "cursor-crosshair hover:bg-red-500/10 hover:border-red-500/50",
        // Killed State
        isKilled && "bg-red-950/10 border-red-500/50 grayscale opacity-80 cursor-pointer",
        className,
      )}
    >
      {/* Killed Overlay */}
      {isKilled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Skull className="text-red-600/60 w-12 h-12 animate-pulse" />
          <div className="absolute inset-0 bg-contain bg-center opacity-30 mix-blend-multiply" style={{ backgroundImage: "url('/cracked-glass.png')" }}></div>
        </div>
      )}

      {/* Target Handle (Input) */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "!w-2 !h-2 border-0 transition-colors",
          isKilled ? "!bg-red-400" : "!bg-brand-gray-mid"
        )}
      />

      <div className={cn("p-4 flex flex-col gap-2", viewMode === "concept" && "items-center text-center")}>
        <div className={cn("flex items-center gap-2.5", viewMode === "concept" && "flex-col")}>
          <div
            className={cn(
              "p-2 rounded-lg shadow-sm text-foreground/80 transition-colors",
              !isKilled && "bg-white/50",
              !isKilled && selected && "bg-brand-orange/10 text-brand-orange",
              isKilled && "bg-red-500/20 text-red-700"
            )}
          >
            {isKilled ? <ZapOff size={16} /> : icon}
          </div>
          <div className="flex flex-col">
            <span className={cn("font-semibold font-poppins text-foreground tracking-tight", viewMode === "concept" ? "text-xs" : "text-sm")}>
              {nodeLabel}
            </span>
          </div>
        </div>

        {/* Details - Only show in Implementation Mode */}
        {viewMode === "implementation" && children && (
          <div className="mt-1 text-[11px] font-lora italic text-brand-gray-mid leading-relaxed border-t border-white/20 pt-2">
            {children}
          </div>
        )}
      </div>

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "!w-2 !h-2 border-0 transition-colors",
          isKilled ? "!bg-red-400" : "!bg-brand-gray-mid"
        )}
      />
    </div>
  );
}
