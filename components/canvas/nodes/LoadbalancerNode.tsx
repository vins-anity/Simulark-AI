"use client";

import { Scale } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function LoadbalancerNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Load Balancer";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "gateway");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Scale size={16} />}
      logo={logo}
      className="border-l-brand-blue" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <div className="text-xs text-text-secondary mt-1">
            Traffic distribution
          </div>
        )}
      </div>
    </BaseNode>
  );
}
