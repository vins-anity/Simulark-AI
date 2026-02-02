"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MouseEvent } from "react";

export function Hero() {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section
            className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#faf9f5] border-b border-brand-charcoal/5"
            onMouseMove={handleMouseMove}
        >
            {/* Interactive Grid Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1908_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1908_1px,transparent_1px)] bg-[size:40px_40px]"
                />
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 107, 0, 0.03),
                                transparent 80%
                            )
                        `,
                    }}
                />
            </div>

            <div className="container mx-auto px-6 z-10 text-center space-y-10 max-w-5xl pt-20">

                {/* Technical Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-3 py-1.5 border border-brand-charcoal/10 bg-white/50 backdrop-blur-sm rounded-sm"
                >
                    <span className="w-2 h-2 bg-brand-orange animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/70">
                        System v1.0.4 <span className="text-brand-gray-mid mx-2">|</span> Architecture ready
                    </span>
                </motion.div>

                {/* Headline */}
                <div className="space-y-4">
                    <motion.h1
                        className="text-6xl md:text-8xl font-poppins font-bold tracking-tighter text-[#1a1a19] leading-[1] relative inline-block"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Design systems,<br />
                        <span className="font-serif italic font-light text-brand-charcoal/60 relative">
                            not just diagrams.
                            <svg className="absolute w-[110%] -bottom-2 -left-2 text-brand-orange/30 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path d="M0 15 Q 50 20 100 15" stroke="currentColor" fill="none" strokeWidth="2" />
                            </svg>
                        </span>
                    </motion.h1>
                </div>

                {/* Subhead with Technical Detail */}
                <motion.div
                    className="flex flex-col items-center gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <p className="text-xl md:text-2xl font-lora text-brand-gray-mid max-w-2xl mx-auto leading-relaxed">
                        Transform abstract ideas into executable infrastructure.
                        Export production-ready Terraform and code instantly.
                    </p>

                    <div className="hidden md:flex gap-8 text-[11px] font-mono text-brand-gray-mid/60 uppercase tracking-widest border-t border-brand-charcoal/5 pt-6 mt-2">
                        <span>[ React Flow Engine ]</span>
                        <span>[ AI Orchestration ]</span>
                        <span>[ Multi-Cloud ]</span>
                    </div>
                </motion.div>

                {/* CTA Actions */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Link href="/auth/signin">
                        <Button size="lg" className="group h-14 px-8 text-sm font-mono uppercase tracking-wider rounded-none bg-brand-charcoal hover:bg-brand-orange text-brand-sand-light transition-all border border-brand-charcoal">
                            <span className="mr-3">Start Architecting</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link href="/features">
                        <Button variant="outline" size="lg" className="group h-14 px-8 text-sm font-mono uppercase tracking-wider rounded-none border-brand-charcoal/20 hover:border-brand-charcoal text-brand-charcoal hover:bg-transparent transition-all">
                            <Terminal className="w-4 h-4 mr-3 text-brand-gray-mid group-hover:text-brand-charcoal transition-colors" />
                            <span>See How It Works</span>
                        </Button>
                    </Link>
                </motion.div>

                {/* Interactive Preview Placeholder */}
                <motion.div
                    initial={{ opacity: 0, rotateX: 20, z: -100 }}
                    animate={{ opacity: 1, rotateX: 0, z: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="mt-20 w-full max-w-5xl aspect-[16/9] bg-white border border-brand-charcoal/10 shadow-2xl shadow-brand-charcoal/5 relative overflow-hidden group perspective-1000"
                >
                    {/* UI Mockup Header */}
                    <div className="h-10 border-b border-brand-charcoal/5 bg-[#faf9f5] flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 bg-transparent" />
                            <div className="w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 bg-transparent" />
                            <div className="w-2.5 h-2.5 rounded-full border border-brand-charcoal/20 bg-transparent" />
                        </div>
                        <div className="mx-auto font-mono text-[10px] text-brand-gray-mid uppercase tracking-widest opacity-50">
                            simulark_studio.exe
                        </div>
                    </div>
                    {/* Placeholder Content */}
                    <div className="absolute inset-0 top-10 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 top-10 flex items-center justify-center">
                        <span className="font-poppins text-6xl font-black text-brand-charcoal/[0.03] uppercase tracking-tighter">
                            Canvas Preview
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
