"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  type OnboardingStep1,
  TeamSize,
  UseCase,
  UserRole,
} from "@/lib/schema/onboarding";

// Extract types from const objects
type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
type UseCaseType = (typeof UseCase)[keyof typeof UseCase];
type TeamSizeType = (typeof TeamSize)[keyof typeof TeamSize];

import { cn } from "@/lib/utils";

// ============================================================================
// Role Options Configuration
// ============================================================================

const ROLE_OPTIONS = [
  {
    id: UserRole.SOFTWARE_ENGINEER,
    label: "Software Engineer",
    description: "Building applications and features",
    icon: "lucide:code-2",
  },
  {
    id: UserRole.DEVOPS_ENGINEER,
    label: "DevOps Engineer",
    description: "Managing infrastructure and deployments",
    icon: "lucide:server",
  },
  {
    id: UserRole.ARCHITECT,
    label: "Solution Architect",
    description: "Designing system architectures",
    icon: "lucide:layout-grid",
  },
  {
    id: UserRole.PRODUCT_MANAGER,
    label: "Product Manager",
    description: "Planning and strategy",
    icon: "lucide:target",
  },
  {
    id: UserRole.STUDENT,
    label: "Student",
    description: "Learning and exploring",
    icon: "lucide:graduation-cap",
  },
  {
    id: UserRole.HOBBYIST,
    label: "Hobbyist",
    description: "Side projects and experiments",
    icon: "lucide:sparkles",
  },
  {
    id: UserRole.OTHER,
    label: "Other",
    description: "Something else",
    icon: "lucide:user",
  },
];

// ============================================================================
// Use Case Options Configuration
// ============================================================================

const USE_CASE_OPTIONS = [
  {
    id: UseCase.SAAS,
    label: "SaaS Application",
    description: "Multi-tenant web application",
    icon: "lucide:cloud",
  },
  {
    id: UseCase.ECOMMERCE,
    label: "E-Commerce",
    description: "Online store or marketplace",
    icon: "lucide:shopping-cart",
  },
  {
    id: UseCase.AI_ML,
    label: "AI / ML Application",
    description: "Intelligent apps with LLMs or ML",
    icon: "lucide:brain",
  },
  {
    id: UseCase.API_BACKEND,
    label: "API / Backend",
    description: "REST or GraphQL API service",
    icon: "lucide:webhook",
  },
  {
    id: UseCase.MOBILE_APP,
    label: "Mobile Application",
    description: "iOS or Android app backend",
    icon: "lucide:smartphone",
  },
  {
    id: UseCase.DATA_PIPELINE,
    label: "Data Pipeline",
    description: "ETL or stream processing",
    icon: "lucide:database",
  },
  {
    id: UseCase.DEVOPS_INFRA,
    label: "DevOps / Infrastructure",
    description: "Infrastructure and tooling",
    icon: "lucide:settings",
  },
  {
    id: UseCase.INTERNAL_TOOLS,
    label: "Internal Tools",
    description: "Company dashboards and tools",
    icon: "lucide:briefcase",
  },
  {
    id: UseCase.LEARNING,
    label: "Learning / Experimenting",
    description: "Just exploring possibilities",
    icon: "lucide:book-open",
  },
  {
    id: UseCase.OTHER,
    label: "Other",
    description: "Something different",
    icon: "lucide:help-circle",
  },
];

// ============================================================================
// Team Size Options
// ============================================================================

const TEAM_SIZE_OPTIONS = [
  { id: TeamSize.SOLO, label: "Just me", icon: "lucide:user" },
  { id: TeamSize.SMALL, label: "Small (2-10)", icon: "lucide:users" },
  { id: TeamSize.MEDIUM, label: "Medium (11-50)", icon: "lucide:building" },
  {
    id: TeamSize.ENTERPRISE,
    label: "Enterprise (50+)",
    icon: "lucide:landmark",
  },
];

// ============================================================================
// Component Props
// ============================================================================

interface Step1RoleUseCaseProps {
  initialData?: OnboardingStep1;
  onChange: (data: OnboardingStep1) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function Step1RoleUseCase({
  initialData,
  onChange,
}: Step1RoleUseCaseProps) {
  const [selectedRole, setSelectedRole] = useState<UserRoleType | "">(
    initialData?.role || "",
  );
  const [selectedUseCase, setSelectedUseCase] = useState<UseCaseType | "">(
    initialData?.useCase || "",
  );
  const [selectedTeamSize, setSelectedTeamSize] = useState<TeamSizeType | "">(
    initialData?.teamSize || "",
  );

  // Notify parent of changes
  useEffect(() => {
    if (selectedRole && selectedUseCase && selectedTeamSize) {
      onChange({
        role: selectedRole,
        useCase: selectedUseCase,
        teamSize: selectedTeamSize,
      });
    }
  }, [selectedRole, selectedUseCase, selectedTeamSize, onChange]);

  return (
    <div className="space-y-8">
      {/* Role Selection */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          What best describes you?
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          This helps us tailor our recommendations
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ROLE_OPTIONS.map((role) => (
            <motion.button
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "relative p-4 border-2 text-left transition-all duration-200",
                selectedRole === role.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon
                  icon={role.icon}
                  className={cn(
                    "w-6 h-6",
                    selectedRole === role.id
                      ? "text-brand-orange"
                      : "text-brand-charcoal/50",
                  )}
                />
                <div>
                  <div className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                    {role.label}
                  </div>
                  <div className="text-[10px] text-brand-charcoal/50 dark:text-gray-500 mt-0.5">
                    {role.description}
                  </div>
                </div>
              </div>

              {selectedRole === role.id && (
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

      {/* Use Case Selection */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          What are you building?
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          Select your primary use case
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {USE_CASE_OPTIONS.map((useCase) => (
            <motion.button
              key={useCase.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedUseCase(useCase.id)}
              className={cn(
                "relative p-3 border-2 text-left transition-all duration-200",
                selectedUseCase === useCase.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon
                  icon={useCase.icon}
                  className={cn(
                    "w-5 h-5",
                    selectedUseCase === useCase.id
                      ? "text-brand-orange"
                      : "text-brand-charcoal/50",
                  )}
                />
                <div>
                  <div className="font-medium text-xs text-brand-charcoal dark:text-gray-200">
                    {useCase.label}
                  </div>
                </div>
              </div>

              {selectedUseCase === useCase.id && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-3 h-3 bg-brand-orange flex items-center justify-center">
                    <Icon icon="lucide:check" className="w-2 h-2 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Team Size Selection */}
      <section>
        <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100 mb-1">
          Team Size
        </h3>
        <p className="text-sm text-brand-charcoal/60 dark:text-gray-400 mb-4">
          How large is your team?
        </p>

        <div className="flex flex-wrap gap-3">
          {TEAM_SIZE_OPTIONS.map((size) => (
            <motion.button
              key={size.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTeamSize(size.id)}
              className={cn(
                "relative px-4 py-2 border-2 flex items-center gap-2 transition-all duration-200",
                selectedTeamSize === size.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white dark:bg-zinc-800",
              )}
            >
              <Icon
                icon={size.icon}
                className={cn(
                  "w-4 h-4",
                  selectedTeamSize === size.id
                    ? "text-brand-orange"
                    : "text-brand-charcoal/50",
                )}
              />
              <span className="font-medium text-sm text-brand-charcoal dark:text-gray-200">
                {size.label}
              </span>

              {selectedTeamSize === size.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange flex items-center justify-center">
                  <Icon icon="lucide:check" className="w-2 h-2 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
