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
      className="border-l-brand-blue" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <>
            <span className="opacity-70">{">"} type: vector store</span>
            <span className="opacity-70">{">"} embeddings: high-dim</span>
            <span className="text-brand-blue">{">"} similarity: cosine</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
