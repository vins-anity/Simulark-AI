export type StressPlannerMode = "auto" | "manual";

export interface StressPlannerModelOption {
  id: string;
  label: string;
  providerUsed: "qwen" | "nvidia" | "kimi" | "minimax" | "zhipu";
}

export const STRESS_PLANNER_AUTO_CHAIN: string[] = [
  "qwen:qwen-flash",
  "nvidia:z-ai/glm5",
  "nvidia:moonshotai/kimi-k2.5",
  "nvidia:minimaxai/minimax-m2.1",
  "zhipu:glm-4.7-flash",
];

export const STRESS_PLANNER_MODEL_OPTIONS: StressPlannerModelOption[] = [
  {
    id: "qwen:qwen-flash",
    label: "Qwen Flash (Alibaba)",
    providerUsed: "qwen",
  },
  {
    id: "nvidia:z-ai/glm5",
    label: "GLM-5 (NVIDIA)",
    providerUsed: "nvidia",
  },
  {
    id: "nvidia:moonshotai/kimi-k2.5",
    label: "Kimi K2.5 (NVIDIA)",
    providerUsed: "kimi",
  },
  {
    id: "nvidia:minimaxai/minimax-m2.1",
    label: "MiniMax M2.1 (NVIDIA)",
    providerUsed: "minimax",
  },
  {
    id: "zhipu:glm-4.7-flash",
    label: "GLM-4.7 Flash (Zhipu)",
    providerUsed: "zhipu",
  },
];

export function isSupportedStressPlannerModel(modelId: string): boolean {
  return STRESS_PLANNER_MODEL_OPTIONS.some((model) => model.id === modelId);
}
