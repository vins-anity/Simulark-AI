"use client";

import { motion } from "framer-motion";
import { CheckCircle, Cloud, Code, Layers, Zap } from "lucide-react";
import { type OnboardingData } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface CompleteStepProps {
  data: OnboardingData;
}

export function CompleteStep({ data }: CompleteStepProps) {
  const totalTechs = Object.values(data.techStack).flat().length;

  const summaryItems = [
    {
      icon: <Zap className="h-4 w-4" />,
      label: "Experience",
      value: data.experienceLevel
        ? data.experienceLevel.charAt(0).toUpperCase() +
          data.experienceLevel.slice(1)
        : "Not set",
      color: "text-amber-600",
    },
    {
      icon: <Layers className="h-4 w-4" />,
      label: "Mode",
      value: data.defaultMode
        ? data.defaultMode.charAt(0).toUpperCase() + data.defaultMode.slice(1)
        : "Not set",
      color: "text-blue-600",
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: "Project Type",
      value: data.projectType || "Not set",
      color: "text-emerald-600",
    },
    {
      icon: <Cloud className="h-4 w-4" />,
      label: "Technologies",
      value: totalTechs > 0 ? `${totalTechs} selected` : "AI defaults",
      color: "text-sky-600",
    },
  ];

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Badge */}
      <motion.div variants={itemVariants} className="mb-4">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand-orange">
          <span className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
          SYS-01 // System Ready
        </span>
      </motion.div>

      {/* Success Animation */}
      <motion.div variants={itemVariants} className="mb-6 flex justify-center">
        <div className="relative">
          {/* Glow */}
          <motion.div
            className="absolute inset-0 -z-10 blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="h-24 w-24 bg-brand-orange/30" />
          </motion.div>

          {/* Checkmark */}
          <motion.div
            className="flex h-24 w-24 items-center justify-center border-2 border-brand-orange bg-brand-orange text-white"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>

          {/* Status indicator */}
          <motion.div
            className="absolute -bottom-1 -right-1 border border-brand-orange bg-bg-secondary px-2 py-0.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-orange">
              OPERATIONAL
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={itemVariants}
        className="mb-3 font-poppins text-3xl font-bold text-brand-charcoal"
      >
        Configuration Complete
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={itemVariants}
        className="mb-8 font-lora text-brand-charcoal/60 max-w-md mx-auto"
      >
        Your preferences have been saved. The AI will now generate architectures
        tailored to your stack.
      </motion.p>

      {/* Summary Grid */}
      <motion.div
        variants={itemVariants}
        className="mb-6 grid gap-2 sm:grid-cols-2"
      >
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 border border-brand-charcoal/10 bg-bg-secondary p-3 text-left"
          >
            <span className={item.color}>{item.icon}</span>
            <div>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/50">
                {item.label}
              </span>
              <span className="font-mono text-xs font-medium uppercase tracking-wide text-brand-charcoal">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Next Steps */}
      <motion.div
        variants={itemVariants}
        className="mb-8 border border-dashed border-brand-orange/30 bg-brand-orange/5 p-4"
      >
        <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-brand-orange">
          What&apos;s Next?
        </h3>
        <ul className="space-y-2 text-sm text-brand-charcoal/70">
          <li className="flex items-center justify-center gap-2">
            <span className="text-brand-orange">→</span>
            Create your first architecture
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-brand-orange">→</span>
            Browse recommended templates
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-brand-orange">→</span>
            Adjust preferences in Settings anytime
          </li>
        </ul>
      </motion.div>

      {/* Footer */}
      <motion.div variants={itemVariants}>
        <p className="text-xs text-brand-charcoal/40 font-mono">
          Click{" "}
          <strong className="text-brand-charcoal/70">[ INITIALIZE ]</strong> to
          start building
        </p>
      </motion.div>
    </motion.div>
  );
}
