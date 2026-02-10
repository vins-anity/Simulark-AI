"use client";

import { Scale } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function LoadbalancerNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Load Balancer";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "gateway");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Scale size={16} />}
      logo={logo}
      className="border-l-4 border-l-[#9b59b6]" // Purple accent
    >
      <div className="text-xs text-[#b0aea5] mt-1">Traffic distribution</div>
    </BaseNode>
  );
}
