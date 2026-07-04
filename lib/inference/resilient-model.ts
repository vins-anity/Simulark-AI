import {
  type LanguageModel,
  type ModelMessage,
  streamText,
  wrapLanguageModel,
} from "ai";
import { createLogger } from "@/lib/logger";
import {
  getInferenceModelChain,
  isRetryableInferenceError,
} from "@/lib/inference-fallback";
import { dashscopeModel } from "@/lib/inference/dashscope-provider";
import {
  resolveTierModelOptions,
  type TierModelOptions,
} from "@/lib/inference/tier-model";
import type { InferenceTierConfig } from "@/lib/inference-tier";
import { createReasoningMiddleware } from "@/lib/ai-middleware";

const logger = createLogger("resilient-model");

export interface ResilientStreamAttempt {
  modelName: string;
  model: LanguageModel;
  options: TierModelOptions;
}

export function getResilientStreamAttempts(
  tierConfig: InferenceTierConfig,
): ResilientStreamAttempt[] {
  const chain = getInferenceModelChain(tierConfig.tier);
  return chain.map((modelName) => ({
    modelName,
    model: wrapLanguageModel({
      model: dashscopeModel(modelName),
      middleware: createReasoningMiddleware(),
    }),
    options: resolveTierModelOptions(modelName, tierConfig),
  }));
}

export interface TierStreamMeta {
  modelUsed: string;
  primaryModel: string;
  fallbackUsed: boolean;
  attemptedModels: string[];
}

export function buildDashScopeProviderOptions(options: TierModelOptions) {
  if (options.enableThinking) {
    return {
      openai: {
        enable_thinking: true,
        reasoning_effort: options.reasoningEffort ?? "high",
      },
    };
  }
  return {
    openai: {
      enable_thinking: false,
    },
  };
}

export interface TierStreamCallOptions {
  tierConfig: InferenceTierConfig;
  system: string;
  messages: ModelMessage[];
  abortSignal?: AbortSignal;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any;
}

/**
 * Execute streamText with tier failover across the model chain.
 */
export async function streamWithTierFallback(
  callOptions: TierStreamCallOptions,
) {
  const { tierConfig, system, messages, abortSignal, output } = callOptions;
  const attempts = getResilientStreamAttempts(tierConfig);
  const primaryModel = tierConfig.dashscopeModel;
  const attemptedModels: string[] = [];
  let lastError: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    attemptedModels.push(attempt.modelName);

    try {
      const result = streamText({
        model: attempt.model,
        system,
        messages,
        maxOutputTokens: attempt.options.maxOutputTokens,
        reasoning: attempt.options.enableThinking ? "high" : undefined,
        providerOptions: buildDashScopeProviderOptions(attempt.options),
        output,
        abortSignal,
        timeout: {
          totalMs: 110_000,
          chunkMs: 15_000,
        },
      });

      const meta: TierStreamMeta = {
        modelUsed: attempt.modelName,
        primaryModel,
        fallbackUsed: attempt.modelName !== primaryModel,
        attemptedModels: [...attemptedModels],
      };

      if (meta.fallbackUsed) {
        logger.warn("Inference failover activated", { ...meta });
      }

      return { result, meta };
    } catch (error) {
      lastError = error;
      const hasMore = i < attempts.length - 1;
      const canRetry = hasMore && isRetryableInferenceError(error);

      logger.warn("Inference model attempt failed", {
        model: attempt.modelName,
        canRetry,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All inference models failed");
}

export function getWrappedDashscopeModel(modelName: string): LanguageModel {
  return wrapLanguageModel({
    model: dashscopeModel(modelName),
    middleware: createReasoningMiddleware(),
  });
}
