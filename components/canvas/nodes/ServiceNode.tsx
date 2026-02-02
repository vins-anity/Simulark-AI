"use client";

import { Server } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function ServiceNode(props: BaseNodeProps) {
  // Simple heuristic for demo: if label contains "Next", use Next.js logo
  const label = (props.data?.label as string) || "Service";
  let logo = "lucide:server"; // Default
  if (label.toLowerCase().includes("next")) logo = "logos:nextjs-icon";
  if (label.toLowerCase().includes("node")) logo = "logos:nodejs-icon";
  if (label.toLowerCase().includes("python")) logo = "logos:python";
  if (label.toLowerCase().includes("clerk")) logo = "logos:clerk";
  if (label.toLowerCase().includes("stripe")) logo = "logos:stripe";


  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Server size={16} />}
      logo={logo}
      className="border-l-[#6a9bcc]" // Blue accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">> instance_type: t3.micro</span>
        <span className="opacity-70">> region: us-east-1</span>
        <span className="text-brand-orange/80">> status: healthy</span>
      </div>
    </BaseNode>
  );
}
