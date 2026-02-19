"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EXPERIENCE_LEVEL_OPTIONS,
  type OnboardingData,
  PROJECT_TYPE_OPTIONS,
  TEAM_CONTEXT_OPTIONS,
} from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface ProfileStepProps {
  data: Pick<OnboardingData, "experienceLevel" | "projectType" | "teamContext">;
  onChange: (updates: Partial<OnboardingData>) => void;
}

export function ProfileStep({ data, onChange }: ProfileStepProps) {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
            INT-01
          </span>
          <span className="font-mono text-[10px] text-brand-charcoal/30">
            // Profile & Intent
          </span>
        </div>
        <h2 className="font-poppins text-xl font-bold text-brand-charcoal md:text-2xl">
          Who are you building for?
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          We&apos;ll tailor architecture recommendations based on your context.
        </p>
      </motion.div>

      {/* Experience Level */}
      <motion.div variants={itemVariants} className="mb-8">
        <label className="block mb-3 font-mono text-xs uppercase tracking-widest text-brand-charcoal/70">
          Experience Level
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXPERIENCE_LEVEL_OPTIONS.map((option) => {
            const isSelected = data.experienceLevel === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange({ experienceLevel: option.id })}
                className={cn(
                  "relative text-left border-2 p-4 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-brand-charcoal/10 bg-bg-secondary hover:border-brand-charcoal/30",
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="exp-indicator"
                    className="absolute inset-y-0 left-0 w-0.5 bg-brand-orange"
                  />
                )}

                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center border",
                      isSelected
                        ? "border-brand-orange bg-brand-orange/10"
                        : "border-brand-charcoal/10 bg-bg-tertiary",
                    )}
                  >
                    <Icon
                      icon={option.icon}
                      className="h-5 w-5 text-brand-charcoal"
                      aria-hidden
                    />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-brand-charcoal">
                        {option.name}
                      </h3>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-brand-orange" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-brand-charcoal/60 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Project Type */}
      <motion.div variants={itemVariants} className="mb-8">
        <label className="block mb-3 font-mono text-xs uppercase tracking-widest text-brand-charcoal/70">
          Primary Project Type
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECT_TYPE_OPTIONS.map((option) => {
            const isSelected = data.projectType === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange({ projectType: option.id })}
                className={cn(
                  "relative flex items-center gap-3 border-2 p-4 text-left transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-brand-charcoal/10 bg-bg-secondary hover:border-brand-charcoal/30",
                )}
              >
                <span className="text-2xl">
                  <Icon
                    icon={option.icon}
                    className="h-6 w-6 text-brand-charcoal"
                  />
                </span>
                <div className="flex-1">
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-brand-charcoal">
                    {option.name}
                  </h3>
                  <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-wide">
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <motion.div
                    layoutId="project-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Team Context */}
      <motion.div variants={itemVariants}>
        <label className="block mb-2 font-mono text-xs uppercase tracking-widest text-brand-charcoal/70">
          Team Context
        </label>
        <div className="flex flex-wrap gap-2">
          {TEAM_CONTEXT_OPTIONS.map((option) => {
            const isSelected = data.teamContext === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onChange({ teamContext: option.id })}
                className={cn(
                  "relative flex items-center gap-2 border-2 px-4 py-3 transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-brand-charcoal/10 bg-bg-secondary hover:border-brand-charcoal/30",
                )}
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-charcoal">
                  {option.name}
                </span>
                <span className="text-[10px] text-brand-charcoal/50">
                  {option.description}
                </span>
                {isSelected && (
                  <span className="ml-1 font-mono text-[10px] text-brand-orange">
                    [SELECTED]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        variants={itemVariants}
        className="mt-5 text-center text-xs text-brand-charcoal/40 font-mono"
      >
        These preferences can be adjusted later in Settings
      </motion.p>
    </motion.div>
  );
}
