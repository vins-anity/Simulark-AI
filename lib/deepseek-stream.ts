import OpenAI from "openai";
import {
  getDashScopeApiKey,
  getDashScopeBaseUrl,
  requireDashScopeApiKey,
} from "@/lib/dashscope";
import {
  DASHSCOPE_FALLBACK_MODEL,
  getInferenceModelChain,
  isRetryableInferenceError,
} from "@/lib/inference-fallback";
import { createLogger } from "@/lib/logger";
import type { InferenceTierConfig } from "@/lib/inference-tier";
import { INFERENCE_TIERS } from "@/lib/inference-tier";

const logger = createLogger("dashscope-stream");

export interface DeepSeekStreamMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DeepSeekStreamUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type DeepSeekStreamPart =
  | { type: "text-delta"; text: string }
  | { type: "reasoning-delta"; text: string }
  | {
      type: "finish";
      finishReason: string;
      usage: DeepSeekStreamUsage;
    }
  | {
      type: "inference-meta";
      modelUsed: string;
      primaryModel: string;
      fallbackUsed: boolean;
      attemptedModels: string[];
    };

export interface InferenceStreamMeta {
  modelUsed: string;
  primaryModel: string;
  fallbackUsed: boolean;
  attemptedModels: string[];
}

let dashscopeOpenAI: OpenAI | null = null;

function getDashscopeOpenAI(): OpenAI {
  if (!dashscopeOpenAI) {
    dashscopeOpenAI = new OpenAI({
      baseURL: getDashScopeBaseUrl(),
      apiKey: requireDashScopeApiKey(),
    });
  }
  return dashscopeOpenAI;
}

function resolveStreamOptions(
  model: string,
  tierConfig: InferenceTierConfig,
): {
  maxOutputTokens: number;
  enableThinking: boolean;
  reasoningEffort?: "high" | "max";
} {
  const isFallbackModel = model !== tierConfig.dashscopeModel;
  const isQwenFallback = model === DASHSCOPE_FALLBACK_MODEL;

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

async function createDashScopeCompletion(
  model: string,
  tierConfig: InferenceTierConfig,
  systemPrompt: string,
  messages: DeepSeekStreamMessage[],
) {
  const client = getDashscopeOpenAI();
  const streamOptions = resolveStreamOptions(model, tierConfig);

  return (await client.chat.completions.create({
    model,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 1.0,
    stream: true,
    stream_options: { include_usage: true },
    max_completion_tokens: streamOptions.maxOutputTokens,
    ...(streamOptions.enableThinking
      ? {
          enable_thinking: true,
          reasoning_effort: streamOptions.reasoningEffort ?? "high",
        }
      : { enable_thinking: false }),
  } as Parameters<typeof client.chat.completions.create>[0])) as AsyncIterable<{
    choices?: Array<{
      delta?: { content?: string; reasoning_content?: string };
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  }>;
}

function wrapCompletionAsStream(
  completion: AsyncIterable<{
    choices?: Array<{
      delta?: { content?: string; reasoning_content?: string };
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  }>,
  meta: InferenceStreamMeta,
): AsyncIterable<DeepSeekStreamPart> {
  async function* generator(): AsyncGenerator<DeepSeekStreamPart> {
    yield {
      type: "inference-meta",
      modelUsed: meta.modelUsed,
      primaryModel: meta.primaryModel,
      fallbackUsed: meta.fallbackUsed,
      attemptedModels: meta.attemptedModels,
    };

    let usage: DeepSeekStreamUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    for await (const chunk of completion) {
      if (!chunk.choices?.length) {
        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens ?? 0,
            completionTokens: chunk.usage.completion_tokens ?? 0,
            totalTokens: chunk.usage.total_tokens ?? 0,
          };
        }
        continue;
      }

      const delta = chunk.choices[0]?.delta as
        | { content?: string; reasoning_content?: string }
        | undefined;

      if (delta?.reasoning_content) {
        yield { type: "reasoning-delta", text: delta.reasoning_content };
      }
      if (delta?.content) {
        yield { type: "text-delta", text: delta.content };
      }
    }

    yield {
      type: "finish",
      finishReason: "stop",
      usage,
    };
  }

  return generator();
}

/**
 * Stream inference via DashScope with DeepSeek primary models and
 * qwen3.6-flash as the final fallback.
 */
export async function streamDashScopeInference(options: {
  tierConfig: InferenceTierConfig;
  systemPrompt: string;
  messages: DeepSeekStreamMessage[];
}): Promise<{ fullStream: AsyncIterable<DeepSeekStreamPart>; meta: InferenceStreamMeta }> {
  const { tierConfig, systemPrompt, messages } = options;
  const chain = getInferenceModelChain(tierConfig.tier);
  const primaryModel = tierConfig.dashscopeModel;
  const attemptedModels: string[] = [];
  let lastError: unknown;

  for (const model of chain) {
    attemptedModels.push(model);
    try {
      const completion = await createDashScopeCompletion(
        model,
        tierConfig,
        systemPrompt,
        messages,
      );

      const meta: InferenceStreamMeta = {
        modelUsed: model,
        primaryModel,
        fallbackUsed: model !== primaryModel,
        attemptedModels: [...attemptedModels],
      };

      if (meta.fallbackUsed) {
        logger.warn("Inference failover activated", {
          primaryModel,
          modelUsed: model,
          attemptedModels,
        });
      }

      return {
        fullStream: wrapCompletionAsStream(completion, meta),
        meta,
      };
    } catch (error) {
      lastError = error;
      const canRetry =
        model !== chain[chain.length - 1] &&
        isRetryableInferenceError(error);

      logger.warn("Inference model attempt failed", {
        model,
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

/** @deprecated Use streamDashScopeInference */
export async function streamDeepSeekChat(options: {
  tierConfig: InferenceTierConfig;
  systemPrompt: string;
  messages: DeepSeekStreamMessage[];
}): Promise<{ fullStream: AsyncIterable<DeepSeekStreamPart> }> {
  const result = await streamDashScopeInference(options);
  return { fullStream: result.fullStream };
}

export function isDashScopeConfigured(): boolean {
  return Boolean(getDashScopeApiKey());
}
