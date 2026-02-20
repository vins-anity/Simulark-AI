export const AVAILABLE_MODELS = [
  // Qwen first (matching provider-registry UI order)
  {
    id: "qwen:qwen3-max",
    name: "QWEN3 MAX",
    provider: "QWEN",
  },
  {
    id: "qwen:qwen3.5-plus",
    name: "QWEN3.5 PLUS",
    provider: "QWEN",
  },
  {
    id: "qwen:qwen-flash",
    name: "QWEN FLASH",
    provider: "QWEN",
  },
  // Other free-tier models
  { id: "nvidia:z-ai/glm5", name: "GLM-5", provider: "NVIDIA" },
  {
    id: "zhipu:glm-4.7-flash",
    name: "GLM-4.7 FLASH",
    provider: "Zhipu",
  },
  {
    id: "nvidia:minimaxai/minimax-m2.1",
    name: "MINIMAX M2.1",
    provider: "NVIDIA",
  },
  {
    id: "nvidia:moonshotai/kimi-k2.5",
    name: "KIMI K2.5",
    provider: "NVIDIA",
  },
] as const;


export type AIModelId = (typeof AVAILABLE_MODELS)[number]["id"];
