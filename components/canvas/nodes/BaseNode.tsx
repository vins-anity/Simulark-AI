"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  selected,
  data,
  children,
  className,
  icon,
  label,
}: BaseNodeProps) {
  const nodeLabel = (data?.label as string) || label || "Node";

  return (
    <div
      className={cn(
        "w-[220px] glass-card rounded-xl transition-all duration-300 ease-out",
        "border border-white/30 backdrop-blur-xl bg-white/40",
        selected &&
          "ring-2 ring-brand-orange border-brand-orange shadow-lg scale-[1.02]",
        className,
      )}
    >
      {/* Target Handle (Input) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-brand-gray-mid !w-2 !h-2 border-0"
      />

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "p-2 rounded-lg bg-white/50 shadow-sm text-foreground/80",
              selected && "bg-brand-orange/10 text-brand-orange",
            )}
          >
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold font-poppins text-foreground tracking-tight">
              {nodeLabel}
            </span>
          </div>
        </div>

        {children && (
          <div className="mt-1 text-[11px] font-lora italic text-brand-gray-mid leading-relaxed border-t border-white/20 pt-2">
            {children}
          </div>
        )}
      </div>

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-brand-gray-mid !w-2 !h-2 border-0"
      />
    </div>
  );
}
