import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin/auth";
import {
  getPlanDetails,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export interface SubscriptionUser {
  user_id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  tier_started_at: string;
  manual_override: boolean;
  created_at: string;
  updated_at: string;
  plan_details: ReturnType<typeof getPlanDetails>;
}

export interface ListSubscriptionsResponse {
  users: SubscriptionUser[];
  total: number;
  page: number;
  pageSize: number;
  filters: {
    tier?: string;
    status?: string;
    search?: string;
  };
}

export async function GET(request: NextRequest) {
  // Verify admin access
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)),
    );
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = await createClient();

    // Build query
    let query = supabase.from("users").select("*", { count: "exact" });

    // Apply filters
    if (tier && ["free", "starter", "pro"].includes(tier)) {
      query = query.eq("subscription_tier", tier);
    }

    if (
      status &&
      ["active", "cancelled", "past_due", "trialing", "expired"].includes(
        status,
      )
    ) {
      query = query.eq("subscription_status", status);
    }

    if (search) {
      // Sanitize search input - remove special characters that could cause injection
      const sanitizedSearch = search.replace(/[%_]/g, "");

      if (sanitizedSearch.length > 0) {
        // Use ilike with wildcards safely
        query = query.or(
          `email.ilike.%${sanitizedSearch}%,full_name.ilike.%${sanitizedSearch}%`,
        );
      }
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: users,
      error,
      count,
    } = await query.order("created_at", { ascending: false }).range(from, to);

    if (error) {
      console.error("[Admin Subscriptions] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    // Enrich user data with plan details
    const enrichedUsers: SubscriptionUser[] = (users || []).map((user) => ({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      subscription_tier: user.subscription_tier as SubscriptionTier,
      subscription_status: user.subscription_status as SubscriptionStatus,
      subscription_expires_at: user.subscription_expires_at,
      tier_started_at: user.tier_started_at,
      manual_override: user.manual_override,
      created_at: user.created_at,
      updated_at: user.updated_at,
      plan_details: getPlanDetails(user.subscription_tier),
    }));

    const response: ListSubscriptionsResponse = {
      users: enrichedUsers,
      total: count || 0,
      page,
      pageSize,
      filters: {
        tier: tier || undefined,
        status: status || undefined,
        search: search || undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Admin Subscriptions] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
