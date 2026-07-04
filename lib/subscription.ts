/** @deprecated Monetization removed — kept for import compatibility. Everyone is on the free plan. */

export type SubscriptionTier = "free";

export type SubscriptionStatus = "active";

export interface TierFeatures {
  maxProjects: number;
  allowedModels: string[];
}

export interface RateLimitConfig {
  burstLimit: number;
  burstWindow: number;
  dailyLimit: number;
}

const FREE_PLAN = {
  id: "free" as const,
  name: "Simulark",
  label: "Free",
  price: 0,
  description: "Full access during the free public beta.",
  features: [
    "Unlimited projects",
    "Flash & Pro inference tiers",
    "Chaos engineering & stress tests",
    "Agent skill export (npx skills)",
  ],
  daily_limit: 50,
  rateLimits: {
    burstLimit: 8,
    burstWindow: 60,
    dailyLimit: 50,
  } as RateLimitConfig,
  tierFeatures: {
    maxProjects: Infinity,
    allowedModels: ["deepseek:deepseek-v4-flash", "deepseek:deepseek-v4-pro"],
  } as TierFeatures,
};

export const SUBSCRIPTION_PLANS = { free: FREE_PLAN };

export function getPlanDetails(_tier?: string) {
  return FREE_PLAN;
}

export function getRateLimits(_tier?: string): RateLimitConfig {
  return FREE_PLAN.rateLimits;
}

export function getTierFeatures(_tier?: string): TierFeatures {
  return FREE_PLAN.tierFeatures;
}

export function canUseModel(_tier: string, _model: string): boolean {
  return true;
}

export function canCreateProject(
  _tier: string,
  _currentProjectCount: number,
): boolean {
  return true;
}

export function hasFeature(_tier: string, _feature: string): boolean {
  return true;
}

export function isValidTier(tier: string): tier is SubscriptionTier {
  return tier === "free";
}
