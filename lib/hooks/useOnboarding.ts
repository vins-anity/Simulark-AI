"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { OnboardingStatus } from "@/actions/onboarding";
import { getOnboardingStatus } from "@/actions/onboarding";

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseOnboardingReturn {
  showOnboarding: boolean;
  onboardingStatus: OnboardingStatus | null;
  isLoading: boolean;
  dismissOnboarding: () => void;
  completeOnboarding: (templateRecommendations?: { id: string }[]) => void;
  refetch: () => Promise<void>;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useOnboarding(): UseOnboardingReturn {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch onboarding status
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getOnboardingStatus();
      if (result.success && result.data) {
        setOnboardingStatus(result.data);
        setShowOnboarding(result.data.needsOnboarding);
      }
    } catch (error) {
      console.error("Failed to fetch onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Dismiss onboarding (skip)
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Complete onboarding and optionally redirect to template
  const completeOnboarding = useCallback(
    (templateRecommendations?: { id: string }[]) => {
      setShowOnboarding(false);

      // If there are template recommendations, could show them or redirect
      // For now, just refresh the dashboard
      router.refresh();
    },
    [router],
  );

  return {
    showOnboarding,
    onboardingStatus,
    isLoading,
    dismissOnboarding,
    completeOnboarding,
    refetch: fetchStatus,
  };
}
