"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ExperienceLevel, type OnboardingStep2 } from "@/lib/schema/onboarding";

// Extract type from const object
type ExperienceLevelType =
  (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

import { TECH_ECOSYSTEM } from "@/lib/tech-ecosystem";
import { cn } from "@/lib/utils";

// ============================================================================
// Component Props
// ============================================================================

interface Step2TechStackProps {
  initialData?: OnboardingStep2;
  smartDefaults?: Partial<OnboardingStep2>;
  onChange: (data: OnboardingStep2) => void;
}

// ============================================================================
// Experience Level Options
// ============================================================================

const EXPERIENCE_OPTIONS = [
  {
    id: ExperienceLevel.BEGINNER,
    label: "Beginner",
    description: "Learning the ropes",
  },
  {
    id: ExperienceLevel.INTERMEDIATE,
    label: "Intermediate",
    description: "Comfortable with basics",
  },
  {
    id: ExperienceLevel.ADVANCED,
    label: "Advanced",
    description: "Expert level",
  },
];

// ============================================================================
// Maximum Selections
// ============================================================================

const MAX_SELECTIONS = {
  cloudProviders: 3,
  languages: 3,
  frameworks: 3,
};

// ============================================================================
// Tech Item Component
// ============================================================================

interface TechItemProps {
  id: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function TechItem({
  id,
  label,
  icon,
  isSelected,
  onClick,
  disabled,
}: TechItemProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative p-3 border-2 flex flex-col items-center gap-2 transition-all duration-200",
        isSelected
          ? "border-brand-orange bg-brand-orange/5"
          : disabled
            ? "border-brand-charcoal/5 bg-brand-charcoal/5 opacity-40 cursor-not-allowed"
            : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
      )}
    >
      <Icon
        icon={icon}
        className={cn(
          "w-6 h-6",
          isSelected ? "text-brand-orange" : "text-brand-charcoal/60",
        )}
      />
      <span className="text-[10px] font-medium uppercase tracking-wide text-brand-charcoal dark:text-gray-300 text-center">
        {label}
      </span>

      {isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-brand-orange flex items-center justify-center">
          <Icon icon="lucide:check" className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function Step2TechStack({
  initialData,
  smartDefaults,
  onChange,
}: Step2TechStackProps) {
  // Get tech items by category
  const cloudProviders = TECH_ECOSYSTEM.filter((t) => t.category === "cloud");
  const languages = TECH_ECOSYSTEM.filter((t) => t.category === "backend");
  const frameworks = TECH_ECOSYSTEM.filter((t) => t.category === "frontend");

  // State
  const [selectedCloudProviders, setSelectedCloudProviders] = useState<
    string[]
  >(initialData?.cloudProviders || smartDefaults?.cloudProviders || []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialData?.languages || smartDefaults?.languages || [],
  );
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(
    initialData?.frameworks || smartDefaults?.frameworks || [],
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevelType>(
    initialData?.experienceLevel ||
      smartDefaults?.experienceLevel ||
      ExperienceLevel.INTERMEDIATE,
  );

  // Notify parent of changes
  useEffect(() => {
    onChange({
      cloudProviders: selectedCloudProviders,
      languages: selectedLanguages,
      frameworks: selectedFrameworks,
      experienceLevel,
    });
  }, [
    selectedCloudProviders,
    selectedLanguages,
    selectedFrameworks,
    experienceLevel,
    onChange,
  ]);

  // Toggle selection helper
  const toggleSelection = (
    id: string,
    selected: string[],
    setSelected: (val: string[]) => void,
    max: number,
  ) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else if (selected.length < max) {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
      {/* Smart Defaults Notice */}
      {(smartDefaults?.languages?.length ||
        smartDefaults?.cloudProviders?.length) && (
        <div className="bg-brand-orange/5 border border-brand-orange/20 p-3 flex items-start gap-3">
          <Icon
            icon="lucide:sparkles"
            className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-brand-charcoal dark:text-gray-200">
              We&apos;ve pre-selected technologies based on your role
            </p>
            <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 mt-1">
              Feel free to adjust these to match your preferences
            </p>
          </div>
        </div>
      )}

      {/* Experience Level */}
      <section>
        <h3 className="font-poppins font-semibold text-base text-brand-charcoal dark:text-gray-100 mb-1">
          Experience Level
        </h3>
        <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 mb-3">
          How would you describe your technical expertise?
        </p>

        <div className="flex gap-3">
          {EXPERIENCE_OPTIONS.map((level) => (
            <motion.button
              key={level.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setExperienceLevel(level.id)}
              className={cn(
                "flex-1 p-3 border-2 text-left transition-all duration-200",
                experienceLevel === level.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <div className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                {level.label}
              </div>
              <div className="text-[10px] text-brand-charcoal/50 dark:text-gray-500 mt-0.5">
                {level.description}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Cloud Providers */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-poppins font-semibold text-base text-brand-charcoal dark:text-gray-100">
            Cloud Providers
          </h3>
          <span className="text-[10px] font-mono text-brand-charcoal/40">
            {selectedCloudProviders.length}/{MAX_SELECTIONS.cloudProviders}
          </span>
        </div>
        <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 mb-3">
          Select up to {MAX_SELECTIONS.cloudProviders} providers you prefer
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {cloudProviders.map((provider) => (
            <TechItem
              key={provider.id}
              id={provider.id}
              label={provider.label}
              icon={provider.icon}
              isSelected={selectedCloudProviders.includes(provider.id)}
              disabled={
                !selectedCloudProviders.includes(provider.id) &&
                selectedCloudProviders.length >= MAX_SELECTIONS.cloudProviders
              }
              onClick={() =>
                toggleSelection(
                  provider.id,
                  selectedCloudProviders,
                  setSelectedCloudProviders,
                  MAX_SELECTIONS.cloudProviders,
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Programming Languages */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-poppins font-semibold text-base text-brand-charcoal dark:text-gray-100">
            Programming Languages
          </h3>
          <span className="text-[10px] font-mono text-brand-charcoal/40">
            {selectedLanguages.length}/{MAX_SELECTIONS.languages}
          </span>
        </div>
        <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 mb-3">
          Select up to {MAX_SELECTIONS.languages} languages you use
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {languages.slice(0, 18).map((lang) => (
            <TechItem
              key={lang.id}
              id={lang.id}
              label={lang.label}
              icon={lang.icon}
              isSelected={selectedLanguages.includes(lang.id)}
              disabled={
                !selectedLanguages.includes(lang.id) &&
                selectedLanguages.length >= MAX_SELECTIONS.languages
              }
              onClick={() =>
                toggleSelection(
                  lang.id,
                  selectedLanguages,
                  setSelectedLanguages,
                  MAX_SELECTIONS.languages,
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Frameworks */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-poppins font-semibold text-base text-brand-charcoal dark:text-gray-100">
            Frameworks
          </h3>
          <span className="text-[10px] font-mono text-brand-charcoal/40">
            {selectedFrameworks.length}/{MAX_SELECTIONS.frameworks}
          </span>
        </div>
        <p className="text-xs text-brand-charcoal/60 dark:text-gray-400 mb-3">
          Select up to {MAX_SELECTIONS.frameworks} frameworks (optional)
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {frameworks.slice(0, 18).map((framework) => (
            <TechItem
              key={framework.id}
              id={framework.id}
              label={framework.label}
              icon={framework.icon}
              isSelected={selectedFrameworks.includes(framework.id)}
              disabled={
                !selectedFrameworks.includes(framework.id) &&
                selectedFrameworks.length >= MAX_SELECTIONS.frameworks
              }
              onClick={() =>
                toggleSelection(
                  framework.id,
                  selectedFrameworks,
                  setSelectedFrameworks,
                  MAX_SELECTIONS.frameworks,
                )
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
