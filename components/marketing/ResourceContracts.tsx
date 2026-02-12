"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const contracts = [
  {
    id: "RC-01",
    name: "Developer",
    price: "0",
    period: "MO",
    subtitle: "FREE_TIER",
    description: "Individual developers and small experiments.",
    features: [
      "3 Projects",
      "Basic architectures",
      "Terraform export",
      "Community support",
      "1 Team member",
    ],
    limits: ["No AI generation", "No collaboration", "Public projects only"],
    cta: "[ INITIALIZE_FREE ]",
    popular: false,
  },
  {
    id: "RC-02",
    name: "Team",
    price: "29",
    period: "MO",
    subtitle: "OPTIMAL_CONFIG",
    description: "Growing teams with collaborative workflows.",
    features: [
      "Unlimited projects",
      "All architectures",
      "AI generation (1K/mo)",
      "Private projects",
      "Up to 10 members",
      "IDE integrations",
      "Cost estimation",
    ],
    limits: ["Limited API access"],
    cta: "[ DEPLOY_TEAM ]",
    popular: true,
  },
  {
    id: "RC-03",
    name: "Enterprise",
    price: "99",
    period: "MO",
    subtitle: "SCALE_CONFIG",
    description: "Organizations with advanced security needs.",
    features: [
      "Everything in Team",
      "Unlimited AI generation",
      "SSO & SAML",
      "Audit logs",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated support",
      "On-premise option",
    ],
    limits: [],
    cta: "[ CONTACT_SALES ]",
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
  return (
    <motion.div
      className={`relative ${contract.popular ? "z-10" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
    >
      {/* Popular Badge */}
      {contract.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] bg-brand-orange text-white px-4 py-1.5">
            {contract.subtitle}
          </span>
        </div>
      )}

      <div
        className={`h-full bg-white border ${
          contract.popular ? "border-brand-orange" : "border-brand-charcoal/10"
        } relative`}
      >
        {/* Contract Header */}
        <div className="p-6 border-b border-brand-charcoal/5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40 block mb-1">
                {contract.id}
              </span>
              <h3 className="font-mono text-xl font-bold text-brand-charcoal uppercase tracking-wide">
                {contract.name}
              </h3>
            </div>
            {!contract.popular && (
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/30">
                {contract.subtitle}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm text-brand-charcoal/40">$</span>
            <span className="font-poppins text-5xl font-bold text-brand-charcoal">
              {contract.price}
            </span>
            <span className="font-mono text-sm text-brand-charcoal/40">
              /{contract.period}
            </span>
          </div>

          <p className="text-brand-charcoal/60 font-lora text-sm mt-3">
            {contract.description}
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 block mb-4">
            // INCLUDED_RESOURCES
          </span>

          <ul className="space-y-3 mb-6">
            {contract.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="w-4 h-4 border border-brand-charcoal/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-brand-orange" />
                </div>
                <span className="text-brand-charcoal/70 text-sm">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Limits */}
          {contract.limits.length > 0 && (
            <>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/30 block mb-4">
                // LIMITATIONS
              </span>
              <ul className="space-y-2 mb-6">
                {contract.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-3">
                    <span className="w-4 h-4 border border-brand-charcoal/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-brand-charcoal/20 text-xs">—</span>
                    </span>
                    <span className="text-brand-charcoal/40 text-sm line-through">
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
              className={`w-full h-12 font-mono text-xs uppercase tracking-[0.15em] rounded-none border-0 ${
                contract.popular
                  ? "bg-brand-orange hover:bg-brand-charcoal text-white"
                  : "bg-brand-charcoal hover:bg-brand-orange text-white"
              } transition-all duration-300`}
            >
              {contract.cta}
            </Button>
          </Link>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-charcoal/10" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-charcoal/10" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/10" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/10" />
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
            Transparent pricing. No hidden fees. Scale as you grow.
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
            All plans include: SSL Encryption • Daily Backups • 99.9% Uptime SLA
          </p>
        </motion.div>
      </div>
    </section>
  );
}
