import type { Edge, Node } from "@xyflow/react";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { logger } from "@/lib/logger";
import {
  type StressTestPlanRequestInput,
  StressTestPlanRequestSchema,
} from "@/lib/schema/api";
import { generateStressTestPlanWithAI } from "@/lib/stress-ai-planner";
import { getEffectiveTier } from "@/lib/subscription-lifecycle";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let effectiveTier = "free";
    const freeTierEnabled = isFeatureEnabled("chaosEngineering", "free");
    if (!freeTierEnabled) {
      effectiveTier = await getEffectiveTier(user.id);
      if (!isFeatureEnabled("chaosEngineering", effectiveTier)) {
        return NextResponse.json(
          { error: "Stress testing is not available for your plan" },
          { status: 403 },
        );
      }
    }

    const body = await req.json();
    const parsed = v.safeParse(StressTestPlanRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stress test plan payload" },
        { status: 400 },
      );
    }

    const { nodes, edges } = parsed.output as StressTestPlanRequestInput & {
      nodes: Node[];
      edges: Edge[];
    };
    const plannerConfig = parsed.output.plannerConfig;

    const result = await generateStressTestPlanWithAI(
      nodes,
      edges,
      plannerConfig,
    );
    const plan = result.plan;

    logger.info("Generated stress test plan", {
      userId: user.id,
      tier: effectiveTier,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      scenarioCount: plan.scenarios.length,
      source: result.source,
      warning: result.warning,
      plannerProvider: result.plannerMeta.providerUsed,
      plannerModel: result.plannerMeta.modelUsed,
    });

    return NextResponse.json({
      type: "stress-test-plan",
      data: {
        assumptions: plan.assumptions,
        scenarios: plan.scenarios,
        markdown: plan.markdown,
        source: result.source,
        warning: result.warning,
        plannerMeta: result.plannerMeta,
      },
    });
  } catch (error: any) {
    logger.error("[Stress Test Plan] Error", error);
    return NextResponse.json(
      { error: error.message || "Failed to build stress test plan" },
      { status: 500 },
    );
  }
}
