"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const capabilities = [
  {
    id: "CAP-01",
    category: "VISUALIZATION",
    title: "Interactive Canvas",
    description:
      "Drag, drop, and connect architecture components on an infinite canvas with snap-to-grid precision.",
    icon: "lucide:git-fork",
    status: "LIVE",
    specs: ["React Flow", "Multi-select", "Undo/Redo"],
  },
  {
    id: "CAP-02",
    category: "AI_CORE",
    title: "Natural Language",
    description:
      "Describe your system in plain English. AI generates the architecture diagram automatically.",
    icon: "lucide:message-square-code",
    status: "LIVE",
    specs: ["GLM-4.7", "DeepSeek V3", "Streaming"],
  },
  {
    id: "CAP-03",
    category: "EXPORT",
    title: "Multi-Format Export",
    description:
      "Export diagrams as SVG, PNG, PDF, or Mermaid for documentation and presentations.",
    icon: "lucide:file-output",
    status: "LIVE",
    specs: ["SVG", "PNG", "PDF", "Mermaid"],
  },
  {
    id: "CAP-04",
    category: "INTEGRATION",
    title: "IDE Context Export",
    description:
      "Export architecture as agent skills for Cursor, Claude Code, and other AI IDEs.",
    icon: "lucide:plug",
    status: "BETA",
    specs: ["Cursor", "Claude Code", "Windsurf"],
  },
  {
    id: "CAP-05",
    category: "ANALYSIS",
    title: "Auto Layout",
    description:
      "Automatically organize your architecture with sophisticated layout algorithms.",
    icon: "lucide:layout",
    status: "BETA",
    specs: ["ELK.js", "Hierarchical", "Radial"],
  },
  {
    id: "CAP-06",
    category: "TESTING",
    title: "Chaos Mode",
    description:
      "Simulate failures and test resilience of your architecture design.",
    icon: "lucide:flame",
    status: "COMING_SOON",
    specs: ["Stress Test", "Failure Sim", "Resilience"],
  },
  {
    id: "CAP-07",
    category: "EXPORT",
    title: "Terraform Export",
    description:
      "Generate Infrastructure-as-Code from your visual diagrams automatically.",
    icon: "lucide:terminal-square",
    status: "COMING_SOON",
    specs: ["Terraform", "HCL", "Multi-provider"],
  },
  {
    id: "CAP-08",
    category: "COLLABORATION",
    title: "Team Workspaces",
    description:
      "Real-time collaboration with comments, version history, and shared projects.",
    icon: "lucide:users",
    status: "COMING_SOON",
    specs: ["Real-time", "Comments", "History"],
  },
];

function CapabilityCard({
  capability,
  index,
}: {
  capability: (typeof capabilities)[0];
  index: number;
}) {
  const isLive = capability.status === "LIVE";
  const isBeta = capability.status === "BETA";
  const isComingSoon = capability.status === "COMING_SOON";

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`h-full p-6 border bg-bg-secondary group-hover:border-brand-orange/40 transition-all duration-300 relative ${
          isComingSoon
            ? "border-brand-charcoal/5 opacity-75"
            : "border-brand-charcoal/10"
        }`}
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />

        {/* ID Badge */}
        <div className="absolute -top-3 right-4 bg-bg-primary px-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
            {capability.id}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`font-mono text-[7px] uppercase tracking-wider px-1.5 py-0.5 ${
              isLive
                ? "bg-brand-green/10 text-brand-green"
                : isBeta
                  ? "bg-brand-orange/10 text-brand-orange"
                  : "bg-brand-charcoal/5 text-brand-charcoal/40"
            }`}
          >
            {isComingSoon ? "SOON" : capability.status}
          </span>
        </div>

        {/* Category */}
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-brand-orange block mb-4">
          // {capability.category}
        </span>

        {/* Icon */}
        <div
          className={`w-10 h-10 border flex items-center justify-center mb-4 transition-colors ${
            isComingSoon
              ? "border-brand-charcoal/5 bg-brand-charcoal/5"
              : "border-brand-charcoal/10 group-hover:border-brand-orange/30"
          }`}
        >
          <Icon
            icon={capability.icon}
            className={`w-5 h-5 ${
              isComingSoon
                ? "text-brand-charcoal/20"
                : "text-brand-charcoal/60 group-hover:text-brand-orange"
            } transition-colors`}
          />
        </div>

        {/* Content */}
        <h3 className="font-mono text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-2">
          {capability.title}
        </h3>
        <p
          className={`font-lora text-sm leading-relaxed mb-4 ${
            isComingSoon ? "text-brand-charcoal/40" : "text-brand-charcoal/60"
          }`}
        >
          {capability.description}
        </p>

        {/* Specs */}
        <div className="flex flex-wrap gap-2">
          {capability.specs.map((spec) => (
            <span
              key={spec}
              className={`px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider ${
                isComingSoon
                  ? "bg-brand-charcoal/5 text-brand-charcoal/30"
                  : "bg-brand-charcoal/5 text-brand-charcoal/50"
              }`}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function CapabilitiesGrid() {
  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      {/* Grid Background */}
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
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
            // SYSTEM_CAPABILITIES
          </span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary mb-4">
            CORE{" "}
            <span className="font-serif italic font-light text-brand-charcoal/50">
              MODULES
            </span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-xl mx-auto">
            Current and upcoming features for architecture design
          </p>
        </motion.div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.id}
              capability={capability}
              index={index}
            />
          ))}
        </div>

        {/* Legend */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-green rounded-full" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-orange rounded-full" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-charcoal/20 rounded-full" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
              Coming Soon
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
