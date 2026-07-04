/**
 * Infer practical tech stack from onboarding profile (rule-based + optional AI).
 */

import { generateObject } from "ai";
import { z } from "zod";
import { dashscopeModel } from "@/lib/inference/dashscope-provider";
import { isDashScopeConfigured } from "@/lib/inference/dashscope-provider";
import type { UserPreferences } from "@/lib/schema/user-preferences";
import { isValidTechId } from "@/lib/tech/registry";
import { resolveTechContext } from "@/lib/tech/resolve-context";

export interface InferredTechStack {
  cloudProviders: string[];
  languages: string[];
  frameworks: string[];
  rationale: string;
  confidence: "high" | "medium" | "low";
}

const InferredStackSchema = z.object({
  cloudProviders: z.array(z.string()).min(1).max(3),
  languages: z.array(z.string()).min(1).max(3),
  frameworks: z.array(z.string()).min(1).max(4),
  rationale: z.string().max(400),
  confidence: z.enum(["high", "medium", "low"]),
});

function ruleBasedInfer(input: {
  projectType?: string;
  experienceLevel?: string;
  teamContext?: string;
  projectDescription?: string;
}): InferredTechStack {
  const useCase = input.projectType || "saas";
  const desc = (input.projectDescription || "").toLowerCase();

  let stack: InferredTechStack = {
    cloudProviders: ["vercel"],
    languages: ["typescript"],
    frameworks: ["nextjs"],
    rationale:
      "Default practical SaaS stack: Next.js on Vercel with TypeScript for fast iteration.",
    confidence: "medium",
  };

  if (useCase === "api" || desc.includes("api")) {
    stack = {
      cloudProviders: ["railway", "aws"],
      languages: ["go", "typescript"],
      frameworks: ["fastapi", "nestjs"],
      rationale: "API-focused stack with proven backend runtimes and simple deployment.",
      confidence: "high",
    };
  } else if (useCase === "mobile" || desc.includes("mobile")) {
    stack = {
      cloudProviders: ["firebase", "aws"],
      languages: ["typescript", "dart"],
      frameworks: ["react-native", "expo"],
      rationale: "Mobile-oriented stack with managed backend services.",
      confidence: "high",
    };
  } else if (useCase === "ai" || useCase === "ai-ml" || desc.includes("ai")) {
    stack = {
      cloudProviders: ["aws", "gcp"],
      languages: ["python", "typescript"],
      frameworks: ["fastapi", "nextjs"],
      rationale: "AI/ML stack with Python for models and Next.js for product UI.",
      confidence: "high",
    };
  } else if (useCase === "ecommerce" || desc.includes("ecommerce")) {
    stack = {
      cloudProviders: ["vercel", "aws"],
      languages: ["typescript"],
      frameworks: ["nextjs", "remix"],
      rationale: "E-commerce friendly full-stack JS with edge-friendly hosting.",
      confidence: "medium",
    };
  }

  if (input.teamContext === "enterprise") {
    stack.cloudProviders = ["aws", "gcp"].slice(0, 2);
    stack.rationale += " Enterprise context favors major cloud providers.";
  }

  if (input.experienceLevel === "beginner") {
    stack.cloudProviders = ["vercel"];
    stack.languages = ["typescript"];
    stack.frameworks = ["nextjs"];
    stack.rationale =
      "Beginner-friendly: managed hosting and a single full-stack framework.";
    stack.confidence = "high";
  }

  return stack;
}

function sanitizeIds(ids: string[], allowed: Set<string>): string[] {
  return [...new Set(ids.map((id) => id.toLowerCase()))].filter(
    (id) => allowed.has(id) || isValidTechId(id),
  );
}

export async function inferTechStackFromProfile(
  prefs: UserPreferences,
): Promise<InferredTechStack> {
  const message = [
    prefs.projectDescription,
    prefs.onboardingMetadata?.useCase,
    prefs.onboardingMetadata?.projectType,
    prefs.applicationType?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  const bundle = resolveTechContext({
    userMessage: message || "saas web application",
    userPreferences: prefs,
    tier: prefs.defaultInferenceTier || "flash",
  });
  const allowed = new Set(bundle.candidateIds);

  if (!isDashScopeConfigured()) {
    const ruled = ruleBasedInfer({
      projectType: prefs.onboardingMetadata?.projectType,
      experienceLevel: prefs.onboardingMetadata?.experienceLevel,
      teamContext: prefs.onboardingMetadata?.teamContext,
      projectDescription: prefs.projectDescription,
    });
    return {
      ...ruled,
      cloudProviders: sanitizeIds(ruled.cloudProviders, allowed),
      languages: sanitizeIds(ruled.languages, allowed),
      frameworks: sanitizeIds(ruled.frameworks, allowed),
    };
  }

  try {
    const { object } = await generateObject({
      model: dashscopeModel("deepseek-v4-flash"),
      schema: InferredStackSchema,
      prompt: `Pick a minimal practical tech stack for this user profile.
Only use IDs from this allowed list: ${bundle.candidateIds.join(", ")}

Profile:
- Experience: ${prefs.onboardingMetadata?.experienceLevel || "intermediate"}
- Use case: ${prefs.onboardingMetadata?.useCase || "saas"}
- Team: ${prefs.onboardingMetadata?.teamContext || "small"}
- Description: ${prefs.projectDescription || "general web app"}

Rules:
- Prefer boring, proven stacks (Next.js, Postgres, Vercel) for vague requests
- Do not over-engineer
- Return valid tech IDs only from the allowed list`,
      maxOutputTokens: 512,
    });

    return {
      cloudProviders: sanitizeIds(object.cloudProviders, allowed),
      languages: sanitizeIds(object.languages, allowed),
      frameworks: sanitizeIds(object.frameworks, allowed),
      rationale: object.rationale,
      confidence: object.confidence,
    };
  } catch {
    return ruleBasedInfer({
      projectType: prefs.onboardingMetadata?.projectType,
      experienceLevel: prefs.onboardingMetadata?.experienceLevel,
      teamContext: prefs.onboardingMetadata?.teamContext,
      projectDescription: prefs.projectDescription,
    });
  }
}
