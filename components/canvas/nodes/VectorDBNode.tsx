"use client";

import { Database, Layers, Search } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function VectorDBNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Vector Database";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "vector-db");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Layers size={16} />}
      logo={logo}
      className="border-l-[#06b6d4]" // Cyan accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} type: vector store</span>
        <span className="opacity-70">{">"} embeddings: high-dim</span>
        <span className="text-cyan-600/80">{">"} similarity: cosine</span>
      </div>
    </BaseNode>
  );
}
