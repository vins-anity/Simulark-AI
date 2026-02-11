"use client";

import { Activity, BarChart3, LineChart } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function MonitoringNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Monitoring";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "monitoring");

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Activity size={16} />}
      logo={logo}
      className="border-l-[#ef4444]" // Red accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">{">"} metrics: real-time</span>
        <span className="opacity-70">{">"} retention: 30d</span>
        <span className="text-red-600/80">{">"} alerts: active</span>
      </div>
    </BaseNode>
  );
}
