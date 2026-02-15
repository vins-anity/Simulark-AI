"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { GENERATION_MODE_OPTIONS, type OnboardingData } from "../types";

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

interface ModeStepProps {
  value?: OnboardingData["defaultMode"];
  onChange: (value: OnboardingData["defaultMode"]) => void;
}

export function ModeStep({ value, onChange }: ModeStepProps) {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
            MOD-01
          </span>
          <span className="font-mono text-[10px] text-brand-charcoal/30">
            // Generation Mode
          </span>
        </div>
        <h2 className="font-poppins text-xl font-bold text-brand-charcoal md:text-2xl">
          Choose Your Default Mode
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60 max-w-lg mx-auto">
          This determines the default complexity level for generated architectures.
        </p>
      </motion.div>

      {/* Mode Cards */}
      <motion.div variants={itemVariants} className="grid gap-3 md:grid-cols-3">
        {GENERATION_MODE_OPTIONS.map((mode) => {
          const isSelected = value === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={cn(
                "group relative flex flex-col border-2 p-4 text-left transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 bg-bg-secondary hover:border-brand-charcoal/30",
              )}
            >
              {/* Badge */}
              <span
                className={cn(
                  "absolute -top-2 right-4 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5",
                  isSelected
                    ? "bg-brand-orange text-white"
                    : "bg-brand-charcoal/10 text-brand-charcoal/60",
                )}
              >
                {mode.badge}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="mode-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-orange"
                />
              )}

              {/* Icon & Title */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center border",
                    isSelected
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-brand-charcoal/10 bg-bg-tertiary",
                  )}
                >
                  <Icon
                    icon={mode.icon}
                    className="h-5 w-5 text-brand-charcoal"
                  />
                </span>
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-brand-charcoal">
                    {mode.name}
                  </h3>
                  <p className="text-[10px] text-brand-charcoal/50">
                    {mode.detail}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-3 text-xs text-brand-charcoal/70 leading-relaxed">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="mt-auto space-y-1.5">
                {mode.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-[10px] text-brand-charcoal/60"
                  >
                    <Check
                      className={cn(
                        "h-3 w-3 shrink-0",
                        isSelected
                          ? "text-brand-orange"
                          : "text-brand-charcoal/30",
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Selection bracket */}
              <div className="mt-3 pt-2 border-t border-brand-charcoal/10">
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    isSelected ? "text-brand-orange" : "text-brand-charcoal/30",
                  )}
                >
                  {isSelected ? "[ SELECTED ]" : "[ SELECT ]"}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Recommendation hint */}
      <motion.div variants={itemVariants} className="mt-6 text-center">
        <p className="text-[10px] text-brand-charcoal/50 font-mono">
          <span className="text-brand-orange">TIP:</span> Start with{" "}
          <strong className="text-brand-charcoal/70">Standard</strong> for most projects
        </p>
      </motion.div>
    </motion.div>
  );
}
