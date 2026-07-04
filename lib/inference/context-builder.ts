/**
 * Unified inference context — prefs, canvas, tech bundle, prompt blocks.
 */

import type { InferenceTier } from "@/lib/inference-tier";
import {
  getInferenceTierConfig,
  tierToArchitectureMode,
} from "@/lib/inference-tier";
import {
  buildEnhancedSystemPrompt,
  type PromptContext,
  summarizePreferenceFit,
} from "@/lib/prompt-engineering";
import { CACHE_BLOCK_POLICY } from "@/lib/prompt-policy";
import type { UserPreferences } from "@/lib/schema/user-preferences";
import { normalizeUserPreferences, toChatPayload } from "@/lib/schema/user-preferences";
import {
  resolveTechContext,
  type TechContextBundle,
} from "@/lib/tech/resolve-context";

export interface InferenceContextInput {
  userPreferences?: UserPreferences | Record<string, unknown>;
  currentNodes?: Array<{ id: string; type?: string; data?: { tech?: string } }>;
  currentEdges?: Array<{ id: string; source: string; target: string }>;
  conversationHistory?: Array<{ role: string; content: string }>;
  projectDocuments?: string;
  tier: InferenceTier;
  operation?: string;
  userMessage: string;
  userRequest?: string;
  architectureType?: string;
  complexity?: string;
}

export interface InferenceContextResult {
  systemPrompt: string;
  techBundle: TechContextBundle;
  cacheBlocks: {
    policy: string;
    tier: string;
  };
  normalizedPreferences: UserPreferences;
}

function extractCanvasTechIds(
  nodes?: InferenceContextInput["currentNodes"],
): string[] {
  if (!nodes) return [];
  return nodes
    .map((n) => n.data?.tech)
    .filter((t): t is string => typeof t === "string" && t.length > 0);
}

export function buildInferenceContext(
  input: InferenceContextInput,
): InferenceContextResult {
  const normalizedPreferences = normalizeUserPreferences(
    input.userPreferences ?? {},
  );

  const canvasTechIds = extractCanvasTechIds(input.currentNodes);

  const techBundle = resolveTechContext({
    userMessage: input.userMessage,
    userPreferences: normalizedPreferences,
    canvasTechIds,
    tier: input.tier,
    operation: input.operation,
  });

  const tierConfig = getInferenceTierConfig(input.tier);
  const mode = tierToArchitectureMode(input.tier);

  const tierPreamble = `INFERENCE TIER: ${input.tier.toUpperCase()} (${tierConfig.label})
Architecture bias: ${mode === "enterprise" ? "enterprise depth when justified" : "MVP / startup practicality"}
Model: ${tierConfig.dashscopeModel}
Thinking: ${tierConfig.enableThinking ? "enabled" : "disabled"}`;

  const promptContext: PromptContext = {
    userInput: input.userRequest || input.userMessage,
    architectureType: (input.architectureType ||
      "general") as PromptContext["architectureType"],
    detectedIntent: `Complexity: ${input.complexity || "medium"}, Operation: ${input.operation || "create"}`,
    mode,
    operationType: input.operation as PromptContext["operationType"],
    currentNodes: input.currentNodes,
    currentEdges: input.currentEdges,
    userPreferences: normalizedPreferences,
    conversationHistory: input.conversationHistory as PromptContext["conversationHistory"],
    preferenceFitSummary:
      normalizedPreferences.techStackMode === "auto"
        ? {
            normalizedPreferences: [],
            overlapOpportunities: [],
            likelyConflicts: [],
            promptDirective: `User deferred stack choice. ${normalizedPreferences.techStackRationale || "Infer practical stack from prompt."}`,
          }
        : summarizePreferenceFit(
            normalizedPreferences,
            mode,
            (input.architectureType || "general") as Parameters<
              typeof summarizePreferenceFit
            >[2],
          ),
  };

  let systemPrompt = buildEnhancedSystemPrompt(promptContext);

  if (input.projectDocuments) {
    systemPrompt += `\n\nPROJECT DOCUMENTS:\n${input.projectDocuments}`;
  }

  systemPrompt += `\n\nTECH CONTEXT (ALLOWED IDS ONLY):\n${techBundle.practicalConstraints}\n\n${techBundle.compactMatrix}`;

  if (techBundle.knowledgeCards && input.tier === "pro") {
    systemPrompt += `\n\nRELEVANT TECH NOTES:\n${techBundle.knowledgeCards}`;
  }

  return {
    systemPrompt,
    techBundle,
    cacheBlocks: {
      policy: CACHE_BLOCK_POLICY,
      tier: tierPreamble,
    },
    normalizedPreferences,
  };
}

export function getStaticPromptPrefix(tier: InferenceTier): string {
  const tierConfig = getInferenceTierConfig(tier);
  return `${CACHE_BLOCK_POLICY}\n\nTIER: ${tier} / ${tierConfig.dashscopeModel}`;
}
