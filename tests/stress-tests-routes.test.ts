import * as v from "valibot";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StressTestPlanResponseSchema } from "../lib/schema/api";

const getUserMock = vi.fn();
const isFeatureEnabledMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

vi.mock("@/lib/feature-flags", () => ({
  isFeatureEnabled: isFeatureEnabledMock,
}));

import { POST as planPost } from "../app/api/stress-tests/plan/route";
import { POST as runPost } from "../app/api/stress-tests/run/route";

describe("stress test routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthorized stress plan requests", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });

    const request = new Request("http://localhost/api/stress-tests/plan", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await planPost(request as any);
    expect(response.status).toBe(401);
  });

  it("returns 401 for unauthorized stress run requests", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null } });

    const request = new Request("http://localhost/api/stress-tests/run", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await runPost(request as any);
    expect(response.status).toBe(401);
  });

  it("returns plannerMeta with sanitized planner details", async () => {
    getUserMock.mockResolvedValueOnce({
      data: {
        user: {
          id: "a2da8c6f-5b03-4828-a45a-3e23405a24a6",
        },
      },
    });
    isFeatureEnabledMock.mockReturnValue(true);

    const request = new Request("http://localhost/api/stress-tests/plan", {
      method: "POST",
      body: JSON.stringify({
        nodes: [{ id: "gateway-1", type: "gateway", data: { label: "API" } }],
        edges: [],
        plannerConfig: {
          mode: "manual",
          modelId: "unsupported:model",
        },
      }),
    });

    const response = await planPost(request as any);
    expect(response.status).toBe(200);
    const payload = await response.json();
    const parsed = v.safeParse(StressTestPlanResponseSchema, payload);
    expect(parsed.success).toBe(true);

    if (parsed.success) {
      expect(parsed.output.data.plannerMeta.providerUsed).toBe("fallback");
      expect(parsed.output.data.plannerMeta.attempts.length).toBe(1);
      expect(
        parsed.output.data.plannerMeta.warning?.includes("User not found."),
      ).toBe(false);
    }
  });
});
