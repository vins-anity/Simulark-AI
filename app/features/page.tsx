"use client";

import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const features = [
    {
        id: "MOD-01",
        title: "Instant Architecture",
        desc: "Generate complete, production-ready backend architectures in seconds using advanced AI models.",
        icon: "lucide:zap"
    },
    {
        id: "MOD-02",
        title: "Version Control",
        desc: "Track changes, branch ideas, and revert infrastructure updates just like you do with code.",
        icon: "lucide:git-branch"
    },
    {
        id: "MOD-03",
        title: "Security Protocols",
        desc: "Every generated architecture follows industry standard security best practices and compliance requirements.",
        icon: "lucide:shield-check"
    },
    {
        id: "MOD-04",
        title: "IaC Export",
        desc: "Export clean, maintainable Terraform, Pulumi, or CloudFormation code that you can own.",
        icon: "lucide:terminal"
    },
    {
        id: "MOD-05",
        title: "Multi-Cloud",
        desc: "Seamlessly deploy to AWS, Azure, Google Cloud, or Vercel without changing your workflow.",
        icon: "lucide:cloud"
    },
    {
        id: "MOD-06",
        title: "Cost Analysis",
        desc: "AI-driven insights to help you choose the most cost-effective resources for your scale.",
        icon: "lucide:coins"
    }
];

export default function FeaturesPage() {
    return (
        <MarketingLayout>
            <div className="bg-[#faf9f5] min-h-screen">
                {/* Header */}
                <div className="pt-32 pb-20 px-6 border-b border-brand-charcoal/5">
                    <div className="container mx-auto max-w-5xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-2 h-2 bg-brand-orange animate-pulse" />
                            <span className="font-mono text-xs uppercase tracking-widest text-brand-charcoal/60">
                                System Capabilities
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-poppins font-bold text-brand-charcoal mb-8 tracking-tight">
                            Core Modules
                        </h1>
                        <p className="text-xl font-lora text-brand-gray-mid max-w-2xl leading-relaxed">
                            Simulark is composed of six primary high-performance modules designed to
                            accelerate technical decision making and execution.
                        </p>
                    </div>
                </div>

                {/* Feature Grid */}
                <section className="py-24 px-6">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-charcoal/10 border border-brand-charcoal/10 shadow-sm">
                            {features.map((f, i) => (
                                <div key={i} className="bg-white p-10 group hover:bg-[#fffaeb] transition-colors relative">
                                    <div className="absolute top-6 right-6 font-mono text-[10px] text-brand-charcoal/20 group-hover:text-brand-orange transition-colors">
                                        {f.id}
                                    </div>

                                    <div className="w-12 h-12 bg-[#faf9f5] border border-brand-charcoal/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                        <Icon icon={f.icon} className="w-6 h-6 text-brand-charcoal" />
                                    </div>

                                    <h3 className="text-xl font-poppins font-bold text-brand-charcoal mb-4 group-hover:translate-x-1 transition-transform">
                                        {f.title}
                                    </h3>
                                    <p className="font-lora text-brand-gray-mid text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {f.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </MarketingLayout>
    );
}
