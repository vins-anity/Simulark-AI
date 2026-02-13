"use client";

import { Brain } from "lucide-react";
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
      className="border-l-brand-blue" // AI / Tech accent
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <>
            <span className="opacity-70">
              {">"} type: {isLocalModel() ? "local" : "cloud api"}
            </span>
            <span className="opacity-70">{">"} inference: on-demand</span>
            <span className="text-brand-blue">{">"} status: serving</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
