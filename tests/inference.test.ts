import { describe, expect, it } from "vitest";
import { shouldUseAgentPath } from "@/lib/agent/routing";
import { getInferenceModelChain } from "@/lib/inference-fallback";
import { getResilientStreamAttempts } from "@/lib/inference/resilient-model";
import { INFERENCE_TIERS } from "@/lib/inference-tier";

describe("agent routing", () => {
  it("uses structured path for empty canvas", () => {
    expect(shouldUseAgentPath("modify", 0)).toBe(false);
    expect(shouldUseAgentPath("create", 0)).toBe(false);
  });

  it("uses agent path for modify operations with existing graph", () => {
    expect(shouldUseAgentPath("modify", 3)).toBe(true);
    expect(shouldUseAgentPath("extend", 2)).toBe(true);
    expect(shouldUseAgentPath("create", 5)).toBe(false);
  });
});

describe("tier failover chain", () => {
  it("pro tier includes flash and qwen fallback", () => {
    expect(getInferenceModelChain("pro")).toEqual([
      INFERENCE_TIERS.pro.dashscopeModel,
      INFERENCE_TIERS.flash.dashscopeModel,
      "qwen3.6-flash",
    ]);
  });

  it("flash tier includes qwen fallback", () => {
    expect(getInferenceModelChain("flash")).toEqual([
      INFERENCE_TIERS.flash.dashscopeModel,
      "qwen3.6-flash",
    ]);
  });
});

describe("resilient stream attempts", () => {
  it("disables thinking on fallback models", () => {
    const attempts = getResilientStreamAttempts(INFERENCE_TIERS.pro);
    expect(attempts[0]?.options.enableThinking).toBe(true);
    expect(attempts[1]?.options.enableThinking).toBe(false);
    expect(attempts[2]?.options.enableThinking).toBe(false);
  });
});
