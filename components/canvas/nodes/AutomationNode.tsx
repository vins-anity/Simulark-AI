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
      className="border-l-brand-orange" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <>
            <span className="opacity-70">{">"} triggers: event-based</span>
            <span className="opacity-70">{">"} execution: async</span>
            <span className="text-brand-orange">{">"} status: active</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
