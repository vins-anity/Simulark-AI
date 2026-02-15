"use server";

import * as v from "valibot";
import {
  type CompleteOnboardingInput,
  CompleteOnboardingSchema,
  generateSmartDefaults,
  type OnboardingData,
  recommendTemplates,
  SaveOnboardingProgressSchema,
  type UserPreferences,
} from "@/lib/schema/onboarding";
import { createClient } from "@/lib/supabase/server";

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

    // Check if user has existing preferences (legacy check)
    const hasExistingPreferences =
      userData?.preferences &&
      typeof userData.preferences === "object" &&
      Object.keys(userData.preferences).length > 0 &&
      ((userData.preferences as UserPreferences).cloudProviders?.length > 0 ||
        (userData.preferences as UserPreferences).languages?.length > 0);

    // Needs onboarding if not completed, not skipped, and no existing preferences
    const needsOnboarding =
      !userData?.onboarding_completed &&
      !userData?.onboarding_skipped &&
      !hasExistingPreferences;

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
    // Validate input
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let smartDefaults: any;
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

    // Update public user record
    const { error: dbError } = await supabase
      .from("users")
      .update({
        onboarding_skipped: true,
        onboarding_completed: true, // Treat skipped as completed for redirection purposes
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
  templateRecommendations?: ReturnType<typeof recommendTemplates>;
}> {
  try {
    // Validate complete data
    const result = v.safeParse(CompleteOnboardingSchema, input);
    if (!result.success) {
      console.error("Validation failed:", result.issues);
      return { success: false, error: "Invalid onboarding data" };
    }

    const data = result.output;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Transform onboarding data to preferences format
    const preferences: UserPreferences = {
      cloudProviders: data.step2.cloudProviders,
      languages: data.step2.languages,
      frameworks: data.step2.frameworks,
      architectureTypes: [data.step3.architecturePreference],
      applicationType: [data.step3.applicationType],
      customInstructions: generateCustomInstructions(data),
      defaultArchitectureMode: data.step3.defaultArchitectureMode as
        | "default"
        | "startup"
        | "corporate"
        | undefined,
      onboardingMetadata: {
        role: data.step1.role,
        useCase: data.step1.useCase,
        teamSize: data.step1.teamSize,
        experienceLevel: data.step2.experienceLevel,
        includeServices: data.step3.includeServices,
      },
    };

    // Update user with completed onboarding and preferences
    const { error: dbError } = await supabase
      .from("users")
      .update({
        onboarding_completed: true,
        onboarding_step: 3,
        onboarding_completed_at: new Date().toISOString(),
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to complete onboarding (db):", dbError);
      return { success: false, error: "Failed to save preferences" };
    }

    // Sync with Auth Metadata for Middleware
    const { error: authError } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });

    if (authError) {
      console.error("Failed to sync onboarding status (auth):", authError);
    }

    // Generate template recommendations
    const templateRecommendations = recommendTemplates(data);

    return {
      success: true,
      templateRecommendations,
    };
  } catch (err) {
    console.error("Error in completeOnboarding:", err);
    return { success: false, error: "Internal error" };
  }
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

function generateCustomInstructions(data: CompleteOnboardingInput): string {
  const parts: string[] = [];

  // Add experience context
  if (data.step2.experienceLevel === "beginner") {
    parts.push(
      "Focus on simple, well-documented solutions with clear explanations.",
    );
  } else if (data.step2.experienceLevel === "advanced") {
    parts.push(
      "Optimize for performance, scalability, and production-ready patterns.",
    );
  }

  // Add team context
  if (data.step1.teamSize === "solo") {
    parts.push(
      "Keep architecture simple and manageable by a single developer.",
    );
  } else if (data.step1.teamSize === "enterprise") {
    parts.push("Design for team collaboration with clear service boundaries.");
  }

  // Add service preferences
  const services = Object.entries(data.step3.includeServices)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);
  if (services.length > 0) {
    parts.push(
      `Include ${services.join(", ")} in architecture recommendations.`,
    );
  }

  return parts.join(" ");
}
