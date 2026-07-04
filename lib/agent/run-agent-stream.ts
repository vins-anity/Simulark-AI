import type { ModelMessage } from "ai";
import { createSimularkAgent } from "@/lib/agent/simulark-agent";
import { createGraphState, type SimularkAgentContext } from "@/lib/agent/types";
import type { InferenceTierConfig } from "@/lib/inference-tier";
import type { ArchitectureStreamPart } from "@/lib/inference/stream-architecture";

export interface AgentStreamOptions {
  ctx: SimularkAgentContext;
  tierConfig: InferenceTierConfig;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  abortSignal?: AbortSignal;
}

/**
 * Run ToolLoopAgent and adapt output to legacy ArchitectureStreamPart format.
 */
export async function runSimularkAgentStream(
  options: AgentStreamOptions,
): Promise<{
  fullStream: AsyncIterable<ArchitectureStreamPart>;
  meta: {
    modelUsed: string;
    primaryModel: string;
    fallbackUsed: boolean;
    attemptedModels: string[];
  };
}> {
  const { ctx, tierConfig, messages, abortSignal } = options;
  const state = createGraphState(ctx.nodes, ctx.edges);
  const agent = createSimularkAgent(ctx, state, tierConfig);

  const modelMessages: ModelMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = await agent.stream({
    messages: modelMessages,
    abortSignal,
  });

  const meta = {
    modelUsed: tierConfig.dashscopeModel,
    primaryModel: tierConfig.dashscopeModel,
    fallbackUsed: false,
    attemptedModels: [tierConfig.dashscopeModel],
  };

  async function* generator(): AsyncGenerator<ArchitectureStreamPart> {
    yield {
      type: "inference-meta",
      ...meta,
    };

    let accumulatedText = "";

    for await (const part of result.fullStream) {
      if (part.type === "text-delta") {
        const text =
          "text" in part && part.text
            ? part.text
            : "delta" in part && typeof part.delta === "string"
              ? part.delta
              : "";
        if (text) {
          accumulatedText += text;
          yield { type: "text-delta", text };
        }
      }
      if (part.type === "reasoning-delta") {
        const text =
          "text" in part && part.text
            ? part.text
            : "delta" in part && typeof part.delta === "string"
              ? part.delta
              : "";
        if (text) {
          yield { type: "reasoning-delta", text };
        }
      }
    }

    const usage = await result.usage;
    const finalObject = {
      nodes: state.nodes,
      edges: state.edges,
      analysis:
        accumulatedText.trim() ||
        state.messages.join("; ") ||
        "Architecture updated via tool calls",
    };

    yield {
      type: "object-partial",
      object: finalObject,
    };

    yield {
      type: "finish",
      finishReason: "stop",
      usage: {
        promptTokens: usage.inputTokens ?? 0,
        completionTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
      },
      object: finalObject,
    };
  }

  return { fullStream: generator(), meta };
}
