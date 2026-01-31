"use client";

import { Server } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function ServiceNode(props: BaseNodeProps) {
  return (
    <BaseNode
      {...props}
      label={(props.data?.label as string) || "Service"}
      icon={<Server size={16} />}
      className="border-l-4 border-l-[#6a9bcc]" // Blue accent
    >
      <div className="text-xs text-[#b0aea5] mt-1">Compute instance</div>
    </BaseNode>
  );
}
