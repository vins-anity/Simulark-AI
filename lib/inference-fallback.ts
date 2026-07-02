import type { InferenceTier } from "@/lib/inference-tier";
import { INFERENCE_TIERS } from "@/lib/inference-tier";

/** Last-resort DashScope model when DeepSeek tiers fail or are exhausted. */
export const DASHSCOPE_FALLBACK_MODEL = "qwen3.6-flash";

export const QWEN_FALLBACK_MODEL_ID = `qwen:${DASHSCOPE_FALLBACK_MODEL}`;

export function getInferenceModelChain(tier: InferenceTier): string[] {
  const flashModel = INFERENCE_TIERS.flash.dashscopeModel;
  const proModel = INFERENCE_TIERS.pro.dashscopeModel;

  if (tier === "pro") {
    return [proModel, flashModel, DASHSCOPE_FALLBACK_MODEL];
  }

  return [flashModel, DASHSCOPE_FALLBACK_MODEL];
}

export function isRetryableInferenceError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const status = (error as { status?: number }).status;
  if (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return true;
  }

  const message = String(
    (error as { message?: string }).message || "",
  ).toLowerCase();
  const code = String((error as { code?: string }).code || "").toLowerCase();

  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("quota") ||
    message.includes("exhausted") ||
    message.includes("insufficient") ||
    message.includes("capacity") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("unavailable") ||
    message.includes("model_not_found") ||
    code.includes("rate_limit") ||
    code.includes("insufficient_quota")
  );
}
