"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  completeOnboarding,
  getOnboardingStatus,
  saveOnboardingProgress,
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CompleteStep } from "./steps/CompleteStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { ModeStep } from "./steps/ModeStep";
import { ProjectTypeStep } from "./steps/ProjectTypeStep";
import { TechStackStep } from "./steps/TechStackStep";
// Step components
import { WelcomeStep } from "./steps/WelcomeStep";
import {
  ONBOARDING_STEPS,
  type OnboardingData,
  type OnboardingStepId,
} from "./types";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    experienceLevel: undefined,
    techStack: {
      frontend: [],
      backend: [],
      database: [],
      auth: [],
      cloud: [],
    },
    projectTypes: [],
    defaultMode: undefined,
  });

  // Load saved progress from sessionStorage and check onboarding status
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Check if user needs onboarding
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

  const handleNext = async () => {
    if (isLastStep) {
      // Complete onboarding
      setIsSaving(true);
      try {
        const result = await completeOnboarding({
          step1: {
            role: "software-engineer",
            useCase: data.projectTypes.includes("saas")
              ? "saas"
              : data.projectTypes[0] || "web-app",
            teamSize: "small",
          },
          step2: {
            cloudProviders: data.techStack.cloud,
            languages: [...data.techStack.backend, ...data.techStack.frontend],
            frameworks: data.techStack.frontend,
            experienceLevel: data.experienceLevel || "intermediate",
          },
          step3: {
            architecturePreference:
              data.defaultMode === "enterprise"
                ? "microservices"
                : data.defaultMode === "startup"
                  ? "serverless"
                  : "not-sure",
            applicationType: data.projectTypes.includes("mobile")
              ? "mobile"
              : "web-app",
            includeServices: {
              auth: data.techStack.auth.length > 0,
              database: data.techStack.database.length > 0,
              cdn: data.techStack.cloud.includes("vercel"),
              monitoring: data.defaultMode === "enterprise",
              cicd: data.defaultMode === "enterprise",
            },
          },
        });

        if (result.success) {
          // Clear session storage
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
    setIsSaving(true);
    try {
      const stepData = getStepDataForServer(currentStep.id, data);
      await saveOnboardingProgress({
        step: currentStepIndex,
        data: stepData,
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }

    setDirection(1);
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (isFirstStep) return;
    setDirection(-1);
    setCurrentStepIndex((prev) => prev - 1);
  };

  const handleSkip = async () => {
    if (confirm("Skip onboarding? Your preferences won't be saved.")) {
      // Skip onboarding on server
      const { skipOnboarding } = await import("@/actions/onboarding");
      await skipOnboarding();
      sessionStorage.removeItem("onboarding_data");
      sessionStorage.removeItem("onboarding_step");
      router.push("/dashboard");
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case "welcome":
        return true;
      case "experience":
        return !!data.experienceLevel;
      case "techstack":
        // Tech stack is optional (can skip)
        return true;
      case "projecttype":
        return data.projectTypes.length > 0;
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
      case "experience":
        return (
          <ExperienceStep
            value={data.experienceLevel}
            onChange={(value) => updateData({ experienceLevel: value })}
          />
        );
      case "techstack":
        return (
          <TechStackStep
            value={data.techStack}
            onChange={(techStack) => updateData({ techStack })}
          />
        );
      case "projecttype":
        return (
          <ProjectTypeStep
            value={data.projectTypes}
            onChange={(projectTypes) => updateData({ projectTypes })}
          />
        );
      case "mode":
        return (
          <ModeStep
            value={data.defaultMode}
            onChange={(value) => updateData({ defaultMode: value })}
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
        <div className="font-mono text-text-secondary animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 border-b border-border-primary bg-bg-secondary/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs text-text-muted uppercase tracking-wider">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="font-mono text-xs text-brand-orange">
              {currentStep.title}
            </span>
          </div>
          <Progress
            value={((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <footer className="sticky bottom-0 z-50 border-t border-border-primary bg-bg-secondary/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && !isLastStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="font-mono text-text-secondary hover:text-text-primary"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isLastStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="font-mono text-text-muted hover:text-text-secondary"
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  Skip
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSaving}
                size="sm"
                className="min-w-[120px] bg-brand-orange text-white hover:bg-brand-orange/90 font-mono"
              >
                {isSaving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : isLastStep ? (
                  "Go to Dashboard"
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
    case "experience":
      return { experienceLevel: data.experienceLevel };
    case "techstack":
      return { techStack: data.techStack };
    case "projecttype":
      return { projectTypes: data.projectTypes };
    case "mode":
      return { defaultMode: data.defaultMode };
    default:
      return {};
  }
}
