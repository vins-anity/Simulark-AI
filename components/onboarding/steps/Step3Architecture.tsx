"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ApplicationType,
  ArchitecturePreference,
  type OnboardingStep1,
  type OnboardingStep3,
} from "@/lib/schema/onboarding";

// Extract types from const objects
type ArchitecturePreferenceEnum =
  (typeof ArchitecturePreference)[keyof typeof ArchitecturePreference];
type ApplicationTypeEnum =
  (typeof ApplicationType)[keyof typeof ApplicationType];

import { cn } from "@/lib/utils";

// ============================================================================
// Component Props
// ============================================================================

interface Step3ArchitectureProps {
  initialData?: OnboardingStep3;
  step1Data?: OnboardingStep1;
  onChange: (data: OnboardingStep3) => void;
}

// ============================================================================
// Architecture Options
// ============================================================================

const ARCHITECTURE_OPTIONS = [
  {
    id: ArchitecturePreference.MICROSERVICES,
    label: "Microservices",
    description: "Distributed services with independent deployments",
    icon: "lucide:boxes",
    bestFor: ["saas", "ecommerce", "enterprise"],
  },
  {
    id: ArchitecturePreference.SERVERLESS,
    label: "Serverless",
    description: "Event-driven functions, pay-per-use scaling",
    icon: "lucide:zap",
    bestFor: ["saas", "api-backend", "learning"],
  },
  {
    id: ArchitecturePreference.MONOLITH,
    label: "Monolithic",
    description: "Single unified codebase, simpler to start",
    icon: "lucide:square",
    bestFor: ["internal-tools", "learning", "solo"],
  },
  {
    id: ArchitecturePreference.EVENT_DRIVEN,
    label: "Event-Driven",
    description: "Asynchronous communication via events",
    icon: "lucide:activity",
    bestFor: ["data-pipeline", "ai-ml", "devops-infra"],
  },
  {
    id: ArchitecturePreference.JAMSTACK,
    label: "Jamstack",
    description: "Static sites with dynamic capabilities",
    icon: "lucide:layers",
    bestFor: ["content", "marketing", "blogs"],
  },
  {
    id: ArchitecturePreference.NOT_SURE,
    label: "Not Sure",
    description: "Let us recommend based on your use case",
    icon: "lucide:help-circle",
    bestFor: [],
  },
];

// ============================================================================
// Application Type Options
// ============================================================================

const APP_TYPE_OPTIONS = [
  {
    id: ApplicationType.WEB_APP,
    label: "Web Application",
    description: "Full-stack web app with frontend and backend",
    icon: "lucide:globe",
  },
  {
    id: ApplicationType.API,
    label: "API / Backend",
    description: "Headless API service only",
    icon: "lucide:webhook",
  },
  {
    id: ApplicationType.MOBILE,
    label: "Mobile Backend",
    description: "Backend for mobile applications",
    icon: "lucide:smartphone",
  },
  {
    id: ApplicationType.CLI,
    label: "CLI Tool",
    description: "Command-line interface tool",
    icon: "lucide:terminal",
  },
  {
    id: ApplicationType.MULTI_PLATFORM,
    label: "Multi-Platform",
    description: "Web, mobile, and API combined",
    icon: "lucide:layout",
  },
];

// ============================================================================
// Include Services Options
// ============================================================================

const INCLUDE_SERVICES = [
  {
    id: "auth",
    label: "Authentication",
    description: "User login and identity management",
    icon: "lucide:lock",
  },
  {
    id: "database",
    label: "Database",
    description: "Data persistence layer",
    icon: "lucide:database",
  },
  {
    id: "cdn",
    label: "CDN / Caching",
    description: "Content delivery and edge caching",
    icon: "lucide:cloud",
  },
  {
    id: "monitoring",
    label: "Monitoring",
    description: "Observability and alerting",
    icon: "lucide:activity",
  },
  {
    id: "cicd",
    label: "CI/CD Pipeline",
    description: "Automated deployment workflows",
    icon: "lucide:git-branch",
  },
];

// ============================================================================
// Main Component
// ============================================================================

export function Step3Architecture({
  initialData,
  step1Data,
  onChange,
}: Step3ArchitectureProps) {
  // State
  const [architecturePreference, setArchitecturePreference] = useState<
    ArchitecturePreferenceEnum | ""
  >(initialData?.architecturePreference || "");
  const [applicationType, setApplicationType] = useState<
    ApplicationTypeEnum | ""
  >(initialData?.applicationType || "");
  const [includeServices, setIncludeServices] = useState<
    OnboardingStep3["includeServices"]
  >(
    initialData?.includeServices || {
      auth: true,
      database: true,
      cdn: true,
      monitoring: false,
      cicd: false,
    },
  );

  // Smart default based on use case
  useEffect(() => {
    if (!architecturePreference && step1Data?.useCase) {
      const useCaseDefaults: Record<string, ArchitecturePreferenceEnum> = {
        saas: ArchitecturePreference.SERVERLESS,
        ecommerce: ArchitecturePreference.MICROSERVICES,
        "ai-ml": ArchitecturePreference.MICROSERVICES,
        "api-backend": ArchitecturePreference.SERVERLESS,
        "mobile-app": ArchitecturePreference.MICROSERVICES,
        "data-pipeline": ArchitecturePreference.EVENT_DRIVEN,
        "devops-infra": ArchitecturePreference.EVENT_DRIVEN,
        learning: ArchitecturePreference.NOT_SURE,
      };

      const defaultArch = useCaseDefaults[step1Data.useCase];
      if (defaultArch) {
        setArchitecturePreference(defaultArch);
      }
    }

    if (!applicationType && step1Data?.useCase) {
      const typeDefaults: Record<string, ApplicationTypeEnum> = {
        saas: ApplicationType.WEB_APP,
        ecommerce: ApplicationType.WEB_APP,
        "ai-ml": ApplicationType.API,
        "api-backend": ApplicationType.API,
        "mobile-app": ApplicationType.MOBILE,
        "data-pipeline": ApplicationType.API,
        "devops-infra": ApplicationType.MULTI_PLATFORM,
      };

      const defaultType = typeDefaults[step1Data.useCase];
      if (defaultType) {
        setApplicationType(defaultType);
      }
    }
  }, [step1Data, architecturePreference, applicationType]);

  // Notify parent of changes
  useEffect(() => {
    if (architecturePreference && applicationType) {
      onChange({
        architecturePreference,
        applicationType,
        includeServices,
      });
    }
  }, [architecturePreference, applicationType, includeServices, onChange]);

  const toggleService = (
    serviceId: keyof OnboardingStep3["includeServices"],
  ) => {
    setIncludeServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Architecture Preference */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          Preferred Architecture
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          What architectural style do you prefer?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ARCHITECTURE_OPTIONS.map((arch) => (
            <motion.button
              key={arch.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setArchitecturePreference(arch.id)}
              className={cn(
                "relative p-4 border-2 text-left transition-all duration-200",
                architecturePreference === arch.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon
                  icon={arch.icon}
                  className={cn(
                    "w-6 h-6",
                    architecturePreference === arch.id
                      ? "text-brand-orange"
                      : "text-brand-charcoal/50",
                  )}
                />
                <div>
                  <div className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                    {arch.label}
                  </div>
                  <div className="text-[10px] text-brand-charcoal/50 dark:text-gray-500 mt-0.5 leading-tight">
                    {arch.description}
                  </div>
                </div>
              </div>

              {architecturePreference === arch.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 bg-brand-orange flex items-center justify-center">
                    <Icon icon="lucide:check" className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Application Type */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          Application Type
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          What type of application are you building?
        </p>

        <div className="flex flex-wrap gap-2">
          {APP_TYPE_OPTIONS.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setApplicationType(type.id)}
              className={cn(
                "relative px-4 py-3 border-2 flex items-center gap-3 transition-all duration-200",
                applicationType === type.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <Icon
                icon={type.icon}
                className={cn(
                  "w-5 h-5",
                  applicationType === type.id
                    ? "text-brand-orange"
                    : "text-brand-charcoal/50",
                )}
              />
              <div className="text-left">
                <div className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                  {type.label}
                </div>
                <div className="text-[10px] text-brand-charcoal/50 dark:text-gray-500">
                  {type.description}
                </div>
              </div>

              {applicationType === type.id && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-brand-orange flex items-center justify-center">
                  <Icon icon="lucide:check" className="w-2 h-2 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Include Services */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          Include in Generations
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          Which components should we include in your architectures?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INCLUDE_SERVICES.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                toggleService(
                  service.id as keyof OnboardingStep3["includeServices"],
                )
              }
              className={cn(
                "relative p-3 border-2 flex items-center gap-3 transition-all duration-200 text-left",
                includeServices[
                  service.id as keyof OnboardingStep3["includeServices"]
                ]
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <Icon
                icon={service.icon}
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  includeServices[
                    service.id as keyof OnboardingStep3["includeServices"]
                  ]
                    ? "text-brand-orange"
                    : "text-brand-charcoal/50",
                )}
              />
              <div>
                <div className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                  {service.label}
                </div>
                <div className="text-[10px] text-brand-charcoal/50 dark:text-gray-500">
                  {service.description}
                </div>
              </div>

              <div
                className={cn(
                  "absolute top-2 right-2 w-4 h-4 border flex items-center justify-center transition-colors",
                  includeServices[
                    service.id as keyof OnboardingStep3["includeServices"]
                  ]
                    ? "bg-brand-orange border-brand-orange"
                    : "border-brand-charcoal/30",
                )}
              >
                {includeServices[
                  service.id as keyof OnboardingStep3["includeServices"]
                ] && (
                  <Icon icon="lucide:check" className="w-3 h-3 text-white" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
