import OpenAI from "openai";
import { callAIWithResilience } from "./ai-resilience";
import {
  type ArchitectureMode,
  buildEnhancedSystemPrompt,
  detectArchitectureType,
  detectComplexity,
} from "./prompt-engineering";

export type AIProvider =
  | "zhipu"
  | "openrouter"
  | "kimi"
  | "google"
  | "minimax"
  | "anthropic"
  | "nvidia"
  | "minimax_nvidia"
  | "kimi_nvidia";

import { env } from "@/lib/env";

interface ProviderConfig {
  baseURL: string;
  apiKey: string | undefined;
  model: string;
  reasoningParam?: Record<string, unknown>; // Optional now
  responseFormat?: { type: "json_object" }; // Expanded to support JSON mode
  extraParams?: Record<string, unknown>; // Added for model-specific parameters like top_k or thinking
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
    model: "z-ai/glm-4.5-air:free", // Free GLM model from Z.AI via OpenRouter
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
  nvidia: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: env.NVIDIA_API_KEY,
    model: "z-ai/glm5",
    // NVIDIA specific: enable thinking
    reasoningParam: { enable_thinking: true, clear_thinking: false }, 
  },
  minimax_nvidia: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: env.NVIDIA_API_KEY,
    model: "minimaxai/minimax-m2.1",
    extraParams: { top_k: 40 },
  },
  kimi_nvidia: {
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: env.NVIDIA_API_KEY,
    model: "moonshotai/kimi-k2.5",
    extraParams: { chat_template_kwargs: { thinking: true } },
  },
};

export function createAIClient(provider: AIProvider = "zhipu") {
  const config = PROVIDERS[provider];

  // Use a dummy key for testing when real key is missing
  // This allows tests to verify config without the client throwing
  const apiKey = config.apiKey || "dummy-key-for-testing";

  if (!config.apiKey) {
    console.warn(`[AI Client] Missing API key for provider: ${provider}`);
  }

  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey,
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
  mode: ArchitectureMode = "enterprise",
  currentNodes: any[] = [],
  currentEdges: any[] = [],
) {
  if (modelId) {
    console.log(
      `[AI Client] Generating with selected model: ${modelId} in mode: ${mode}`,
    );

    // Normalize modelId to lowercase for robust matching
    const id = modelId.toLowerCase();

    // Map modelId to provider
    if (id.includes("zhipu") || id === "glm-4.7-flash") {
      return await callModelStream(
        "zhipu",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("nvidia:minimax")) {
      return await callModelStream(
        "minimax_nvidia",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("nvidia:kimi") || id.includes("nvidia:moonshot")) {
      return await callModelStream(
        "kimi_nvidia",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("nvidia") || id.includes("glm5")) {
      return await callModelStream(
        "nvidia",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id === "deepseek-ai") {
      return await callModelStream(
        "openrouter",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("glm-4.5-air")) {
      // New GLM 4.5 Air model from Z.AI via OpenRouter (free)
      return await callModelStream(
        "openrouter",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (
      id === "kimi-k2.5" ||
      id.includes("moonshot") ||
      id.includes("kimi")
    ) {
      return await callModelStream(
        "kimi",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("gemini") || id.includes("google")) {
      return await callModelStream(
        "google",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("minimax")) {
      return await callModelStream(
        "minimax",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    } else if (id.includes("claude") || id.includes("anthropic")) {
      return await callModelStream(
        "anthropic",
        prompt,
        mode,
        currentNodes,
        currentEdges,
      );
    }
  }

  // Default fallback logic
  // 1. Try Primary (Zhipu)
  try {
    console.log(
      `[AI Client] Starting generation. Primary: Zhipu GLM-4.7 Flash. Mode: ${mode}. Prompt length: ${prompt.length}`,
    );
    const stream = await callModelStream(
      "zhipu",
      prompt,
      mode,
      currentNodes,
      currentEdges,
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
  mode: ArchitectureMode = "enterprise",
  currentNodes: any[] = [],
  currentEdges: any[] = [],
) {
  const { client, config } = createAIClient(provider);

  // Detect architecture type and complexity for optimized prompting
  const detection = detectArchitectureType(prompt);
  const complexity = detectComplexity(prompt);

  // For simple prompts in startup mode, disable reasoning to speed up generation
  const shouldDisableReasoning = complexity === "simple" && mode === "startup";

  // Use enhanced prompt engineering with architecture detection
  const systemPrompt = buildEnhancedSystemPrompt({
    userInput: prompt,
    architectureType: detection.type,
    detectedIntent: `Architecture: ${detection.type}, Complexity: ${complexity}, Keywords: ${detection.detectedKeywords.join(", ")}`,
    currentNodes,
    currentEdges,
    mode,
  });

  // Determine reasoning level based on mode and complexity
  let reasoningConfig = {};
  if (config.reasoningParam) {
    if (mode === "startup" || mode === "default") {
      // Startup & Default: Disable thinking for maximum speed
      // The extensive system prompt provides enough context without needing the model to "think"
      reasoningConfig = { thinking: { type: "disabled" } };
      console.log(`[AI Client] Reasoning: DISABLED (Speed optimized)`);
    } else if (mode === "enterprise") {
      // Enterprise: Low thinking for balance
      reasoningConfig = { thinking: { type: "low" } };
      console.log(`[AI Client] Reasoning: LOW (Enterprise mode)`);
    } else {
      // Complex/Enterprise: Full thinking enabled
      reasoningConfig = config.reasoningParam;
      console.log(`[AI Client] Reasoning: ENABLED (Complex/Enterprise mode)`);
    }
  }

  console.log(
    `[AI Client] Calling OpenAI API via provider: ${provider} (Model: ${config.model})`,
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
        ...reasoningConfig,
        response_format: config.responseFormat,
        ...(config.extraParams ? { extra_body: config.extraParams } : {}),
      });
    },
    "Architecture Generation",
  );
}
