export interface StreamArchitecturePayload {
  nodes: unknown[];
  edges: unknown[];
  analysis?: string;
  selectedArchitectureStrategy?: string;
  preferenceConflicts?: string[];
  recommendedStack?: string[];
  preferenceAlignedAlternative?: string[];
  validation: {
    valid: boolean;
    issues: unknown[];
    appliedFixes: unknown[];
  };
  candidateTechIds?: string[];
}
