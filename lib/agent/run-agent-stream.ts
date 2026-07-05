import type { ModelMessage } from "ai";
import { createSimularkAgent } from "@/lib/agent/simulark-agent";
import { createGraphState, type SimularkAgentContext } from "@/lib/agent/types";
import type { InferenceTierConfig } from "@/lib/inference-tier";
import type { ArchitectureStreamPart } from "@/lib/inference/stream-architecture";
import { ensureArchitectureEdges } from "@/lib/infer-architecture-edges";

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

    let toolStep = 0;
    for await (const part of result.fullStream) {
      if (
        part.type === "tool-call" ||
        part.type === "tool-input-start" ||
        part.type === "tool-result"
      ) {
        toolStep += 1;
        const toolName =
          "toolName" in part && typeof part.toolName === "string"
            ? part.toolName
            : "diagram";
        yield {
          type: "activity",
          detail: `Applying ${toolName} (${toolStep})`,
          progress: Math.min(75, 35 + toolStep * 8),
        };
      }
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
    const edgeEnsured = ensureArchitectureEdges(state.nodes, state.edges);
    const finalObject = {
      nodes: state.nodes,
      edges: edgeEnsured.edges,
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
