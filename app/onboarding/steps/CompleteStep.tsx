"use client";

import { motion } from "framer-motion";
import { CheckCircle, Globe, Layers, Sparkles, Zap } from "lucide-react";
import { type OnboardingData } from "../types";

interface CompleteStepProps {
  data: OnboardingData;
}

export function CompleteStep({ data }: CompleteStepProps) {
  // Get experience label
  const experienceLabels: Record<string, string> = {
    beginner: "Beginner 🌱",
    intermediate: "Intermediate ⚖️",
    expert: "Expert 🚀",
  };

  // Get mode label
  const modeLabels: Record<string, string> = {
    startup: "🚀 Startup Mode",
    default: "⚖️ Default Mode",
    enterprise: "🏢 Enterprise Mode",
  };

  // Count total tech selections
  const totalTechs = Object.values(data.techStack).flat().length;

  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Success animation */}
      <motion.div
        className="mb-8 flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="relative">
          {/* Glow effect */}
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
            <div className="h-24 w-24 rounded-full bg-brand-orange/40" />
          </motion.div>

          {/* Checkmark */}
          <motion.div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-orange text-white"
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>

          {/* Sparkles */}
          <motion.div
            className="absolute -right-4 -top-4"
            animate={{
              rotate: [0, 20, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="mb-4 font-mono text-3xl font-bold text-text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        You&apos;re all set!
      </motion.h2>

      {/* Description */}
      <motion.p
        className="mb-8 text-text-secondary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Your preferences have been saved. Here&apos;s a summary of your setup:
      </motion.p>

      {/* Summary Cards */}
      <motion.div
        className="mb-8 grid gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Experience */}
        <div className="rounded-lg border border-border-primary bg-bg-secondary p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-brand-orange">
            <Zap className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Experience
            </span>
          </div>
          <p className="font-medium text-text-primary">
            {data.experienceLevel
              ? experienceLabels[data.experienceLevel]
              : "Not set"}
          </p>
        </div>

        {/* Mode */}
        <div className="rounded-lg border border-border-primary bg-bg-secondary p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-brand-blue">
            <Layers className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Default Mode
            </span>
          </div>
          <p className="font-medium text-text-primary">
            {data.defaultMode ? modeLabels[data.defaultMode] : "Not set"}
          </p>
        </div>

        {/* Project Types */}
        <div className="rounded-lg border border-border-primary bg-bg-secondary p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-brand-green">
            <Globe className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Project Types
            </span>
          </div>
          <p className="font-medium text-text-primary">
            {data.projectTypes.length > 0
              ? `${data.projectTypes.length} selected`
              : "None selected"}
          </p>
          <p className="text-xs text-text-muted">
            {data.projectTypes.join(", ")}
          </p>
        </div>

        {/* Tech Stack */}
        <div className="rounded-lg border border-border-primary bg-bg-secondary p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-purple-500">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Technologies
            </span>
          </div>
          <p className="font-medium text-text-primary">
            {totalTechs > 0 ? `${totalTechs} selected` : "Skipped"}
          </p>
          <p className="text-xs text-text-muted">
            {totalTechs > 0
              ? "Custom stack configured"
              : "Will use smart defaults"}
          </p>
        </div>
      </motion.div>

      {/* What&apos;s next */}
      <motion.div
        className="mb-8 rounded-lg border border-dashed border-brand-orange/50 bg-brand-orange/5 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-2 font-mono text-sm font-medium text-brand-orange">
          What&apos;s next?
        </h3>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>🎯 Create your first architecture</li>
          <li>📚 Browse recommended templates</li>
          <li>⚙️ Adjust preferences anytime in settings</li>
        </ul>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="mb-4 text-sm text-text-muted">
          Click <strong className="text-text-secondary">Go to Dashboard</strong>{" "}
          to start building
        </p>
      </motion.div>
    </div>
  );
}
