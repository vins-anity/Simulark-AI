"use client";

import { Zap } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function CacheNode(props: BaseNodeProps) {
  return (
    <BaseNode
      {...props}
      label={(props.data?.label as string) || "Cache"}
      icon={<Zap size={16} />}
      className="border-l-brand-warning" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <div className="text-xs text-text-secondary mt-1">In-memory store</div>
        )}
      </div>
    </BaseNode>
  );
}
