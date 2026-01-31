"use client";

import { Icon } from "@iconify/react";
import { motion, type Variants } from "framer-motion";

const features = [
    {
        icon: "lucide:brain-circuit",
        title: "AI-Driven Design",
        description: "Describe your system in plain English. Our dual-agent AI orchestrator generates strictly valid, optimized architectures instantly.",
        color: "text-brand-orange",
        bg: "bg-brand-orange/10"
    },
    {
        icon: "lucide:workflow",
        title: "Visual Canvas",
        description: "Edit your architecture with our premium React Flow canvas. Drag, drop, and connect services with intuitive controls.",
        color: "text-brand-blue",
        bg: "bg-brand-blue/10"
    },
    {
        icon: "lucide:code-2",
        title: "Code Export",
        description: "Don't just draw it—build it. Export to Terraform, Mermaid.js, or implementation code ready for deployment.",
        color: "text-brand-green",
        bg: "bg-brand-green/10"
    }
];

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export function FeatureShowcase() {
    return (
        <section className="py-32 relative bg-white/40">
            <div className="container mx-auto px-6">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-poppins font-bold text-brand-charcoal mb-6 tracking-tight"
                    >
                        Beyond simple diagramming.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xl font-lora text-brand-gray-mid"
                    >
                        Simulark bridges the gap between conceptual design and executable code.
                    </motion.p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group p-8 rounded-3xl bg-white/60 border border-white/80 shadow-lg shadow-brand-charcoal/5 hover:shadow-xl hover:bg-white/90 transition-all duration-300"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon icon={feature.icon} className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-poppins font-semibold text-brand-charcoal mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-brand-charcoal/70 leading-relaxed font-lora">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
