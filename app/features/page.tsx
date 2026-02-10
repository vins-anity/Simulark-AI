"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const features = [
  {
    id: "CORE-01",
    title: "Interactive Architecture Canvas",
    subtitle: "SEMANTIC COMPONENT ENGINE",
    desc: "A professional-grade visual environment built on XYFlow. Unlike static diagramming tools, every node has strict semantic definitions—Gateways, Services, Queues, and Databases are active entities, not just shapes.",
    tech: ["XYFlow Engine", "Semantic Nodes", "Smart Auto-Layout"],
    icon: "lucide:layout-grid",
  },
  {
    id: "CORE-02",
    title: "Agentic 'Deep Thinking'",
    subtitle: "REASONING-FIRST GENERATION",
    desc: "We use a multi-stage AI pipeline (GLM-4.7) that 'thinks' before it draws. Simulark analyzes your system constraints and architectural requirements to generate technically sound diagrams, not hallucinations.",
    tech: ["GLM-4.7 Flash", "Multi-Provider Fallback", "Streaming Thoughts"],
    icon: "lucide:brain-circuit",
  },
  {
    id: "CORE-03",
    title: "Visual Simulation",
    subtitle: "CHAOS & RESILIENCE",
    desc: "Go beyond static diagrams. Visualize protocol-aware data flows (HTTP vs gRPC vs Queues) and use 'Chaos Mode' to inject faults, testing your system's resilience before writing a single line of code.",
    tech: ["Chaos Mode", "Protocol Animation", "Congestion Detection"],
    icon: "lucide:activity",
  },
  {
    id: "CORE-04",
    title: "The Context Bridge",
    subtitle: "SINGLE SOURCE OF TRUTH",
    desc: "Solve the 'Context Loss' problem. Simulark serves as the bridge between design and implementation, exporting 'Living Blueprints' (SKILL.md) that AI coding agents like Cursor and Windsurf can read and understand.",
    tech: ["SKILL.md Export", "IDE Integration", ".cursorrules Gen"],
    icon: "lucide:file-json-2",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <div className="bg-[#faf9f5] min-h-screen font-sans selection:bg-brand-orange/20">
        {/* Hero Section - Aligned with README Philosophy */}
        <section className="relative pt-32 pb-24 border-b border-brand-charcoal/10 overflow-hidden">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a05_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="container mx-auto max-w-6xl px-6 relative z-10">
            <div className="flex flex-col gap-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-3 border border-brand-charcoal/10 bg-white/50 backdrop-blur-sm px-3 py-1 w-fit">
                <div className="w-2 h-2 bg-brand-orange animate-pulse rounded-full" />
                <span className="font-mono text-xs font-medium tracking-widest text-brand-charcoal/70 uppercase">
                  Simulark Platform
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold font-poppins text-brand-charcoal tracking-tight leading-[1.1]">
                THE CONTEXT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-charcoal">
                  BRIDGE.
                </span>
              </h1>

              {/* Subtext from README */}
              <p className="max-w-3xl text-xl md:text-2xl font-lora text-brand-charcoal/80 leading-relaxed mt-4 border-l-2 border-brand-orange pl-6">
                Bridge the gap between high-level system design and low-level
                implementation. Simulark is the <strong>Generative UI</strong>{" "}
                platform for modern backend architecture.
              </p>
            </div>
          </div>
        </section>

        {/* Features List - Based on README Core Features */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-0 border-x border-t border-brand-charcoal/10">
              {features.map((f, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={f.id}
                  className="group relative bg-[#faf9f5] border-b border-brand-charcoal/10 hover:bg-white transition-colors duration-500"
                >
                  <div className="grid md:grid-cols-12 gap-8 md:gap-12 p-8 md:p-12 items-start">
                    {/* ID & Icon Logic */}
                    <div className="md:col-span-2 flex flex-col items-start gap-4">
                      <span className="font-mono text-xs font-bold text-brand-charcoal/40 group-hover:text-brand-orange transition-colors">
                        {f.id}
                      </span>
                      <div className="w-12 h-12 flex items-center justify-center border border-brand-charcoal/10 bg-white group-hover:scale-110 group-hover:border-brand-orange/50 transition-all duration-300">
                        <Icon
                          icon={f.icon}
                          className="w-6 h-6 text-brand-charcoal"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-10 flex flex-col md:flex-row gap-8 justify-between">
                      <div className="flex flex-col gap-4 max-w-2xl">
                        <div>
                          <h3 className="font-mono text-xs font-medium text-brand-orange tracking-widest uppercase mb-2">
                            {f.subtitle}
                          </h3>
                          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-brand-charcoal mb-4">
                            {f.title}
                          </h2>
                        </div>
                        <p className="font-lora text-lg text-brand-charcoal/70 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>

                      {/* Tech Stack Tags */}
                      <div className="flex flex-col gap-3 md:border-l border-brand-charcoal/10 md:pl-6 min-w-[200px] justify-center">
                        <span className="font-mono text-[10px] uppercase text-brand-charcoal/40 mb-1">
                          Powered By
                        </span>
                        {f.tech.map((t, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-brand-charcoal/40" />
                            <span className="font-sans text-sm font-medium text-brand-charcoal/80">
                              {t}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hover Indicator Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Call to Action */}
        <section className="py-24 bg-brand-charcoal text-[#faf9f5] relative overflow-hidden">
          <div className="container mx-auto max-w-6xl px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-poppins font-bold mb-8">
              Start Designing.
            </h2>
            <p className="font-lora text-xl text-white/70 max-w-2xl mx-auto mb-12">
              Transform your backend architecture workflow with the power of
              Generative UI and Deep Thinking AI.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-4 border border-white/20 bg-white/5 px-8 py-4 hover:bg-white hover:text-brand-charcoal transition-all group"
            >
              <span className="font-mono tracking-widest uppercase">
                Launch Platform
              </span>
              <Icon
                icon="lucide:arrow-right"
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              />
            </a>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
