"use client";

import { Mail, MessageSquare, Send } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function MessagingNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Messaging";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "messaging");

  // Determine channel type
  const getChannelType = () => {
    const techLower = tech.toLowerCase();
    if (
      techLower.includes("email") ||
      techLower.includes("sendgrid") ||
      techLower.includes("mailgun")
    )
      return "email";
    if (techLower.includes("sms") || techLower.includes("twilio"))
      return "sms/voice";
    if (techLower.includes("push") || techLower.includes("onesignal"))
      return "push";
    if (techLower.includes("websocket") || techLower.includes("socket"))
      return "websocket";
    if (
      techLower.includes("queue") ||
      techLower.includes("kafka") ||
      techLower.includes("rabbitmq")
    )
      return "message queue";
    return "multi-channel";
  };

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<MessageSquare size={16} />}
      logo={logo}
      className="border-l-[#3b82f6]" // Blue accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">
          {">"} channel: {getChannelType()}
        </span>
        <span className="opacity-70">{">"} delivery: async</span>
        <span className="text-blue-600/80">{">"} throughput: high</span>
      </div>
    </BaseNode>
  );
}
