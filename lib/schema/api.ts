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
export type UpgradeSubscriptionInput = v.InferOutput<
  typeof UpgradeSubscriptionSchema
>;
export type DowngradeSubscriptionInput = v.InferOutput<
  typeof DowngradeSubscriptionSchema
>;
export type ListSubscriptionsQuery = v.InferOutput<
  typeof ListSubscriptionsQuerySchema
>;
