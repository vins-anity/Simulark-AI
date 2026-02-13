"use client";

import { Server } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function ServiceNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Service";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "service");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Server size={16} />}
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
            <span className="opacity-70">{">"} type: service</span>
            <span className="text-brand-orange/80">{">"} status: active</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
