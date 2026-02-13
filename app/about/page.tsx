"use client";

import { Icon } from "@iconify/react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="bg-[#faf9f5] min-h-screen">
        {/* Hero */}
        <div className="pt-32 pb-24 px-6 border-b border-brand-charcoal/5">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-brand-charcoal/10 rounded-full mb-8 bg-white">
              <span className="w-1.5 h-1.5 bg-brand-charcoal rounded-full" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/70">
                Origin Log: 2024
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-poppins font-bold text-brand-charcoal mb-10 tracking-tighter">
              Engineering <span className="text-brand-orange">velocity</span>.
            </h1>
            <p className="text-xl md:text-2xl font-lora text-brand-gray-mid leading-relaxed max-w-2xl mx-auto">
              We believe that infrastructure should be defined by intent, not
              boilerplate.
            </p>
          </div>
        </div>

        {/* Manifesto */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="relative border-l border-brand-charcoal/20 pl-12 space-y-20">
              {[
                {
                  year: "THE PROBLEM",
                  title: "Cognitive Overhead",
                  content:
                    "Modern cloud architecture requires maintaining a mental model of thousands of disconnected services, configurations, and specialized languages. It's an inefficient use of human intelligence.",
                },
                {
                  year: "THE SOLUTION",
                  title: "Visual Abstraction",
                  content:
                    "Simulark provides a visual interface that maps 1:1 with your mental model, handling the low-level translation to Terraform or CloudFormation automatically.",
                },
                {
                  year: "THE GOAL",
                  title: "Pure Creation",
                  content:
                    "Our mission is to reduce the 'time-to-infrastructure' to zero, allowing engineers to focus purely on system design and logic.",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[54px] top-1 w-3 h-3 bg-white border-2 border-brand-charcoal rounded-full" />
                  <span className="font-mono text-xs text-brand-orange font-bold tracking-widest mb-2 block">
                    // {item.year}
                  </span>
                  <h2 className="text-3xl font-poppins font-bold text-brand-charcoal mb-4">
                    {item.title}
                  </h2>
                  <p className="font-lora text-lg text-brand-gray-mid leading-relaxed text-justify">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team / Stats */}
        <section className="py-24 bg-brand-charcoal text-brand-sand-light border-t border-brand-charcoal/5">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/10">
              {[
                { label: "Architectures Generated", value: "10k+" },
                { label: "Lines of Code Saved", value: "2M+" },
                { label: "Supported Providers", value: "3" },
                { label: "Uptime", value: "99.9%" },
              ].map((stat, i) => (
                <div key={i} className="px-4">
                  <div className="font-mono text-4xl font-bold mb-2 text-white">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-white/50">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
