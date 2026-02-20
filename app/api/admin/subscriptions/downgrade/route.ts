import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin/auth";
import type { SubscriptionStatus } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

export interface DowngradeRequest {
  userId: string;
  reason?: string;
  immediate?: boolean;
}

export interface DowngradeResponse {
  success: boolean;
  user: {
    user_id: string;
    email: string;
    subscription_tier: string;
    subscription_status: SubscriptionStatus;
    subscription_expires_at: string | null;
    tier_started_at: string;
  };
  message: string;
  gracePeriodEndsAt?: string;
}

export async function POST(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return auth.response;
  }

  const adminUserId = auth.userId;

  try {
    const body: DowngradeRequest = await request.json();
    const { userId, reason, immediate = false } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select(
        "subscription_tier, subscription_status, subscription_expires_at, email",
      )
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent downgrading if already on free tier
    if (currentUser.subscription_tier === "free") {
      return NextResponse.json(
        { error: "User is already on free tier" },
        { status: 400 },
      );
    }

    let updateData: Record<string, unknown>;
    let gracePeriodEndsAt: string | undefined;

    if (immediate) {
      // Immediate downgrade
      updateData = {
        subscription_tier: "free",
        subscription_status: "expired",
        subscription_expires_at: null,
        tier_started_at: new Date().toISOString(),
        manual_override: true,
        updated_at: new Date().toISOString(),
      };
    } else {
      // Schedule downgrade at end of current period (3-day grace period)
      const now = new Date();
      gracePeriodEndsAt = new Date(
        now.setDate(now.getDate() + 3),
      ).toISOString();

      updateData = {
        subscription_status: "cancelled",
        subscription_expires_at: gracePeriodEndsAt,
        manual_override: true,
        updated_at: new Date().toISOString(),
      };
    }

    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("user_id", userId)
      .select(
        "user_id, email, subscription_tier, subscription_status, subscription_expires_at, tier_started_at",
      )
      .single();

    if (updateError) {
      console.error("[Admin Downgrade] Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to downgrade user" },
        { status: 500 },
      );
    }

    // Log to subscription history
    const { error: historyError } = await supabase
      .from("subscription_history")
      .insert({
        user_id: userId,
        old_tier: currentUser.subscription_tier,
        new_tier: immediate ? "free" : currentUser.subscription_tier,
        old_status: currentUser.subscription_status,
        new_status: immediate ? "expired" : "cancelled",
        changed_by: adminUserId,
        change_reason:
          reason ||
          `Admin downgrade to free tier${immediate ? " (immediate)" : " (grace period)"}`,
      });

    if (historyError) {
      console.error("[Admin Downgrade] History log error:", historyError);
      // Don't fail the request if history logging fails
    }

    const response: DowngradeResponse = {
      success: true,
      user: updatedUser,
      message: immediate
        ? `Successfully downgraded ${currentUser.email} to free tier immediately`
        : `Scheduled downgrade for ${currentUser.email}. Grace period ends ${gracePeriodEndsAt}`,
      gracePeriodEndsAt: immediate ? undefined : gracePeriodEndsAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Admin Downgrade] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
