"use client";

import { Brain, Cpu, Sparkles } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function AIModelNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "AI Model";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "ai");

  // Determine if it's local or cloud
  const isLocalModel = () => {
    const localTools = [
      "ollama",
      "lm-studio",
      "vllm",
      "llamacpp",
      "localai",
      "jan",
      "text-generation-webui",
      "koboldcpp",
      "tabby",
      "continue",
    ];
    const techLower = tech.toLowerCase();
    return localTools.some((tool) => techLower.includes(tool));
  };

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Brain size={16} />}
      logo={logo}
      className="border-l-[#8b5cf6]" // Violet accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">
          {">"} type: {isLocalModel() ? "local" : "cloud api"}
        </span>
        <span className="opacity-70">{">"} inference: on-demand</span>
        <span className="text-violet-600/80">{">"} status: serving</span>
      </div>
    </BaseNode>
  );
}
