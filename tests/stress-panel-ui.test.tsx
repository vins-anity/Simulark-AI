import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getPlannerRequestConfig,
  getPlannerStatusMessage,
} from "../components/canvas/StressTestPanel";

const PANEL_PATH =
  "/Users/vinsanity/dev/personal/Simulark-AI/components/canvas/StressTestPanel.tsx";

describe("stress panel UI behavior", () => {
  it("contains clear how-it-works and seed explanation copy", () => {
    const source = readFileSync(PANEL_PATH, "utf8");
    expect(source).toContain("What This Feature Does");
    expect(source).toContain("Seed locks randomness");
  });

  it("builds plan request payload correctly for auto/manual planner modes", () => {
    expect(getPlannerRequestConfig("auto", "auto")).toEqual({
      mode: "auto",
    });
    expect(
      getPlannerRequestConfig("manual", "nvidia:moonshotai/kimi-k2.5"),
    ).toEqual({
      mode: "manual",
      modelId: "nvidia:moonshotai/kimi-k2.5",
    });
  });

  it("formats planner status banner with sanitized fallback messaging", () => {
    const message = getPlannerStatusMessage({
      providerUsed: "fallback",
      attempts: [
        {
          modelId: "nvidia:z-ai/glm5",
          ok: false,
          reasonCode: "auth_failed",
        },
      ],
      warning: "AI planner unavailable, using deterministic fallback",
      warningCode: "ai_unavailable",
    });

    expect(message).toContain("Deterministic planner used");
    expect(message?.includes("User not found")).toBe(false);
  });

  it("keeps the panel content scrollable within viewport constraints", () => {
    const source = readFileSync(PANEL_PATH, "utf8");
    expect(source).toContain("overflow-y-auto max-h-[calc(100vh-11rem)]");
  });
});
