import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { createZhipu } from "zhipu-ai-provider";
import { env } from "./env";

export interface ModelInfo {
  name: string;
  provider: string;
  description: string;
  supportsTools: boolean;
  supportsStreaming: boolean;
  badge?: "hot_tag" | "double_hot_tag" | "balance_tag";
  dailyLimit?: number;
  tooltipOverview?: string;
}

/**
 * Available models with their providers
 * Format: "provider:model-id"
 */
export const AVAILABLE_MODELS: Record<string, ModelInfo> = {
  // ── Alibaba Cloud Qwen (shown first in UI) ──────────────────────────────
  // Ordered: hot → balance → flash, then free-tier others below

  "qwen:qwen3-max": {
    name: "Qwen3 Max",
    provider: "qwen",
    description:
      "Most powerful Qwen — ideal for complex, multi-step enterprise tasks",
    supportsTools: true,
    supportsStreaming: true,
    badge: "double_hot_tag",
    dailyLimit: 30,
    tooltipOverview:
      "Flagship reasoning model. Native Thinking mode for deep architectural analysis. Best for Enterprise mode.",
  },
  "qwen:qwen3.5-plus": {
    name: "Qwen3.5 Plus",
    provider: "qwen",
    description:
      "Balanced model — performs on par with Qwen3 Max at a fraction of the cost",
    supportsTools: true,
    supportsStreaming: true,
    badge: "hot_tag",
    dailyLimit: 30,
    tooltipOverview:
      "1M token context. Supports text, image & video. Great balance of quality and speed for Startup mode.",
  },
  "qwen:qwen-flash": {
    name: "Qwen Flash",
    provider: "qwen",
    description: "Fastest and lowest-cost Qwen model — ideal for simple tasks",
    supportsTools: true,
    supportsStreaming: true,
    dailyLimit: 30,
    tooltipOverview:
      "1M token context. Qwen3-series. Blazing fast JSON graph generation for rapid prototyping.",
  },

  // ── Other free-tier models ───────────────────────────────────────────────
  "nvidia:z-ai/glm5": {
    name: "GLM-5",
    provider: "nvidia",
    description: "State-of-the-art 744B MoE model",
    supportsTools: true,
    supportsStreaming: true,
  },
  "zhipu:glm-4.7-flash": {
    name: "GLM-4.7 Flash",
    provider: "zhipu",
    description: "Fast and efficient fallback",
    supportsTools: true,
    supportsStreaming: true,
  },
  "nvidia:minimaxai/minimax-m2.1": {
    name: "MiniMax M2.1",
    provider: "nvidia",
    description: "Next-gen MoE for speed and reasoning",
    supportsTools: true,
    supportsStreaming: true,
  },
  "nvidia:moonshotai/kimi-k2.5": {
    name: "Kimi K2.5",
    provider: "nvidia",
    description: "Multi-modal model with 15T tokens",
    supportsTools: true,
    supportsStreaming: true,
  },
};

export type ModelId = keyof typeof AVAILABLE_MODELS;

/**
 * Provider registry for unified model access
 * Note: We use custom getModel function instead of createProviderRegistry
 * to avoid ProviderV3 interface requirements
 */

// Lazy initialization of providers to prevent client-side evaluation of server-side env vars
const providers = {
  zhipu: null as any,
  openrouter: null as any,
  kimi: null as any,
  nvidia: null as any,
  qwen: null as any,
};

/**
 * Get a language model by ID
 * @param modelId - Model identifier (e.g., 'zhipu:glm-4.7-flash')
 * @returns LanguageModel instance
 */
export function getModel(modelId: ModelId | string): LanguageModel {
  // Parse provider and model from ID
  const [provider, ...modelParts] = modelId.split(":");
  const modelName = modelParts.join(":");

  switch (provider) {
    case "zhipu":
      if (!providers.zhipu)
        providers.zhipu = createZhipu({ apiKey: env.ZHIPU_API_KEY });
      return providers.zhipu(modelName);
    case "openrouter":
      if (!providers.openrouter)
        providers.openrouter = createOpenRouter({
          apiKey: env.OPENROUTER_API_KEY,
        });
      return providers.openrouter.chat(modelName);
    case "kimi":
      if (!providers.kimi)
        providers.kimi = createOpenAI({
          baseURL: env.KIMI_BASE_URL || "https://api.moonshot.ai/v1",
          apiKey: env.KIMI_API_KEY,
        });
      return providers.kimi(modelName);
    case "nvidia":
      if (!providers.nvidia)
        providers.nvidia = createOpenAI({
          baseURL: "https://integrate.api.nvidia.com/v1",
          apiKey: env.NVIDIA_API_KEY,
        });
      return providers.nvidia(modelName);
    case "qwen":
      if (!providers.qwen)
        providers.qwen = createOpenAI({
          baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
          apiKey: env.QWEN_API_KEY,
        });
      return providers.qwen(modelName);
    default:
      // Default to Zhipu
      console.warn(`Unknown provider: ${provider}, defaulting to Zhipu`);
      if (!providers.zhipu)
        providers.zhipu = createZhipu({ apiKey: env.ZHIPU_API_KEY });
      return providers.zhipu("glm-4.7-flash");
  }
}

/**
 * Get model information
 * @param modelId - Model identifier
 * @returns Model metadata
 */
export function getModelInfo(modelId: string) {
  return (
    AVAILABLE_MODELS[modelId as ModelId] ||
    ({
      name: "Unknown Model",
      provider: "unknown",
      description: "Model information not available",
      supportsTools: false,
      supportsStreaming: false,
    } as ModelInfo)
  );
}

/**
 * Get all available models for a specific provider
 * @param provider - Provider name
 * @returns Array of model IDs
 */
export function getModelsByProvider(provider: string): ModelId[] {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([, info]) => info.provider === provider)
    .map(([id]) => id as ModelId);
}

/**
 * Get default model ID
 * @returns Default model identifier
 */
export function getDefaultModelId(): ModelId {
  return "zhipu:glm-4.7-flash";
}

/**
 * Check if a model supports tools
 * @param modelId - Model identifier
 * @returns Boolean indicating tool support
 */
export function supportsTools(modelId: string): boolean {
  const info = getModelInfo(modelId);
  return info.supportsTools;
}

/**
 * Get provider-specific configuration
 * @param provider - Provider name
 * @returns Provider configuration
 */
export function getProviderConfig(provider: string) {
  switch (provider) {
    case "zhipu":
      return {
        baseURL: "https://open.bigmodel.cn/api/paas/v4",
        apiKey: env.ZHIPU_API_KEY,
        defaultModel: "glm-4.7-flash",
      };
    case "openrouter":
      return {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_API_KEY,
        defaultModel: "z-ai/glm-4.5-air:free",
      };
    case "kimi":
      return {
        baseURL: env.KIMI_BASE_URL || "https://api.moonshot.ai/v1",
        apiKey: env.KIMI_API_KEY,
        defaultModel: "kimi-k2.5",
      };
    case "qwen":
      return {
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        apiKey: env.QWEN_API_KEY,
        defaultModel: "qwen3-coder-flash",
      };
    default:
      return null;
  }
}
