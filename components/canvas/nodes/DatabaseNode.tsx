"use client";

import { Database } from "lucide-react";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function DatabaseNode(props: BaseNodeProps) {
  return (
    <BaseNode
      {...props}
      label={(props.data?.label as string) || "Database"}
      icon={<Database size={16} />}
      className="border-l-4 border-l-[#788c5d]" // Green accent
    >
      <div className="text-xs text-[#b0aea5] mt-1">Persistent storage</div>
    </BaseNode>
  );
}
