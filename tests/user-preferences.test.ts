import { describe, expect, it } from "vitest";
import {
  mapOnboardingDataToPreferences,
  normalizeUserPreferences,
  toInferenceTier,
} from "@/lib/schema/user-preferences";

describe("user-preferences", () => {
  it("migrates legacy singular fields to arrays", () => {
    const prefs = normalizeUserPreferences({
      cloudProvider: "aws",
      language: "typescript",
      framework: "nextjs",
      defaultMode: "enterprise",
    });
    expect(prefs.cloudProviders).toEqual(["aws"]);
    expect(prefs.languages).toEqual(["typescript"]);
    expect(prefs.frameworks).toEqual(["nextjs"]);
    expect(prefs.defaultInferenceTier).toBe("pro");
  });

  it("maps onboarding UI data with tier", () => {
    const prefs = mapOnboardingDataToPreferences({
      experienceLevel: "intermediate",
      projectType: "saas",
      teamContext: "solo",
      techStack: {
        cloud: ["vercel"],
        languages: ["typescript"],
        frameworks: ["nextjs"],
      },
      techStackMode: "manual",
      defaultMode: "flash",
      architecturePreferences: ["serverless"],
    });
    expect(prefs.defaultInferenceTier).toBe("flash");
    expect(prefs.cloudProviders).toEqual(["vercel"]);
    expect(prefs.techStackMode).toBe("manual");
    expect(prefs.onboardingMetadata?.useCase).toBe("saas");
  });

  it("auto tech stack mode leaves arrays empty", () => {
    const prefs = mapOnboardingDataToPreferences({
      techStack: { cloud: [], languages: [], frameworks: [] },
      techStackMode: "auto",
      projectDescription: "A todo app for teams",
      defaultMode: "flash",
    });
    expect(prefs.techStackMode).toBe("auto");
    expect(prefs.cloudProviders).toEqual([]);
    expect(prefs.projectDescription).toBe("A todo app for teams");
  });

  it("toInferenceTier resolves from normalized prefs", () => {
    const prefs = normalizeUserPreferences({ defaultInferenceTier: "pro" });
    expect(toInferenceTier(prefs)).toBe("pro");
  });
});
