"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  completeOnboarding,
  type OnboardingStatus,
  saveOnboardingProgress,
  skipOnboarding,
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import {
  type CompleteOnboardingInput,
  generateSmartDefaults,
  type OnboardingStep1,
  type OnboardingStep2,
  type OnboardingStep3,
} from "@/lib/schema/onboarding";
import { OnboardingCompletion } from "./OnboardingCompletion";
import { Step1RoleUseCase } from "./steps/Step1RoleUseCase";
import { Step2TechStack } from "./steps/Step2TechStack";
import { Step3Architecture } from "./steps/Step3Architecture";

// ============================================================================
// Types
// ============================================================================

interface OnboardingModalProps {
  status: OnboardingStatus;
  onComplete: (
    templateRecommendations?: {
      id: string;
      confidence: number;
      reason: string;
    }[],
  ) => void;
  onSkip: () => void;
}

interface StepData {
  step1?: OnboardingStep1;
  step2?: OnboardingStep2;
  step3?: OnboardingStep3;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingModal({
  status,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(status.currentStep || 1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [templateRecommendations, setTemplateRecommendations] = useState<
    { id: string; confidence: number; reason: string }[]
  >([]);

  // Form data state
  const [stepData, setStepData] = useState<StepData>(() => {
    const partial = status.partialData || {};
    return {
      step1: partial.step1,
      step2: partial.step2,
      step3: partial.step3,
    };
  });

  // Smart defaults for step 2 based on step 1
  const [smartDefaults, setSmartDefaults] = useState<Partial<OnboardingStep2>>(
    {},
  );

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  const handleNext = useCallback(async () => {
    if (currentStep < 3) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      await handleComplete();
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(async () => {
    setIsLoading(true);
    const result = await skipOnboarding();
    setIsLoading(false);
    if (result.success) {
      toast.info("Onboarding skipped", {
        description: "You can complete it anytime in settings.",
      });
      onSkip();
    } else {
      toast.error("Failed to skip onboarding");
    }
  }, [onSkip]);

  const handleComplete = useCallback(async () => {
    if (!stepData.step1 || !stepData.step2 || !stepData.step3) {
      toast.error("Please complete all steps");
      return;
    }

    setIsLoading(true);

    const completeData: CompleteOnboardingInput = {
      step1: stepData.step1,
      step2: stepData.step2,
      step3: stepData.step3,
    };

    const result = await completeOnboarding(completeData);
    setIsLoading(false);

    if (result.success) {
      setTemplateRecommendations(result.templateRecommendations || []);
      setShowCompletion(true);
    } else {
      toast.error(result.error || "Failed to complete onboarding");
    }
  }, [stepData]);

  // ============================================================================
  // Step Data Handlers
  // ============================================================================

  const handleStep1Complete = useCallback(
    async (data: OnboardingStep1) => {
      setStepData((prev) => ({ ...prev, step1: data }));

      // Generate smart defaults
      const defaults = generateSmartDefaults(data);
      setSmartDefaults(defaults);

      // Auto-apply defaults to step 2 if not already set
      if (!stepData.step2) {
        setStepData((prev) => ({
          ...prev,
          step1: data,
          step2: {
            cloudProviders: defaults.cloudProviders || [],
            languages: defaults.languages || [],
            frameworks: defaults.frameworks || [],
            experienceLevel: defaults.experienceLevel || "intermediate",
          },
        }));
      }

      // Save progress
      await saveOnboardingProgress({ step: 1, data });
    },
    [stepData.step2],
  );

  const handleStep2Complete = useCallback(async (data: OnboardingStep2) => {
    setStepData((prev) => ({ ...prev, step2: data }));
    await saveOnboardingProgress({ step: 2, data });
  }, []);

  const handleStep3Complete = useCallback(async (data: OnboardingStep3) => {
    setStepData((prev) => ({ ...prev, step3: data }));
    await saveOnboardingProgress({ step: 3, data });
  }, []);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "About You";
      case 2:
        return "Technology Stack";
      case 3:
        return "Architecture Preferences";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Help us understand your background";
      case 2:
        return "Select your preferred technologies";
      case 3:
        return "Final configuration details";
      default:
        return "";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!stepData.step1?.role && !!stepData.step1?.useCase;
      case 2:
        return (
          !!stepData.step2 &&
          stepData.step2.cloudProviders.length > 0 &&
          stepData.step2.languages.length > 0
        );
      case 3:
        return !!stepData.step3?.architecturePreference;
      default:
        return false;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (showCompletion) {
    return (
      <OnboardingCompletion
        templateRecommendations={templateRecommendations}
        onContinue={() => onComplete(templateRecommendations)}
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/90 backdrop-blur-sm p-4"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 border border-white/5 rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border border-white/5 rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Modal Container */}
      <motion.div
        className="relative w-full max-w-3xl bg-brand-sand-light dark:bg-zinc-900 shadow-2xl overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-orange" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-orange" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-orange" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-orange" />

        {/* Header */}
        <div className="border-b border-brand-charcoal/10 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40">
                  // ONBOARDING
                </span>
                <span className="font-mono text-[10px] text-brand-orange">
                  STEP_0{currentStep}/03
                </span>
              </div>
              <h2 className="font-poppins text-2xl font-bold text-brand-charcoal dark:text-gray-100">
                {getStepTitle()}
              </h2>
              <p className="text-sm text-brand-charcoal/60 dark:text-gray-400">
                {getStepSubtitle()}
              </p>
            </div>

            {/* Right: Progress + Skip */}
            <div className="flex items-center gap-4">
              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 transition-colors ${
                      step <= currentStep
                        ? "bg-brand-orange"
                        : "bg-brand-charcoal/20"
                    }`}
                  />
                ))}
              </div>

              {/* Skip button */}
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/40 hover:text-brand-orange transition-colors"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-0.5 bg-brand-charcoal/10">
            <motion.div
              className="h-full bg-brand-orange"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="h-full"
            >
              {currentStep === 1 && (
                <Step1RoleUseCase
                  initialData={stepData.step1}
                  onChange={handleStep1Complete}
                />
              )}
              {currentStep === 2 && (
                <Step2TechStack
                  initialData={stepData.step2}
                  smartDefaults={smartDefaults}
                  onChange={handleStep2Complete}
                />
              )}
              {currentStep === 3 && (
                <Step3Architecture
                  initialData={stepData.step3}
                  step1Data={stepData.step1}
                  onChange={handleStep3Complete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-charcoal/10 px-6 py-4 flex items-center justify-between bg-brand-charcoal/5">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="font-mono text-xs uppercase tracking-wider rounded-none disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="bg-brand-charcoal text-white hover:bg-brand-orange rounded-none font-mono text-xs uppercase tracking-wider px-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                Saving...
              </span>
            ) : currentStep === 3 ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Complete
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
