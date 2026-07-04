import { describe, expect, it } from "vitest";
import { resolveTechContext } from "@/lib/tech/resolve-context";
import { validateTechOutput } from "@/lib/tech/validate-output";

describe("tech intelligence layer", () => {
  it("resolves candidates under cap for flash tier", () => {
    const bundle = resolveTechContext({
      userMessage: "build a saas app with nextjs and postgres",
      tier: "flash",
      userPreferences: {
        cloudProviders: ["vercel"],
        languages: ["typescript"],
        frameworks: ["nextjs"],
        architectureTypes: [],
        applicationType: [],
        customInstructions: "",
        techStackMode: "manual",
      },
    });
    expect(bundle.candidateIds.length).toBeLessThanOrEqual(25);
    expect(bundle.candidateIds).toContain("nextjs");
    expect(bundle.candidateIds).toContain("vercel");
    expect(bundle.compactMatrix).toContain("nextjs");
  });

  it("validates and fixes unknown tech ids", () => {
    const { nodes, issues } = validateTechOutput(
      [
        {
          id: "n1",
          data: { tech: "postgresql" },
        },
      ],
      ["postgres", "nextjs", "vercel"],
    );
    expect(nodes[0].data?.tech).toBe("postgres");
    expect(issues.length).toBeGreaterThan(0);
  });
});
