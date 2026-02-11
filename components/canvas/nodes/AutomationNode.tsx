"use client";

import { GitBranch, Workflow, Zap } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function AutomationNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Automation";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "automation");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Workflow size={16} />}
      logo={logo}
      className="border-l-[#f97316]" // Orange accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} triggers: event-based</span>
        <span className="opacity-70">{">"} execution: async</span>
        <span className="text-orange-600/80">{">"} status: active</span>
      </div>
    </BaseNode>
  );
}
