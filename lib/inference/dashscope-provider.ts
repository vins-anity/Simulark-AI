import { createOpenAI } from "@ai-sdk/openai";
import {
  getDashScopeApiKey,
  getDashScopeBaseUrl,
  requireDashScopeApiKey,
} from "@/lib/dashscope";

let dashscopeProvider: ReturnType<typeof createOpenAI> | null = null;

/**
 * Shared DashScope OpenAI-compatible provider for AI SDK calls.
 */
export function getDashscopeProvider() {
  if (!dashscopeProvider) {
    dashscopeProvider = createOpenAI({
      baseURL: getDashScopeBaseUrl(),
      apiKey: getDashScopeApiKey(),
    });
  }
  return dashscopeProvider;
}

/**
 * Returns a language model handle for a DashScope model id (e.g. deepseek-v4-flash).
 */
export function dashscopeModel(modelName: string) {
  return getDashscopeProvider().chat(modelName);
}

export function isDashScopeConfigured(): boolean {
  return Boolean(getDashScopeApiKey());
}

export function requireDashScope(): ReturnType<typeof createOpenAI> {
  requireDashScopeApiKey();
  return getDashscopeProvider();
}
