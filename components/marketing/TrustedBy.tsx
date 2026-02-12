"use client";

import Image from "next/image";

const companies = [
  { name: "Claude Code", icon: "/icons/claude-color.svg", id: "01" },
  { name: "Cursor", icon: "/icons/cursor.svg", id: "02" },
  { name: "Windsurf", icon: "/icons/windsurf.svg", id: "03" },
  { name: "Codex", icon: "/icons/openai.svg", id: "04" },
  { name: "DeepSeek", icon: "/icons/deepseek-color.svg", id: "05" },
  { name: "Antigravity", icon: "/icons/gemini-color.svg", id: "06" },
  { name: "Z.AI", icon: "/icons/zai.svg", id: "07" },
];

export function TrustedBy() {
  return (
    <section className="py-8 border-y border-brand-charcoal/10 bg-brand-sand-light relative overflow-hidden">
      {/* Structural Grid Decor */}
      <div className="absolute inset-0 drafting-grid opacity-0 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="flex flex-col gap-1 shrink-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-charcoal/50">
            // INTEGRATION_LAYER
          </span>
          <h2 className="font-mono text-xs uppercase tracking-widest text-brand-charcoal font-bold">
            Architectural Context
          </h2>
        </div>

        <div className="h-px w-full md:w-px md:h-12 bg-brand-charcoal/10 shrink-0" />

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-3 group cursor-default"
            >
              <div className="relative">
                <span className="absolute -top-3 -right-2 font-mono text-[8px] text-brand-charcoal/30 group-hover:text-brand-orange transition-colors">
                  [{company.id}]
                </span>
                <div className="w-8 h-8 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                  <Image
                    src={company.icon}
                    alt={company.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-brand-charcoal/60 group-hover:text-brand-charcoal transition-colors">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
