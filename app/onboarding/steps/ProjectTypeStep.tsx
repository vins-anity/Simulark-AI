"use client";

import { motion } from "framer-motion";
import { Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_TYPE_OPTIONS } from "../types";

interface ProjectTypeStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ProjectTypeStep({ value, onChange }: ProjectTypeStepProps) {
  const toggleProjectType = (typeId: string) => {
    const updated = value.includes(typeId)
      ? value.filter((id) => id !== typeId)
      : [...value, typeId];
    onChange(updated);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-3 font-mono text-2xl font-bold text-text-primary md:text-3xl">
          What types of projects do you build?
        </h2>
        <p className="text-text-secondary">
          Select all that apply. We&apos;ll prioritize these in your
          recommendations.
        </p>
      </motion.div>

      {/* Selection count */}
      {value.length > 0 && (
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-2 font-mono text-sm text-brand-orange">
            <Layers className="h-4 w-4" />
            {value.length} project type{value.length !== 1 ? "s" : ""} selected
          </span>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECT_TYPE_OPTIONS.map((option, index) => {
          const isSelected = value.includes(option.id);

          return (
            <motion.button
              key={option.id}
              onClick={() => toggleProjectType(option.id)}
              className={cn(
                "relative flex flex-col items-center rounded-lg border-2 p-6 text-center transition-all",
                "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-border-primary bg-bg-secondary hover:border-border-secondary",
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection checkmark */}
              {isSelected && (
                <motion.div
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              )}

              {/* Icon */}
              <span className="mb-3 text-4xl">{option.icon}</span>

              {/* Name */}
              <h3 className="mb-1 font-mono text-lg font-semibold text-text-primary">
                {option.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-muted">{option.description}</p>

              {/* Bottom indicator */}
              {isSelected && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-orange"
                  layoutId="project-indicator"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Validation hint */}
      {value.length === 0 && (
        <motion.p
          className="mt-6 text-center text-sm text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Select at least one project type to continue
        </motion.p>
      )}
    </div>
  );
}
