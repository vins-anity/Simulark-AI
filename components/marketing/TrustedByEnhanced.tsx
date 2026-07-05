"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const exportTargets = [
  { name: "Cursor", icon: "/icons/cursor.svg", id: "INT-01" },
  { name: "Claude Code", icon: "/icons/claude-color.svg", id: "INT-02" },
  { name: "Windsurf", icon: "/icons/windsurf.svg", id: "INT-03" },
];

export function TrustedByEnhanced() {
  return (
    <section className="py-10 border-y border-brand-charcoal/10 bg-bg-primary relative overflow-hidden z-20">
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: "120px 100%",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <motion.div
            className="flex flex-col gap-1 shrink-0 lg:w-56"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-readable-meta uppercase tracking-[0.2em] text-brand-charcoal/50 block mb-1">
              // EXPORT_TARGETS
            </span>
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-text-primary font-bold">
              AI IDE CONTEXT
            </h2>
            <p className="font-mono text-readable-meta uppercase text-brand-charcoal/55 mt-2 leading-relaxed">
              Skill ZIP + npx skills install commands
            </p>
          </motion.div>

          <div className="hidden lg:block w-px h-12 bg-brand-charcoal/10" />

          <div className="flex-1 w-full lg:w-auto overflow-hidden">
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-6">
              {exportTargets.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  className="flex items-center gap-3 group cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="font-mono text-readable-meta text-brand-charcoal/50 uppercase">
                    {integration.id}
                  </span>
                  <div className="w-7 h-7 border border-brand-charcoal/10 flex items-center justify-center bg-bg-secondary group-hover:border-brand-orange/30 transition-colors duration-300">
                    <Image
                      src={integration.icon}
                      alt={integration.name}
                      width={16}
                      height={16}
                      loading="lazy"
                      className="object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 group-hover:text-text-primary transition-colors">
                    {integration.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="flex items-center gap-3 shrink-0 border border-brand-charcoal/10 px-4 py-3 bg-bg-secondary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Image
              src="/icons/deepseek-color.svg"
              alt="DeepSeek"
              width={18}
              height={18}
              loading="lazy"
              className="opacity-70"
            />
            <div className="flex flex-col">
              <span className="font-mono text-readable-meta uppercase text-brand-charcoal/50">
                Inference
              </span>
              <span className="font-mono text-xs uppercase text-brand-charcoal/70">
                DeepSeek V4 Flash / Pro
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
