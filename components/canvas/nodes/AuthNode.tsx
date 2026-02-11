"use client";

import { Key, Lock, Shield, ShieldCheck } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function AuthNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Authentication";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "auth");

  // Determine auth type based on tech
  const getAuthType = () => {
    const techLower = tech.toLowerCase();
    if (techLower.includes("oauth") || techLower.includes("social"))
      return "OAuth 2.0";
    if (techLower.includes("saml")) return "SAML 2.0";
    if (techLower.includes("mfa") || techLower.includes("2fa"))
      return "Multi-Factor";
    if (techLower.includes("sso")) return "SSO";
    return "JWT/OAuth";
  };

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<Shield size={16} />}
      logo={logo}
      className="border-l-[#8b5cf6]" // Purple/Violet accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">
          {">"} protocol: {getAuthType()}
        </span>
        <span className="opacity-70">{">"} sessions: stateless</span>
        <span className="text-violet-600/80">{">"} security: active</span>
      </div>
    </BaseNode>
  );
}
