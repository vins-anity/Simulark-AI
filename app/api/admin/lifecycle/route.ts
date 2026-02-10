import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { verifyAdminAccess } from "@/lib/admin/auth";
import {
  processExpiredSubscriptions,
  sendExpiryReminders,
} from "@/lib/subscription-lifecycle";

export const runtime = "nodejs";

/**
 * Admin API for subscription lifecycle management
 * Can be called via cron job or manually
 *
 * POST /api/admin/lifecycle
 * Body: { action: 'process-expired' | 'send-reminders' }
 *
 * Or with cron secret header for automated calls:
 * Headers: { 'X-Cron-Secret': 'your-secret' }
 */

export async function POST(request: NextRequest) {
  try {
    // Check for cron secret first (for automated calls)
    const cronSecret = request.headers.get("X-Cron-Secret");
    const isCronCall = cronSecret && cronSecret === env.CRON_SECRET;

    // If not a cron call, verify admin access
    if (!isCronCall) {
      const auth = await verifyAdminAccess();
      if (!auth.success) {
        return auth.response;
      }
    }

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required field: action" },
        { status: 400 },
      );
    }

    switch (action) {
      case "process-expired": {
        const result = await processExpiredSubscriptions();
        return NextResponse.json({
          success: true,
          action: "process-expired",
          result,
          message: `Processed ${result.processed} expired subscriptions. Downgraded ${result.downgraded} users. Errors: ${result.errors}`,
        });
      }

      case "send-reminders": {
        const result = await sendExpiryReminders();
        return NextResponse.json({
          success: true,
          action: "send-reminders",
          result,
          message: `Sent ${result.reminded} expiry reminders. Errors: ${result.errors}`,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Use 'process-expired' or 'send-reminders'`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[Admin Lifecycle] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint for checking lifecycle status
 * Returns current statistics about subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    // Check for cron secret or admin access
    const cronSecret = request.headers.get("X-Cron-Secret");
    const isCronCall = cronSecret && cronSecret === env.CRON_SECRET;

    if (!isCronCall) {
      const auth = await verifyAdminAccess();
      if (!auth.success) {
        return auth.response;
      }
    }

    const supabase = (await import("@/lib/supabase/server")).createClient;
    const client = await supabase();

    // Get subscription statistics
    const { data: stats, error } = await client
      .from("users")
      .select("subscription_tier, subscription_status");

    if (error) {
      console.error("[Admin Lifecycle] Error fetching stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription statistics" },
        { status: 500 },
      );
    }

    // Calculate statistics
    const tierCounts =
      stats?.reduce(
        (acc, user) => {
          acc[user.subscription_tier] = (acc[user.subscription_tier] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ) || {};

    const statusCounts =
      stats?.reduce(
        (acc, user) => {
          acc[user.subscription_status] =
            (acc[user.subscription_status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ) || {};

    return NextResponse.json({
      success: true,
      statistics: {
        totalUsers: stats?.length || 0,
        byTier: tierCounts,
        byStatus: statusCounts,
      },
      message: "Subscription lifecycle statistics",
    });
  } catch (error) {
    console.error("[Admin Lifecycle] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
