import type { Edge, Node } from "@xyflow/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateTextMock = vi.fn();
const getModelMock = vi.fn();

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
}));

vi.mock("@/lib/provider-registry", () => ({
  getModel: (modelId: string) => getModelMock(modelId),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

process.env.DASHSCOPE_API_KEY = "test-dashscope-key";

import { generateStressTestPlanWithAI } from "../lib/stress-ai-planner";

const nodes: Node[] = [
  {
    id: "gateway-1",
    type: "gateway",
    position: { x: 0, y: 0 },
    data: { label: "Gateway", serviceType: "gateway" },
  },
  {
    id: "service-1",
    type: "service",
    position: { x: 200, y: 0 },
    data: { label: "API", serviceType: "service" },
  },
];

const edges: Edge[] = [
  { id: "edge-1", source: "gateway-1", target: "service-1" },
];

function validAIText(suffix = "A"): { text: string } {
  return {
    text: JSON.stringify({
      assumptions: [`Assumption ${suffix}`],
      scenarios: [
        {
          id: `traffic-spike-${suffix}`,
          type: "traffic-spike",
          name: `Traffic Spike ${suffix}`,
          objective: "Validate resilience under peak load",
          targets: ["Gateway"],
          loadProfile: {
            baselineRps: 120,
            peakRps: 600,
            rampSeconds: 90,
            holdSeconds: 240,
          },
          passCriteria: ["Availability >= 99%"],
        },
      ],
    }),
  };
}

describe("stress-ai-planner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModelMock.mockImplementation((modelId: string) => ({ modelId }));
  });

  it("auto chain succeeds with Flash model", async () => {
    generateTextMock.mockResolvedValueOnce(validAIText("B"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("deepseek");
    expect(result.plannerMeta.modelUsed).toBe("deepseek:deepseek-v4-flash");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "deepseek:deepseek-v4-flash",
        ok: true,
      },
    ]);
  });

  it("auto chain uses qwen fallback when Flash fails", async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error("429 rate limit"))
      .mockResolvedValueOnce(validAIText("C"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("qwen");
    expect(result.plannerMeta.modelUsed).toBe("qwen:qwen3.6-flash");
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it("auto chain uses deterministic fallback when all models fail", async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error("401 Unauthorized"))
      .mockRejectedValueOnce(new Error("401 Unauthorized"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("fallback");
    expect(result.plannerMeta.providerUsed).toBe("fallback");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "deepseek:deepseek-v4-flash",
        ok: false,
        reasonCode: "auth_failed",
      },
      {
        modelId: "qwen:qwen3.6-flash",
        ok: false,
        reasonCode: "auth_failed",
      },
    ]);
    expect(result.plannerMeta.warningCode).toBe("ai_unavailable");
  });

  it("manual mode succeeds with selected Flash model", async () => {
    generateTextMock.mockResolvedValueOnce(validAIText("D"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "manual",
      modelId: "deepseek:deepseek-v4-flash",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("deepseek");
    expect(result.plannerMeta.modelUsed).toBe("deepseek:deepseek-v4-flash");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "deepseek:deepseek-v4-flash",
        ok: true,
      },
    ]);
  });

  it("manual mode falls back deterministically on selected model failure", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("invalid api key"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "manual",
      modelId: "deepseek:deepseek-v4-flash",
    });

    expect(result.source).toBe("fallback");
    expect(result.plannerMeta.providerUsed).toBe("fallback");
    expect(result.plannerMeta.warningCode).toBe("manual_model_failed");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "deepseek:deepseek-v4-flash",
        ok: false,
        reasonCode: "auth_failed",
      },
    ]);
    expect(result.warning?.includes("invalid api key")).toBe(false);
  });
});
