"use client";

import { Monitor, Smartphone } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function ClientNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Client";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "client");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Monitor size={16} />}
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
            <span className="opacity-70">{">"} type: browser/spa</span>
            <span className="opacity-70">{">"} users: ~5k/day</span>
            <span className="text-brand-orange/80">{">"} status: online</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
