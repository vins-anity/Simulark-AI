import type { ArchitectureMode } from "@/lib/prompt-engineering";

/** User-facing inference choice — replaces separate mode + model pickers. */
export type InferenceTier = "flash" | "pro";

export interface InferenceTierConfig {
  tier: InferenceTier;
  label: string;
  description: string;
  /** Internal DashScope model id (no vendor shown in UI). */
  modelId: string;
  dashscopeModel: string;
  architectureMode: ArchitectureMode;
  enableThinking: boolean;
  reasoningEffort?: "high" | "max";
  maxOutputTokens: number;
}

export const INFERENCE_TIERS: Record<InferenceTier, InferenceTierConfig> = {
  flash: {
    tier: "flash",
    label: "Flash",
    description:
      "Fast iteration for edits, simple graphs, and lightweight JSON updates",
    modelId: "deepseek:deepseek-v4-flash",
    dashscopeModel: "deepseek-v4-flash",
    architectureMode: "startup",
    enableThinking: false,
    maxOutputTokens: 8192,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    description:
      "Deep reasoning for complex systems, enterprise patterns, and long analysis",
    modelId: "deepseek:deepseek-v4-pro",
    dashscopeModel: "deepseek-v4-pro",
    architectureMode: "enterprise",
    enableThinking: true,
    reasoningEffort: "high",
    maxOutputTokens: 32768,
  },
};

export const DEFAULT_INFERENCE_TIER: InferenceTier = "flash";

export const INFERENCE_TIER_OPTIONS = Object.values(INFERENCE_TIERS);

/** Internal tasks that should always use Flash to preserve Pro quota. */
export const INTERNAL_FLASH_MODEL_ID = INFERENCE_TIERS.flash.modelId;

export function isInferenceTier(value: unknown): value is InferenceTier {
  return value === "flash" || value === "pro";
}

/**
 * Normalize legacy model/mode/tier values from persisted project metadata.
 */
export function resolveInferenceTier(input?: {
  tier?: string | null;
  model?: string | null;
  mode?: string | null;
}): InferenceTier {
  if (input?.tier && isInferenceTier(input.tier)) {
    return input.tier;
  }

  const model = input?.model?.toLowerCase() ?? "";
  if (model.includes("pro") || model.includes("max")) {
    return "pro";
  }
  if (model.includes("flash") || model.includes("plus")) {
    return "flash";
  }

  const mode = input?.mode?.toLowerCase() ?? "";
  if (mode === "enterprise" || mode === "corporate") {
    return "pro";
  }
  if (mode === "startup") {
    return "flash";
  }

  return DEFAULT_INFERENCE_TIER;
}

export function getInferenceTierConfig(
  tier: InferenceTier,
): InferenceTierConfig {
  return INFERENCE_TIERS[tier];
}

export function tierToArchitectureMode(tier: InferenceTier): ArchitectureMode {
  return INFERENCE_TIERS[tier].architectureMode;
}
