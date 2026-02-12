"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";

const contracts = [
  {
    id: "P-100-X",
    name: "Doodle",
    subtitle: "FREE_TIER",
    price: "0",
    period: "mo",
    description: "For experimental prototyping.",
    features: [
      "Up to 3 Projects",
      "Standard Node Library",
      "Community Support",
      "Public Exports (SVG, PNG, PDF, Mermaid, Agent Skills)",
      "GLM-4.7-Flash (10x Daily Limit)",
    ],
    limits: ["Private Projects", "Auto-Layout", "Chaos Mode"],
    cta: "INITIALIZE",
    popular: false,
    dark: false,
  },
  {
    id: "P-200-X",
    name: "Sketch",
    subtitle: "DEVS_CHOICE",
    price: "5",
    period: "mo",
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
    cta: "UPGRADE CAPACITY",
    popular: true,
    dark: false,
  },
  {
    id: "P-300-X",
    name: "Blueprint",
    subtitle: "LIFETIME",
    price: "10",
    period: "one-time",
    description: "Forever access for mission-critical scale.",
    features: [
      "Everything in Sketch, Forever",
      "Commercial Usage Rights",
      "Priority Generation Queue",
      "Private Mode (Zero Data Retention)",
      "Claude Opus 4.5",
      "Code Generation/Export (soon)",
    ],
    limits: [],
    cta: "MINT BLUEPRINT",
    popular: false,
    dark: true,
  },
];

function ContractCard({
  contract,
  index,
}: {
  contract: (typeof contracts)[0];
  index: number;
}) {
  return (
    <motion.div
      className={`relative ${contract.popular ? "z-10" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
    >
      {/* Popular Badge - DEVS CHOICE style */}
      {contract.popular && (
        <div className="absolute -top-3 right-0 z-20">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] bg-brand-charcoal text-white px-3 py-1.5">
            {contract.subtitle}
          </span>
        </div>
      )}

      {/* Lifetime Badge - Blueprint */}
      {contract.dark && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] bg-[#c67b5c] text-white px-4 py-1.5">
            {contract.subtitle}
          </span>
        </div>
      )}

      <div
        className={`h-full border relative ${
          contract.dark
            ? "bg-[#1a2332] border-[#c67b5c]"
            : contract.popular
              ? "bg-white border-brand-charcoal"
              : "bg-white border-brand-charcoal/10"
        }`}
      >
        {/* Contract Header */}
        <div
          className={`p-6 border-b ${
            contract.dark ? "border-white/10" : "border-brand-charcoal/5"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span
                className={`font-mono text-[9px] uppercase tracking-wider block mb-1 ${
                  contract.dark ? "text-white/40" : "text-brand-charcoal/40"
                }`}
              >
                REF: {contract.id}
              </span>
              <h3
                className={`font-poppins text-2xl font-bold tracking-tight ${
                  contract.dark ? "text-white" : "text-brand-charcoal"
                }`}
              >
                {contract.name}
              </h3>
            </div>
            {!contract.popular && !contract.dark && (
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/30">
                {contract.subtitle}
              </span>
            )}
          </div>

          <p
            className={`font-lora italic text-sm mb-6 ${
              contract.dark ? "text-white/50" : "text-brand-charcoal/50"
            }`}
          >
            {contract.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono text-lg ${
                contract.dark ? "text-[#c67b5c]" : "text-brand-charcoal/40"
              }`}
            >
              $
            </span>
            <span
              className={`font-poppins text-6xl font-bold tracking-tight ${
                contract.dark ? "text-[#c67b5c]" : "text-brand-charcoal"
              }`}
            >
              {contract.price}
            </span>
            <span
              className={`font-mono text-sm ${
                contract.dark ? "text-white/40" : "text-brand-charcoal/40"
              }`}
            >
              /{contract.period}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className={`p-6 ${contract.dark ? "bg-[#1a2332]" : "bg-white"}`}>
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.15em] block mb-4 ${
              contract.dark ? "text-white/30" : "text-brand-charcoal/40"
            }`}
          >
            // INCLUDED
          </span>

          <ul className="space-y-3 mb-6">
            {contract.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 ${
                    contract.dark ? "text-[#c67b5c]" : "text-brand-charcoal"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-sm leading-relaxed ${
                    contract.dark ? "text-white/80" : "text-brand-charcoal/70"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Limits */}
          {contract.limits.length > 0 && (
            <>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.15em] block mb-4 ${
                  contract.dark ? "text-white/20" : "text-brand-charcoal/30"
                }`}
              >
                // NOT INCLUDED
              </span>
              <ul className="space-y-2 mb-6">
                {contract.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 ${
                        contract.dark
                          ? "text-white/20"
                          : "text-brand-charcoal/20"
                      }`}
                    >
                      <Minus className="w-3 h-3" />
                    </div>
                    <span
                      className={`text-sm line-through ${
                        contract.dark
                          ? "text-white/30"
                          : "text-brand-charcoal/30"
                      }`}
                    >
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* CTA */}
          <Link href="/auth/signin">
            <Button
              className={`w-full h-14 font-mono text-xs uppercase tracking-[0.15em] rounded-none border-0 transition-all duration-300 ${
                contract.dark
                  ? "bg-[#c67b5c] hover:bg-[#b36a4d] text-white"
                  : contract.popular
                    ? "bg-white border-2 border-brand-charcoal hover:bg-brand-charcoal text-brand-charcoal hover:text-white"
                    : "bg-white border-2 border-brand-charcoal hover:bg-brand-charcoal text-brand-charcoal hover:text-white"
              }`}
              variant="outline"
            >
              {contract.cta}
            </Button>
          </Link>
        </div>

        {/* Corner Accents */}
        {!contract.dark && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-charcoal/10" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-charcoal/10" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/10" />
          </>
        )}
      </div>
    </motion.div>
  );
}

export function ResourceContracts() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(26,26,26,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "120px 100%",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
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
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-xl mx-auto">
            Start free. Upgrade when you need more power.
          </p>
        </motion.div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contracts.map((contract, index) => (
            <ContractCard key={contract.id} contract={contract} index={index} />
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-charcoal/30">
            All plans include SSL Encryption • Daily Backups • Export Anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
