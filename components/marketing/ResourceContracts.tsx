"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Minus, Zap, Shield, Crown } from "lucide-react";

const contracts = [
  {
    id: "P-100-X",
    name: "Doodle",
    subtitle: "EXPERIMENTAL",
    price: "0",
    period: "MO",
    description: "For experimental prototyping.",
    features: [
      "Up to 3 Projects",
      "Standard Node Library",
      "Community Support",
      "Public Exports (SVG, PNG, PDF, Mermaid, Agent Skills)",
      "GLM-4.7-Flash (10x Daily Limit)",
    ],
    limits: ["Private Projects", "Auto-Layout", "Chaos Mode", "Code Export"],
    cta: "[ INITIALIZE_FREE ]",
    icon: Zap,
    popular: false,
  },
  {
    id: "P-200-X",
    name: "Sketch",
    subtitle: "DEVS_CHOICE",
    price: "5",
    period: "MO",
    description: "For professional architects.",
    features: [
      "Unlimited Projects",
      "Advanced Chaos Engineering & Stress Testing",
      "Sophisticated Auto-Layouts (Elkjs/Radial)",
      "Kimi-k2.5, Gemini 3.0 Flash/Pro, Minimax",
      "Quick Mode & Enterprise Mode",
      "Advance node library",
      "Priority Email Support",
    ],
    limits: ["Terraform Export", "Team Collaboration"],
    cta: "[ UPGRADE_CAPACITY ]",
    icon: Crown,
    popular: true,
  },
  {
    id: "P-300-X",
    name: "Blueprint",
    subtitle: "LIFETIME",
    price: "10",
    period: "ONE-TIME",
    description: "Forever access for mission-critical scale.",
    features: [
      "Everything in Sketch, Forever",
      "Commercial Usage Rights",
      "Priority Generation Queue",
      "Private Mode (Zero Data Retention)",
      "Claude Opus 4.5",
      "Code Generation/Export (BETA)",
    ],
    limits: [],
    cta: "[ MINT_BLUEPRINT ]",
    icon: Shield,
    popular: false,
  },
];

function ContractCard({
  contract,
  index,
}: {
  contract: (typeof contracts)[0];
  index: number;
}) {
  const Icon = contract.icon;

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
    >
      {/* Popular Badge */}
      {contract.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-brand-orange text-white px-4 py-1.5">
            {contract.subtitle}
          </span>
        </div>
      )}

      {/* Card Container */}
      <div
        className={`h-full border bg-white relative transition-all duration-300 ${
          contract.popular
            ? "border-brand-orange"
            : "border-brand-charcoal/10 group-hover:border-brand-charcoal/30"
        }`}
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-charcoal/20" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-charcoal/20" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/20" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/20" />

        {/* Header */}
        <div className="p-6 border-b border-brand-charcoal/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40 block mb-1">
                REF: {contract.id}
              </span>
              <h3 className="font-mono text-xl font-bold text-brand-charcoal uppercase tracking-wide">
                {contract.name}
              </h3>
            </div>
            {!contract.popular && (
              <span className="font-mono text-[8px] uppercase tracking-wider text-brand-charcoal/30">
                {contract.subtitle}
              </span>
            )}
          </div>

          <p className="font-lora text-brand-charcoal/60 italic text-sm mb-6">
            {contract.description}
          </p>

          {/* Price Block */}
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-lg text-brand-charcoal/40">$</span>
            <span className="font-poppins text-5xl font-bold text-brand-charcoal tracking-tight">
              {contract.price}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-brand-charcoal/40">
              /{contract.period}
            </span>
          </div>
        </div>

        {/* Features Section */}
        <div className="p-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 block mb-4">
            // INCLUDED_RESOURCES
          </span>

          <ul className="space-y-3 mb-6">
            {contract.features.map((feature, i) => (
              <motion.li
                key={feature}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
              >
                <div className="w-4 h-4 border border-brand-charcoal/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-brand-charcoal" />
                </div>
                <span className="text-brand-charcoal/70 text-sm leading-relaxed">
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Limits Section */}
          {contract.limits.length > 0 && (
            <>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/30 block mb-4">
                // LIMITATIONS
              </span>
              <ul className="space-y-2 mb-6">
                {contract.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-3">
                    <div className="w-4 h-4 border border-brand-charcoal/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Minus className="w-2.5 h-2.5 text-brand-charcoal/30" />
                    </div>
                    <span className="text-brand-charcoal/40 text-sm line-through">
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* CTA Button */}
          <Link href="/auth/signin">
            <Button
              className={`w-full h-12 font-mono text-xs uppercase tracking-[0.12em] rounded-none border-0 transition-all duration-300 ${
                contract.popular
                  ? "bg-brand-charcoal text-white hover:bg-brand-orange"
                  : "bg-transparent border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white"
              }`}
              variant={contract.popular ? "default" : "outline"}
            >
              <span className="text-white/40 group-hover:text-white/40">[</span>
              <span className="mx-2">
                {contract.popular
                  ? "UPGRADE_CAPACITY"
                  : contract.cta.replace(/[\[\] ]/g, "")}
              </span>
              <span className="text-white/40 group-hover:text-white/40">]</span>
            </Button>
          </Link>
        </div>

        {/* Bottom Status Line */}
        <div
          className={`h-0.5 ${contract.popular ? "bg-brand-orange" : "bg-brand-charcoal/10"}`}
        />
      </div>
    </motion.div>
  );
}

export function ResourceContracts() {
  return (
    <section className="py-32 bg-[#faf9f5] relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(26,26,26,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,26,26,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
            // RESOURCE_CONTRACTS
          </span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-4">
            SERVICE{" "}
            <span className="font-serif italic font-light text-brand-charcoal/50">
              LEVELS
            </span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-2xl">
            Transparent pricing. No hidden fees. Scale as you grow.
          </p>
        </motion.div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contracts.map((contract, index) => (
            <ContractCard key={contract.id} contract={contract} index={index} />
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          className="mt-16 pt-8 border-t border-brand-charcoal/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-charcoal/30">
              All plans include: SSL Encryption • Daily Backups • 99.9% Uptime
              SLA
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
                SECURE_CHECKOUT
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
