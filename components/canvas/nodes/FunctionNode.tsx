"use client";

import { Zap } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function FunctionNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Function";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "function");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Zap size={16} />}
      logo={logo}
      className="border-l-yellow-400"
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} runtime: nodejs18.x</span>
        <span className="opacity-70">{">"} memory: 128mb</span>
        <span className="text-brand-orange/80">{">"} status: active</span>
      </div>
    </BaseNode>
  );
}
