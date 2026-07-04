import type { LanguageModel } from "ai";
import {
  DASHSCOPE_FALLBACK_MODEL,
  getInferenceModelChain,
} from "@/lib/inference-fallback";
import type { InferenceTier, InferenceTierConfig } from "@/lib/inference-tier";
import {
  DEFAULT_INFERENCE_TIER,
  getInferenceTierConfig,
  INFERENCE_TIERS,
} from "@/lib/inference-tier";
import { dashscopeModel } from "@/lib/inference/dashscope-provider";

export interface TierModelOptions {
  maxOutputTokens: number;
  enableThinking: boolean;
  reasoningEffort?: "high" | "max";
}

/**
 * Resolve stream/generation options for a model in the tier failover chain.
 */
export function resolveTierModelOptions(
  modelName: string,
  tierConfig: InferenceTierConfig,
): TierModelOptions {
  const isFallbackModel = modelName !== tierConfig.dashscopeModel;
  const isQwenFallback = modelName === DASHSCOPE_FALLBACK_MODEL;

  if (isQwenFallback || isFallbackModel) {
    return {
      maxOutputTokens: INFERENCE_TIERS.flash.maxOutputTokens,
      enableThinking: false,
    };
  }

  return {
    maxOutputTokens: tierConfig.maxOutputTokens,
    enableThinking: tierConfig.enableThinking,
    reasoningEffort: tierConfig.reasoningEffort,
  };
}

/**
 * Primary model for a tier (first in the failover chain).
 */
export function getTierModel(
  tier: InferenceTier = DEFAULT_INFERENCE_TIER,
): LanguageModel {
  const config = getInferenceTierConfig(tier);
  return dashscopeModel(config.dashscopeModel);
}

/**
 * Ordered DashScope model names for tier failover.
 */
export function getTierModelChain(tier: InferenceTier): string[] {
  return getInferenceModelChain(tier);
}

/**
 * LanguageModel handles for the full tier failover chain.
 */
export function getTierModelChainHandles(tier: InferenceTier): LanguageModel[] {
  return getTierModelChain(tier).map((name) => dashscopeModel(name));
}

export { getInferenceTierConfig, getInferenceModelChain };
