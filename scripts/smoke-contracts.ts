/**
 * Contract validation — no network, no API keys required.
 *   bun scripts/smoke-contracts.ts
 */
import * as v from "valibot";
import { getInferenceModelChain } from "../lib/inference-fallback";
import {
  getInferenceTierConfig,
  INFERENCE_TIER_OPTIONS,
  resolveInferenceTier,
} from "../lib/inference-tier";
import { getModelDailyLimit, USAGE_LIMITS } from "../lib/usage-limits";
import {
  StressTestPlanRequestSchema,
  StressTestPlanResponseSchema,
} from "../lib/schema/api";
import { buildUsageSnapshot } from "../lib/usage-status";
import {
  STRESS_PLANNER_AUTO_CHAIN,
  STRESS_PLANNER_MODEL_OPTIONS,
} from "../lib/stress-planner-models";

let failures = 0;

function check(name: string, ok: boolean, detail?: string): void {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

// Inference tiers
check("flash tier resolves", resolveInferenceTier({ tier: "flash" }) === "flash");
check("pro tier resolves", resolveInferenceTier({ tier: "pro" }) === "pro");
check(
  "invalid tier falls back to flash",
  resolveInferenceTier({ tier: "invalid" }) === "flash",
);
check(
  "tier options count",
  INFERENCE_TIER_OPTIONS.length === 2,
  `got ${INFERENCE_TIER_OPTIONS.length}`,
);

// Model chains
const flashChain = getInferenceModelChain("flash");
check("flash chain length", flashChain.length === 2);
check(
  "flash chain ends with qwen",
  flashChain.at(-1) === "qwen3.6-flash",
);

// Usage limits
check(
  "flash daily limit",
  getModelDailyLimit("deepseek:deepseek-v4-flash") === USAGE_LIMITS.modelDaily["deepseek:deepseek-v4-flash"],
);
check(
  "qwen fallback limit",
  getModelDailyLimit("qwen:qwen3.6-flash") > 0,
);

// Usage snapshot contract
const snapshot = buildUsageSnapshot({
  tier: "flash",
  generationCount: 5,
  recordDate: new Date().toISOString().slice(0, 10),
});
check("usage snapshot remaining", snapshot.remaining === snapshot.limit - 5);
check("usage snapshot percent", snapshot.percentUsed >= 0 && snapshot.percentUsed <= 100);

// Stress planner chain
check(
  "stress auto chain",
  STRESS_PLANNER_AUTO_CHAIN.length === 2 &&
    STRESS_PLANNER_AUTO_CHAIN[1] === "qwen:qwen3.6-flash",
);
check(
  "stress planner options",
  STRESS_PLANNER_MODEL_OPTIONS.some((m) => m.id === "qwen:qwen3.6-flash"),
);

// API schema contracts
const planReq = v.safeParse(StressTestPlanRequestSchema, {
  nodes: [{ id: "n1", type: "gateway", data: { label: "API" } }],
  edges: [],
  plannerConfig: { mode: "auto" },
});
check("StressTestPlanRequest auto mode", planReq.success);

const planRes = v.safeParse(StressTestPlanResponseSchema, {
  type: "stress-test-plan",
  data: {
    assumptions: [],
    scenarios: [],
    markdown: "",
    source: "fallback",
    plannerMeta: {
      providerUsed: "qwen",
      modelUsed: "qwen:qwen3.6-flash",
      attempts: [
        {
          modelId: "deepseek:deepseek-v4-flash",
          ok: false,
          reasonCode: "auth_failed",
        },
        { modelId: "qwen:qwen3.6-flash", ok: true },
      ],
      warningCode: "partial_failover",
      warning: "Primary planner failed. Switched to backup model.",
    },
  },
});
check("StressTestPlanResponse with qwen provider", planRes.success);

// Tier config invariants
for (const tier of ["flash", "pro"] as const) {
  const cfg = getInferenceTierConfig(tier);
  check(`${tier} has dashscope model`, cfg.dashscopeModel.length > 0);
  check(`${tier} has modelId`, cfg.modelId.includes("deepseek"));
}

console.log(`\n${failures === 0 ? "All contract checks passed" : `${failures} contract check(s) failed`}\n`);
process.exit(failures > 0 ? 1 : 0);
