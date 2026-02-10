"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    title: "Natural Input",
    desc: "Describe your system logic in plain English.",
    sub: "Prompt Engineering",
    icon: "lucide:message-square-code",
  },
  {
    id: "02",
    title: "Visual Logic",
    desc: "AI helps you visualize the flow instantly.",
    sub: "React Flow Engine",
    icon: "lucide:git-fork",
  },
  {
    id: "03",
    title: "Production Code",
    desc: "Export to Terraform or implementation code.",
    sub: "Code Generation",
    icon: "lucide:terminal-square",
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-32 bg-white relative overflow-hidden border-b border-brand-charcoal/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-brand-charcoal/10 pb-6">
          <div>
            <h2 className="text-4xl font-poppins font-bold text-brand-charcoal mb-2">
              The Architecture Pipeline
            </h2>
            <p className="font-mono text-xs text-brand-gray-mid uppercase tracking-widest">
              From thought to infrastructure
            </p>
          </div>
          <div className="hidden md:block">
            <Icon
              icon="lucide:arrow-right"
              className="w-8 h-8 text-brand-orange animate-pulse"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-px bg-dashed border-t border-brand-charcoal/20 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 p-8 border-l border-brand-charcoal/5 first:border-l-0 group hover:bg-[#faf9f5] transition-colors"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-3xl font-light text-brand-charcoal/20 group-hover:text-brand-orange transition-colors">
                  {step.id}
                </span>
                <div className="w-12 h-12 bg-white border border-brand-charcoal/10 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                  <Icon
                    icon={step.icon}
                    className="w-5 h-5 text-brand-charcoal"
                  />
                </div>
              </div>

              <h3 className="text-xl font-poppins font-bold text-brand-charcoal mb-3 group-hover:translate-x-1 transition-transform">
                {step.title}
              </h3>
              <p className="text-brand-gray-mid font-lora text-sm leading-relaxed mb-6">
                {step.desc}
              </p>

              <div className="pt-6 border-t border-brand-charcoal/5">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
                  Module: {step.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
