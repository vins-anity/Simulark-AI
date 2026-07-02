/** Client-safe default caps when env is unavailable (matches server fallbacks). */
export const DEFAULT_USAGE_LIMITS = {
  userDaily: 50,
  ipDaily: 60,
  burstLimit: 8,
  burstWindowSeconds: 60,
  modelDaily: {
    "deepseek:deepseek-v4-flash": 80,
    "deepseek:deepseek-v4-pro": 25,
    "qwen:qwen3.6-flash": 80,
  } as const,
};

export function getDefaultModelDailyLimit(modelId?: string): number {
  if (!modelId) {
    return DEFAULT_USAGE_LIMITS.userDaily;
  }

  const modelLimit =
    DEFAULT_USAGE_LIMITS.modelDaily[
      modelId as keyof typeof DEFAULT_USAGE_LIMITS.modelDaily
    ];
  return modelLimit ?? DEFAULT_USAGE_LIMITS.userDaily;
}
