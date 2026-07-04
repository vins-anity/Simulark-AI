import { INFERENCE_TIERS, type InferenceTier } from "@/lib/inference-tier";

export const AVAILABLE_MODELS = [
  {
    id: INFERENCE_TIERS.flash.modelId,
    name: INFERENCE_TIERS.flash.label.toUpperCase(),
    tier: "flash" as InferenceTier,
  },
  {
    id: INFERENCE_TIERS.pro.modelId,
    name: INFERENCE_TIERS.pro.label.toUpperCase(),
    tier: "pro" as InferenceTier,
  },
] as const;

export type AIModelId = (typeof AVAILABLE_MODELS)[number]["id"];
