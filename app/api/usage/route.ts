import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { resolveInferenceTier } from "@/lib/inference-tier";
import { checkUsageStatusReadLimit } from "@/lib/rate-limit";
import { buildUsageSnapshot } from "@/lib/usage-snapshot-server";
import { createClient } from "@/lib/supabase/server";

const QuerySchema = v.object({
  tier: v.optional(v.union([v.literal("flash"), v.literal("pro")])),
});

function normalizeUsageDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value.slice(0, 10);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const readLimit = await checkUsageStatusReadLimit(user.id);
  if (!readLimit.allowed) {
    return NextResponse.json(
      { error: "Too many usage checks. Try again soon." },
      { status: 429 },
    );
  }

  const tierParam = req.nextUrl.searchParams.get("tier") ?? undefined;
  const parsed = v.safeParse(QuerySchema, {
    tier: tierParam === "flash" || tierParam === "pro" ? tierParam : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const tier = resolveInferenceTier({ tier: parsed.output.tier ?? "flash" });
  const { data, error } = await supabase
    .from("user_usages")
    .select("generation_count, date")
    .eq("user_id", user.id)
    .maybeSingle();

  const snapshot = buildUsageSnapshot({
    tier,
    generationCount: error ? 0 : (data?.generation_count ?? 0),
    recordDate: normalizeUsageDate(data?.date),
  });

  return NextResponse.json({ data: snapshot });
}
