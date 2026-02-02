"use client";

import { Database } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function DatabaseNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Database";
  let logo = "lucide:database";
  if (label.toLowerCase().includes("postgres") || label.toLowerCase().includes("supabase")) logo = "logos:postgresql";
  if (label.toLowerCase().includes("redis")) logo = "logos:redis";
  if (label.toLowerCase().includes("mongo")) logo = "logos:mongodb-icon";

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Database size={16} />}
      logo={logo}
      className="border-l-[#788c5d]" // Green accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{'>'} type: persistent_vol</span>
        <span className="opacity-70">{'>'} replicas: 1 (primary)</span>
        <span className="text-green-600/80">{'>'} connection: active</span>
      </div>
    </BaseNode>
  );
}
