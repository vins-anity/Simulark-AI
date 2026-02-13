"use client";

import { Icon } from "@iconify/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const modules = [
  {
    id: "MOD-01",
    title: "Natural Input",
    desc: "Describe system logic in plain English. AI parses context, constraints, and architectural requirements.",
    sub: "PROMPT_ENGINE",
    icon: "lucide:message-square-code",
    specs: ["Context-aware", "Multi-lang", "Intent recognition"],
  },
  {
    id: "MOD-02",
    title: "Visual Logic",
    desc: "AI generates interactive diagrams. Real-time visualization of architectural decisions and data flows.",
    sub: "FLOW_RENDERER",
    icon: "lucide:git-fork",
    specs: ["Real-time sync", "Collab editing", "Version control"],
  },
  {
    id: "MOD-03",
    title: "Production Export",
    desc: "Generate Terraform configuration and context files for Cursor/Windsurf IDE integration.",
    sub: "CODE_GEN",
    icon: "lucide:terminal-square",
    specs: ["Terraform HCL", "Cursor Rules", "Mermaid diagrams"],
  },
];

function ModuleCard({
  module,
  index,
}: {
  module: (typeof modules)[0];
  index: number;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      {/* Module Container */}
      <div className="relative h-full bg-bg-secondary border border-border-primary group-hover:border-brand-orange/40 transition-all duration-300">
        {/* Module ID Badge - Top Right */}
        <div className="absolute -top-3 right-4 bg-bg-primary px-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/40 group-hover:text-brand-orange transition-colors">
            {module.id}
          </span>
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            {/* Icon in rigid box */}
            <div className="w-12 h-12 border border-border-primary flex items-center justify-center bg-bg-tertiary group-hover:border-brand-orange/30 transition-colors">
              <Icon
                icon={module.icon}
                className="w-5 h-5 text-brand-charcoal/60 group-hover:text-brand-orange transition-colors"
              />
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse" />
              <span className="font-mono text-[8px] uppercase text-brand-charcoal/40">
                ONLINE
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-poppins font-bold text-text-primary mb-3 uppercase tracking-tight">
            {module.title}
          </h3>

          {/* Description */}
          <p className="text-brand-charcoal/60 font-lora text-sm leading-relaxed mb-6">
            {module.desc}
          </p>

          {/* Specs List */}
          <div className="space-y-2 mb-6">
            {module.specs.map((spec, i) => (
              <div key={spec} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-brand-charcoal/20" />
                <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
                  {spec}
                </span>
              </div>
            ))}
          </div>

          {/* Subsystem Label */}
          <div className="pt-4 border-t border-brand-charcoal/5">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/30">
              // {module.sub}
            </span>
          </div>
        </div>

        {/* Hover Line Effect */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-brand-orange"
          initial={{ width: "0%" }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export function FeatureShowcaseEnhanced() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 0.5], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-bg-primary relative overflow-hidden"
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-charcoal/10 pb-6 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
                // SYSTEM_ARCHITECTURE
              </span>
              <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary tracking-tight">
                THE PIPELINE
              </h2>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 mt-2">
                FROM_INTENT_TO_INFRASTRUCTURE
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-brand-charcoal/30">
                EXECUTION_FLOW
              </span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Icon
                  icon="lucide:arrow-right"
                  className="w-5 h-5 text-brand-orange"
                />
              </motion.div>
            </div>
          </div>

          {/* Progress Line */}
          <div className="relative h-px bg-brand-charcoal/5 mt-0">
            <motion.div
              className="absolute top-0 left-0 h-full bg-brand-orange"
              style={{ width: lineProgress }}
            />
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px border-t border-dashed border-brand-charcoal/10 z-0" />

          {/* Connection Arrows */}
          <div className="hidden md:flex absolute top-[56px] left-[33%] z-0">
            <Icon
              icon="lucide:chevron-right"
              className="w-3 h-3 text-brand-charcoal/20"
            />
          </div>
          <div className="hidden md:flex absolute top-[56px] right-[33%] z-0">
            <Icon
              icon="lucide:chevron-right"
              className="w-3 h-3 text-brand-charcoal/20"
            />
          </div>

          {modules.map((module, index) => (
            <ModuleCard key={module.id} module={module} index={index} />
          ))}
        </div>

        {/* System Stats */}
        <motion.div
          className="mt-24 pt-12 border-t border-brand-charcoal/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100+", label: "SUPPORTED_TECHNOLOGIES" },
              { value: "10x", label: "SPEED_GAIN" },
              { value: "90%", label: "ACCURACY" },
              { value: "24/7", label: "AI_UPTIME" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="text-3xl md:text-4xl font-poppins font-bold text-text-primary mb-1">
                  {stat.value}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
