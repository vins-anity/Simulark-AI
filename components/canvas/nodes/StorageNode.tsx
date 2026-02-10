"use client";

import { HardDrive, Cloud } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";
import { getTechIcon } from "@/lib/icons";

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
      className="border-l-emerald-400"
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} type: object-store</span>
        <span className="opacity-70">{">"} access: private</span>
        <span className="text-brand-orange/80">{">"} status: available</span>
      </div>
    </BaseNode>
  );
}
