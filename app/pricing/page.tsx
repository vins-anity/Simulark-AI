"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
    return (
        <MarketingLayout>
            <div className="min-h-screen bg-[#faf9f5] text-brand-charcoal pt-16 pb-20 px-4 md:px-8 font-sans selection:bg-brand-charcoal/10 tracking-tight">
                <div className="max-w-6xl mx-auto space-y-10">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-charcoal/5 border border-brand-charcoal/5">
                            <span className="w-2 h-2 rounded-full bg-[#FEBC2E] animate-pulse" />
                            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">Resource Allocation</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                            Contracts
                        </h1>
                        <p className="text-xl text-brand-gray-mid max-w-2xl mx-auto font-light leading-relaxed">
                            Select the computational capacity required for your infrastructure engineering.
                        </p>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-4">

                        {/* Doodle Plan */}
                        <PricingCard
                            name="Doodle"
                            desc="For experimental prototyping."
                            price="0"
                            features={[
                                "Up to 3 Projects",
                                "Standard Node Library",
                                "Community Support",
                                "Public Exports (SVG, PNG, PDF, Mermaid, Agent Skills)",
                                "GLM-4.7-Flash (10x Daily Limit)"
                            ]}
                            refCode="P-100-X"
                            btnText="Initialize"
                            variant="default"
                        />

                        {/* Blueprint Plan - CENTERED & SPECIAL */}
                        <PricingCard
                            name="Blueprint"
                            desc="Forever access for mission-critical scale."
                            price="10"
                            period=" one-time"
                            features={[
                                "Everything in Sketch, Forever",
                                "Commercial Usage Rights",
                                "Priority Generation Queue",
                                "Private Mode (Zero Data Retention)",
                                "Claude Opus 4.5",
                                "Code Generation/Export (soon)"
                            ]}
                            refCode="P-300-X"
                            btnText="Mint Blueprint"
                            variant="special"
                            tag="LIFETIME"
                        />

                        {/* Sketch Plan */}
                        <PricingCard
                            name="Sketch"
                            desc="For professional architects."
                            price="5"
                            period="/mo"
                            features={[
                                "Unlimited Projects",
                                "Advanced Chaos Engineering & Stress Testing",
                                "Sophisticated Auto-Layouts (Elkjs/Radial)",
                                "Kimi-k2.5, Gemini 3.0 Flash/Pro, Minimax",
                                "Quick Mode & Enterprise Mode",
                                "Advance node library",
                                "Priority Email Support"
                            ]}
                            refCode="P-200-X"
                            btnText="Upgrade Capacity"
                            variant="default"
                            tag="Devs Choice"
                        />
                    </div>

                    {/* FAQ / Additional Info */}
                    <div className="max-w-3xl mx-auto pt-10 border-t border-brand-charcoal/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <h3 className="font-mono text-sm uppercase tracking-wider opacity-60">Enterprise & Teams</h3>
                                <p className="text-sm text-brand-gray-mid leading-relaxed">
                                    Need custom SLAs, SSO, or on-premise deployment? We offer bespoke contracts for large engineering teams.
                                </p>
                                <a href="#" className="inline-block mt-2 text-sm font-medium border-b border-brand-charcoal pb-0.5 hover:opacity-70 transition-opacity">Contact Sales -&gt;</a>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-mono text-sm uppercase tracking-wider opacity-60">Open Source Protocol</h3>
                                <p className="text-sm text-brand-gray-mid leading-relaxed">
                                    Simulark contributes to the open ecosystem. Sketch and Blueprint tiers directly fund our R&D in generative architecture.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MarketingLayout>
    );
}

function PricingCard({
    name, desc, price, period = "/mo", features, refCode, btnText, variant = "default", tag
}: {
    name: string, desc: string, price: string, period?: string, features: string[], refCode: string, btnText: string, variant?: "default" | "premium" | "special", tag?: string
}) {
    const isSpecial = variant === "special";
    const isPremium = variant === "premium";

    return (
        <div className={`
            relative p-5 md:p-6 transition-all duration-500 group flex flex-col h-full
            ${isPremium ? "bg-white border-2 border-[#FEBC2E]/40 md:-mt-4 md:mb-4 shadow-2xl shadow-[#FEBC2E]/5 z-20" : ""}
            ${isSpecial ? "bg-[#1B2F45] text-white border-2 border-[#d97757] shadow-[0_0_50px_rgba(217,119,87,0.2)] md:-mt-8 md:mb-8 scale-[1.02] z-30" : ""}
            ${variant === "default" ? "bg-white border border-brand-charcoal/10 shadow-lg z-10" : ""}
        `}>
            {/* Tech Markers */}
            <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${isSpecial ? "border-[#d97757]/40" : "border-brand-charcoal/20"}`} />
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${isSpecial ? "border-[#d97757]/40" : "border-brand-charcoal/20"}`} />

            {/* Pattern Overlay for Special Card */}
            {isSpecial && (
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: `radial-gradient(#d97757 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}
                />
            )}

            {/* Tag */}
            {tag && (
                <div className={`
                    absolute -top-3 right-8 px-3 py-1 text-[10px] font-mono uppercase tracking-widest shadow-md
                    ${isSpecial ? "bg-[#d97757] text-white font-bold" : "bg-brand-charcoal text-white"}
                `}>
                    {tag}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                    <h3 className={`text-xl font-bold font-mono tracking-tight ${isSpecial ? "text-[#d97757]" : ""}`}>{name}</h3>
                    <p className={`text-[12px] italic font-light ${isSpecial ? "text-white/70" : "text-brand-gray-mid"}`}>{desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-light ${isSpecial ? "text-[#d97757]" : ""}`}>$</span>
                    <span className={`text-5xl font-black tracking-tighter ${isSpecial ? "text-[#d97757]" : ""}`}>{price}</span>
                    {period && <span className={`text-[10px] font-mono opacity-50 ${isSpecial ? "text-white" : "text-brand-charcoal"}`}>{period}</span>}
                </div>

                <div className={`h-px w-full ${isSpecial ? "bg-white/10" : "bg-brand-charcoal/5"}`} />

                <ul className="space-y-2 py-1 flex-1">
                    {features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px]">
                            <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSpecial ? "text-[#d97757]" : "text-brand-charcoal/40"}`} />
                            <span className={isSpecial ? "opacity-90 font-medium" : "opacity-80"}>{feat}</span>
                        </li>
                    ))}
                </ul>

                <div className="pt-4 mt-auto">
                    <Button
                        className={`
                            w-full h-12 rounded-none font-mono text-xs uppercase tracking-widest transition-all
                            ${isPremium ? "bg-brand-charcoal text-white hover:bg-black" : ""}
                            ${variant === "default" ? "bg-transparent border border-brand-charcoal hover:bg-brand-charcoal hover:text-white" : ""}
                            ${isSpecial ? "bg-[#d97757] text-white hover:bg-white hover:text-[#d97757] border-none font-black shadow-lg shadow-black/20" : ""}
                        `}
                    >
                        {btnText}
                    </Button>
                    <div className={`mt-3 text-center font-mono text-[8px] uppercase tracking-widest opacity-30 ${isSpecial ? "text-white" : ""}`}>
                        REF: {refCode}
                    </div>
                </div>
            </div>
        </div>
    );
}
