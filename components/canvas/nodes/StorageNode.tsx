"use client";

import { Cloud, HardDrive } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function StorageNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Storage";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "storage");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<HardDrive size={16} />}
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
            <span className="opacity-70">{">"} type: object-store</span>
            <span className="opacity-70">{">"} access: private</span>
            <span className="text-brand-orange">{">"} status: available</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
