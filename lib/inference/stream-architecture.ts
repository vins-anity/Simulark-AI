import { type ModelMessage, Output } from "ai";
import { ArchitectureGenerationOutputSchema } from "@/lib/architecture-schemas";
import type { InferenceTierConfig } from "@/lib/inference-tier";
import {
  streamWithTierFallback,
  type TierStreamMeta,
} from "@/lib/inference/resilient-model";

export interface ArchitectureStreamMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ArchitectureStreamUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Legacy-compatible stream parts for gradual frontend migration. */
export type ArchitectureStreamPart =
  | { type: "text-delta"; text: string }
  | { type: "reasoning-delta"; text: string }
  | { type: "object-partial"; object: Record<string, unknown> }
  | {
      type: "finish";
      finishReason: string;
      usage: ArchitectureStreamUsage;
      object?: Record<string, unknown>;
    }
  | {
      type: "inference-meta";
      modelUsed: string;
      primaryModel: string;
      fallbackUsed: boolean;
      attemptedModels: string[];
    }
  | { type: "activity"; detail: string; progress?: number };

export type { TierStreamMeta as InferenceStreamMeta };

export interface StreamArchitectureOptions {
  tierConfig: InferenceTierConfig;
  systemPrompt: string;
  messages: ArchitectureStreamMessage[];
  structured?: boolean;
  abortSignal?: AbortSignal;
}

function toModelMessages(
  messages: ArchitectureStreamMessage[],
): ModelMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

function getDeltaText(part: {
  type: string;
  text?: string;
  delta?: string;
}): string {
  if (typeof part.text === "string" && part.text.length > 0) {
    return part.text;
  }
  if (typeof part.delta === "string" && part.delta.length > 0) {
    return part.delta;
  }
  return "";
}

type StreamQueueItem = ArchitectureStreamPart | { type: "__source_done" };

/**
 * Merge fullStream + partialOutputStream concurrently.
 * Sequential consumption blocks the tee and stalls the client for minutes.
 */
async function* mergeModelStreams(
  result: Awaited<ReturnType<typeof streamWithTierFallback>>["result"],
  structured: boolean,
): AsyncGenerator<ArchitectureStreamPart> {
  const queue: StreamQueueItem[] = [];
  let pendingSources = structured ? 2 : 1;
  let streamError: unknown;
  let wake: (() => void) | null = null;

  const notify = () => {
    wake?.();
    wake = null;
  };

  const push = (part: ArchitectureStreamPart) => {
    queue.push(part);
    notify();
  };

  const sourceDone = () => {
    pendingSources -= 1;
    if (pendingSources <= 0) {
      queue.push({ type: "__source_done" });
      notify();
    }
  };

  const waitForQueue = async () => {
    while (queue.length === 0 && pendingSources > 0) {
      await new Promise<void>((resolve) => {
        wake = resolve;
      });
    }
  };

  void (async () => {
    try {
      for await (const part of result.fullStream) {
        if (part.type === "text-delta") {
          const text = getDeltaText(part);
          if (text) {
            push({ type: "text-delta", text });
          }
        }
        if (part.type === "reasoning-delta") {
          const text = getDeltaText(part);
          if (text) {
            push({ type: "reasoning-delta", text });
          }
        }
      }
    } catch (error) {
      streamError = error;
    } finally {
      sourceDone();
    }
  })();

  if (structured) {
    void (async () => {
      try {
        for await (const partial of result.partialOutputStream) {
          if (partial && typeof partial === "object") {
            push({
              type: "object-partial",
              object: partial as Record<string, unknown>,
            });
          }
        }
      } catch (error) {
        streamError = error;
      } finally {
        sourceDone();
      }
    })();
  }

  while (true) {
    await waitForQueue();
    const item = queue.shift();
    if (!item) {
      break;
    }
    if (item.type === "__source_done") {
      break;
    }
    yield item;
  }

  if (streamError) {
    throw streamError;
  }
}

/**
 * Stream architecture generation via AI SDK 7 with tier failover.
 */
export async function streamArchitectureInference(
  options: StreamArchitectureOptions,
): Promise<{
  fullStream: AsyncIterable<ArchitectureStreamPart>;
  meta: TierStreamMeta;
}> {
  const {
    tierConfig,
    systemPrompt,
    messages,
    structured = true,
    abortSignal,
  } = options;

  const modelMessages = toModelMessages(messages);

  const outputSpec = structured
    ? Output.object({
        schema: ArchitectureGenerationOutputSchema,
        name: "ArchitectureGeneration",
        description:
          "Complete system architecture with nodes, edges, and analysis metadata",
      })
    : undefined;

  const { result, meta } = await streamWithTierFallback({
    tierConfig,
    system: systemPrompt,
    messages: modelMessages,
    abortSignal,
    output: outputSpec,
  });

  async function* generator(): AsyncGenerator<ArchitectureStreamPart> {
    yield {
      type: "inference-meta",
      modelUsed: meta.modelUsed,
      primaryModel: meta.primaryModel,
      fallbackUsed: meta.fallbackUsed,
      attemptedModels: meta.attemptedModels,
    };

    yield* mergeModelStreams(result, structured);

    const usage = await result.usage;
    const output = structured ? await result.output : undefined;

    yield {
      type: "finish",
      finishReason: "stop",
      usage: {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
      },
      object: output as Record<string, unknown> | undefined,
    };
  }

  return {
    fullStream: generator(),
    meta,
  };
}
