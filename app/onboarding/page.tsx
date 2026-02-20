"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  completeOnboarding,
  getOnboardingStatus,
  saveOnboardingProgress,
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { ResetOnboardingModal } from "./components/ResetOnboardingModal";
import { ArchPatternsStep } from "./steps/ArchPatternsStep";
import { CompleteStep } from "./steps/CompleteStep";
import { ModeStep } from "./steps/ModeStep";
import { ProfileStep } from "./steps/ProfileStep";
import { TechStackStep } from "./steps/TechStackStep";
import { WelcomeStep } from "./steps/WelcomeStep";
import {
  ONBOARDING_STEPS,
  type OnboardingData,
  type OnboardingStepId,
} from "./types";

// ============================================================================
// Animation Variants
// ============================================================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const contentVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 40 : -40,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

// ============================================================================
// Main Component
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    techStack: {
      cloud: [],
      languages: [],
      frameworks: [],
    },
  });

  // Load saved progress from sessionStorage and check onboarding status
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const status = await getOnboardingStatus();
        if (!status.success) {
          console.error("Failed to get onboarding status:", status.error);
          return;
        }

        // Redirect if onboarding not needed
        if (!status.data?.needsOnboarding) {
          router.push("/dashboard");
          return;
        }

        // Load from sessionStorage
        const savedData = sessionStorage.getItem("onboarding_data");
        const savedStep = sessionStorage.getItem("onboarding_step");

        if (savedData) {
          setData(JSON.parse(savedData));
        }

        if (savedStep) {
          const stepIndex = parseInt(savedStep, 10);
          if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
            setCurrentStepIndex(stepIndex);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [router]);

  // Save progress to sessionStorage whenever data or step changes
  useEffect(() => {
    if (!isLoading) {
      sessionStorage.setItem("onboarding_data", JSON.stringify(data));
      sessionStorage.setItem("onboarding_step", currentStepIndex.toString());
    }
  }, [data, currentStepIndex, isLoading]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const progressPercent =
    ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async () => {
    if (isLastStep) {
      // Complete onboarding
      setIsSaving(true);
      try {
        // Map to valid schema values
        const roleMap: Record<string, string> = {
          beginner: "student",
          intermediate: "software-engineer",
          expert: "architect",
        };

        const useCaseMap: Record<string, string> = {
          saas: "saas",
          api: "api-backend",
          mobile: "mobile-app",
          ecommerce: "ecommerce",
          ai: "ai-ml",
          data: "data-pipeline",
          "api-backend": "api-backend",
          "mobile-app": "mobile-app",
          "ai-ml": "ai-ml",
          "data-pipeline": "data-pipeline",
        };

        const experienceLevelMap: Record<string, string> = {
          beginner: "beginner",
          intermediate: "intermediate",
          expert: "advanced",
        };

        const result = await completeOnboarding({
          step1: {
            role:
              roleMap[data.experienceLevel || "intermediate"] ||
              "software-engineer",
            useCase: useCaseMap[data.projectType || "saas"] || "saas",
            teamSize: data.teamContext || "small",
          },
          step2: {
            cloudProviders: data.techStack.cloud,
            languages: [...data.techStack.languages],
            frameworks: data.techStack.frameworks,
            experienceLevel: experienceLevelMap[
              data.experienceLevel || "intermediate"
            ] as "beginner" | "intermediate" | "advanced",
          },
          step3: {
            architecturePreferences:
              data.architecturePreferences &&
              data.architecturePreferences.length > 0
                ? data.architecturePreferences
                : [
                    data.defaultMode === "enterprise"
                      ? "microservices"
                      : data.defaultMode === "startup"
                        ? "serverless"
                        : "not-sure",
                  ],
            applicationType:
              data.projectType === "api" || data.projectType === "mobile"
                ? data.projectType
                : "web-app",
            includeServices: {
              auth: true,
              database: true,
              cdn:
                data.techStack.cloud.includes("vercel") ||
                data.techStack.cloud.includes("aws") ||
                data.techStack.cloud.includes("cloudflare"),
              monitoring: data.defaultMode === "enterprise",
              cicd: data.defaultMode === "enterprise",
            },
            defaultArchitectureMode: data.defaultMode,
          },
        });

        if (result.success) {
          sessionStorage.removeItem("onboarding_data");
          sessionStorage.removeItem("onboarding_step");
          router.push("/dashboard");
        } else {
          console.error("Failed to complete onboarding:", result.error);
        }
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Save progress to server for non-final steps
    if (
      currentStepIndex > 0 &&
      currentStepIndex < ONBOARDING_STEPS.length - 1
    ) {
      setIsSaving(true);
      try {
        await saveOnboardingProgress({
          step: currentStepIndex,
          data: getStepDataForServer(currentStep.id, data),
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      } finally {
        setIsSaving(false);
      }
    }

    setDirection(1);
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isFirstStep) return;
    setDirection(-1);
    setCurrentStepIndex((prev) => prev - 1);
  };

  const handleSkipStep = async () => {
    // For specific steps, we might want to save default state before moving on
    if (
      currentStep.id === "profile" ||
      currentStep.id === "techstack" ||
      currentStep.id === "archpatterns"
    ) {
      setIsSaving(true);
      try {
        await saveOnboardingProgress({
          step: currentStepIndex,
          data: getStepDataForServer(currentStep.id, data),
        });
      } catch (error) {
        console.error("Failed to save skip progress:", error);
      } finally {
        setIsSaving(false);
      }
    }

    setDirection(1);
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleExitFlow = async () => {
    setShowSkipModal(false);
    setIsSaving(true);
    try {
      const { skipOnboarding } = await import("@/actions/onboarding");
      await skipOnboarding();
      sessionStorage.removeItem("onboarding_data");
      sessionStorage.removeItem("onboarding_step");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to exit onboarding:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case "welcome":
        return true;
      case "profile":
        return !!(data.experienceLevel && data.projectType && data.teamContext);
      case "techstack":
        return (
          data.techStack.cloud.length > 0 &&
          data.techStack.languages.length > 0 &&
          data.techStack.frameworks.length > 0
        );
      case "archpatterns":
        return (data.architecturePreferences?.length || 0) > 0;
      case "mode":
        return !!data.defaultMode;
      case "complete":
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case "welcome":
        return <WelcomeStep />;
      case "profile":
        return (
          <ProfileStep
            data={{
              experienceLevel: data.experienceLevel,
              projectType: data.projectType,
              teamContext: data.teamContext,
            }}
            onChange={updateData}
          />
        );
      case "techstack":
        return (
          <TechStackStep
            data={data.techStack}
            onChange={(techStack) => updateData({ techStack })}
            projectType={data.projectType}
          />
        );
      case "archpatterns":
        return (
          <ArchPatternsStep
            selected={data.architecturePreferences || []}
            onChange={(architecturePreferences) =>
              updateData({ architecturePreferences })
            }
          />
        );
      case "mode":
        return (
          <ModeStep
            value={data.defaultMode}
            onChange={(defaultMode) => updateData({ defaultMode })}
          />
        );
      case "complete":
        return <CompleteStep data={data} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-charcoal/20 border-t-brand-orange animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/50">
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-bg-primary"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Progress Header - Living Blueprint Style */}
      <header className="sticky top-0 z-50 border-b border-brand-charcoal/10 bg-bg-secondary/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-3">
          {/* Top row: Badge + Title */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
                {currentStep.badge}
              </span>
              <span className="font-mono text-[10px] text-brand-charcoal/30">
                // {currentStep.shortTitle}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
              STEP {currentStepIndex + 1} OF {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-brand-charcoal/10 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-brand-orange"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Step indicators */}
          <div className="mt-3 flex justify-between">
            {ONBOARDING_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  if (idx < currentStepIndex) {
                    setDirection(-1);
                    setCurrentStepIndex(idx);
                  }
                }}
                disabled={idx > currentStepIndex}
                className={`font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  idx === currentStepIndex
                    ? "text-brand-orange"
                    : idx < currentStepIndex
                      ? "text-brand-charcoal/60 hover:text-brand-charcoal cursor-pointer"
                      : "text-brand-charcoal/20"
                }`}
              >
                {step.shortTitle}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-4xl px-4 py-4 md:py-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer - Living Blueprint Style */}
      <footer className="sticky bottom-0 z-50 border-t border-brand-charcoal/10 bg-bg-secondary/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button or Exit button */}
            <div>
              {isFirstStep ? (
                <Button
                  variant="ghost"
                  onClick={() => setShowSkipModal(true)}
                  className="group font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal"
                >
                  <X className="mr-1 h-3.5 w-3.5" />[ EXIT_FLOW ]
                </Button>
              ) : (
                !isLastStep && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="group font-mono text-xs uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    [ BACK ]
                  </Button>
                )
              )}
            </div>

            {/* Right: Skip Step + Exit + Next */}
            <div className="flex items-center gap-3">
              {!isLastStep &&
                currentStepIndex > 1 &&
                currentStep.id !== "techstack" &&
                currentStep.id !== "archpatterns" && (
                  <Button
                    variant="ghost"
                    onClick={handleSkipStep}
                    disabled={isSaving}
                    className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-orange hover:bg-brand-orange/5 transition-all flex items-center gap-2 h-9 border border-transparent hover:border-brand-orange/20"
                  >
                    <SkipForward className="h-3 w-3" />[ SKIP_STEP ]
                  </Button>
                )}

              {/* Exit button for non-first steps (moved to desktop-only if screen space is tight) */}
              {currentStepIndex > 0 && !isLastStep && (
                <Button
                  variant="ghost"
                  onClick={() => setShowSkipModal(true)}
                  disabled={isSaving}
                  className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/30 hover:text-red-500 hover:bg-red-50/50 transition-all hidden md:flex items-center gap-2 h-9 border border-transparent hover:border-red-500/20"
                >
                  [ EXIT_ONBOARDING ]
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSaving}
                className="min-w-[140px] bg-brand-orange text-white hover:bg-brand-orange/90 border-0 rounded-none font-mono text-xs uppercase tracking-wider"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 animate-spin border-2 border-white/30 border-t-white" />
                    Saving...
                  </span>
                ) : isLastStep ? (
                  <span className="flex items-center gap-1">
                    <span>[</span>
                    INITIALIZE
                    <span>]</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span>[</span>
                    CONTINUE
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    <span>]</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <ResetOnboardingModal
        isOpen={showSkipModal}
        onOpenChange={setShowSkipModal}
        onConfirm={handleExitFlow}
        isResetting={isSaving}
        title="Exit Onboarding?"
        description="Proceeding will terminate the configuration sequence. System defaults will be applied until manual parameters are defined in settings."
        confirmLabel="[ TERMINATE & EXIT ]"
        badge="SYS-EXIT_01 // BYPASS_PROTOCOL"
      />
    </motion.div>
  );
}

// Helper function to get step data for server
function getStepDataForServer(
  stepId: OnboardingStepId,
  data: OnboardingData,
): Record<string, unknown> {
  switch (stepId) {
    case "welcome":
      return { started: true };
    case "profile":
      return {
        experienceLevel: data.experienceLevel,
        projectType: data.projectType,
        teamContext: data.teamContext,
      };
    case "techstack":
      return { techStack: data.techStack };
    case "mode":
      return { defaultMode: data.defaultMode };
    default:
      return {};
  }
}
