import type { Edge, Node } from "@xyflow/react";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { logger } from "@/lib/logger";
import {
  StressTestRunEventSchema,
  type StressTestRunRequestInput,
  StressTestRunRequestSchema,
} from "@/lib/schema/api";
import { runStressSimulation } from "@/lib/stress-runner";
import { getEffectiveTier } from "@/lib/subscription-lifecycle";
import { createClient } from "@/lib/supabase/server";

function createStableSeed(
  nodes: Node[],
  edges: Edge[],
  scenarioId: string,
): number {
  const source = `${scenarioId}:${nodes.length}:${edges.length}:${nodes
    .map((node) => node.id)
    .sort()
    .join("|")}:${edges
    .map((edge) => edge.id)
    .sort()
    .join("|")}`;

  let hash = 2166136261;
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

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
    const parsed = v.safeParse(StressTestRunRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stress test run payload" },
        { status: 400 },
      );
    }

    const {
      nodes,
      edges,
      scenario,
      seed,
      nodeSpecOverrides = {},
    } = parsed.output as StressTestRunRequestInput & {
      nodes: Node[];
      edges: Edge[];
    };

    const runSeed = Number.isFinite(seed)
      ? Number(seed)
      : createStableSeed(nodes, edges, scenario.id);

    logger.info("Starting stress test run", {
      userId: user.id,
      tier: effectiveTier,
      seed: runSeed,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      scenarioId: scenario.id,
      scenarioType: scenario.type,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runStressSimulation(
            {
              nodes,
              edges,
              scenario,
              seed: runSeed,
              nodeSpecOverrides,
            },
            { delayMs: 80 },
          )) {
            const validatedEvent = v.safeParse(StressTestRunEventSchema, event);
            if (!validatedEvent.success) {
              logger.warn("Dropped invalid stress stream event", {
                scenarioId: scenario.id,
              });
              continue;
            }

            controller.enqueue(
              encoder.encode(`${JSON.stringify(validatedEvent.output)}\n`),
            );
          }
        } catch (error: any) {
          logger.error("[Stress Test Run] Stream failed", error);
          const fallbackEvent = {
            type: "error" as const,
            data: {
              message:
                error?.message || "Stress simulation failed unexpectedly",
            },
          };
          controller.enqueue(
            encoder.encode(`${JSON.stringify(fallbackEvent)}\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    logger.error("[Stress Test Run] Error", error);
    return NextResponse.json(
      { error: error.message || "Failed to start stress test run" },
      { status: 500 },
    );
  }
}
