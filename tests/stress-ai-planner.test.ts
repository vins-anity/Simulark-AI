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

process.env.NVIDIA_API_KEY = "test-nvidia-key";
process.env.ZHIPU_API_KEY = "test-zhipu-key";

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

  it("auto chain falls back from GLM-5 auth failure to Kimi success", async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error("401 Unauthorized"))
      .mockResolvedValueOnce(validAIText("B"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("kimi");
    expect(result.plannerMeta.modelUsed).toBe("nvidia:moonshotai/kimi-k2.5");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "nvidia:z-ai/glm5",
        ok: false,
        reasonCode: "auth_failed",
      },
      {
        modelId: "nvidia:moonshotai/kimi-k2.5",
        ok: true,
      },
    ]);
    expect(result.warning).toBe(
      "Primary planner failed. Switched to backup model.",
    );
  });

  it("auto chain falls back across timeouts and succeeds on MiniMax", async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error("planner_timeout"))
      .mockRejectedValueOnce(new Error("planner_timeout"))
      .mockResolvedValueOnce(validAIText("C"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("minimax");
    expect(result.plannerMeta.modelUsed).toBe("nvidia:minimaxai/minimax-m2.1");
    expect(result.plannerMeta.attempts.map((item) => item.reasonCode)).toEqual([
      "timeout",
      "timeout",
      undefined,
    ]);
    expect(getModelMock.mock.calls.map((call) => call[0])).toEqual([
      "nvidia:z-ai/glm5",
      "nvidia:moonshotai/kimi-k2.5",
      "nvidia:minimaxai/minimax-m2.1",
    ]);
  });

  it("auto chain uses deterministic fallback when all models fail", async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error("401 User not found"))
      .mockRejectedValueOnce(new Error("provider down"))
      .mockRejectedValueOnce(new Error("provider down"))
      .mockRejectedValueOnce(new Error("provider down"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "auto",
    });

    expect(result.source).toBe("fallback");
    expect(result.plannerMeta.providerUsed).toBe("fallback");
    expect(result.plannerMeta.attempts).toHaveLength(4);
    expect(result.plannerMeta.warningCode).toBe("ai_unavailable");
    expect(result.warning?.includes("User not found")).toBe(false);
  });

  it("manual mode succeeds with selected model", async () => {
    generateTextMock.mockResolvedValueOnce(validAIText("D"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "manual",
      modelId: "zhipu:glm-4.7-flash",
    });

    expect(result.source).toBe("ai");
    expect(result.plannerMeta.providerUsed).toBe("zhipu");
    expect(result.plannerMeta.modelUsed).toBe("zhipu:glm-4.7-flash");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "zhipu:glm-4.7-flash",
        ok: true,
      },
    ]);
  });

  it("manual mode falls back deterministically on selected model failure", async () => {
    generateTextMock.mockRejectedValueOnce(new Error("invalid api key"));

    const result = await generateStressTestPlanWithAI(nodes, edges, {
      mode: "manual",
      modelId: "nvidia:z-ai/glm5",
    });

    expect(result.source).toBe("fallback");
    expect(result.plannerMeta.providerUsed).toBe("fallback");
    expect(result.plannerMeta.warningCode).toBe("manual_model_failed");
    expect(result.plannerMeta.attempts).toEqual([
      {
        modelId: "nvidia:z-ai/glm5",
        ok: false,
        reasonCode: "auth_failed",
      },
    ]);
    expect(result.warning?.includes("invalid api key")).toBe(false);
  });
});
