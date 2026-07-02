import { env } from "./env";

/**
 * Singapore workspace-specific DashScope OpenAI-compatible base URL.
 * Falls back to the legacy international endpoint when workspace ID is unset.
 */
export function getDashScopeBaseUrl(): string {
  const workspaceId = env.DASHSCOPE_WORKSPACE_ID?.trim();
  if (workspaceId) {
    return `https://${workspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`;
  }
  return "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
}

export function getDashScopeApiKey(): string | undefined {
  return env.DASHSCOPE_API_KEY || env.QWEN_API_KEY;
}

export function requireDashScopeApiKey(): string {
  const key = getDashScopeApiKey();
  if (!key) {
    throw new Error(
      "DASHSCOPE_API_KEY is not configured. Add it to your environment.",
    );
  }
  return key;
}
