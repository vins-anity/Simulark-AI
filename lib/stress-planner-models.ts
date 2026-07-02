import {
  DASHSCOPE_FALLBACK_MODEL,
  QWEN_FALLBACK_MODEL_ID,
} from "@/lib/inference-fallback";

export type StressPlannerMode = "auto" | "manual";

export interface StressPlannerModelOption {
  id: string;
  label: string;
  providerUsed: "deepseek" | "qwen" | "fallback";
}

/** Stress planning: Flash first, then Qwen fallback. */
export const STRESS_PLANNER_AUTO_CHAIN: string[] = [
  "deepseek:deepseek-v4-flash",
  QWEN_FALLBACK_MODEL_ID,
];

export const STRESS_PLANNER_MODEL_OPTIONS: StressPlannerModelOption[] = [
  {
    id: "deepseek:deepseek-v4-flash",
    label: "Flash",
    providerUsed: "deepseek",
  },
  {
    id: QWEN_FALLBACK_MODEL_ID,
    label: "Qwen Fallback",
    providerUsed: "qwen",
  },
];

export { DASHSCOPE_FALLBACK_MODEL, QWEN_FALLBACK_MODEL_ID };

export function isSupportedStressPlannerModel(modelId: string): boolean {
  return STRESS_PLANNER_MODEL_OPTIONS.some((model) => model.id === modelId);
}
