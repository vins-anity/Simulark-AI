"use client";

import { Network } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function GatewayNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "API Gateway";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "gateway");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Network size={16} />}
      logo={logo}
      className="border-l-4 border-l-[#d97757]" // Orange accent
    >
      <div className="text-xs text-[#b0aea5] mt-1">
        Handles incoming traffic
      </div>
    </BaseNode>
  );
}
