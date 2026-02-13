"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const integrations = [
  {
    name: "Claude Code",
    icon: "/icons/claude-color.svg",
    id: "INT-01",
    status: "ACTIVE",
  },
  { name: "Cursor", icon: "/icons/cursor.svg", id: "INT-02", status: "ACTIVE" },
  {
    name: "Windsurf",
    icon: "/icons/windsurf.svg",
    id: "INT-03",
    status: "ACTIVE",
  },
  { name: "Codex", icon: "/icons/openai.svg", id: "INT-04", status: "ACTIVE" },
  {
    name: "DeepSeek",
    icon: "/icons/deepseek-color.svg",
    id: "INT-05",
    status: "ACTIVE",
  },
  {
    name: "Gemini",
    icon: "/icons/gemini-color.svg",
    id: "INT-06",
    status: "ACTIVE",
  },
  { name: "Z.AI", icon: "/icons/zai.svg", id: "INT-07", status: "BETA" },
];

export function TrustedByEnhanced() {
  return (
    <section className="py-10 border-y border-brand-charcoal/10 bg-bg-primary relative overflow-hidden">
      {/* Technical Grid */}
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
          {/* Header */}
          <motion.div
            className="flex flex-col gap-1 shrink-0 lg:w-48"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/40">
              // INTEGRATION_LAYER
            </span>
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-text-primary font-bold">
              AI_IDE_CONTEXT
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/50">
                7 MODULES LINKED
              </span>
            </div>
          </motion.div>

          {/* Separator */}
          <div className="hidden lg:block w-px h-12 bg-brand-charcoal/10" />

          {/* Integration List */}
          <div className="flex-1 overflow-hidden">
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  className="flex items-center gap-3 group cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* ID Badge */}
                  <span className="font-mono text-[8px] text-brand-charcoal/30 uppercase">
                    {integration.id}
                  </span>

                  {/* Icon Container */}
                  <div className="w-7 h-7 border border-brand-charcoal/10 flex items-center justify-center bg-bg-secondary group-hover:border-brand-orange/30 transition-colors duration-300">
                    <Image
                      src={integration.icon}
                      alt={integration.name}
                      width={16}
                      height={16}
                      className="object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Name & Status */}
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/60 group-hover:text-text-primary transition-colors">
                      {integration.name}
                    </span>
                    <span
                      className={`font-mono text-[7px] uppercase ${
                        integration.status === "ACTIVE"
                          ? "text-brand-green"
                          : "text-brand-orange"
                      }`}
                    >
                      {integration.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </section>
  );
}
