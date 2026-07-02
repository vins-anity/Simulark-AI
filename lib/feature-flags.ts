/** All features enabled for everyone — monetization tiers removed. */

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

export function isFeatureEnabled(
  _featureName: FeatureName,
  _userTier?: string,
): boolean {
  return true;
}

export function canUseModel(_modelName: string, _userTier?: string): boolean {
  return true;
}

export function canCreateProject(
  _currentProjectCount: number,
  _userTier?: string,
): boolean {
  return true;
}

export function getEnabledFeatures(_userTier?: string): FeatureName[] {
  return [
    "privateMode",
    "commercialRights",
    "prioritySupport",
    "priorityQueue",
    "earlyAccess",
    "codeGeneration",
    "chaosEngineering",
    "autoLayouts",
    "enterpriseMode",
    "advancedModels",
    "unlimitedProjects",
  ];
}

export function getFeatureStatus(): Record<
  FeatureName,
  { enabled: boolean; restricted: boolean }
> {
  const features = getEnabledFeatures();
  return Object.fromEntries(
    features.map((name) => [name, { enabled: true, restricted: false }]),
  ) as Record<FeatureName, { enabled: boolean; restricted: boolean }>;
}
