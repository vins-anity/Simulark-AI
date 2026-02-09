"use client";

import { Server } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function ServiceNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Service";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "service");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Server size={16} />}
      logo={logo}
      className="border-l-[#6a9bcc]" // Blue accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} instance_type: t3.micro</span>
        <span className="opacity-70">{">"} region: us-east-1</span>
        <span className="text-brand-orange/80">{">"} status: healthy</span>
      </div>
    </BaseNode>
  );
}
