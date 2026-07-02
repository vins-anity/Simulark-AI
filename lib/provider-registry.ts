import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getDashScopeApiKey, getDashScopeBaseUrl } from "./dashscope";
import {
  DEFAULT_INFERENCE_TIER,
  type InferenceTier,
  INFERENCE_TIERS,
} from "./inference-tier";

export interface ModelInfo {
  name: string;
  provider: string;
  description: string;
  supportsTools: boolean;
  supportsStreaming: boolean;
  tier: InferenceTier;
}

/**
 * Internal model registry — UI shows tier labels only (Flash / Pro).
 * Format: "deepseek:deepseek-v4-flash"
 */
export const AVAILABLE_MODELS: Record<string, ModelInfo> = {
  [INFERENCE_TIERS.flash.modelId]: {
    name: INFERENCE_TIERS.flash.label,
    provider: "deepseek",
    description: INFERENCE_TIERS.flash.description,
    supportsTools: true,
    supportsStreaming: true,
    tier: "flash",
  },
  [INFERENCE_TIERS.pro.modelId]: {
    name: INFERENCE_TIERS.pro.label,
    provider: "deepseek",
    description: INFERENCE_TIERS.pro.description,
    supportsTools: true,
    supportsStreaming: true,
    tier: "pro",
  },
};

export type ModelId = keyof typeof AVAILABLE_MODELS;

let dashscopeProvider: ReturnType<typeof createOpenAI> | null = null;

function getDashscopeProvider() {
  if (!dashscopeProvider) {
    dashscopeProvider = createOpenAI({
      baseURL: getDashScopeBaseUrl(),
      apiKey: getDashScopeApiKey(),
    });
  }
  return dashscopeProvider;
}

/**
 * Get a language model by internal id (e.g. deepseek:deepseek-v4-flash).
 */
export function getModel(modelId: ModelId | string): LanguageModel {
  const [, ...modelParts] = modelId.split(":");
  const modelName =
    modelParts.join(":") || INFERENCE_TIERS[DEFAULT_INFERENCE_TIER].dashscopeModel;
  return getDashscopeProvider().chat(modelName);
}

export function getModelInfo(modelId: string): ModelInfo {
  return (
    AVAILABLE_MODELS[modelId as ModelId] ||
    ({
      name: "Unknown",
      provider: "deepseek",
      description: "Model information not available",
      supportsTools: false,
      supportsStreaming: false,
      tier: DEFAULT_INFERENCE_TIER,
    } as ModelInfo)
  );
}

export function getModelsByProvider(provider: string): ModelId[] {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([, info]) => info.provider === provider)
    .map(([id]) => id as ModelId);
}

export function getDefaultModelId(): ModelId {
  return INFERENCE_TIERS[DEFAULT_INFERENCE_TIER].modelId;
}

export function supportsTools(modelId: string): boolean {
  return getModelInfo(modelId).supportsTools;
}

export function getProviderConfig() {
  return {
    baseURL: getDashScopeBaseUrl(),
    apiKey: getDashScopeApiKey(),
    defaultModel: INFERENCE_TIERS[DEFAULT_INFERENCE_TIER].dashscopeModel,
  };
}

export function resolveModelIdFromTier(tier: InferenceTier): ModelId {
  return INFERENCE_TIERS[tier].modelId as ModelId;
}
