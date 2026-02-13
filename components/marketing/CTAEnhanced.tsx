"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function CTAEnhanced() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-brand-charcoal text-brand-sand-light relative overflow-hidden"
    >
      {/* Schematic Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-brand-sand-light) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-brand-sand-light) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.1
        }}
      />

      {/* Technical Corner Marks */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-brand-sand-light/10" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-brand-sand-light/10" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-brand-sand-light/10" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-brand-sand-light/10" />

      {/* System Status - Top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-sand-light/30">
          // SYSTEM_READY
        </span>
        <span className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
      </div>

      <motion.div
        className="container mx-auto px-6 relative z-10 text-center"
        style={{ y }}
      >
        {/* Signal Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-brand-sand-light/20 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-sand-light/60">
            FREE_TIER_AVAILABLE
          </span>
        </motion.div>

        {/* Main Headline */}
        <div className="overflow-hidden mb-6">
          <motion.h2
            className="text-5xl md:text-7xl lg:text-8xl font-poppins font-bold tracking-tight text-brand-sand-light"
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            READY TO BUILD?
          </motion.h2>
        </div>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl font-lora text-brand-sand-light/50 max-w-xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Stop drawing static boxes. Start architecting executable systems.
        </motion.p>

        {/* CTA Button - Bracket Style */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="group h-14 px-0 text-sm font-mono uppercase tracking-[0.15em] rounded-none bg-brand-orange hover:bg-brand-sand-light hover:text-brand-charcoal text-brand-sand-light transition-all duration-300 border-0"
            >
              <span className="px-4 text-brand-sand-light/40 group-hover:text-brand-charcoal/40 transition-colors">
                [
              </span>
              <span className="px-2">START_PROJECT</span>
              <motion.span
                className="px-2"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
              <span className="px-4 text-brand-sand-light/40 group-hover:text-brand-charcoal/40 transition-colors">
                ]
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* System Guarantees */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          {["NO_CREDIT_CARD", "FREE_FOREVER", "CANCEL_ANYTIME"].map(
            (item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-brand-orange" />
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-sand-light/30">
                  {item}
                </span>
              </div>
            ),
          )}
        </motion.div>
      </motion.div>

      {/* Bottom System Info */}
      <div className="absolute bottom-8 left-8 font-mono text-[9px] text-brand-sand-light/20 uppercase">
        <div>SYS_VERSION: 0.9.2</div>
        <div>UPTIME: 99.99%</div>
      </div>

      <div className="absolute bottom-8 right-8 font-mono text-[9px] text-brand-sand-light/20 uppercase text-right">
        <div>BUILD: 2026.02.12</div>
        <div>STATUS: OPERATIONAL</div>
      </div>
    </section>
  );
}
