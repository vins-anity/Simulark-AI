"use client";

import { Container } from "lucide-react"; // Generic 'Queue' look
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function QueueNode(props: BaseNodeProps) {
  return (
    <BaseNode
      {...props}
      label={(props.data?.label as string) || "Queue"}
      icon={<Container size={16} />}
      className="border border-brand-orange/50 bg-brand-orange/5 rounded-xl"
    >
      <div className="text-xs text-[#b0aea5] mt-1">Message Broker</div>
    </BaseNode>
  );
}
