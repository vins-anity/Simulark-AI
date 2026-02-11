"use client";

import { GitBranch, Play, Rocket } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function CICDNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "CI/CD";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "cicd");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<GitBranch size={16} />}
      logo={logo}
      className="border-l-[#6366f1]" // Indigo accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} pipeline: automated</span>
        <span className="opacity-70">{">"} trigger: push/pr</span>
        <span className="text-indigo-600/80">{">"} deploy: continuous</span>
      </div>
    </BaseNode>
  );
}
