import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import { createZhipu } from "zhipu-ai-provider";
import { env } from "./env";

/**
 * Available models with their providers
 * Format: "provider:model-id"
 */
export const AVAILABLE_MODELS = {
  // Zhipu (BigModel) - GLM models
  "zhipu:glm-4.7-flash": {
    name: "GLM-4.7 Flash",
    provider: "zhipu",
    description: "Fast and efficient for most tasks",
    supportsTools: true,
    supportsStreaming: true,
  },

  // OpenRouter - Free GLM models
  "openrouter:z-ai/glm-4.5-air:free": {
    name: "GLM-4.5 Air (Free)",
    provider: "openrouter",
    description: "Free tier GLM model via OpenRouter",
    supportsTools: true,
    supportsStreaming: true,
  },

  // Kimi (Moonshot AI)
  "kimi:kimi-k2.5": {
    name: "Kimi K2.5",
    provider: "kimi",
    description: "Advanced reasoning and long context",
    supportsTools: true,
    supportsStreaming: true,
  },

  // OpenRouter - Other models
  "openrouter:deepseek-ai": {
    name: "DeepSeek AI",
    provider: "openrouter",
    description: "Open source reasoning model",
    supportsTools: true,
    supportsStreaming: true,
  },

  "openrouter:google/gemini-3-pro-preview": {
    name: "Gemini 3 Pro",
    provider: "openrouter",
    description: "Google's latest multimodal model",
    supportsTools: true,
    supportsStreaming: true,
  },

  "openrouter:anthropic/claude-3-opus": {
    name: "Claude 3 Opus",
    provider: "openrouter",
    description: "Anthropic's most capable model",
    supportsTools: true,
    supportsStreaming: true,
  },

  "openrouter:minimax/minimax-m2.1": {
    name: "MiniMax M2.1",
    provider: "openrouter",
    description: "Chinese multimodal model",
    supportsTools: true,
    supportsStreaming: true,
  },
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

// Initialize individual providers
const zhipu = createZhipu({
  apiKey: env.ZHIPU_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const kimi = createOpenAI({
  baseURL: env.KIMI_BASE_URL || "https://api.moonshot.ai/v1",
  apiKey: env.KIMI_API_KEY,
});

/**
 * Provider registry for unified model access
 * Note: We use custom getModel function instead of createProviderRegistry
 * to avoid ProviderV3 interface requirements
 */

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
      return zhipu(modelName);
    case "openrouter":
      return openrouter.chat(modelName);
    case "kimi":
      return kimi(modelName);
    default:
      // Default to Zhipu
      console.warn(`Unknown provider: ${provider}, defaulting to Zhipu`);
      return zhipu("glm-4.7-flash");
  }
}

/**
 * Get model information
 * @param modelId - Model identifier
 * @returns Model metadata
 */
export function getModelInfo(modelId: string) {
  return (
    AVAILABLE_MODELS[modelId as ModelId] || {
      name: "Unknown Model",
      provider: "unknown",
      description: "Model information not available",
      supportsTools: false,
      supportsStreaming: false,
    }
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
    default:
      return null;
  }
}
