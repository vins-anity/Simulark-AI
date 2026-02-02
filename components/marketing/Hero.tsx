"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 z-0">
                {/* Subtle Grain */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply pointer-events-none"></div>

                {/* Gradient Orbs */}
                <motion.div
                    style={{ y: y1 }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[100px]"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 20, -10, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    style={{ y: y2 }}
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px]"
                    animate={{ scale: [1, 1.1, 0.9, 1], rotate: [0, -15, 10, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <motion.div
                style={{ opacity }}
                className="container mx-auto px-6 z-10 text-center space-y-8 max-w-5xl"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-brand-charcoal/5 backdrop-blur-sm shadow-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green/75 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                    </span>
                    <span className="text-xs font-medium uppercase tracking-widest text-[#1a1a19]/70">Simulark v1.0 Public Beta</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    className="text-6xl md:text-8xl font-poppins font-bold tracking-tighter text-[#1a1a19] leading-[1.1]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                    Architecture, <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-orange/80 italic font-serif pr-2">refined</span>
                    by intelligence.
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    className="text-xl md:text-2xl font-lora text-brand-gray-mid max-w-2xl mx-auto leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    Transform natural language into production-ready backend infrastructure.
                    Export to Terraform, Diagram, or Code in seconds.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link href="/auth/signin">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-sand-light shadow-2xl hover:shadow-brand-charcoal/30 transition-all">
                            <span className="mr-2">Start Designing Free</span>
                            <Icon icon="lucide:arrow-right" className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/features">
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-brand-charcoal/20 hover:bg-brand-charcoal/5 hover:border-brand-charcoal/40 text-[#1a1a19] transition-all">
                            How It Works
                        </Button>
                    </Link>
                </motion.div>

                {/* Floating UI Mockup Preview */}
                <motion.div
                    className="mt-16 relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/40 ring-1 ring-black/5 group"
                    initial={{ opacity: 0, y: 40, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
                >
                    <div className="absolute inset-0 bg-brand-charcoal/5 backdrop-blur-sm group-hover:backdrop-blur-0 transition-all duration-700"></div>
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-brand-sand-light to-transparent"></div>
                    {/* Placeholder for actual product screenshot/video */}
                    <div className="w-full h-full flex items-center justify-center bg-white/20">
                        <span className="font-poppins text-brand-charcoal/40 text-sm tracking-widest uppercase">Interactive Canvas Preview</span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
