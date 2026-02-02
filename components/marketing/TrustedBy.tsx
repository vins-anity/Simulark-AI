"use client";

import { Icon } from "@iconify/react";

const companies = [
    { name: "Acme Corp", icon: "lucide:box" },
    { name: "GlobalTech", icon: "lucide:globe" },
    { name: "Nebula", icon: "lucide:cloud" },
    { name: "Vertex", icon: "lucide:triangle" },
    { name: "SaaS Inc", icon: "lucide:zap" },
];

export function TrustedBy() {
    return (
        <section className="py-12 border-b border-brand-charcoal/5 bg-[#faf9f5]">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 whitespace-nowrap">
                    Trusted by engineers at
                </span>

                <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {companies.map((company) => (
                        <div key={company.name} className="flex items-center gap-2 group">
                            <Icon icon={company.icon} className="w-5 h-5 text-brand-charcoal group-hover:text-brand-orange transition-colors" />
                            <span className="font-poppins font-semibold text-sm text-brand-charcoal">{company.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
