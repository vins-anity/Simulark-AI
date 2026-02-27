import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { analyzeArchitectureQuality } from "@/lib/architecture-quality";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

const logger = createLogger("api:quality-check");

const QualityCheckRequestSchema = v.object({
  nodes: v.pipe(v.array(v.any()), v.minLength(1), v.maxLength(1000)),
  edges: v.pipe(v.array(v.any()), v.maxLength(5000)),
  mode: v.optional(
    v.union([
      v.literal("default"),
      v.literal("startup"),
      v.literal("enterprise"),
    ]),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = v.safeParse(QualityCheckRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quality check payload" },
        { status: 400 },
      );
    }

    const report = analyzeArchitectureQuality(
      parsed.output.nodes,
      parsed.output.edges,
      parsed.output.mode,
    );

    return NextResponse.json({
      type: "architecture-quality-report",
      data: report,
    });
  } catch (error: any) {
    logger.error("[Quality Check] Error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to evaluate architecture quality" },
      { status: 500 },
    );
  }
}
