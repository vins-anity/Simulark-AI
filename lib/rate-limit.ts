import { createClient } from "@/lib/supabase/server";
import { getPlanDetails } from "@/lib/subscription";

export async function checkRateLimit(userId: string) {
  const supabase = await createClient(); // Use server client

  // 1. Get User's Subscription Tier
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("subscription_tier")
    .eq("user_id", userId)
    .single();

  if (userError) {
    console.error("Rate Limit: Failed to fetch user tier", userError);
    // Fail open or closed? Let's fail safe to free tier limits if we can't read
  }

  const tier = userData?.subscription_tier || "free";
  const plan = getPlanDetails(tier);

  // Safety check: if plan doesn't have a limit defined, default to 10 (Free)
  const dailyLimit = plan.daily_limit ?? 10;

  // 2. Get User's Current Usage for Today
  const today = new Date().toISOString().split("T")[0];

  const { data: usageData, error: usageError } = await supabase
    .from("user_usages")
    .select("generation_count, date")
    .eq("user_id", userId)
    .single();

  let currentCount = 0;

  // Handle case where no record exists yet
  if (!usageData) {
    currentCount = 0;
  } else if (usageData.date !== today) {
    // Record exists but from previous day - reset logic handled by upsert below
    currentCount = 0;
  } else {
    currentCount = usageData.generation_count;
  }

  // 3. Check Limit
  if (currentCount >= dailyLimit) {
    return {
      allowed: false,
      limit: dailyLimit,
      remaining: 0,
      reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(), // Midnight tonight
    };
  }

  // 4. Increment Usage (Optimistic)
  // We use upsert to handle both new rows and updates, and date rollovers
  const { error: updateError } = await supabase.from("user_usages").upsert(
    {
      user_id: userId,
      date: today,
      generation_count: currentCount + 1,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (updateError) {
    console.error("Rate Limit: Failed to update usage", updateError);
    // If we can't write usage, we might want to still allow it but log error
    // Or fail close. For now, allow but log.
  }

  return {
    allowed: true,
    limit: dailyLimit,
    remaining: dailyLimit - (currentCount + 1),
    reset: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
  };
}
