"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

const capabilities = [
  {
    id: "CAP-01",
    category: "VISUALIZATION",
    title: "Interactive Diagrams",
    description:
      "Drag, drop, connect. Real-time collaborative canvas with version control.",
    icon: "lucide:git-fork",
    specs: ["React Flow", "Multiplayer", "History"],
  },
  {
    id: "CAP-02",
    category: "AI_CORE",
    title: "Natural Language",
    description:
      "Describe your system. AI translates intent into architectural diagrams.",
    icon: "lucide:message-square-code",
    specs: ["GPT-4o", "Claude", "Local LLMs"],
  },
  {
    id: "CAP-03",
    category: "EXPORT",
    title: "Code Generation",
    description:
      "Compile diagrams to Terraform, Kubernetes, Docker Compose, and more.",
    icon: "lucide:terminal-square",
    specs: ["HCL", "YAML", "JSON"],
  },
  {
    id: "CAP-04",
    category: "COLLABORATION",
    title: "Team Workspaces",
    description:
      "Shared projects with role-based access and real-time synchronization.",
    icon: "lucide:users",
    specs: ["RBAC", "Comments", "Audit log"],
  },
  {
    id: "CAP-05",
    category: "INTEGRATION",
    title: "IDE Context",
    description:
      "Export architectural context directly to Cursor, Claude Code, Windsurf.",
    icon: "lucide:plug",
    specs: ["MCP Protocol", "Skills", "Prompts"],
  },
  {
    id: "CAP-06",
    category: "ANALYSIS",
    title: "Cost Estimation",
    description:
      "Real-time infrastructure cost analysis across AWS, GCP, Azure.",
    icon: "lucide:calculator",
    specs: ["AWS", "GCP", "Azure"],
  },
  {
    id: "CAP-07",
    category: "VALIDATION",
    title: "Architecture Review",
    description:
      "AI-powered best practice checks and security recommendations.",
    icon: "lucide:shield-check",
    specs: ["Security", "Performance", "Cost"],
  },
  {
    id: "CAP-08",
    category: "DOCUMENTATION",
    title: "Auto-Documentation",
    description:
      "Generate technical documentation from your architecture diagrams.",
    icon: "lucide:file-text",
    specs: ["Markdown", "OpenAPI", "ADR"],
  },
];

function CapabilityCard({
  capability,
  index,
}: {
  capability: (typeof capabilities)[0];
  index: number;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="h-full p-6 border border-brand-charcoal/10 bg-white group-hover:border-brand-orange/40 transition-all duration-300 relative">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-charcoal/20 group-hover:border-brand-orange/40 transition-colors" />

        {/* ID Badge */}
        <div className="absolute -top-3 right-4 bg-[#faf9f5] px-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
            {capability.id}
          </span>
        </div>

        {/* Category */}
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-brand-orange block mb-4">
          // {capability.category}
        </span>

        {/* Icon */}
        <div className="w-10 h-10 border border-brand-charcoal/10 flex items-center justify-center mb-4 group-hover:border-brand-orange/30 transition-colors">
          <Icon
            icon={capability.icon}
            className="w-5 h-5 text-brand-charcoal/60 group-hover:text-brand-orange transition-colors"
          />
        </div>

        {/* Content */}
        <h3 className="font-mono text-sm font-bold text-brand-charcoal uppercase tracking-wide mb-2">
          {capability.title}
        </h3>
        <p className="text-brand-charcoal/60 font-lora text-sm leading-relaxed mb-4">
          {capability.description}
        </p>

        {/* Specs */}
        <div className="flex flex-wrap gap-2">
          {capability.specs.map((spec) => (
            <span
              key={spec}
              className="px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider bg-brand-charcoal/5 text-brand-charcoal/50"
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
    <section className="py-32 bg-[#faf9f5] relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(26,26,26,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(26,26,26,0.04) 1px, transparent 1px)
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
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-4">
            CORE{" "}
            <span className="font-serif italic font-light text-brand-charcoal/50">
              MODULES
            </span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-xl mx-auto">
            Full-stack architecture design and deployment platform
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

        {/* Bottom Metrics */}
        <motion.div
          className="mt-16 pt-12 border-t border-brand-charcoal/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { label: "EXPORT_FORMATS", value: "12+" },
              { label: "CLOUD_PROVIDERS", value: "3" },
              { label: "ARCH_PATTERNS", value: "50+" },
              { label: "AI_MODELS", value: "8" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <span className="font-poppins text-3xl font-bold text-brand-charcoal block">
                  {stat.value}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
