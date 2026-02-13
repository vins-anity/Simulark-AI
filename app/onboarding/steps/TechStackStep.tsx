"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type OnboardingData, TECH_STACK_OPTIONS } from "../types";

interface TechStackStepProps {
  value: OnboardingData["techStack"];
  onChange: (value: OnboardingData["techStack"]) => void;
}

const SECTIONS = [
  { id: "frontend", title: "Frontend", color: "text-brand-blue" },
  { id: "backend", title: "Backend", color: "text-brand-green" },
  { id: "database", title: "Database", color: "text-brand-orange" },
  { id: "auth", title: "Authentication", color: "text-purple-500" },
  { id: "cloud", title: "Cloud / Hosting", color: "text-cyan-500" },
] as const;

export function TechStackStep({ value, onChange }: TechStackStepProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "frontend",
    "backend",
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
    const current = value[category];
    const updated = current.includes(techId)
      ? current.filter((id) => id !== techId)
      : [...current, techId];

    onChange({
      ...value,
      [category]: updated,
    });
  };

  const hasSelections = Object.values(value).some((arr) => arr.length > 0);

  const skipStep = () => {
    onChange({
      frontend: [],
      backend: [],
      database: [],
      auth: [],
      cloud: [],
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-3 font-mono text-2xl font-bold text-text-primary md:text-3xl">
          What technologies do you prefer?
        </h2>
        <p className="text-text-secondary">
          Select your preferred tech stack. We&apos;ll use these for
          recommendations.
        </p>
      </motion.div>

      {/* Skip option */}
      <motion.div
        className="mb-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={skipStep}
          className="font-mono text-text-muted hover:text-text-secondary"
        >
          Skip for now
        </Button>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section, sectionIndex) => {
          const isExpanded = expandedSections.includes(section.id);
          const techs =
            TECH_STACK_OPTIONS[section.id as keyof typeof TECH_STACK_OPTIONS];
          const selectedCount =
            value[section.id as keyof OnboardingData["techStack"]].length;

          return (
            <motion.div
              key={section.id}
              className="overflow-hidden rounded-lg border border-border-primary bg-bg-secondary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-bg-tertiary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h3
                    className={cn(
                      "font-mono text-lg font-semibold",
                      section.color,
                    )}
                  >
                    {section.title}
                  </h3>
                  {selectedCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-xs text-white">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-text-muted" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-text-muted" />
                )}
              </button>

              {/* Section Content */}
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? "auto" : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border-primary p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {techs.map((tech) => {
                      const isSelected = value[
                        section.id as keyof OnboardingData["techStack"]
                      ].includes(tech.id);

                      return (
                        <motion.button
                          key={tech.id}
                          onClick={() =>
                            toggleTech(
                              section.id as keyof OnboardingData["techStack"],
                              tech.id,
                            )
                          }
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-3 text-left transition-all",
                            "hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                            isSelected
                              ? "border-brand-orange bg-brand-orange/5"
                              : "border-border-secondary bg-bg-tertiary/50 hover:bg-bg-tertiary",
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-lg">{tech.icon}</span>
                          <span className="flex-1 text-sm font-medium text-text-primary">
                            {tech.name}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-brand-orange" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {hasSelections && (
        <motion.div
          className="mt-6 rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-2 text-brand-orange">
            <Sparkles className="h-4 w-4" />
            <span className="font-mono text-sm font-medium">
              Your tech stack
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(value)
              .flatMap(([category, techs]) =>
                techs.map((techId) => {
                  const tech = TECH_STACK_OPTIONS[
                    category as keyof typeof TECH_STACK_OPTIONS
                  ]?.find((t) => t.id === techId);
                  return tech ? { ...tech, category } : null;
                }),
              )
              .filter(Boolean)
              .map((tech) => (
                <span
                  key={tech!.id}
                  className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-3 py-1 text-xs"
                >
                  <span>{tech!.icon}</span>
                  <span className="text-text-secondary">{tech!.name}</span>
                </span>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
