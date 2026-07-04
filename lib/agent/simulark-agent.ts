import { stepCountIs, ToolLoopAgent } from "ai";
import {
  buildEnhancedSystemPrompt,
  type ArchitectureMode,
} from "@/lib/prompt-engineering";
import { createDiagramTools } from "@/lib/agent/diagram-tools";
import type {
  GraphMutationState,
  SimularkAgentContext,
} from "@/lib/agent/types";
import { getWrappedDashscopeModel } from "@/lib/inference/resilient-model";
import type { InferenceTierConfig } from "@/lib/inference-tier";

export function createSimularkAgent(
  ctx: SimularkAgentContext,
  state: GraphMutationState,
  tierConfig: InferenceTierConfig,
) {
  const tools = createDiagramTools(state, ctx.mode as ArchitectureMode);
  const model = getWrappedDashscopeModel(tierConfig.dashscopeModel);

  const instructions =
    ctx.systemPrompt ||
    buildEnhancedSystemPrompt({
      userInput: ctx.userInput,
      architectureType: ctx.architectureType as Parameters<
        typeof buildEnhancedSystemPrompt
      >[0]["architectureType"],
      detectedIntent: `Operation: ${ctx.operationType}, Complexity: ${ctx.complexity}`,
      currentNodes: ctx.nodes,
      currentEdges: ctx.edges,
      mode: ctx.mode,
      operationType: ctx.operationType,
      userPreferences: ctx.userPreferences as Parameters<
        typeof buildEnhancedSystemPrompt
      >[0]["userPreferences"],
    });

  return new ToolLoopAgent({
    model,
    instructions: `${instructions}

You are modifying an existing architecture. Use tools to make precise changes.
After changes, call validateGraph with autoFix when appropriate.
Respond briefly explaining what you changed.`,
    tools,
    stopWhen: stepCountIs(8),
    timeout: {
      totalMs: 90_000,
      toolMs: 5_000,
    },
    toolApproval: undefined,
  });
}
