"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";

const architectures = [
  {
    id: "ARC-01",
    name: "Modern Web App",
    stack: ["Next.js 15", "Turso", "Upstash", "Vercel"],
    nodes: 5,
    connections: 4,
    icon: "logos:nextjs-icon",
    color: "#6a9bcc",
    description:
      "Edge-first architecture with serverless compute and distributed databases.",
    status: "LIVE",
  },
  {
    id: "ARC-02",
    name: "RAG Pipeline",
    stack: ["FastAPI", "LangChain", "Pinecone", "OpenAI"],
    nodes: 6,
    connections: 5,
    icon: "simple-icons:langchain",
    color: "#ff4d00",
    description:
      "AI-powered retrieval system with vector search and reasoning models.",
    status: "LIVE",
  },
  {
    id: "ARC-03",
    name: "Microservices",
    stack: ["Bun", "Elysia", "Kafka", "Rust"],
    nodes: 8,
    connections: 7,
    icon: "logos:kafka-icon",
    color: "#788c5d",
    description:
      "High-performance event-driven architecture with ultra-fast runtimes.",
    status: "LIVE",
  },
  {
    id: "ARC-04",
    name: "E-Commerce",
    stack: ["Astro", "Medusa", "Meilisearch", "Stripe"],
    nodes: 7,
    connections: 6,
    icon: "simple-icons:medusa",
    color: "#8b5cf6",
    description: "Composable commerce with headless CMS and instant search.",
    status: "BETA",
  },
  {
    id: "ARC-05",
    name: "Real-time Sync",
    stack: ["PartyKit", "Hono", "Automerge", "WASM"],
    nodes: 5,
    connections: 5,
    icon: "logos:webassembly",
    color: "#ec4899",
    description:
      "Local-first CRDT architecture for collaborative applications.",
    status: "COMING_SOON",
  },
  {
    id: "ARC-06",
    name: "AI Agent Swarm",
    stack: ["Python", "CrewAI", "Redis", "Postgres"],
    nodes: 9,
    connections: 12,
    icon: "simple-icons:openai",
    color: "#10b981",
    description: "Multi-agent orchestration system with persistent memory.",
    status: "COMING_SOON",
  },
];

function ArchitectureCard({
  arch,
  index,
  isSelected,
  onSelect,
}: {
  arch: (typeof architectures)[0];
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isLive = arch.status === "LIVE";
  const isBeta = arch.status === "BETA";
  const isComingSoon = arch.status === "COMING_SOON";

  return (
    <motion.div
      className={`relative cursor-pointer group ${isSelected ? "z-10" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
    >
      <div
        className={`h-full bg-bg-secondary border transition-all duration-300 ${
          isSelected
            ? "border-brand-orange"
            : isComingSoon
              ? "border-brand-charcoal/5 opacity-60"
              : "border-brand-charcoal/10 group-hover:border-brand-charcoal/30"
        }`}
      >
        {/* Header with ID */}
        <div className="flex justify-between items-start p-4 border-b border-brand-charcoal/5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 border flex items-center justify-center"
              style={{
                borderColor: isComingSoon ? "#e5e5e5" : `${arch.color}40`,
              }}
            >
              <Icon
                icon={arch.icon}
                className="w-5 h-5"
                style={{ color: isComingSoon ? "#ccc" : arch.color }}
              />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-text-primary uppercase tracking-wide">
                {arch.name}
              </h3>
              <span className="font-mono text-[9px] text-brand-charcoal/40">
                {arch.id}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-brand-orange"
              />
            )}
            <span
              className={`font-mono text-[7px] uppercase tracking-wider px-1.5 py-0.5 ${
                isLive
                  ? "bg-brand-green/10 text-brand-green"
                  : isBeta
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "bg-brand-charcoal/5 text-brand-charcoal/40"
              }`}
            >
              {isComingSoon ? "SOON" : arch.status}
            </span>
          </div>
        </div>

        {/* Specs */}
        <div className="p-4">
          <p
            className={`font-lora text-sm mb-4 leading-relaxed ${
              isComingSoon ? "text-brand-charcoal/40" : "text-brand-charcoal/60"
            }`}
          >
            {arch.description}
          </p>

          {/* Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {arch.stack.map((tech) => (
              <span
                key={tech}
                className={`px-2 py-1 font-mono text-[8px] uppercase tracking-wider ${
                  isComingSoon
                    ? "bg-brand-charcoal/5 text-brand-charcoal/30"
                    : "bg-brand-charcoal/5 text-brand-charcoal/60"
                }`}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex gap-4 pt-3 border-t border-brand-charcoal/5">
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {arch.nodes}
              </span>
              <span className="font-mono text-[8px] uppercase text-brand-charcoal/40 block">
                Nodes
              </span>
            </div>
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {arch.connections}
              </span>
              <span className="font-mono text-[8px] uppercase text-brand-charcoal/40 block">
                Edges
              </span>
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        {!isComingSoon && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-brand-orange"
            initial={{ width: "0%" }}
            animate={{ width: isSelected ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
}

export function ArchitectureShowcase() {
  const [selectedArch, setSelectedArch] = useState(architectures[0]);

  return (
    <section className="py-32 bg-bg-primary relative overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--canvas-grid) 1px, transparent 1px),
            linear-gradient(to bottom, var(--canvas-grid) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
            // ARCHITECTURE_LIBRARY
          </span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary mb-4">
            BLUEPRINT{" "}
            <span className="font-serif italic font-light text-brand-charcoal/50">
              COLLECTION
            </span>
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-brand-charcoal/40 max-w-2xl">
            Production-tested architecture patterns. Import, customize, deploy.
          </p>
        </motion.div>

        {/* Selected Preview */}
        {selectedArch.status !== "COMING_SOON" && (
          <motion.div
            className="mb-12 p-6 border border-brand-charcoal/10 bg-bg-tertiary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Preview Visual */}
              <div className="w-full md:w-1/3 aspect-video border border-brand-charcoal/10 bg-bg-secondary relative overflow-hidden">
                {/* Schematic representation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    {/* Center node */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 flex items-center justify-center bg-bg-secondary z-10"
                      style={{ borderColor: selectedArch.color }}
                    >
                      <Icon
                        icon={selectedArch.icon}
                        className="w-4 h-4"
                        style={{ color: selectedArch.color }}
                      />
                    </div>
                    {/* Orbital nodes */}
                    {Array.from({ length: selectedArch.nodes - 1 }).map(
                      (_, i) => {
                        const angle =
                          (i / (selectedArch.nodes - 1)) * Math.PI * 2;
                        const x = Math.cos(angle) * 40;
                        const y = Math.sin(angle) * 40;
                        return (
                          <motion.div
                            key={i}
                            className="absolute w-4 h-4 border border-brand-charcoal/20 bg-bg-secondary"
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                              transform: "translate(-50%, -50%)",
                            }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          />
                        );
                      },
                    )}
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      {Array.from({ length: selectedArch.nodes - 1 }).map(
                        (_, i) => {
                          const angle =
                            (i / (selectedArch.nodes - 1)) * Math.PI * 2;
                          const x1 = 50;
                          const y1 = 50;
                          const x2 = 50 + Math.cos(angle) * 40;
                          const y2 = 50 + Math.sin(angle) * 40;
                          return (
                            <motion.line
                              key={i}
                              x1={`${x1}%`}
                              y1={`${y1}%`}
                              x2={`${x2}%`}
                              y2={`${y2}%`}
                              stroke="rgba(26,26,26,0.1)"
                              strokeWidth="1"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ delay: 0.3 + i * 0.05 }}
                            />
                          );
                        },
                      )}
                    </svg>
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-charcoal/20" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-charcoal/20" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-charcoal/20" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-charcoal/20" />
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-[10px] text-brand-orange">
                    {selectedArch.id}
                  </span>
                  <span className="text-brand-charcoal/20">|</span>
                  <span className="font-mono text-[10px] uppercase text-brand-charcoal/40">
                    TEMPLATE
                  </span>
                  {selectedArch.status === "BETA" && (
                    <>
                      <span className="text-brand-charcoal/20">|</span>
                      <span className="font-mono text-[9px] uppercase text-brand-orange bg-brand-orange/10 px-1.5 py-0.5">
                        BETA
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-poppins font-bold text-text-primary mb-2">
                  {selectedArch.name}
                </h3>
                <p className="text-brand-charcoal/60 font-lora mb-4">
                  {selectedArch.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedArch.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider border border-brand-charcoal/10 text-brand-charcoal/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architectures.map((arch, index) => (
            <ArchitectureCard
              key={arch.id}
              arch={arch}
              index={index}
              isSelected={selectedArch.id === arch.id}
              onSelect={() => setSelectedArch(arch)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
