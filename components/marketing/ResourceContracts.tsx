"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const included = [
  "Unlimited projects with Supabase persistence",
  "Interactive canvas — drag, connect, undo/redo",
  "AI architecture from plain English (Flash & Pro)",
  "Chaos mode and stress-test simulations",
  "Auto-layout (flow, hierarchical, radial)",
  "Export PNG, SVG, PDF, and Mermaid",
  "Agent skill ZIP with npx skills install commands",
  "Quality checks before export",
];

const limits = [
  "Daily AI request caps (fair-use limits apply)",
  "No team collaboration yet",
  "No payment or subscription tiers",
];

export function ResourceContracts() {
  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
            // FREE_PUBLIC_BETA
          </span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary mb-4">
            EVERYTHING{" "}
            <span className="font-serif italic font-light text-brand-charcoal/50">
              INCLUDED
            </span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-2xl mx-auto">
            No credit card. No tiers. One free workspace while we iterate in
            the open.
          </p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto border border-brand-orange bg-bg-secondary"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-8 border-b border-brand-charcoal/10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40 block mb-1">
                  REF: BETA-001
                </span>
                <h3 className="font-mono text-2xl font-bold text-text-primary uppercase tracking-wide">
                  Simulark
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-poppins text-5xl font-bold text-text-primary">
                  $0
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-brand-charcoal/40">
                  / during beta
                </span>
              </div>
            </div>
            <p className="font-lora text-brand-charcoal/60 italic text-sm">
              Describe backend architecture, edit on a live canvas, stress-test
              your design, and export diagrams plus IDE context for Cursor and
              similar tools.
            </p>
          </div>

          <div className="p-8">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 block mb-4">
              // INCLUDED
            </span>
            <ul className="space-y-3 mb-8">
              {included.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-4 h-4 border border-brand-charcoal/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-text-primary" />
                  </div>
                  <span className="text-brand-charcoal/70 text-sm leading-relaxed">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/30 block mb-4">
              // GOOD_TO_KNOW
            </span>
            <ul className="space-y-2 mb-8">
              {limits.map((limit) => (
                <li
                  key={limit}
                  className="text-brand-charcoal/50 text-sm leading-relaxed"
                >
                  — {limit}
                </li>
              ))}
            </ul>

            <Link href="/auth/signin">
              <Button className="w-full h-12 font-mono text-xs uppercase tracking-[0.12em] rounded-none bg-brand-charcoal text-white hover:bg-brand-orange border-0">
                [ START_FREE_BETA ]
              </Button>
            </Link>
          </div>

          <div className="h-0.5 bg-brand-orange" />
        </motion.div>

        <motion.p
          className="mt-10 text-center font-mono text-readable-meta uppercase tracking-[0.12em] text-brand-charcoal/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Projects saved in Supabase · AI inference via DeepSeek V4 on DashScope
        </motion.p>
      </div>
    </section>
  );
}
