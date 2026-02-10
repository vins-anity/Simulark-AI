import OpenAI from "openai";
import { callAIWithResilience } from "./ai-resilience";
import { buildEnhancedSystemPrompt } from "./prompt-engineering";

export type AIProvider =
  | "zhipu"
  | "openrouter"
  | "kimi"
  | "google"
  | "minimax"
  | "anthropic";

import { env } from "@/lib/env";

interface ProviderConfig {
  baseURL: string;
  apiKey: string | undefined;
  model: string;
  reasoningParam?: Record<string, unknown>; // Optional now
  responseFormat?: { type: "json_object" }; // Expanded to support JSON mode
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  zhipu: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    apiKey: env.ZHIPU_API_KEY,
    model: "glm-4.7-flash", // Using Flash as per doc
    // IMPORTANT: Keep thinking enabled but system prompt handles JSON in content
    reasoningParam: { thinking: { type: "enabled" } },
  },
  kimi: {
    baseURL: env.KIMI_BASE_URL || "https://api.moonshot.ai/v1", // Updated to .ai as per K2.5 docs, but support override

    apiKey: env.KIMI_API_KEY,
    model: "kimi-k2.5", // User requested Kimi 2.5
    // Kimi doesn't support specific reasoning params like Zhipu/OpenRouter yet, or uses standard OpenAI
    // Use JSON mode for reliability
    // responseFormat: { type: "json_object" },
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
    model: "tngtech/deepseek-r1t2-chimera:free", // Fallback
    reasoningParam: { reasoning: { enabled: true } },
  },
  google: {
    baseURL: "https://openrouter.ai/api/v1", // Using OpenRouter for unified billing/access
    apiKey: env.OPENROUTER_API_KEY,
    model: "google/gemini-3-pro-preview",
  },
  minimax: {
    baseURL: "https://openrouter.ai/api/v1", // Using OpenRouter for unified billing/access
    apiKey: env.OPENROUTER_API_KEY,
    model: "minimax/minimax-m2.1",
  },
  anthropic: {
    baseURL: "https://openrouter.ai/api/v1", // Using OpenRouter for unified billing/access
    apiKey: env.OPENROUTER_API_KEY,
    model: "anthropic/claude-3-opus",
  },
};

export function createAIClient(provider: AIProvider = "zhipu") {
  const config = PROVIDERS[provider];

  if (!config.apiKey) {
    console.warn(`[AI Client] Missing API key for provider: ${provider}`);
  }

  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    timeout: 30 * 1000, // 30 seconds timeout
    defaultHeaders: {
      "HTTP-Referer": "https://simulark.app",
      "X-Title": "Simulark",
    },
  });

  return { client, config };
}

export async function generateArchitectureStream(
  prompt: string,
  modelId?: string,
  mode: "default" | "startup" | "corporate" = "default",
  currentNodes: any[] = [],
  currentEdges: any[] = [],
  quickMode: boolean = false,
) {
  if (modelId) {
    console.log(
      `[AI Client] Generating with selected model: ${modelId} in mode: ${mode}${quickMode ? " (QUICK)" : ""}`,
    );
    // Map modelId to provider
    if (modelId === "glm-4.7-flash") {
      return await callModelStream(
        "zhipu",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    } else if (modelId === "deepseek-ai") {
      return await callModelStream(
        "openrouter",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    } else if (
      modelId === "kimi-k2.5" ||
      modelId?.includes("moonshot") ||
      modelId?.includes("kimi")
    ) {
      return await callModelStream(
        "kimi",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    } else if (modelId?.includes("gemini")) {
      return await callModelStream(
        "google",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    } else if (modelId?.includes("minimax")) {
      return await callModelStream(
        "minimax",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    } else if (modelId?.includes("claude")) {
      return await callModelStream(
        "anthropic",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
    }
  }

  // Default fallback logic
  // 1. Try Primary (Zhipu)
  try {
    console.log(
      `[AI Client] Starting generation. Primary: Zhipu GLM-4.7 Flash. Mode: ${mode}${quickMode ? " (QUICK)" : ""}. Prompt length: ${prompt.length}`,
    );
    const stream = await callModelStream(
      "zhipu",
      prompt,
      mode,
      currentNodes,
      currentEdges,
      quickMode,
    );
    console.log("[AI Client] Zhipu stream established successfully.");
    return stream;
  } catch (error: any) {
    console.warn(
      `[AI Client] Zhipu failed (Error: ${error.message}). Switching to OpenRouter fallback...`,
    );
    // 2. Fallback (OpenRouter)
    try {
      const stream = await callModelStream(
        "openrouter",
        prompt,
        mode,
        currentNodes,
        currentEdges,
        quickMode,
      );
      console.log("[AI Client] OpenRouter stream established successfully.");
      return stream;
    } catch (fbError: any) {
      console.error(
        `[AI Client] OpenRouter fallback also failed: ${fbError.message}`,
      );
      throw fbError;
    }
  }
}

async function callModelStream(
  provider: AIProvider,
  prompt: string,
  mode: "default" | "startup" | "corporate" = "default",
  currentNodes: any[] = [],
  currentEdges: any[] = [],
  quickMode: boolean = false,
) {
  const { client, config } = createAIClient(provider);

  // Use enhanced prompt engineering with architecture detection
  const systemPrompt = buildEnhancedSystemPrompt({
    userInput: prompt,
    architectureType: "unknown",
    detectedIntent: "",
    currentNodes,
    currentEdges,
    mode,
    quickMode,
  });

  console.log(
    `[AI Client] Calling OpenAI API via provider: ${provider} (Model: ${config.model})${quickMode ? " [QUICK MODE]" : ""}`,
  );

  // Use enhanced resilience with retry and circuit breaker
  return await callAIWithResilience(
    provider,
    async () => {
      return await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: true,
        ...(config.reasoningParam || {}),
        response_format: config.responseFormat,
      });
    },
    "Architecture Generation",
  );
}
