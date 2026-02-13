"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layers, Shield, Sparkles, Zap } from "lucide-react";

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated Hero */}
      <div className="relative mb-8">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="h-32 w-32 rounded-full bg-brand-orange/30" />
        </motion.div>

        {/* Icon grid with animations */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          <motion.div
            className="absolute"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Layers className="h-16 w-16 text-brand-orange" />
          </motion.div>

          {/* Orbiting elements */}
          <motion.div
            className="absolute -right-2 -top-2"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Zap className="h-6 w-6 text-brand-green" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-2"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Shield className="h-5 w-5 text-brand-blue" />
          </motion.div>
        </div>
      </div>

      {/* Title */}
      <motion.h1
        className="mb-4 font-mono text-3xl font-bold text-text-primary md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to <span className="text-brand-orange">Simulark</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        className="mb-8 max-w-md text-text-secondary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Let&apos;s configure your architecture generator for better results.
        This will only take a minute.
      </motion.p>

      {/* Feature highlights */}
      <motion.div
        className="mb-8 grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {[
          {
            icon: <Sparkles className="h-5 w-5" />,
            title: "Smart",
            description: "AI-powered recommendations",
          },
          {
            icon: <Layers className="h-5 w-5" />,
            title: "Visual",
            description: "Interactive architecture diagrams",
          },
          {
            icon: <Zap className="h-5 w-5" />,
            title: "Fast",
            description: "Generate in seconds",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center rounded-lg border border-border-primary bg-bg-secondary p-4"
          >
            <div className="mb-2 text-brand-orange">{feature.icon}</div>
            <h3 className="mb-1 font-mono text-sm font-medium text-text-primary">
              {feature.title}
            </h3>
            <p className="text-xs text-text-muted">{feature.description}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA hint */}
      <motion.div
        className="flex items-center gap-2 text-sm text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>Click</span>
        <span className="inline-flex items-center gap-1 rounded bg-brand-orange/10 px-2 py-1 font-mono text-xs text-brand-orange">
          Next
          <ArrowRight className="h-3 w-3" />
        </span>
        <span>to get started</span>
      </motion.div>
    </div>
  );
}
