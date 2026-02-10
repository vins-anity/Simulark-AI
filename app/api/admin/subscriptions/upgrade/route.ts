import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin/auth";
import {
  isValidTier,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export interface UpgradeRequest {
  userId: string;
  newTier: SubscriptionTier;
  status?: SubscriptionStatus;
  expiresAt?: string | null;
  reason?: string;
  manualOverride?: boolean;
}

export interface UpgradeResponse {
  success: boolean;
  user: {
    user_id: string;
    email: string;
    subscription_tier: SubscriptionTier;
    subscription_status: SubscriptionStatus;
    subscription_expires_at: string | null;
    tier_started_at: string;
  };
  message: string;
}

export async function POST(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return auth.response;
  }

  const adminUserId = auth.userId;

  try {
    const body: UpgradeRequest = await request.json();
    const {
      userId,
      newTier,
      status = "active",
      expiresAt,
      reason,
      manualOverride = true,
    } = body;

    // Validate required fields
    if (!userId || !newTier) {
      return NextResponse.json(
        { error: "Missing required fields: userId and newTier" },
        { status: 400 },
      );
    }

    // Validate tier
    if (!isValidTier(newTier)) {
      return NextResponse.json(
        {
          error: `Invalid tier: ${newTier}. Must be one of: free, starter, pro`,
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get current user data for history tracking
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("subscription_tier, subscription_status, email")
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      subscription_tier: newTier,
      subscription_status: status,
      tier_started_at: new Date().toISOString(),
      manual_override: manualOverride,
      updated_at: new Date().toISOString(),
    };

    // Handle expiration date
    if (expiresAt !== undefined) {
      updateData.subscription_expires_at = expiresAt;
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
      console.error("[Admin Upgrade] Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to upgrade user" },
        { status: 500 },
      );
    }

    // Log to subscription history
    const { error: historyError } = await supabase
      .from("subscription_history")
      .insert({
        user_id: userId,
        old_tier: currentUser.subscription_tier,
        new_tier: newTier,
        old_status: currentUser.subscription_status,
        new_status: status,
        changed_by: adminUserId,
        change_reason: reason || `Admin upgrade to ${newTier}`,
      });

    if (historyError) {
      console.error("[Admin Upgrade] History log error:", historyError);
      // Don't fail the request if history logging fails
    }

    const response: UpgradeResponse = {
      success: true,
      user: updatedUser,
      message: `Successfully upgraded ${currentUser.email} to ${newTier} tier`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Admin Upgrade] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
