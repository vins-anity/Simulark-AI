import type { Edge, Node } from "@xyflow/react";
import { generateText } from "ai";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { getModel } from "@/lib/provider-registry";
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

interface AIPlanPayload {
  assumptions: string[];
  scenarios: StressScenario[];
}

const allowedScenarioTypes: Set<StressScenario["type"]> = new Set([
  "traffic-spike",
  "node-failure",
  "dependency-latency",
  "queue-backlog",
  "data-store-hotspot",
]);

function extractJson(text: string): string | null {
  const codeBlockMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function sanitizePlanPayload(payload: unknown): AIPlanPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const assumptions = isStringArray(obj.assumptions)
    ? obj.assumptions.slice(0, 8)
    : [];

  const rawScenarios = Array.isArray(obj.scenarios) ? obj.scenarios : [];
  const scenarios: StressScenario[] = [];

  for (const item of rawScenarios) {
    if (!item || typeof item !== "object") continue;
    const scenario = item as Record<string, unknown>;
    const type = scenario.type;

    if (
      typeof type !== "string" ||
      !allowedScenarioTypes.has(type as StressScenario["type"])
    ) {
      continue;
    }

    const targets = isStringArray(scenario.targets)
      ? scenario.targets.filter((t) => t.trim().length > 0).slice(0, 5)
      : [];

    const passCriteria = isStringArray(scenario.passCriteria)
      ? scenario.passCriteria.filter((t) => t.trim().length > 0).slice(0, 6)
      : [];

    const loadProfileRaw =
      scenario.loadProfile && typeof scenario.loadProfile === "object"
        ? (scenario.loadProfile as Record<string, unknown>)
        : null;

    const baselineRps = Number(loadProfileRaw?.baselineRps || 120);
    const peakRps = Number(loadProfileRaw?.peakRps || 480);
    const rampSeconds = Number(loadProfileRaw?.rampSeconds || 120);
    const holdSeconds = Number(loadProfileRaw?.holdSeconds || 480);

    scenarios.push({
      id: typeof scenario.id === "string" ? scenario.id : type,
      type: type as StressScenario["type"],
      name:
        typeof scenario.name === "string" && scenario.name.trim().length > 0
          ? scenario.name
          : type,
      objective:
        typeof scenario.objective === "string" &&
        scenario.objective.trim().length > 0
          ? scenario.objective
          : "Validate resilience under stress",
      targets,
      loadProfile: {
        baselineRps: Number.isFinite(baselineRps)
          ? Math.max(1, baselineRps)
          : 120,
        peakRps: Number.isFinite(peakRps) ? Math.max(1, peakRps) : 480,
        rampSeconds: Number.isFinite(rampSeconds)
          ? Math.max(10, rampSeconds)
          : 120,
        holdSeconds: Number.isFinite(holdSeconds)
          ? Math.max(30, holdSeconds)
          : 480,
      },
      passCriteria:
        passCriteria.length > 0
          ? passCriteria
          : ["Architecture maintains acceptable resilience during the test"],
    });
  }

  if (scenarios.length === 0) return null;

  return {
    assumptions,
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

async function attemptPlanWithModel(
  modelId: string,
  graphSummary: object,
  fallbackPlan: StressTestPlan,
): Promise<StressTestPlan> {
  const model = getModel(modelId);

  const prompt = `You are a resilience engineer. Generate architecture stress scenarios.
Return strict JSON with this shape:
{
  "assumptions": string[],
  "scenarios": [
    {
      "id": string,
      "type": "traffic-spike" | "node-failure" | "dependency-latency" | "queue-backlog" | "data-store-hotspot",
      "name": string,
      "objective": string,
      "targets": string[],
      "loadProfile": {
        "baselineRps": number,
        "peakRps": number,
        "rampSeconds": number,
        "holdSeconds": number
      },
      "passCriteria": string[]
    }
  ]
}

Graph summary:
${JSON.stringify(graphSummary, null, 2)}
`;

  const result = await Promise.race([
    generateText({
      model,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 2200,
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("planner_timeout")), 10000);
    }),
  ]);

  const raw = extractJson(result.text);
  if (!raw) {
    throw new Error("invalid_payload");
  }

  const parsed = JSON.parse(raw);
  const sanitized = sanitizePlanPayload(parsed);

  if (!sanitized) {
    throw new Error("invalid_payload");
  }

  return toPlanFromPayload(sanitized, fallbackPlan);
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
