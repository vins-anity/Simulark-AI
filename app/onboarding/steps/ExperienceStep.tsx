"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPERIENCE_LEVEL_OPTIONS } from "../types";

interface ExperienceStepProps {
  value?: "beginner" | "intermediate" | "expert";
  onChange: (value: "beginner" | "intermediate" | "expert") => void;
}

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Question */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-3 font-mono text-2xl font-bold text-text-primary md:text-3xl">
          What&apos;s your experience level?
        </h2>
        <p className="text-text-secondary">
          We&apos;ll tailor architecture recommendations based on your expertise
        </p>
      </motion.div>

      {/* Options */}
      <div className="space-y-4">
        {EXPERIENCE_LEVEL_OPTIONS.map((option, index) => {
          const isSelected = value === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() =>
                onChange(option.id as "beginner" | "intermediate" | "expert")
              }
              className={cn(
                "relative w-full rounded-lg border-2 p-6 text-left transition-all duration-200",
                "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-border-primary bg-bg-secondary hover:border-border-secondary",
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-2xl">
                  {option.icon}
                </span>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-mono text-lg font-semibold text-text-primary">
                      {option.name}
                    </h3>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-white"
                      >
                        <Check className="h-3 w-3" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute inset-y-0 left-0 w-1 bg-brand-orange"
                  layoutId="experience-indicator"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      <motion.p
        className="mt-6 text-center text-sm text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Don&apos;t worry, you can change this later in your profile settings
      </motion.p>
    </div>
  );
}
