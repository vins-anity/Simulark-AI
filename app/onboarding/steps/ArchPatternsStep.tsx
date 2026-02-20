"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type OnboardingData } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

const ARCHITECTURE_PATTERNS = [
  {
    id: "monolith",
    label: "Monolithic",
    icon: "ph:cube-fill",
    description: "Unified codebase, simplified deployment",
  },
  {
    id: "microservices",
    label: "Microservices",
    icon: "ph:squares-four-fill",
    description: "Distributed services, high scalability",
  },
  {
    id: "serverless",
    label: "Serverless",
    icon: "ph:lightning-fill",
    description: "Event-driven, scale-to-zero compute",
  },
  {
    id: "event-driven",
    label: "Event Driven",
    icon: "ph:arrows-left-right-bold",
    description: "Asynchronous communication via brokers",
  },
  {
    id: "jamstack",
    label: "Jamstack",
    icon: "ph:layers-fill",
    description: "Pre-rendered static sites with APIs",
  },
  {
    id: "clean-arch",
    label: "Clean Arch",
    icon: "ph:circle-wavy-check-fill",
    description: "Separation of concerns, decoupled logic",
  },
];

interface ArchPatternsStepProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ArchPatternsStep({
  selected,
  onChange,
}: ArchPatternsStepProps) {
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((i) => i !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
            CFG-03
          </span>
          <span className="font-mono text-[10px] text-brand-charcoal/30">
            // Architecture Patterns
          </span>
        </div>
        <h2 className="font-poppins text-xl font-bold text-brand-charcoal md:text-2xl">
          Select Architecture Patterns
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60 max-w-lg mx-auto">
          Choose one or more patterns. Selecting both Monolith and Microservices
          favors a Modular Monolith approach.
        </p>
      </motion.div>

      {/* Patterns Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {ARCHITECTURE_PATTERNS.map((pattern) => {
          const isSelected = selected.includes(pattern.id);
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => toggleSelection(pattern.id)}
              className={cn(
                "group relative flex flex-col items-start p-4 border-2 transition-all duration-200 text-left h-full",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 bg-bg-secondary hover:border-brand-charcoal/30",
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center border transition-all duration-200",
                    isSelected
                      ? "border-brand-orange bg-brand-orange/10"
                      : "border-brand-charcoal/10 bg-bg-tertiary",
                  )}
                >
                  <Icon
                    icon={pattern.icon}
                    className={cn(
                      "w-5 h-5",
                      isSelected
                        ? "text-brand-orange"
                        : "text-brand-charcoal/70",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "font-mono text-xs font-bold uppercase tracking-wider",
                    isSelected ? "text-brand-orange" : "text-brand-charcoal",
                  )}
                >
                  {pattern.label}
                </span>
              </div>

              <p className="text-[11px] text-brand-charcoal/60 leading-relaxed mb-4">
                {pattern.description}
              </p>

              <div className="mt-auto pt-2 border-t border-brand-charcoal/5 w-full flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-widest",
                    isSelected ? "text-brand-orange" : "text-brand-charcoal/30",
                  )}
                >
                  {isSelected ? "[ SELECTED ]" : "[ SELECT ]"}
                </span>
                {isSelected && <Check className="w-3 h-3 text-brand-orange" />}
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* Tip */}
      <motion.div variants={itemVariants} className="mt-8 text-center">
        <p className="text-[10px] text-brand-charcoal/50 font-mono">
          <span className="text-brand-orange">NOTE:</span> These preferences act
          as strong "gravity" for the AI generator.
        </p>
      </motion.div>
    </motion.div>
  );
}
