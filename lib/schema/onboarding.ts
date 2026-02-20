/**
 * Onboarding system types and validation schemas
 * Using Valibot for runtime validation
 */

import * as v from "valibot";

// ============================================================================
// Enums and Constants
// ============================================================================

export const UserRole = {
  SOFTWARE_ENGINEER: "software-engineer",
  DEVOPS_ENGINEER: "devops-engineer",
  ARCHITECT: "architect",
  STUDENT: "student",
  PRODUCT_MANAGER: "product-manager",
  HOBBYIST: "hobbyist",
  OTHER: "other",
} as const;

export const UseCase = {
  SAAS: "saas",
  ECOMMERCE: "ecommerce",
  AI_ML: "ai-ml",
  API_BACKEND: "api-backend",
  MOBILE_APP: "mobile-app",
  DATA_PIPELINE: "data-pipeline",
  DEVOPS_INFRA: "devops-infra",
  INTERNAL_TOOLS: "internal-tools",
  LEARNING: "learning",
  OTHER: "other",
} as const;

export const TeamSize = {
  SOLO: "solo",
  SMALL: "small",
  MEDIUM: "medium",
  ENTERPRISE: "enterprise",
} as const;

export const ExperienceLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export const ArchitecturePreference = {
  MICROSERVICES: "microservices",
  SERVERLESS: "serverless",
  MONOLITH: "monolith",
  EVENT_DRIVEN: "event-driven",
  JAMSTACK: "jamstack",
  CLEAN_ARCH: "clean-arch",
  NOT_SURE: "not-sure",
} as const;

export const ApplicationType = {
  WEB_APP: "web-app",
  API: "api",
  MOBILE: "mobile",
  CLI: "cli",
  MULTI_PLATFORM: "multi-platform",
} as const;

// Architecture modes aligned with prompt engineering
export const ArchitectureMode = {
  DEFAULT: "default",
  STARTUP: "startup",
  ENTERPRISE: "enterprise",
} as const;

// ============================================================================
// Valibot Schemas
// ============================================================================

export const OnboardingStep1Schema = v.object({
  role: v.picklist(Object.values(UserRole)),
  useCase: v.picklist(Object.values(UseCase)),
  teamSize: v.picklist(Object.values(TeamSize)),
});

export const OnboardingStep2Schema = v.object({
  cloudProviders: v.pipe(
    v.array(v.string()),
    v.minLength(1, "Select at least one cloud provider"),
  ),
  languages: v.pipe(
    v.array(v.string()),
    v.minLength(1, "Select at least one language"),
  ),
  frameworks: v.pipe(
    v.array(v.string()),
    v.minLength(1, "Select at least one framework"),
  ),
  experienceLevel: v.picklist(Object.values(ExperienceLevel)),
});

export const OnboardingStep3Schema = v.object({
  architecturePreferences: v.pipe(
    v.array(v.picklist(Object.values(ArchitecturePreference))),
    v.minLength(1, "Select at least one architecture pattern"),
  ),
  applicationType: v.picklist(Object.values(ApplicationType)),
  defaultMode: v.optional(v.string()), // "default" | "startup" | "enterprise"
  defaultArchitectureMode: v.optional(v.string()),
  defaultModel: v.optional(v.string()),
  includeServices: v.object({
    auth: v.boolean(),
    database: v.boolean(),
    cdn: v.boolean(),
    monitoring: v.boolean(),
    cicd: v.boolean(),
  }),
});

export const OnboardingDataSchema = v.object({
  step1: v.optional(OnboardingStep1Schema),
  step2: v.optional(OnboardingStep2Schema),
  step3: v.optional(OnboardingStep3Schema),
  completedAt: v.optional(v.string()), // ISO date string
});

export const SaveOnboardingProgressSchema = v.object({
  step: v.number(), // 1, 2, or 3
  data: v.record(v.string(), v.unknown()),
});

export const CompleteOnboardingSchema = v.object({
  step1: OnboardingStep1Schema,
  step2: OnboardingStep2Schema,
  step3: OnboardingStep3Schema,
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type OnboardingStep1 = v.InferOutput<typeof OnboardingStep1Schema>;
export type OnboardingStep2 = v.InferOutput<typeof OnboardingStep2Schema>;
export type OnboardingStep3 = v.InferOutput<typeof OnboardingStep3Schema>;
export type OnboardingData = v.InferOutput<typeof OnboardingDataSchema>;
export type SaveOnboardingProgressInput = v.InferInput<
  typeof SaveOnboardingProgressSchema
>;
export type CompleteOnboardingInput = v.InferInput<
  typeof CompleteOnboardingSchema
>;

export interface UserPreferences {
  cloudProviders: string[];
  languages: string[];
  frameworks: string[];
  architectureTypes: string[];
  applicationType: string[];
  customInstructions: string;
  defaultArchitectureMode?: (typeof ArchitectureMode)[keyof typeof ArchitectureMode];
  defaultMode?: (typeof ArchitectureMode)[keyof typeof ArchitectureMode];
  defaultModel?: string;
  onboardingMetadata?: {
    role: string;
    useCase: string;
    teamSize: string;
    experienceLevel: string;
    includeServices: Record<string, boolean>;
  };
}

// ============================================================================
// Smart Defaults Generator
// ============================================================================

export function generateSmartDefaults(
  step1: OnboardingStep1,
): Partial<OnboardingStep2 & OnboardingStep3> {
  const defaults: Partial<OnboardingStep2 & OnboardingStep3> = {
    cloudProviders: [],
    languages: [],
    frameworks: [],
    experienceLevel: "intermediate",
    architecturePreferences: ["not-sure"],
    applicationType: "web-app",
    includeServices: {
      auth: true,
      database: true,
      cdn: true,
      monitoring: false,
      cicd: false,
    },
  };

  // Role-based defaults
  switch (step1.role) {
    case "software-engineer":
      defaults.languages = ["typescript", "python"];
      defaults.frameworks = ["nextjs", "react"];
      defaults.cloudProviders = ["vercel", "aws"];
      defaults.experienceLevel = "intermediate";
      break;
    case "devops-engineer":
      defaults.languages = ["python", "go"];
      defaults.cloudProviders = ["aws", "gcp", "azure"];
      defaults.experienceLevel = "advanced";
      defaults.includeServices = {
        auth: true,
        database: true,
        cdn: true,
        monitoring: true,
        cicd: true,
      };
      break;
    case "architect":
      defaults.languages = ["java", "go", "python"];
      defaults.cloudProviders = ["aws", "gcp"];
      defaults.experienceLevel = "advanced";
      defaults.architecturePreferences = ["microservices"];
      break;
    case "student":
    case "hobbyist":
      defaults.languages = ["javascript", "python"];
      defaults.frameworks = ["react", "express"];
      defaults.cloudProviders = ["vercel", "railway"];
      defaults.experienceLevel = "beginner";
      defaults.architecturePreferences = ["serverless"];
      break;
  }

  // Use case-based adjustments
  switch (step1.useCase) {
    case "saas":
      defaults.frameworks = ["nextjs", "react"];
      defaults.architecturePreferences = ["serverless"];
      defaults.applicationType = "web-app";
      break;
    case "ecommerce":
      defaults.frameworks = ["nextjs", "remix"];
      defaults.architecturePreferences = ["microservices"];
      break;
    case "ai-ml":
      defaults.languages = ["python"];
      defaults.frameworks = ["fastapi", "django"];
      defaults.cloudProviders = ["aws", "gcp"];
      break;
    case "api-backend":
      defaults.frameworks = ["fastapi", "nestjs", "gin"];
      defaults.applicationType = "api";
      break;
    case "mobile-app":
      defaults.languages = ["typescript", "dart"];
      defaults.frameworks = ["react-native", "flutter"];
      defaults.applicationType = "mobile";
      break;
    case "devops-infra":
      defaults.cloudProviders = ["aws", "gcp", "azure"];
      defaults.architecturePreferences = ["event-driven"];
      break;
  }

  return defaults;
}

// ============================================================================
// Template Recommendation Engine
// ============================================================================

export interface TemplateRecommendation {
  id: string;
  confidence: number; // 0-1
  reason: string;
}

export function recommendTemplates(
  data: CompleteOnboardingInput,
): TemplateRecommendation[] {
  const recommendations: TemplateRecommendation[] = [];
  const scores: Record<string, number> = {};

  // Score templates based on use case
  const useCaseScores: Record<string, string[]> = {
    saas: ["saas-starter", "ai-rag"],
    ecommerce: ["e-commerce"],
    "ai-ml": ["ai-rag", "saas-starter"],
    "api-backend": ["saas-starter"],
    "mobile-app": ["chat-app"],
    "data-pipeline": ["iot-dashboard"],
    "devops-infra": ["iot-dashboard"],
  };

  // Add use case scores
  const templatesForUseCase = useCaseScores[data.step1.useCase] || [];
  for (const template of templatesForUseCase) {
    scores[template] = (scores[template] || 0) + 0.5;
  }

  // Adjust based on tech stack overlap
  const templateTechs: Record<string, string[]> = {
    "saas-starter": ["nextjs", "react", "supabase", "stripe"],
    "e-commerce": ["remix", "redis", "postgresql"],
    "iot-dashboard": ["mqtt", "timescaledb"],
    "ai-rag": ["python", "openai", "pinecone"],
    "chat-app": ["socket.io", "redis", "mongodb"],
  };

  for (const [templateId, techs] of Object.entries(templateTechs)) {
    const userTechs = [...data.step2.languages, ...data.step2.frameworks];
    const overlap = techs.filter((t) =>
      userTechs.some((ut) => t.toLowerCase().includes(ut.toLowerCase())),
    ).length;
    scores[templateId] = (scores[templateId] || 0) + overlap * 0.15;
  }

  // Convert to recommendations
  for (const [id, score] of Object.entries(scores)) {
    if (score > 0) {
      recommendations.push({
        id,
        confidence: Math.min(score, 0.95),
        reason: generateRecommendationReason(id, data),
      });
    }
  }

  // Sort by confidence
  recommendations.sort((a, b) => b.confidence - a.confidence);

  return recommendations.slice(0, 3);
}

function generateRecommendationReason(
  templateId: string,
  data: CompleteOnboardingInput,
): string {
  const reasons: Record<string, string> = {
    "saas-starter": `Perfect for ${data.step1.useCase.replace("-", " ")} with your ${data.step2.frameworks[0] || "React"} stack`,
    "e-commerce": "Matches your e-commerce use case with scalable architecture",
    "iot-dashboard": "Great for data pipelines and real-time processing",
    "ai-rag": "Ideal for AI/ML applications with vector search",
    "chat-app": "Fits your mobile/real-time communication needs",
  };
  return reasons[templateId] || "Recommended based on your preferences";
}
