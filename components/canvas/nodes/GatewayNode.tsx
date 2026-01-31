"use client";

import { Network } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function GatewayNode(props: BaseNodeProps) {
  return (
    <BaseNode
      {...props}
      label={(props.data?.label as string) || "API Gateway"}
      icon={<Network size={16} />}
      className="border-l-4 border-l-[#d97757]" // Orange accent
    >
      <div className="text-xs text-[#b0aea5] mt-1">
        Handles incoming traffic
      </div>
    </BaseNode>
  );
}
