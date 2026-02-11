"use client";

import { Lock, Shield, ShieldCheck } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function SecurityNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Security";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "security");

  // Determine security type
  const getSecurityType = () => {
    const techLower = tech.toLowerCase();
    if (techLower.includes("waf")) return "firewall";
    if (techLower.includes("vault") || techLower.includes("secrets"))
      return "secrets";
    if (techLower.includes("scan") || techLower.includes("snyk"))
      return "scanning";
    return "protection";
  };

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<ShieldCheck size={16} />}
      logo={logo}
      className="border-l-[#f43f5e]" // Rose accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">
          {">"} type: {getSecurityType()}
        </span>
        <span className="opacity-70">{">"} encryption: tls1.3</span>
        <span className="text-rose-600/80">{">"} status: enforced</span>
      </div>
    </BaseNode>
  );
}
