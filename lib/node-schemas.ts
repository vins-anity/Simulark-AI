import * as v from "valibot";

export type NodeSchema = v.InferOutput<typeof BaseSchema>;

const BaseSchema = v.object({
  label: v.string(),
  tech: v.optional(v.string()),
  tier: v.optional(v.string()),
});

// Specific Schemas
export const FunctionSchema = v.object({
  ...BaseSchema.entries,
  runtime: v.picklist([
    "nodejs18.x",
    "nodejs20.x",
    "python3.11",
    "go1.x",
    "java17",
  ]),
  memory: v.number(),
  timeout: v.number(),
  handler: v.string(),
});

export const DatabaseSchema = v.object({
  ...BaseSchema.entries,
  engine: v.string(),
  version: v.string(),
  storage_gb: v.number(),
  instance_type: v.string(),
});

export const QueueSchema = v.object({
  ...BaseSchema.entries,
  visibility_timeout: v.number(),
  retention_seconds: v.number(),
  fifo: v.boolean(),
});

export const ServiceSchema = v.object({
  ...BaseSchema.entries,
  replicas: v.number(),
  cpu: v.string(),
  memory: v.string(),
  image: v.optional(v.string()),
});

export const StorageSchema = v.object({
  ...BaseSchema.entries,
  class: v.picklist(["standard", "intelligent-tiering", "glacier"]),
  encryption: v.boolean(),
  public_access: v.boolean(),
});

export const AISchema = v.object({
  ...BaseSchema.entries,
  model: v.string(),
  context_window: v.number(),
  temperature: v.number(),
});

export const ClientSchema = v.object({
  ...BaseSchema.entries,
  platform: v.picklist(["web", "mobile", "desktop"]),
  framework: v.string(),
  users_daily: v.number(),
});

// Mapping
export const SCHEMAS: Record<string, any> = {
  function: FunctionSchema,
  database: DatabaseSchema,
  queue: QueueSchema,
  service: ServiceSchema,
  storage: StorageSchema,
  ai: AISchema,
  client: ClientSchema,
};

export const DEFAULT_VALUES: Record<string, any> = {
  function: {
    runtime: "nodejs18.x",
    memory: 128,
    timeout: 30,
    handler: "index.handler",
  },
  database: {
    engine: "postgres",
    version: "15",
    storage_gb: 20,
    instance_type: "db.t3.micro",
  },
  queue: { visibility_timeout: 30, retention_seconds: 345600, fifo: false },
  service: { replicas: 1, cpu: "0.5 vCPU", memory: "512 MB" },
  storage: { class: "standard", encryption: true, public_access: false },
  ai: { model: "gpt-4-turbo", context_window: 128000, temperature: 0.7 },
  client: { platform: "web", framework: "nextjs", users_daily: 1000 },
};

export function getSchemaForType(type: string) {
  return SCHEMAS[type] || BaseSchema;
}

export function getDefaultValuesForType(type: string) {
  return DEFAULT_VALUES[type] || {};
}
