"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { TECH_STACK_OPTIONS, type OnboardingData } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
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

const SECTIONS = [
  { id: "cloud", title: "Cloud / Hosting", color: "text-sky-600" },
  { id: "languages", title: "Languages", color: "text-amber-600" },
  { id: "frameworks", title: "Frameworks", color: "text-emerald-600" },
] as const;

interface TechStackStepProps {
  data: OnboardingData["techStack"];
  onChange: (value: OnboardingData["techStack"]) => void;
  projectType?: string;
}

export function TechStackStep({
  data,
  onChange,
  projectType,
}: TechStackStepProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "cloud",
    "languages",
  ]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const toggleTech = (
    category: keyof OnboardingData["techStack"],
    techId: string,
  ) => {
    const current = data[category];
    const updated = current.includes(techId)
      ? current.filter((id) => id !== techId)
      : [...current, techId];

    onChange({
      ...data,
      [category]: updated,
    });
  };

  const applySmartDefaults = () => {
    // Smart defaults based on project type
    const defaults: Record<string, Partial<OnboardingData["techStack"]>> = {
      saas: {
        cloud: ["vercel", "aws"],
        languages: ["typescript", "python"],
        frameworks: ["nextjs", "react"],
      },
      api: {
        cloud: ["aws", "railway"],
        languages: ["go", "python", "typescript"],
        frameworks: ["fastapi", "gin", "express"],
      },
      mobile: {
        cloud: ["aws", "firebase"],
        languages: ["typescript"],
        frameworks: ["react", "nextjs"],
      },
      ai: {
        cloud: ["aws", "gcp"],
        languages: ["python", "typescript"],
        frameworks: ["fastapi", "django"],
      },
    };

    const defaultStack = projectType ? defaults[projectType] : defaults.saas;
    onChange({
      cloud: defaultStack?.cloud || [],
      languages: defaultStack?.languages || [],
      frameworks: defaultStack?.frameworks || [],
    });
  };

  const hasSelections = Object.values(data).some((arr) => arr.length > 0);
  const totalSelections = Object.values(data).flat().length;

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
            CFG-01
          </span>
          <span className="font-mono text-[10px] text-brand-charcoal/30">
            // Technology Stack
          </span>
        </div>
        <h2 className="font-poppins text-xl font-bold text-brand-charcoal md:text-2xl">
          What technologies do you prefer?
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          Select your preferred stack. We&apos;ll use these for recommendations.
        </p>
      </motion.div>

      {/* Smart Defaults Button */}
      <motion.div variants={itemVariants} className="mb-4">
        <button
          onClick={applySmartDefaults}
          className="group flex items-center gap-2 border border-brand-orange/30 bg-brand-orange/5 px-3 py-1.5 hover:bg-brand-orange/10 transition-colors"
        >
          <Wand2 className="h-3.5 w-3.5 text-brand-orange" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-brand-orange">
            Smart Defaults
          </span>
        </button>
      </motion.div>

      {/* Sections */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const techs = TECH_STACK_OPTIONS[section.id];
          const selectedCount = data[section.id as keyof typeof data].length;

          return (
            <motion.div
              key={section.id}
              variants={itemVariants}
              className="border border-brand-charcoal/10 bg-bg-secondary overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3
                    className={cn(
                      "font-mono text-sm font-semibold uppercase tracking-wider",
                      section.color,
                    )}
                  >
                    {section.title}
                  </h3>
                  {selectedCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center border border-brand-orange/30 bg-brand-orange/10 px-1.5 font-mono text-[10px] text-brand-orange">
                      {selectedCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-brand-charcoal/40" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-brand-charcoal/40" />
                  )}
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-brand-charcoal/10 p-4">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {techs.map((tech, idx) => {
                          const isSelected = data[
                            section.id as keyof typeof data
                          ].includes(tech.id);

                          return (
                            <motion.button
                              key={tech.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              onClick={() =>
                                toggleTech(
                                  section.id as keyof typeof data,
                                  tech.id,
                                )
                              }
                              className={cn(
                                "flex items-center gap-2 border p-3 text-left transition-all",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                                isSelected
                                  ? "border-brand-orange bg-brand-orange/5"
                                  : "border-brand-charcoal/10 bg-bg-tertiary/30 hover:border-brand-charcoal/30",
                              )}
                            >
                              <Icon
                                icon={tech.icon}
                                className="h-5 w-5 shrink-0"
                              />
                              <span className="flex-1 text-xs font-medium uppercase tracking-wide truncate">
                                {tech.name}
                              </span>
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 shrink-0 text-brand-orange" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Summary */}
      <AnimatePresence>
        {hasSelections && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 border border-brand-orange/20 bg-brand-orange/5 p-3"
          >
            <div className="flex items-center gap-2 text-brand-orange">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase tracking-wider">
                {totalSelections} Selected
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip hint */}
      <motion.p
        variants={itemVariants}
        className="mt-4 text-center text-xs text-brand-charcoal/40 font-mono"
      >
        Skip to use AI-recommended defaults
      </motion.p>
    </motion.div>
  );
}
