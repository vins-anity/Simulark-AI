export const AVAILABLE_MODELS = [
  { id: "nvidia:z-ai/glm5", name: "GLM-5", provider: "NVIDIA" },
  // { id: "anthropic/claude-3-opus", name: "CLIMB-3 OPUS", provider: "Anthropic" },
  // { id: "google/gemini-3-pro-preview", name: "GEMINI-3 PRO", provider: "Google" },
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
