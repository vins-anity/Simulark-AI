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
      className="border-l-[var(--color-error)]" // Semantic error/security border
    >
      <div className="flex flex-col gap-1">
        {props.data?.description ? (
          <span className="opacity-70 text-[10px] leading-tight line-clamp-3">
            {">"} {props.data.description as string}
          </span>
        ) : (
          <>
            <span className="opacity-70">
              {">"} type: {getSecurityType()}
            </span>
            <span className="opacity-70">{">"} encryption: tls1.3</span>
            <span className="text-[var(--color-error)]">{">"} status: enforced</span>
          </>
        )}
      </div>
    </BaseNode>
  );
}
