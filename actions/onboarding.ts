"use server";

import * as v from "valibot";
import {
  type CompleteOnboardingInput,
  CompleteOnboardingSchema,
  generateSmartDefaults,
  type OnboardingData,
  type OnboardingStep2,
  type OnboardingStep3,
  recommendTemplates,
  SaveOnboardingProgressSchema,
} from "@/lib/schema/onboarding";
import {
  getDefaultUserPreferences,
  mapOnboardingDataToPreferences,
  normalizeUserPreferences,
  type OnboardingUiData,
  type UserPreferences,
} from "@/lib/schema/user-preferences";
import { inferTechStackFromProfile } from "@/lib/tech/infer-tech-stack";
import { createClient } from "@/lib/supabase/server";

const ONBOARDING_STEP_IDS = [
  "welcome",
  "profile",
  "techstack",
  "archpatterns",
  "mode",
  "complete",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_IDS)[number];

export const SaveOnboardingProgressByStepSchema = v.object({
  stepId: v.picklist(ONBOARDING_STEP_IDS),
  data: v.record(v.string(), v.unknown()),
});

// ============================================================================
// Get Onboarding Status
// ============================================================================

export interface OnboardingStatus {
  needsOnboarding: boolean;
  currentStep: number;
  isSkipped: boolean;
  partialData?: OnboardingData;
}

export async function getOnboardingStatus(): Promise<{
  success: boolean;
  data?: OnboardingStatus;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select(
        "onboarding_completed, onboarding_step, onboarding_skipped, onboarding_data, preferences",
      )
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch onboarding status:", error);
      return { success: false, error: "Failed to fetch status" };
    }

    const hasExistingPreferences =
      userData?.preferences &&
      typeof userData.preferences === "object" &&
      Object.keys(userData.preferences).length > 0 &&
      (normalizeUserPreferences(userData.preferences).cloudProviders.length >
        0 ||
        normalizeUserPreferences(userData.preferences).languages.length > 0);

    const needsOnboarding =
      !userData?.onboarding_completed &&
      !userData?.onboarding_skipped &&
      !hasExistingPreferences;

    // Keep auth metadata in sync when DB says completed
    if (userData?.onboarding_completed && !user.user_metadata?.onboarding_completed) {
      await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
    }

    return {
      success: true,
      data: {
        needsOnboarding,
        currentStep: userData?.onboarding_step || 0,
        isSkipped: userData?.onboarding_skipped || false,
        partialData: userData?.onboarding_data || undefined,
      },
    };
  } catch (err) {
    console.error("Error in getOnboardingStatus:", err);
    return { success: false, error: "Internal error" };
  }
}

// ============================================================================
// Save Progress (for each step)
// ============================================================================

export async function saveOnboardingProgress(
  input: unknown,
): Promise<{ success: boolean; error?: string; smartDefaults?: unknown }> {
  try {
    const byStep = v.safeParse(SaveOnboardingProgressByStepSchema, input);
    if (byStep.success) {
      const { stepId, data } = byStep.output;
      const stepIndex = ONBOARDING_STEP_IDS.indexOf(stepId);

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Unauthorized" };

      const { data: userData } = await supabase
        .from("users")
        .select("onboarding_data")
        .eq("user_id", user.id)
        .single();

      const existingData = (userData?.onboarding_data || {}) as Record<
        string,
        unknown
      >;
      const updatedData = { ...existingData, [stepId]: data };

      const { error } = await supabase
        .from("users")
        .update({
          onboarding_step: stepIndex >= 0 ? stepIndex : 0,
          onboarding_data: updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to save progress:", error);
        return { success: false, error: "Failed to save progress" };
      }
      return { success: true };
    }

    // Legacy numeric step API
    const result = v.safeParse(SaveOnboardingProgressSchema, input);
    if (!result.success) {
      return { success: false, error: "Invalid input data" };
    }

    const { step, data } = result.output;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing data
    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_data")
      .eq("user_id", user.id)
      .single();

    const existingData = (userData?.onboarding_data || {}) as OnboardingData;

    // Merge new data
    const stepKey = `step${step}` as const;
    const updatedData: OnboardingData = {
      ...existingData,
      [stepKey]: data,
    };

    // If step 1, generate and return smart defaults
    let smartDefaults: Partial<OnboardingStep2 & OnboardingStep3> | undefined;
    if (step === 1 && data && typeof data === "object" && "role" in data) {
      smartDefaults = generateSmartDefaults(
        data as Parameters<typeof generateSmartDefaults>[0],
      );
    }

    // Update user record
    const { error } = await supabase
      .from("users")
      .update({
        onboarding_step: step,
        onboarding_data: updatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to save progress:", error);
      return { success: false, error: "Failed to save progress" };
    }

    return { success: true, smartDefaults };
  } catch (err) {
    console.error("Error in saveOnboardingProgress:", err);
    return { success: false, error: "Internal error" };
  }
}

// ============================================================================
// Skip Onboarding
// ============================================================================

// ============================================================================
// Skip Onboarding
// ============================================================================

export async function skipOnboarding(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update public user record with minimal defaults
    const defaultPrefs = getDefaultUserPreferences();

    const { error: dbError } = await supabase
      .from("users")
      .update({
        onboarding_skipped: true,
        onboarding_completed: true,
        preferences: defaultPrefs,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to skip onboarding (db):", dbError);
      return { success: false, error: "Failed to skip onboarding" };
    }

    // Sync with Auth Metadata for Middleware
    const { error: authError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (authError) {
      console.error("Failed to sync onboarding status (auth):", authError);
      // We don't fail the request here as the DB update succeeded
    }

    return { success: true };
  } catch (err) {
    console.error("Error in skipOnboarding:", err);
    return { success: false, error: "Internal error" };
  }
}

// ============================================================================
// Complete Onboarding
// ============================================================================

export async function completeOnboarding(input: unknown): Promise<{
  success: boolean;
  error?: string;
  preferences?: UserPreferences;
  templateRecommendations?: ReturnType<typeof recommendTemplates>;
}> {
  try {
    const result = v.safeParse(CompleteOnboardingSchema, input);
    if (!result.success) {
      console.error("Validation failed:", result.issues);
      return { success: false, error: "Invalid onboarding data" };
    }

    const data = result.output;
    const tier =
      data.step3.defaultArchitectureMode === "enterprise" ||
      data.step3.defaultMode === "enterprise"
        ? "pro"
        : "flash";

    const preferences = normalizeUserPreferences({
      cloudProviders: data.step2.cloudProviders,
      languages: data.step2.languages,
      frameworks: data.step2.frameworks,
      architectureTypes: data.step3.architecturePreferences,
      applicationType: [data.step3.applicationType],
      customInstructions: "",
      defaultInferenceTier: tier,
      defaultMode: tier === "pro" ? "enterprise" : "startup",
      defaultArchitectureMode: tier === "pro" ? "enterprise" : "startup",
      defaultModel: data.step3.defaultModel,
      techStackMode: "manual",
      onboardingMetadata: {
        role: data.step1.role,
        useCase: data.step1.useCase,
        teamSize: data.step1.teamSize,
        experienceLevel: data.step2.experienceLevel,
        includeServices: data.step3.includeServices,
      },
    });

    return finalizeOnboarding(preferences, data);
  } catch (err) {
    console.error("Error in completeOnboarding:", err);
    return { success: false, error: "Internal error" };
  }
}

export async function completeOnboardingFromUi(
  uiData: OnboardingUiData,
): Promise<{
  success: boolean;
  error?: string;
  preferences?: UserPreferences;
  templateRecommendations?: ReturnType<typeof recommendTemplates>;
}> {
  try {
    let preferences = mapOnboardingDataToPreferences(uiData);

    if (preferences.techStackMode === "auto") {
      const inferred = await inferTechStackFromProfile(preferences);
      preferences = normalizeUserPreferences({
        ...preferences,
        cloudProviders: inferred.cloudProviders,
        languages: inferred.languages,
        frameworks: inferred.frameworks,
        techStackInferred: true,
        techStackRationale: inferred.rationale,
      });
    }

    return finalizeOnboarding(preferences);
  } catch (err) {
    console.error("Error in completeOnboardingFromUi:", err);
    return { success: false, error: "Internal error" };
  }
}

async function finalizeOnboarding(
  preferences: UserPreferences,
  legacyData?: CompleteOnboardingInput,
): Promise<{
  success: boolean;
  error?: string;
  preferences?: UserPreferences;
  templateRecommendations?: ReturnType<typeof recommendTemplates>;
}> {
  const normalized = normalizeUserPreferences(preferences);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error: dbError } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      onboarding_step: ONBOARDING_STEP_IDS.length - 1,
      onboarding_completed_at: new Date().toISOString(),
      preferences: normalized,
      onboarding_data: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (dbError) {
    console.error("Failed to complete onboarding (db):", dbError);
    return { success: false, error: "Failed to save preferences" };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });

  if (authError) {
    console.error("Failed to sync onboarding status (auth):", authError);
  }

  return {
    success: true,
    preferences: normalized,
    templateRecommendations: legacyData
      ? recommendTemplates(legacyData)
      : undefined,
  };
}

// ============================================================================
// Reset Onboarding
// ============================================================================

export async function resetOnboarding(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Reset DB record
    const { error: dbError } = await supabase
      .from("users")
      .update({
        onboarding_completed: false,
        onboarding_skipped: false,
        onboarding_step: 0,
        onboarding_data: null,
        preferences: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to reset onboarding (db):", dbError);
      return { success: false, error: "Failed to reset onboarding" };
    }

    // Reset Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { onboarding_completed: false },
    });

    if (authError) {
      console.error("Failed to reset onboarding status (auth):", authError);
      return { success: false, error: "Failed to update auth status" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in resetOnboarding:", err);
    return { success: false, error: "Internal error" };
  }
}

// ============================================================================
// Resume Onboarding (if previously started)
// ============================================================================

export async function resumeOnboarding(): Promise<{
  success: boolean;
  data?: OnboardingData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("onboarding_data, onboarding_step")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch onboarding data:", error);
      return { success: false, error: "Failed to fetch data" };
    }

    return {
      success: true,
      data: userData?.onboarding_data || {},
    };
  } catch (err) {
    console.error("Error in resumeOnboarding:", err);
    return { success: false, error: "Internal error" };
  }
}

// ============================================================================
// Helper: Generate Custom Instructions from Onboarding Data
// ============================================================================
