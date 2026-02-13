"use client";

import { Database } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

export function DatabaseNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Database";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "database");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Database size={16} />}
      logo={logo}
      className="border-l-brand-green" // semantic border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <>
            <span className="opacity-70">{">"} type: database</span>
            <span className="text-brand-green">{">"} connection: active</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
