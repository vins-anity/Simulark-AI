/**
 * Canonical user preferences contract — single source for onboarding, settings, chat.
 */

import * as v from "valibot";
import {
  INFERENCE_TIERS,
  type InferenceTier,
  resolveInferenceTier,
} from "@/lib/inference-tier";
import type { ArchitectureMode } from "@/lib/prompt-engineering";

// ============================================================================
// Schemas
// ============================================================================

export const InferenceTierSchema = v.picklist(["flash", "pro"] as const);

export const TechStackModeSchema = v.picklist(["manual", "auto"] as const);

export const OnboardingMetadataSchema = v.object({
  role: v.string(),
  useCase: v.string(),
  teamSize: v.string(),
  experienceLevel: v.string(),
  includeServices: v.record(v.string(), v.boolean()),
  projectType: v.optional(v.string()),
  teamContext: v.optional(v.string()),
});

export const UserPreferencesSchema = v.object({
  cloudProviders: v.optional(v.array(v.string()), []),
  languages: v.optional(v.array(v.string()), []),
  frameworks: v.optional(v.array(v.string()), []),
  architectureTypes: v.optional(v.array(v.string()), []),
  applicationType: v.optional(v.array(v.string()), []),
  customInstructions: v.optional(v.string(), ""),
  defaultArchitectureMode: v.optional(
    v.picklist(["default", "startup", "enterprise"] as const),
  ),
  defaultMode: v.optional(
    v.picklist(["default", "startup", "enterprise"] as const),
  ),
  defaultInferenceTier: v.optional(InferenceTierSchema),
  defaultModel: v.optional(v.string()),
  techStackMode: v.optional(TechStackModeSchema, "manual"),
  techStackInferred: v.optional(v.boolean()),
  techStackRationale: v.optional(v.string()),
  projectDescription: v.optional(v.string()),
  onboardingMetadata: v.optional(OnboardingMetadataSchema),
});

export type UserPreferences = v.InferOutput<typeof UserPreferencesSchema>;
export type TechStackMode = v.InferOutput<typeof TechStackModeSchema>;
export type OnboardingMetadata = v.InferOutput<typeof OnboardingMetadataSchema>;

const DEFAULT_PREFERENCES: UserPreferences = {
  cloudProviders: [],
  languages: [],
  frameworks: [],
  architectureTypes: [],
  applicationType: [],
  customInstructions: "",
  techStackMode: "manual",
};

// ============================================================================
// Normalization
// ============================================================================

type LegacyPreferences = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function pickSingularOrArray(
  plural: unknown,
  singular: unknown,
): string[] {
  const fromPlural = asStringArray(plural);
  if (fromPlural.length > 0) return fromPlural;
  if (typeof singular === "string" && singular.length > 0) return [singular];
  return [];
}

/**
 * Normalize raw DB / client preferences and migrate legacy fields.
 */
export function normalizeUserPreferences(
  raw: unknown,
): UserPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFERENCES };
  }

  const legacy = raw as LegacyPreferences;

  const tier = resolveInferenceTier({
    tier:
      typeof legacy.defaultInferenceTier === "string"
        ? legacy.defaultInferenceTier
        : null,
    model: typeof legacy.defaultModel === "string" ? legacy.defaultModel : null,
    mode:
      typeof legacy.defaultMode === "string"
        ? legacy.defaultMode
        : typeof legacy.defaultArchitectureMode === "string"
          ? legacy.defaultArchitectureMode
          : null,
  });

  const architectureMode: ArchitectureMode =
    tier === "pro" ? "enterprise" : "startup";

  const techStackMode =
    legacy.techStackMode === "auto" || legacy.techStackMode === "manual"
      ? legacy.techStackMode
      : "manual";

  const normalized: UserPreferences = {
    cloudProviders: pickSingularOrArray(
      legacy.cloudProviders,
      legacy.cloudProvider,
    ),
    languages: pickSingularOrArray(legacy.languages, legacy.language),
    frameworks: pickSingularOrArray(legacy.frameworks, legacy.framework),
    architectureTypes: asStringArray(legacy.architectureTypes),
    applicationType: asStringArray(legacy.applicationType),
    customInstructions:
      typeof legacy.customInstructions === "string"
        ? legacy.customInstructions
        : "",
    defaultInferenceTier: tier,
    defaultMode: architectureMode,
    defaultArchitectureMode: architectureMode,
    defaultModel: INFERENCE_TIERS[tier].modelId,
    techStackMode,
    techStackInferred:
      typeof legacy.techStackInferred === "boolean"
        ? legacy.techStackInferred
        : undefined,
    techStackRationale:
      typeof legacy.techStackRationale === "string"
        ? legacy.techStackRationale
        : undefined,
    projectDescription:
      typeof legacy.projectDescription === "string"
        ? legacy.projectDescription
        : undefined,
    onboardingMetadata:
      legacy.onboardingMetadata &&
      typeof legacy.onboardingMetadata === "object"
        ? (legacy.onboardingMetadata as OnboardingMetadata)
        : undefined,
  };

  const parsed = v.safeParse(UserPreferencesSchema, normalized);
  if (parsed.success) {
    return parsed.output;
  }

  return { ...DEFAULT_PREFERENCES, ...normalized };
}

export function toInferenceTier(prefs: UserPreferences): InferenceTier {
  return resolveInferenceTier({
    tier: prefs.defaultInferenceTier,
    model: prefs.defaultModel,
    mode: prefs.defaultMode || prefs.defaultArchitectureMode,
  });
}

/** Full preferences object for prompts / API — no field subsetting. */
export function toChatPayload(prefs: UserPreferences): UserPreferences {
  return normalizeUserPreferences(prefs);
}

export function getDefaultUserPreferences(): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    defaultInferenceTier: "flash",
    defaultMode: "startup",
    defaultArchitectureMode: "startup",
    defaultModel: INFERENCE_TIERS.flash.modelId,
    techStackMode: "auto",
  };
}

// ============================================================================
// Onboarding UI → UserPreferences
// ============================================================================

export interface OnboardingUiData {
  experienceLevel?: "beginner" | "intermediate" | "expert";
  projectType?: string;
  teamContext?: "solo" | "small" | "enterprise";
  techStack: {
    cloud: string[];
    languages: string[];
    frameworks: string[];
  };
  techStackMode?: TechStackMode;
  projectDescription?: string;
  defaultMode?: "flash" | "pro";
  architecturePreferences?: string[];
}

const ROLE_MAP: Record<string, string> = {
  beginner: "student",
  intermediate: "software-engineer",
  expert: "architect",
};

const USE_CASE_MAP: Record<string, string> = {
  saas: "saas",
  ecommerce: "ecommerce",
  "ai-ml": "ai-ml",
  api: "api-backend",
  mobile: "mobile-app",
  devops: "devops-infra",
  learning: "learning",
};

export function mapOnboardingDataToPreferences(
  data: OnboardingUiData,
): UserPreferences {
  const tier: InferenceTier = data.defaultMode === "pro" ? "pro" : "flash";
  const architectureMode: ArchitectureMode =
    tier === "pro" ? "enterprise" : "startup";
  const techStackMode = data.techStackMode ?? "manual";

  const experienceLevelMap: Record<string, string> = {
    beginner: "beginner",
    intermediate: "intermediate",
    expert: "advanced",
  };

  return normalizeUserPreferences({
    cloudProviders: techStackMode === "manual" ? data.techStack.cloud : [],
    languages:
      techStackMode === "manual" ? [...data.techStack.languages] : [],
    frameworks: techStackMode === "manual" ? data.techStack.frameworks : [],
    architectureTypes:
      data.architecturePreferences && data.architecturePreferences.length > 0
        ? data.architecturePreferences
        : [
            tier === "pro"
              ? "microservices"
              : tier === "flash"
                ? "serverless"
                : "not-sure",
          ],
    applicationType: [
      data.projectType === "api" || data.projectType === "mobile"
        ? data.projectType
        : "web-app",
    ],
    customInstructions: "",
    defaultInferenceTier: tier,
    defaultMode: architectureMode,
    defaultArchitectureMode: architectureMode,
    defaultModel: INFERENCE_TIERS[tier].modelId,
    techStackMode,
    projectDescription: data.projectDescription,
    onboardingMetadata: {
      role:
        ROLE_MAP[data.experienceLevel || "intermediate"] || "software-engineer",
      useCase: USE_CASE_MAP[data.projectType || "saas"] || "saas",
      teamSize: data.teamContext || "small",
      experienceLevel:
        experienceLevelMap[data.experienceLevel || "intermediate"] ||
        "intermediate",
      projectType: data.projectType,
      teamContext: data.teamContext,
      includeServices: {
        auth: true,
        database: true,
        cdn:
          data.techStack.cloud.includes("vercel") ||
          data.techStack.cloud.includes("aws") ||
          data.techStack.cloud.includes("cloudflare"),
        monitoring: tier === "pro",
        cicd: tier === "pro",
      },
    },
  });
}
