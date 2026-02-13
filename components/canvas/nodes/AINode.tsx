"use client";

import { Bot } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function AINode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "AI Model";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "ai");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Bot size={16} />}
      logo={logo}
      className="border-l-purple-400"
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} model: gpt-4-turbo</span>
        <span className="opacity-70">{">"} tokens: 8k context</span>
        <span className="text-brand-orange/80">{">"} status: ready</span>
      </div>
    </BaseNode>
  );
}
