"use client";

import { Network } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function GatewayNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "API Gateway";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "gateway");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Network size={16} />}
      logo={logo}
      className="border-l-brand-orange" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <div className="text-xs text-text-muted mt-1">
            Handles incoming traffic
          </div>
        )}
      </div>
    </BaseNode>
  );
}
