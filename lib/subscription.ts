export type SubscriptionTier = "free" | "starter" | "pro";

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "past_due"
  | "trialing"
  | "expired";

export interface TierFeatures {
  maxProjects: number;
  allowedModels: string[];
  privateMode: boolean;
  commercialRights: boolean;
  prioritySupport: boolean;
  priorityQueue: boolean;
  earlyAccess: boolean;
  codeGeneration: boolean;
  chaosEngineering: boolean;
  autoLayouts: boolean;
  enterpriseMode: boolean;
}

export interface RateLimitConfig {
  burstLimit: number; // requests per window
  burstWindow: number; // window in seconds
  dailyLimit: number;
}

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Doodle",
    label: "Doodle (Free)",
    price: 0,
    description: "For experimental prototyping.",
    features: [
      "Up to 3 Projects",
      "Standard Node Library",
      "Community Support",
      "Public Exports (PDF, PNG, SVG, Mermaid, Agent Skills)",
      "GLM-4.7-Flash (30x Daily Limit)",
    ],
    daily_limit: 30,
    rateLimits: {
      burstLimit: 5,
      burstWindow: 10,
      dailyLimit: 30,
    } as RateLimitConfig,
    tierFeatures: {
      maxProjects: 3,
      allowedModels: ["GLM-4.7-Flash"],
      privateMode: false,
      commercialRights: false,
      prioritySupport: false,
      priorityQueue: false,
      earlyAccess: false,
      codeGeneration: false,
      chaosEngineering: false,
      autoLayouts: false,
      enterpriseMode: false,
    } as TierFeatures,
  },
  starter: {
    id: "starter",
    name: "Sketch",
    label: "Sketch (Starter)",
    price: 5,
    description: "For professional architects.",
    features: [
      "Unlimited Projects",
      "Advanced Chaos Engineering & Stress Testing",
      "Sophisticated Auto-Layouts",
      "Smarter Algorithms (Kimi k2.5, Gemini 3.0, Minimax)",

      "Enterprise Mode (Corporate Archetype)",
      "Advance node library",
      "Priority Email Support",
    ],
    daily_limit: 50,
    rateLimits: {
      burstLimit: 10,
      burstWindow: 10,
      dailyLimit: 50,
    } as RateLimitConfig,
    tierFeatures: {
      maxProjects: Infinity,
      allowedModels: ["GLM-4.7-Flash", "Kimi-k2.5", "Gemini-3.0", "Minimax"],
      privateMode: false,
      commercialRights: false,
      prioritySupport: true,
      priorityQueue: true,
      earlyAccess: false,
      codeGeneration: false,
      chaosEngineering: true,
      autoLayouts: true,
      enterpriseMode: true,
    } as TierFeatures,
  },
  pro: {
    id: "pro",
    name: "Blueprint",
    label: "Blueprint (Lifetime)",
    price: 10,
    description: "Forever access for mission-critical scale.",
    features: [
      "Everything in Sketch, Forever",
      "Commercial Usage Rights",
      "Priority Generation Queue",
      "Private Mode (Zero Data Retention)",
      "Early Access to Beta Features",
      "Claude Opus 4.5",
      "Code Generation/Export (coming soon)",
    ],
    daily_limit: 1000,
    rateLimits: {
      burstLimit: 20,
      burstWindow: 10,
      dailyLimit: 1000,
    } as RateLimitConfig,
    tierFeatures: {
      maxProjects: Infinity,
      allowedModels: [
        "GLM-4.7-Flash",
        "Kimi-k2.5",
        "Gemini-3.0",
        "Minimax",
        "Claude-Opus-4.5",
      ],
      privateMode: true,
      commercialRights: true,
      prioritySupport: true,
      priorityQueue: true,
      earlyAccess: true,
      codeGeneration: true,
      chaosEngineering: true,
      autoLayouts: true,
      enterpriseMode: true,
    } as TierFeatures,
  },
};

export function getPlanDetails(tier: string) {
  return (
    SUBSCRIPTION_PLANS[tier as SubscriptionTier] || SUBSCRIPTION_PLANS.free
  );
}

export function getRateLimits(tier: string): RateLimitConfig {
  return (
    SUBSCRIPTION_PLANS[tier as SubscriptionTier]?.rateLimits ||
    SUBSCRIPTION_PLANS.free.rateLimits
  );
}

export function getTierFeatures(tier: string): TierFeatures {
  return (
    SUBSCRIPTION_PLANS[tier as SubscriptionTier]?.tierFeatures ||
    SUBSCRIPTION_PLANS.free.tierFeatures
  );
}

export function canUseModel(tier: string, model: string): boolean {
  const features = getTierFeatures(tier);
  return features.allowedModels.includes(model);
}

export function canCreateProject(
  tier: string,
  currentProjectCount: number,
): boolean {
  const features = getTierFeatures(tier);
  if (features.maxProjects === Infinity) return true;
  return currentProjectCount < features.maxProjects;
}

export function hasFeature(tier: string, feature: keyof TierFeatures): boolean {
  const features = getTierFeatures(tier);
  return features[feature] as boolean;
}

export function isValidTier(tier: string): tier is SubscriptionTier {
  return ["free", "starter", "pro"].includes(tier);
}

export function getTierPriority(tier: string): number {
  const priorities: Record<SubscriptionTier, number> = {
    free: 0,
    starter: 1,
    pro: 2,
  };
  return priorities[tier as SubscriptionTier] ?? 0;
}

export function isHigherTier(
  currentTier: string,
  compareTier: string,
): boolean {
  return getTierPriority(currentTier) > getTierPriority(compareTier);
}

// Grace period configuration
export const GRACE_PERIOD_DAYS = 3;

export function isInGracePeriod(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  const gracePeriodEnd = new Date(expiresAt);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);
  return new Date() < gracePeriodEnd;
}
