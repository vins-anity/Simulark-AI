import * as v from "valibot";

// Common schemas
export const UuidSchema = v.pipe(v.string(), v.uuid());

export const EmailSchema = v.pipe(v.string(), v.email());

export const NonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));

// Project schemas
export const CreateProjectSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  description: v.optional(v.pipe(v.string(), v.maxLength(1000))),
  provider: v.optional(v.string()),
});

export const UpdateProjectSchema = v.object({
  name: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
  description: v.optional(v.pipe(v.string(), v.maxLength(1000))),
  provider: v.optional(v.string()),
  nodes: v.optional(v.array(v.any())),
  edges: v.optional(v.array(v.any())),
  metadata: v.optional(v.record(v.string(), v.any())),
});

// Chat schemas
export const CreateChatSchema = v.object({
  projectId: UuidSchema,
  title: v.optional(v.pipe(v.string(), v.maxLength(200))),
});

export const SendMessageSchema = v.object({
  chatId: UuidSchema,
  content: v.pipe(v.string(), v.minLength(1), v.maxLength(10000)),
  model: v.optional(v.string()),
  mode: v.optional(
    v.union([
      v.literal("default"),
      v.literal("startup"),
      v.literal("enterprise"),
    ]),
  ),
});

// AI Generation schema
export const GenerateRequestSchema = v.object({
  prompt: v.pipe(v.string(), v.minLength(1), v.maxLength(50000)),
  model: v.optional(v.string()),
  mode: v.optional(
    v.union([
      v.literal("default"),
      v.literal("startup"),
      v.literal("enterprise"),
    ]),
  ),

  currentNodes: v.optional(v.array(v.any())),
  currentEdges: v.optional(v.array(v.any())),
});

export const ExportSkillRequestSchema = v.object({
  projectName: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  projectDescription: v.optional(v.pipe(v.string(), v.maxLength(2000))),
  nodes: v.pipe(v.array(v.any()), v.minLength(1), v.maxLength(1000)),
  edges: v.pipe(v.array(v.any()), v.maxLength(5000)),
});

export const StressTestPlanRequestSchema = v.object({
  nodes: v.pipe(v.array(v.any()), v.minLength(1), v.maxLength(1000)),
  edges: v.pipe(v.array(v.any()), v.maxLength(5000)),
  plannerConfig: v.optional(
    v.union([
      v.object({
        mode: v.literal("auto"),
        modelId: v.optional(v.pipe(v.string(), v.minLength(1))),
      }),
      v.object({
        mode: v.literal("manual"),
        modelId: v.pipe(v.string(), v.minLength(1)),
      }),
    ]),
  ),
});

export const StressScenarioTypeSchema = v.picklist([
  "traffic-spike",
  "node-failure",
  "dependency-latency",
  "queue-backlog",
  "data-store-hotspot",
]);

export const StressScenarioSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  type: StressScenarioTypeSchema,
  name: v.pipe(v.string(), v.minLength(1)),
  objective: v.pipe(v.string(), v.minLength(1)),
  targets: v.array(v.string()),
  loadProfile: v.object({
    baselineRps: v.pipe(v.number(), v.minValue(1)),
    peakRps: v.pipe(v.number(), v.minValue(1)),
    rampSeconds: v.pipe(v.number(), v.minValue(1)),
    holdSeconds: v.pipe(v.number(), v.minValue(1)),
  }),
  passCriteria: v.pipe(v.array(v.string()), v.minLength(1)),
});

export const StressPlannerProviderSchema = v.picklist([
  "nvidia",
  "kimi",
  "minimax",
  "zhipu",
  "fallback",
]);

export const StressPlannerAttemptReasonCodeSchema = v.picklist([
  "auth_failed",
  "timeout",
  "provider_unavailable",
  "invalid_payload",
]);

export const StressPlannerWarningCodeSchema = v.picklist([
  "fallback_used",
  "partial_failover",
  "manual_model_failed",
  "ai_unavailable",
]);

export const StressPlannerMetaSchema = v.object({
  providerUsed: StressPlannerProviderSchema,
  modelUsed: v.optional(v.pipe(v.string(), v.minLength(1))),
  attempts: v.array(
    v.object({
      modelId: v.pipe(v.string(), v.minLength(1)),
      ok: v.boolean(),
      reasonCode: v.optional(StressPlannerAttemptReasonCodeSchema),
    }),
  ),
  warningCode: v.optional(StressPlannerWarningCodeSchema),
  warning: v.optional(v.pipe(v.string(), v.minLength(1))),
});

export const StressTestPlanResponseSchema = v.object({
  type: v.literal("stress-test-plan"),
  data: v.object({
    assumptions: v.array(v.string()),
    scenarios: v.array(StressScenarioSchema),
    markdown: v.string(),
    source: v.picklist(["ai", "fallback"]),
    warning: v.optional(v.string()),
    plannerMeta: StressPlannerMetaSchema,
  }),
});

export const StressTestRunRequestSchema = v.object({
  nodes: v.pipe(v.array(v.any()), v.minLength(1), v.maxLength(1000)),
  edges: v.pipe(v.array(v.any()), v.maxLength(5000)),
  scenario: StressScenarioSchema,
  seed: v.optional(v.pipe(v.number(), v.minValue(0))),
  nodeSpecOverrides: v.optional(
    v.record(v.string(), v.record(v.string(), v.unknown())),
  ),
});

export const StressTestRunEventSchema = v.variant("type", [
  v.object({
    type: v.literal("progress"),
    data: v.object({
      progress: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
      stage: v.picklist(["initializing", "running", "evaluating", "complete"]),
    }),
  }),
  v.object({
    type: v.literal("metric"),
    data: v.object({
      step: v.pipe(v.number(), v.minValue(1)),
      progress: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
      availability: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
      latency: v.pipe(v.number(), v.minValue(0)),
      errorRate: v.pipe(v.number(), v.minValue(0)),
      throughput: v.pipe(v.number(), v.minValue(0)),
      hotNodes: v.array(v.string()),
      hotEdges: v.array(v.string()),
    }),
  }),
  v.object({
    type: v.literal("event"),
    data: v.object({
      id: v.pipe(v.string(), v.minLength(1)),
      message: v.pipe(v.string(), v.minLength(1)),
      severity: v.picklist(["low", "medium", "high", "critical"]),
      nodeIds: v.optional(v.array(v.string())),
      edgeIds: v.optional(v.array(v.string())),
      timestamp: v.pipe(v.number(), v.minValue(0)),
    }),
  }),
  v.object({
    type: v.literal("verdict"),
    data: v.object({
      status: v.picklist(["pass", "fail"]),
      score: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
      violatedCriteria: v.array(v.string()),
      bottlenecks: v.array(v.string()),
      recommendations: v.array(v.string()),
      summary: v.pipe(v.string(), v.minLength(1)),
    }),
  }),
  v.object({
    type: v.literal("done"),
    data: v.object({
      durationMs: v.pipe(v.number(), v.minValue(0)),
      eventCount: v.pipe(v.number(), v.minValue(0)),
    }),
  }),
  v.object({
    type: v.literal("error"),
    data: v.object({
      message: v.pipe(v.string(), v.minLength(1)),
    }),
  }),
]);

// Admin subscription schemas
export const UpgradeSubscriptionSchema = v.object({
  userId: UuidSchema,
  newTier: v.union([v.literal("free"), v.literal("starter"), v.literal("pro")]),
  status: v.optional(
    v.union([
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("expired"),
    ]),
  ),
  expiresAt: v.optional(v.union([v.string(), v.null()])),
  reason: v.optional(v.string()),
  manualOverride: v.optional(v.boolean()),
});

export const DowngradeSubscriptionSchema = v.object({
  userId: UuidSchema,
  reason: v.optional(v.string()),
  immediate: v.optional(v.boolean()),
});

export const ListSubscriptionsQuerySchema = v.object({
  page: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => parseInt(val, 10)),
      v.minValue(1),
    ),
  ),
  pageSize: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => parseInt(val, 10)),
      v.minValue(1),
      v.maxValue(100),
    ),
  ),
  tier: v.optional(
    v.union([v.literal("free"), v.literal("starter"), v.literal("pro")]),
  ),
  status: v.optional(
    v.union([
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("trialing"),
      v.literal("expired"),
    ]),
  ),
  search: v.optional(v.pipe(v.string(), v.maxLength(200))),
});

// Export types
export type CreateProjectInput = v.InferOutput<typeof CreateProjectSchema>;
export type UpdateProjectInput = v.InferOutput<typeof UpdateProjectSchema>;
export type CreateChatInput = v.InferOutput<typeof CreateChatSchema>;
export type SendMessageInput = v.InferOutput<typeof SendMessageSchema>;
export type GenerateRequestInput = v.InferOutput<typeof GenerateRequestSchema>;
export type ExportSkillRequestInput = v.InferOutput<
  typeof ExportSkillRequestSchema
>;
export type StressTestPlanRequestInput = v.InferOutput<
  typeof StressTestPlanRequestSchema
>;
export type StressScenarioInput = v.InferOutput<typeof StressScenarioSchema>;
export type StressTestRunRequestInput = v.InferOutput<
  typeof StressTestRunRequestSchema
>;
export type StressTestRunEventInput = v.InferOutput<
  typeof StressTestRunEventSchema
>;
export type StressPlannerMetaInput = v.InferOutput<
  typeof StressPlannerMetaSchema
>;
export type StressTestPlanResponseInput = v.InferOutput<
  typeof StressTestPlanResponseSchema
>;
export type UpgradeSubscriptionInput = v.InferOutput<
  typeof UpgradeSubscriptionSchema
>;
export type DowngradeSubscriptionInput = v.InferOutput<
  typeof DowngradeSubscriptionSchema
>;
export type ListSubscriptionsQuery = v.InferOutput<
  typeof ListSubscriptionsQuerySchema
>;
