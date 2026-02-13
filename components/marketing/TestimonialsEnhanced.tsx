"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

const fieldReports = [
  {
    entry: "LOG-442",
    quote:
      "Simulark turned our spaghetti architecture diagrams into actual, deployable Terraform code. It's not just a drawing tool; it's an engineering multiplier.",
    author: "Sarah Jenkins",
    role: "Principal Architect",
    org: "TechFlow",
    clearance: "L3",
  },
  {
    entry: "LOG-891",
    quote:
      "The ability to visualize and then instantly create the infrastructure is mind-blowing. It bridges the gap between the whiteboard and the IDE perfectly.",
    author: "David Chen",
    role: "DevOps Lead",
    org: "ScaleUp",
    clearance: "L2",
  },
  {
    entry: "LOG-156",
    quote:
      "We reduced our architecture design time by 80%. The AI understands context in a way that feels almost magical. Every team should have this.",
    author: "Elena Rodriguez",
    role: "CTO",
    org: "NexGen Systems",
    clearance: "L4",
  },
  {
    entry: "LOG-723",
    quote:
      "Finally, a tool that speaks both architect and developer. The export to multiple formats saved us weeks of manual work.",
    author: "Marcus Kim",
    role: "Senior Engineer",
    org: "CloudFirst",
    clearance: "L2",
  },
];

function FieldReport({
  report,
  index,
}: {
  report: (typeof fieldReports)[0];
  index: number;
}) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="bg-bg-secondary border border-brand-charcoal/10 p-6 group-hover:border-brand-orange/30 transition-all duration-300 relative">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-charcoal/20" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-charcoal/20" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-charcoal/20" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-charcoal/20" />

        {/* Entry Header */}
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-brand-charcoal/5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-brand-orange">
              ENTRY: {report.entry}
            </span>
            <span className="text-brand-charcoal/20">|</span>
            <span className="font-mono text-[9px] text-brand-charcoal/40 uppercase">
              CLEARANCE: {report.clearance}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-green rounded-full" />
            <span className="font-mono text-[8px] uppercase text-brand-charcoal/40">
              VERIFIED
            </span>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="font-lora text-base text-text-primary/80 leading-relaxed mb-6">
          &ldquo;{report.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-brand-charcoal/5">
          {/* Avatar placeholder */}
          <div className="w-10 h-10 border border-brand-charcoal/10 flex items-center justify-center bg-bg-tertiary">
            <span className="font-mono text-xs text-brand-charcoal/60">
              {report.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <div className="font-mono text-xs text-text-primary font-bold uppercase tracking-wide">
              {report.author}
            </div>
            <div className="font-mono text-[9px] text-brand-charcoal/40 uppercase">
              {report.role} // {report.org}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TestimonialsEnhanced() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-bg-primary relative overflow-hidden"
    >
      {/* Subtle Grid */}
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
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          <motion.div
            className="lg:w-1/3 lg:sticky lg:top-32 lg:self-start"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-orange block mb-2">
              // FIELD_REPORTS
            </span>

            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-text-primary mb-4">
              FIELD
              <br />
              <span className="font-serif italic font-light text-brand-charcoal/50">
                Notes
              </span>
            </h2>

            <p className="font-lora text-brand-charcoal/60 italic mb-8">
              Observations from engineering teams deploying with Simulark.
            </p>

            {/* Stats */}
            <div className="space-y-4 pt-6 border-t border-brand-charcoal/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-brand-charcoal/10 flex items-center justify-center">
                  <span className="font-mono text-sm text-text-primary">
                    4.9
                  </span>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
                    AVG_RATING
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-brand-orange" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-brand-charcoal/10 flex items-center justify-center font-mono text-xs text-brand-charcoal">
                  500+
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
                  ACTIVE_TEAMS
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reports Grid */}
          <div className="lg:w-2/3">
            <div className="grid gap-4">
              {fieldReports.map((report, index) => (
                <FieldReport key={report.entry} report={report} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
