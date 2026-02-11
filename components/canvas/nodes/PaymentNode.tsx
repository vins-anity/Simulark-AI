"use client";

import { CreditCard, DollarSign, Wallet } from "lucide-react";
import { getTechIcon } from "@/lib/icons";
import { BaseNode, type BaseNodeProps } from "./BaseNode";

export function PaymentNode(props: BaseNodeProps) {
  const label = (props.data?.label as string) || "Payment Gateway";
  const tech = (props.data?.tech as string) || label;
  const logo = getTechIcon(tech, "payment");

  // Determine payment methods
  const getPaymentMethods = () => {
    const techLower = tech.toLowerCase();
    if (techLower.includes("stripe")) return "cards, wallets, bank";
    if (techLower.includes("paypal")) return "paypal, cards";
    if (techLower.includes("crypto")) return "crypto, wallets";
    return "cards, digital wallets";
  };

  return (
    <BaseNode
      {...props}
      label={label}
      icon={<CreditCard size={16} />}
      logo={logo}
      className="border-l-[#10b981]" // Green accent
    >
      <div className="flex flex-col gap-1">
        <span className="opacity-70">
          {">"} methods: {getPaymentMethods()}
        </span>
        <span className="opacity-70">{">"} currency: multi</span>
        <span className="text-emerald-600/80">{">"} pci: compliant</span>
      </div>
    </BaseNode>
  );
}
