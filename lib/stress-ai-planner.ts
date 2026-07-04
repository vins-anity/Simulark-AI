import { z } from "zod";
import type { Edge, Node } from "@xyflow/react";
import { generateObject } from "ai";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { getWrappedDashscopeModel } from "@/lib/inference/resilient-model";
import { INFERENCE_TIERS } from "@/lib/inference-tier";
import type { StressPlannerMetaInput } from "@/lib/schema/api";
import {
  isSupportedStressPlannerModel,
  STRESS_PLANNER_AUTO_CHAIN,
  STRESS_PLANNER_MODEL_OPTIONS,
  type StressPlannerMode,
} from "@/lib/stress-planner-models";
import {
  buildStressTestPlan,
  type StressScenario,
  type StressTestPlan,
} from "@/lib/stress-testing-plan";

type PlannerReasonCode =
  StressPlannerMetaInput["attempts"][number]["reasonCode"];
type PlannerProvider = StressPlannerMetaInput["providerUsed"];

interface PlannerConfig {
  mode?: StressPlannerMode;
  modelId?: string;
}

export interface AIPlannerResult {
  plan: StressTestPlan;
  source: "ai" | "fallback";
  warning?: string;
  plannerMeta: StressPlannerMetaInput;
}

const StressPlanOutputSchema = z.object({
  assumptions: z.array(z.string()),
  scenarios: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        "traffic-spike",
        "node-failure",
        "dependency-latency",
        "queue-backlog",
        "data-store-hotspot",
      ]),
      name: z.string(),
      objective: z.string(),
      targets: z.array(z.string()),
      loadProfile: z.object({
        baselineRps: z.number(),
        peakRps: z.number(),
        rampSeconds: z.number(),
        holdSeconds: z.number(),
      }),
      passCriteria: z.array(z.string()),
    }),
  ),
});

type AIPlanPayload = z.infer<typeof StressPlanOutputSchema>;

const allowedScenarioTypes: Set<StressScenario["type"]> = new Set([
  "traffic-spike",
  "node-failure",
  "dependency-latency",
  "queue-backlog",
  "data-store-hotspot",
]);

function sanitizePlanPayload(payload: unknown): AIPlanPayload | null {
  const parsed = StressPlanOutputSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  const scenarios: StressScenario[] = [];
  for (const scenario of parsed.data.scenarios) {
    if (!allowedScenarioTypes.has(scenario.type)) {
      continue;
    }
    scenarios.push({
      ...scenario,
      targets: scenario.targets.filter((t) => t.trim().length > 0).slice(0, 5),
      passCriteria:
        scenario.passCriteria.length > 0
          ? scenario.passCriteria
          : ["Architecture maintains acceptable resilience during the test"],
    });
  }

  if (scenarios.length === 0) {
    return null;
  }

  return {
    assumptions: parsed.data.assumptions.slice(0, 8),
    scenarios,
  };
}

function toPlanFromPayload(
  payload: AIPlanPayload,
  fallbackPlan: StressTestPlan,
): StressTestPlan {
  const assumptions =
    payload.assumptions.length > 0
      ? payload.assumptions
      : fallbackPlan.assumptions;

  const lines: string[] = [];
  lines.push("# Stress Testing Plan");
  lines.push("");
  lines.push("## Assumptions");
  lines.push("");
  for (const assumption of assumptions) {
    lines.push(`- ${assumption}`);
  }
  lines.push("");
  lines.push("## Scenarios");
  lines.push("");
  for (const scenario of payload.scenarios) {
    lines.push(`### ${scenario.name}`);
    lines.push("");
    lines.push(`- **Type**: ${scenario.type}`);
    lines.push(`- **Objective**: ${scenario.objective}`);
    lines.push(
      `- **Targets**: ${scenario.targets.length > 0 ? scenario.targets.join(", ") : "N/A"}`,
    );
    lines.push(
      `- **Load Profile**: ${scenario.loadProfile.baselineRps} -> ${scenario.loadProfile.peakRps} RPS, ramp ${scenario.loadProfile.rampSeconds}s, hold ${scenario.loadProfile.holdSeconds}s`,
    );
    lines.push("- **Pass Criteria**:");
    for (const criterion of scenario.passCriteria) {
      lines.push(`  - ${criterion}`);
    }
    lines.push("");
  }

  return {
    assumptions,
    scenarios: payload.scenarios,
    markdown: lines.join("\n"),
  };
}

function modelToProviderUsed(modelId: string): PlannerProvider {
  if (modelId.startsWith("qwen:")) {
    return "qwen";
  }
  const match = STRESS_PLANNER_MODEL_OPTIONS.find(
    (item) => item.id === modelId,
  );
  return match?.providerUsed || "fallback";
}

function normalizePlannerErrorReason(error: unknown): PlannerReasonCode {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "unknown";
  const message = rawMessage.toLowerCase();

  if (message.includes("timeout")) {
    return "timeout";
  }
  if (
    message.includes("auth") ||
    message.includes("unauthorized") ||
    message.includes("invalid api key") ||
    message.includes("401") ||
    message.includes("user not found")
  ) {
    return "auth_failed";
  }
  if (
    message.includes("invalid") ||
    message.includes("unexpected token") ||
    message.includes("json") ||
    message.includes("payload") ||
    message.includes("schema") ||
    message.includes("format")
  ) {
    return "invalid_payload";
  }
  return "provider_unavailable";
}

function getModelOrder(config?: PlannerConfig): {
  mode: StressPlannerMode;
  models: string[];
} {
  if (config?.mode === "manual") {
    if (!config.modelId || !isSupportedStressPlannerModel(config.modelId)) {
      return { mode: "manual", models: [] };
    }
    return { mode: "manual", models: [config.modelId] };
  }

  return { mode: "auto", models: [...STRESS_PLANNER_AUTO_CHAIN] };
}

function hasCredentialsForModel(modelId: string): boolean {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  if (modelId.startsWith("deepseek:")) {
    return Boolean(env.DASHSCOPE_API_KEY || env.QWEN_API_KEY);
  }
  if (modelId.startsWith("qwen:")) {
    return Boolean(env.DASHSCOPE_API_KEY || env.QWEN_API_KEY);
  }
  if (modelId.startsWith("nvidia:")) {
    return Boolean(env.NVIDIA_API_KEY);
  }
  if (modelId.startsWith("zhipu:")) {
    return Boolean(env.ZHIPU_API_KEY);
  }
  if (modelId.startsWith("kimi:")) {
    return Boolean(env.KIMI_API_KEY);
  }
  if (modelId.startsWith("openrouter:")) {
    return Boolean(env.OPENROUTER_API_KEY);
  }
  return true;
}

function resolveDashscopeModelName(modelId: string): string {
  const [, ...parts] = modelId.split(":");
  return parts.join(":") || INFERENCE_TIERS.flash.dashscopeModel;
}

async function attemptPlanWithModel(
  modelId: string,
  graphSummary: object,
  fallbackPlan: StressTestPlan,
): Promise<StressTestPlan> {
  const modelName = resolveDashscopeModelName(modelId);
  const model = getWrappedDashscopeModel(modelName);

  const prompt = `You are a resilience engineer. Generate architecture stress scenarios.
Graph summary:
${JSON.stringify(graphSummary, null, 2)}
`;

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 10_000);

  try {
    const { object } = await generateObject({
      model,
      schema: StressPlanOutputSchema,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 2200,
      abortSignal: abortController.signal,
    });

    const sanitized = sanitizePlanPayload(object);
    if (!sanitized) {
      throw new Error("invalid_payload");
    }

    return toPlanFromPayload(sanitized, fallbackPlan);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateStressTestPlanWithAI(
  nodes: Node[],
  edges: Edge[],
  plannerConfig?: PlannerConfig,
): Promise<AIPlannerResult> {
  const fallbackPlan = buildStressTestPlan(nodes, edges);
  const planner = getModelOrder(plannerConfig);
  const attempts: StressPlannerMetaInput["attempts"] = [];
  const hasManualSelection = planner.mode === "manual";

  const graphSummary = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodeTypes: Array.from(
      new Set(nodes.map((node) => node.type).filter(Boolean)),
    ).slice(0, 20),
    edges: edges.slice(0, 40).map((edge) => ({
      source: edge.source,
      target: edge.target,
      protocol: edge.data?.protocol || "http",
    })),
    nodes: nodes.slice(0, 60).map((node) => ({
      id: node.id,
      label: node.data?.label || node.id,
      type: node.type,
      tech: node.data?.tech || null,
    })),
  };

  if (planner.models.length === 0) {
    if (plannerConfig?.mode === "manual") {
      attempts.push({
        modelId: plannerConfig.modelId || "manual:unselected",
        ok: false,
        reasonCode: "provider_unavailable",
      });
    }
    const warning =
      "Selected planner model is unavailable. Using deterministic fallback.";
    return {
      plan: fallbackPlan,
      source: "fallback",
      warning,
      plannerMeta: {
        providerUsed: "fallback",
        attempts,
        warningCode: "manual_model_failed",
        warning,
      },
    };
  }

  for (const modelId of planner.models) {
    if (!hasCredentialsForModel(modelId)) {
      attempts.push({
        modelId,
        ok: false,
        reasonCode: "auth_failed",
      });
      continue;
    }

    try {
      const plan = await attemptPlanWithModel(
        modelId,
        graphSummary,
        fallbackPlan,
      );
      attempts.push({ modelId, ok: true });

      const hadFailures = attempts.some((attempt) => !attempt.ok);
      const warning = hadFailures
        ? "Primary planner failed. Switched to backup model."
        : undefined;

      return {
        plan,
        source: "ai",
        warning,
        plannerMeta: {
          providerUsed: modelToProviderUsed(modelId),
          modelUsed: modelId,
          attempts,
          warningCode: hadFailures ? "partial_failover" : undefined,
          warning,
        },
      };
    } catch (error: unknown) {
      const reasonCode = normalizePlannerErrorReason(error);
      attempts.push({ modelId, ok: false, reasonCode });
      logger.warn("Stress AI planner model failed", {
        modelId,
        reasonCode,
      });
    }
  }

  const warning = hasManualSelection
    ? "Selected planner model failed. Using deterministic fallback."
    : "AI planner unavailable, using deterministic fallback";

  return {
    plan: fallbackPlan,
    source: "fallback",
    warning,
    plannerMeta: {
      providerUsed: "fallback",
      attempts,
      warningCode: hasManualSelection
        ? "manual_model_failed"
        : "ai_unavailable",
      warning,
    },
  };
}
