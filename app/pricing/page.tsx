"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Scriptkiddie",
        price: "0",
        desc: "For experimental prototyping.",
        features: ["3 Projects", "Basic Nodes", "Community Support", "Public Exports"],
        cta: "Initialize",
        highlight: false
    },
    {
        name: "Studio",
        price: "29",
        desc: "For professional architects.",
        features: ["Unlimited Projects", "All Advanced Nodes", "Priority Computation", "Private Exports", "Team Collaboration"],
        cta: "Upgrade Capacity",
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For mission-critical scale.",
        features: ["SSO & Audit Logs", "VPC Deployment", "SLA Guarantee", "Dedicated Solutions Architect"],
        cta: "Contact Sales",
        highlight: false
    }
];

export default function PricingPage() {
    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5] min-h-screen">
                <div className="pt-32 pb-20 px-6">
                    <div className="container mx-auto max-w-5xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Icon icon="lucide:ticket" className="w-4 h-4 text-brand-orange" />
                            <span className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/60">
                                Resource Allocation
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-poppins font-bold text-brand-charcoal mb-6 tracking-tight">
                            Contracts
                        </h1>
                        <p className="text-xl font-lora text-brand-gray-mid max-w-2xl leading-relaxed">
                            Select the computational capacity required for your infrastructure engineering.
                        </p>
                    </div>
                </div>

                <div className="pb-32 px-6">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8">
                            {plans.map((plan, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "relative p-8 flex flex-col bg-white border h-full transition-all duration-300",
                                        plan.highlight
                                            ? "border-brand-orange shadow-2xl shadow-brand-orange/10 scale-105 z-10"
                                            : "border-brand-charcoal/10 hover:border-brand-charcoal/30"
                                    )}
                                >
                                    {plan.highlight && (
                                        <div className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-mono uppercase px-3 py-1 tracking-widest">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="mb-8 border-b border-brand-charcoal/5 pb-8">
                                        <h3 className="font-poppins font-bold text-2xl text-brand-charcoal mb-2">{plan.name}</h3>
                                        <p className="font-lora text-sm text-brand-gray-mid italic mb-6">{plan.desc}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-mono text-4xl text-brand-charcoal font-medium">
                                                {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                                            </span>
                                            {plan.price !== "Custom" && (
                                                <span className="font-mono text-xs text-brand-gray-mid">/mo</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 mb-8">
                                        <ul className="space-y-4">
                                            {plan.features.map((feat, j) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    <Icon icon="lucide:check-square" className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                                                    <span className="font-mono text-xs text-brand-charcoal/80 uppercase tracking-wide">{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        className={cn(
                                            "w-full rounded-none h-12 font-mono uppercase tracking-wider text-xs border transition-all",
                                            plan.highlight
                                                ? "bg-brand-charcoal text-brand-sand-light hover:bg-brand-orange hover:text-white border-transparent"
                                                : "bg-transparent text-brand-charcoal border-brand-charcoal hover:bg-brand-charcoal hover:text-white"
                                        )}
                                    >
                                        {plan.cta}
                                    </Button>

                                    <div className="mt-4 text-center">
                                        <span className="font-mono text-[9px] text-brand-charcoal/30 uppercase">
                                            Ref: P-{i + 1}00-X
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}
