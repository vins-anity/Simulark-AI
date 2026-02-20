"use client";

import { Server } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

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
    />
  );
}
