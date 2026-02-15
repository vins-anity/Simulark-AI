"use client";

import { motion } from "framer-motion";
import { ArrowRight, Braces, Layers, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        className="w-full max-w-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-orange">
            <span className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
            SYS-00 // System Initialization
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="mb-4 font-poppins text-3xl font-bold tracking-tight text-brand-charcoal md:text-4xl"
        >
          Configure Your
          <br />
          <span className="text-brand-orange">Architecture Engine</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-md mx-auto font-lora text-base text-brand-charcoal/60"
        >
          Set your preferences for AI-generated infrastructure. This takes under
          a minute and can be changed anytime.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          variants={itemVariants}
          className="mb-10 grid gap-3 sm:grid-cols-3"
        >
          {[
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Smart",
              description: "AI-powered",
            },
            {
              icon: <Layers className="h-5 w-5" />,
              title: "Visual",
              description: "Interactive",
            },
            {
              icon: <Braces className="h-5 w-5" />,
              title: "Executable",
              description: "Production-ready",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center border border-brand-charcoal/10 bg-bg-secondary p-3 hover:border-brand-orange/30 transition-colors"
            >
              <div className="mb-1.5 text-brand-orange">{feature.icon}</div>
              <h3 className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-charcoal">
                {feature.title}
              </h3>
              <p className="text-[9px] text-brand-charcoal/50 font-mono uppercase">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA Hint */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2 text-sm text-brand-charcoal/50"
        >
          <span>Click</span>
          <span className="inline-flex items-center gap-1 border border-brand-orange/30 px-2 py-1 font-mono text-xs uppercase text-brand-orange">
            <span>[</span>
            Continue
            <ArrowRight className="h-3 w-3" />
            <span>]</span>
          </span>
          <span>to begin</span>
        </motion.div>

        {/* Technical Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 pt-4 border-t border-brand-charcoal/10"
        >
          <div className="flex justify-center gap-6 font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40">
            <span>EST_TIME: 60s</span>
            <span>STEPS: 3</span>
            <span>REVERSIBLE</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
