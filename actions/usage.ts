"use server";

import type { InferenceTier } from "@/lib/inference-tier";
import { resolveInferenceTier } from "@/lib/inference-tier";
import { checkUsageStatusReadLimit } from "@/lib/rate-limit";
import { buildUsageSnapshot } from "@/lib/usage-snapshot-server";
import type { DailyUsageSnapshot } from "@/lib/usage-status";
import { createClient } from "@/lib/supabase/server";
import * as v from "valibot";

function normalizeUsageDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value.slice(0, 10);
}

async function getDailyUsageSnapshot(
  userId: string,
  tierInput?: InferenceTier | string,
): Promise<DailyUsageSnapshot> {
  const tier = resolveInferenceTier({ tier: tierInput });
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_usages")
    .select("generation_count, date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return buildUsageSnapshot({
      tier,
      generationCount: 0,
      recordDate: null,
    });
  }

  return buildUsageSnapshot({
    tier,
    generationCount: data?.generation_count ?? 0,
    recordDate: normalizeUsageDate(data?.date),
  });
}

const UsageTierSchema = v.optional(
  v.union([v.literal("flash"), v.literal("pro")]),
);

export async function getUsageStatus(
  tierInput?: InferenceTier,
): Promise<
  | { success: true; data: DailyUsageSnapshot }
  | { success: false; error: string }
> {
  const parsedTier = v.safeParse(UsageTierSchema, tierInput);
  if (!parsedTier.success) {
    return { success: false, error: "Invalid tier" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const readLimit = await checkUsageStatusReadLimit(user.id);
  if (!readLimit.allowed) {
    return { success: false, error: "Too many usage checks. Try again soon." };
  }

  const data = await getDailyUsageSnapshot(user.id, parsedTier.output ?? "flash");
  return { success: true, data };
}
