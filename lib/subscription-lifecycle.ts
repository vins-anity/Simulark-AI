import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";
import type { SubscriptionStatus, SubscriptionTier } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  isActive: boolean;
  isInGracePeriod: boolean;
  gracePeriodEndsAt: Date | null;
  daysUntilExpiry: number | null;
}

const GRACE_PERIOD_DAYS = 3;

/**
 * Get subscription state for a user
 * Works in both server and client contexts
 */
export async function getSubscriptionState(
  userId: string,
): Promise<SubscriptionState | null> {
  try {
    // Use service role key if available (server-side) for unrestricted access
    const supabase = env.SUPABASE_SERVICE_ROLE_KEY
      ? createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } },
        )
      : await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("subscription_tier, subscription_status, subscription_expires_at")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error(
        "[Subscription Lifecycle] Error fetching subscription:",
        error,
      );
      return null;
    }

    return calculateSubscriptionState(data);
  } catch (error) {
    console.error("[Subscription Lifecycle] Error:", error);
    return null;
  }
}

/**
 * Calculate subscription state from raw data
 */
function calculateSubscriptionState(data: {
  subscription_tier: string;
  subscription_status: string;
  subscription_expires_at: string | null;
}): SubscriptionState {
  const now = new Date();
  const expiresAt = data.subscription_expires_at
    ? new Date(data.subscription_expires_at)
    : null;

  // Check if expired
  const isExpired = expiresAt ? now > expiresAt : false;

  // Calculate grace period
  let gracePeriodEndsAt: Date | null = null;
  let isInGracePeriod = false;

  if (expiresAt && isExpired) {
    gracePeriodEndsAt = new Date(expiresAt);
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS);
    isInGracePeriod = now < gracePeriodEndsAt;
  }

  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (expiresAt && !isExpired) {
    const diffTime = expiresAt.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Determine if subscription is active
  const isActive = !isExpired || isInGracePeriod;

  // Determine effective tier (downgrade to free if expired and not in grace period)
  const effectiveTier: SubscriptionTier =
    isExpired && !isInGracePeriod
      ? "free"
      : (data.subscription_tier as SubscriptionTier);

  return {
    tier: effectiveTier,
    status: data.subscription_status as SubscriptionStatus,
    expiresAt,
    isActive,
    isInGracePeriod,
    gracePeriodEndsAt,
    daysUntilExpiry,
  };
}

/**
 * Check if user has active subscription (including grace period)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const state = await getSubscriptionState(userId);
  return state?.isActive ?? false;
}

/**
 * Get effective tier for a user
 * Returns 'free' if subscription is expired (outside grace period)
 */
export async function getEffectiveTier(
  userId: string,
): Promise<SubscriptionTier> {
  const state = await getSubscriptionState(userId);
  return state?.tier ?? "free";
}

/**
 * Process expired subscriptions
 * Should be run periodically (e.g., daily via cron job)
 */
export async function processExpiredSubscriptions(): Promise<{
  processed: number;
  downgraded: number;
  errors: number;
}> {
  const result = { processed: 0, downgraded: 0, errors: 0 };

  try {
    const supabase = env.SUPABASE_SERVICE_ROLE_KEY
      ? createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } },
        )
      : await createClient();

    const now = new Date().toISOString();
    const gracePeriodCutoff = new Date();
    gracePeriodCutoff.setDate(gracePeriodCutoff.getDate() - GRACE_PERIOD_DAYS);

    // Find subscriptions that have passed their grace period
    const { data: expiredUsers, error: fetchError } = await supabase
      .from("users")
      .select("user_id, subscription_tier, subscription_status")
      .eq("subscription_status", "cancelled")
      .lte("subscription_expires_at", gracePeriodCutoff.toISOString())
      .neq("subscription_tier", "free")
      .eq("manual_override", false);

    if (fetchError) {
      console.error(
        "[Subscription Lifecycle] Error fetching expired subscriptions:",
        fetchError,
      );
      return result;
    }

    result.processed = expiredUsers?.length ?? 0;

    for (const user of expiredUsers || []) {
      try {
        // Update user to free tier
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_tier: "free",
            subscription_status: "expired",
            subscription_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.user_id);

        if (updateError) {
          console.error(
            `[Subscription Lifecycle] Error downgrading user ${user.user_id}:`,
            updateError,
          );
          result.errors++;
          continue;
        }

        // Log to history
        await supabase.from("subscription_history").insert({
          user_id: user.user_id,
          old_tier: user.subscription_tier,
          new_tier: "free",
          old_status: user.subscription_status as SubscriptionStatus,
          new_status: "expired",
          change_reason: "Automatic downgrade after grace period expired",
        });

        result.downgraded++;
      } catch (error) {
        console.error(
          `[Subscription Lifecycle] Error processing user ${user.user_id}:`,
          error,
        );
        result.errors++;
      }
    }

    return result;
  } catch (error) {
    console.error(
      "[Subscription Lifecycle] Error in processExpiredSubscriptions:",
      error,
    );
    return result;
  }
}

/**
 * Send expiry reminders (placeholder for email integration)
 */
export async function sendExpiryReminders(): Promise<{
  reminded: number;
  errors: number;
}> {
  const result = { reminded: 0, errors: 0 };

  try {
    const supabase = env.SUPABASE_SERVICE_ROLE_KEY
      ? createBrowserClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } },
        )
      : await createClient();

    // Find subscriptions expiring in 3 days
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 3);
    const startOfDay = new Date(
      reminderDate.setHours(0, 0, 0, 0),
    ).toISOString();
    const endOfDay = new Date(
      reminderDate.setHours(23, 59, 59, 999),
    ).toISOString();

    const { data: expiringUsers, error: fetchError } = await supabase
      .from("users")
      .select("user_id, email, subscription_tier, subscription_expires_at")
      .eq("subscription_status", "active")
      .gte("subscription_expires_at", startOfDay)
      .lte("subscription_expires_at", endOfDay);

    if (fetchError) {
      console.error(
        "[Subscription Lifecycle] Error fetching expiring subscriptions:",
        fetchError,
      );
      return result;
    }

    // TODO: Integrate with email service (e.g., SendGrid, Resend)
    for (const user of expiringUsers || []) {
      console.log(
        `[Subscription Lifecycle] Would send expiry reminder to ${user.email}`,
      );
      // await sendEmail(user.email, 'subscription_expiring', { ... });
      result.reminded++;
    }

    return result;
  } catch (error) {
    console.error(
      "[Subscription Lifecycle] Error in sendExpiryReminders:",
      error,
    );
    return result;
  }
}

/**
 * Check if action should be blocked due to subscription status
 */
export async function checkSubscriptionBlock(userId: string): Promise<{
  blocked: boolean;
  reason?: string;
  gracePeriodEndsAt?: Date;
}> {
  const state = await getSubscriptionState(userId);

  if (!state) {
    return { blocked: false }; // Allow if we can't determine state
  }

  if (state.isActive) {
    return { blocked: false };
  }

  // Subscription is expired and past grace period
  return {
    blocked: true,
    reason:
      "Your subscription has expired. Please renew to continue using premium features.",
  };
}
