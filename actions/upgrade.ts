"use server";

import { createLogger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("actions:upgrade");

export async function requestUpgrade(
  planName: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized upgrade request attempt", { email, planName });
      return { success: false, error: "Unauthorized" };
    }

    const userLogger = logger.withRequest(crypto.randomUUID(), user.id);

    // Log the upgrade intent to our structured logging system
    // In the future, this is where we'd insert into an `upgrade_requests` table
    // or trigger a Resend/Loops.so email flow securely on the server side.
    userLogger.info("Upgrade request received", {
      providedEmail: email,
      actualUserEmail: user.email,
      planName,
      timestamp: new Date().toISOString(),
    });

    // Simulate reliable backend processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true };
  } catch (error) {
    logger.error("Error processing upgrade request", error);
    return { success: false, error: "Internal server error" };
  }
}
