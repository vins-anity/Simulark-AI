import { env } from "@/env";

/**
 * Feature Flag System
 *
 * By default, all features are enabled for all users.
 * Features can be restricted to specific tiers using environment variables.
 *
 * Environment Variables:
 * - ENABLE_ALL_FEATURES=true (default) - All features available to everyone
 * - RESTRICT_FEATURES_BY_TIER=true - Enable tier-based restrictions
 * - FEATURE_<name>_TIERS=free,starter,pro - Comma-separated list of allowed tiers
 *
 * Examples:
 * ENABLE_ALL_FEATURES=true
 * # All features available to everyone
 *
 * ENABLE_ALL_FEATURES=false
 * RESTRICT_FEATURES_BY_TIER=true
 * FEATURE_PRIVATE_MODE_TIERS=pro
 * FEATURE_COMMERCIAL_RIGHTS_TIERS=starter,pro
 */

export type FeatureName =
  | "privateMode"
  | "commercialRights"
  | "prioritySupport"
  | "priorityQueue"
  | "earlyAccess"
  | "codeGeneration"
  | "chaosEngineering"
  | "autoLayouts"
  | "enterpriseMode"
  | "advancedModels"
  | "unlimitedProjects";

export interface FeatureConfig {
  name: FeatureName;
  description: string;
  defaultEnabled: boolean;
  envVarName: string;
}

// Feature definitions
export const FEATURES: Record<FeatureName, FeatureConfig> = {
  privateMode: {
    name: "privateMode",
    description: "Private mode with zero data retention",
    defaultEnabled: true,
    envVarName: "FEATURE_PRIVATE_MODE_TIERS",
  },
  commercialRights: {
    name: "commercialRights",
    description: "Commercial usage rights",
    defaultEnabled: true,
    envVarName: "FEATURE_COMMERCIAL_RIGHTS_TIERS",
  },
  prioritySupport: {
    name: "prioritySupport",
    description: "Priority email support",
    defaultEnabled: true,
    envVarName: "FEATURE_PRIORITY_SUPPORT_TIERS",
  },
  priorityQueue: {
    name: "priorityQueue",
    description: "Priority generation queue",
    defaultEnabled: true,
    envVarName: "FEATURE_PRIORITY_QUEUE_TIERS",
  },
  earlyAccess: {
    name: "earlyAccess",
    description: "Early access to beta features",
    defaultEnabled: true,
    envVarName: "FEATURE_EARLY_ACCESS_TIERS",
  },
  codeGeneration: {
    name: "codeGeneration",
    description: "Code generation and export",
    defaultEnabled: true,
    envVarName: "FEATURE_CODE_GENERATION_TIERS",
  },
  chaosEngineering: {
    name: "chaosEngineering",
    description: "Advanced chaos engineering and stress testing",
    defaultEnabled: true,
    envVarName: "FEATURE_CHAOS_ENGINEERING_TIERS",
  },
  autoLayouts: {
    name: "autoLayouts",
    description: "Sophisticated auto-layouts (Elkjs/Radial)",
    defaultEnabled: true,
    envVarName: "FEATURE_AUTO_LAYOUTS_TIERS",
  },
  enterpriseMode: {
    name: "enterpriseMode",
    description: "Enterprise mode with corporate archetype",
    defaultEnabled: true,
    envVarName: "FEATURE_ENTERPRISE_MODE_TIERS",
  },
  advancedModels: {
    name: "advancedModels",
    description: "Access to advanced AI models (Kimi, Gemini, Claude)",
    defaultEnabled: true,
    envVarName: "FEATURE_ADVANCED_MODELS_TIERS",
  },
  unlimitedProjects: {
    name: "unlimitedProjects",
    description: "Unlimited projects",
    defaultEnabled: true,
    envVarName: "FEATURE_UNLIMITED_PROJECTS_TIERS",
  },
};

/**
 * Check if a feature is enabled for a user
 * Defaults to true (enabled) unless explicitly restricted
 */
export function isFeatureEnabled(
  featureName: FeatureName,
  userTier: string = "free",
): boolean {
  // If ENABLE_ALL_FEATURES is true (default), everyone gets everything
  if (env.ENABLE_ALL_FEATURES !== false) {
    return true;
  }

  // If RESTRICT_FEATURES_BY_TIER is not enabled, everyone gets everything
  if (env.RESTRICT_FEATURES_BY_TIER !== true) {
    return true;
  }

  const feature = FEATURES[featureName];
  if (!feature) {
    console.warn(`[Feature Flags] Unknown feature: ${featureName}`);
    return true; // Default to enabled for unknown features
  }

  // Get allowed tiers from environment variable
  const allowedTiersEnv = env[feature.envVarName as keyof typeof env] as
    | string
    | undefined;

  // If no restriction set, feature is available to all
  if (!allowedTiersEnv) {
    return true;
  }

  const allowedTiers = allowedTiersEnv
    .split(",")
    .map((t) => t.trim().toLowerCase());
  return allowedTiers.includes(userTier.toLowerCase());
}

/**
 * Check if user can use a specific AI model
 */
export function canUseModel(
  modelName: string,
  userTier: string = "free",
): boolean {
  // Basic models available to all
  const basicModels = ["GLM-4.7-Flash"];

  if (basicModels.includes(modelName)) {
    return true;
  }

  // Advanced models require feature flag
  return isFeatureEnabled("advancedModels", userTier);
}

/**
 * Check if user can create more projects
 */
export function canCreateProject(
  currentProjectCount: number,
  userTier: string = "free",
): boolean {
  // If unlimited projects feature is enabled, always allow
  if (isFeatureEnabled("unlimitedProjects", userTier)) {
    return true;
  }

  // Free tier limit when restricted
  return currentProjectCount < 3;
}

/**
 * Get all enabled features for a tier
 */
export function getEnabledFeatures(userTier: string = "free"): FeatureName[] {
  return (Object.keys(FEATURES) as FeatureName[]).filter((feature) =>
    isFeatureEnabled(feature, userTier),
  );
}

/**
 * Get feature configuration for display in UI
 */
export function getFeatureStatus(): Record<
  FeatureName,
  { enabled: boolean; restricted: boolean }
> {
  const result = {} as Record<
    FeatureName,
    { enabled: boolean; restricted: boolean }
  >;

  (Object.keys(FEATURES) as FeatureName[]).forEach((featureName) => {
    const feature = FEATURES[featureName];
    const restricted =
      env.RESTRICT_FEATURES_BY_TIER === true &&
      !!env[feature.envVarName as keyof typeof env];

    result[featureName] = {
      enabled: isFeatureEnabled(featureName),
      restricted,
    };
  });

  return result;
}
