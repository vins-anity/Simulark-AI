"use server";

import { revalidatePath } from "next/cache";
import { type UserPreferences } from "@/lib/schema/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function getUserPreferences(): Promise<{
  success: boolean;
  preferences?: UserPreferences;
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
      .select("preferences")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch user preferences:", error);
      return { success: false, error: "Failed to fetch preferences" };
    }

    return {
      success: true,
      preferences: userData?.preferences as UserPreferences,
    };
  } catch (err) {
    console.error("Error in getUserPreferences:", err);
    return { success: false, error: "Internal error" };
  }
}

export async function updateUserPreferences(
  prefs: Partial<UserPreferences>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // First fetch existing preferences to merge
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("preferences")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch existing preferences:", fetchError);
      return { success: false, error: "Failed to fetch existing preferences" };
    }

    const currentPreferences = (userData?.preferences as UserPreferences) || {
      cloudProviders: [],
      languages: [],
      frameworks: [],
      architectureTypes: [],
      applicationType: [],
      customInstructions: "",
    };

    const updatedPreferences = {
      ...currentPreferences,
      ...prefs,
    };

    const { error: updateError } = await supabase
      .from("users")
      .update({ preferences: updatedPreferences })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update preferences:", updateError);
      return { success: false, error: "Failed to update preferences" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (err) {
    console.error("Error in updateUserPreferences:", err);
    return { success: false, error: "Internal error" };
  }
}
