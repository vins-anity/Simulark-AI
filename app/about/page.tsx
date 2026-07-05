"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="bg-bg-primary min-h-screen">
        <div className="pt-32 pb-24 px-6 border-b border-brand-charcoal/5">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-brand-charcoal/10 rounded-full mb-8 bg-white">
              <span className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/70">
                Free public beta
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-poppins font-bold text-brand-charcoal mb-10 tracking-tighter">
              Design systems,{" "}
              <span className="text-brand-orange">not slide decks</span>.
            </h1>
            <p className="text-xl md:text-2xl font-lora text-brand-charcoal/75 leading-relaxed max-w-2xl mx-auto">
              Simulark helps you think through backend architecture visually —
              before you write code or provision cloud resources.
            </p>
          </div>
        </div>

        <section className="py-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="relative border-l border-brand-charcoal/20 pl-12 space-y-20">
              {[
                {
                  year: "THE PROBLEM",
                  title: "Context gets lost",
                  content:
                    "Architecture decisions live in docs, threads, and whiteboards that never follow you into the IDE. When you start coding with AI assistants, the original system intent is often missing.",
                },
                {
                  year: "WHAT WE SHIP",
                  title: "A living diagram",
                  content:
                    "Describe your backend in plain English. Edit nodes and connections on a canvas. Run chaos and stress simulations. Export PNG, Mermaid, or an agent skill package your IDE can install with npx skills.",
                },
                {
                  year: "WHAT WE DON'T",
                  title: "No magic deploy button",
                  content:
                    "Simulark does not generate Terraform, provision cloud resources, or replace your infrastructure team. It is a design and context tool — honest about what ships today.",
                },
              ].map((item, i) => (
                <div key={item.year} className="relative">
                  <div className="absolute -left-[54px] top-1 w-3 h-3 bg-white border-2 border-brand-charcoal rounded-full" />
                  <span className="font-mono text-xs text-brand-orange font-bold tracking-widest mb-2 block">
                    // {item.year}
                  </span>
                  <h2 className="text-3xl font-poppins font-bold text-brand-charcoal mb-4">
                    {item.title}
                  </h2>
                  <p className="font-lora text-lg text-brand-gray-mid leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-brand-charcoal text-brand-sand-light border-t border-brand-charcoal/5">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <p className="font-lora text-lg text-white/70 leading-relaxed mb-8">
              Built as a capstone project. Inference runs on DeepSeek V4 via
              Alibaba Cloud DashScope. Projects persist in Supabase. Daily AI
              limits keep the free beta sustainable.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Open beta · No subscriptions · Feedback welcome
            </p>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
