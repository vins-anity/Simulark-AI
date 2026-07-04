/**
 * Shared canvas node types — persistence + AI generation.
 */

import * as v from "valibot";
import { z } from "zod";

export const NODE_TYPES = [
  "gateway",
  "service",
  "frontend",
  "backend",
  "database",
  "queue",
  "ai",
  "auth",
  "payment",
  "automation",
  "messaging",
  "search",
  "monitoring",
  "cicd",
  "security",
  "vector-db",
  "ai-model",
  "idp",
  "function",
  "bucket",
  "external",
  "saas",
  "third-party",
  "cache",
  "storage",
  "client",
  "loadbalancer",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export const NodeTypeSchema = v.picklist(NODE_TYPES);

export const ZodNodeTypeSchema = z.enum(NODE_TYPES);

/** Map ecosystem defaultType strings to canvas NodeType */
export const DEFAULT_TYPE_ALIASES: Record<string, NodeType> = {
  "ai-agent": "ai",
  "ai-sdk": "ai",
  "ai-framework": "ai",
  "ai-model": "ai-model",
  embedding: "ai",
  rag: "ai",
  rerank: "ai",
  eval: "ai",
  orchestration: "service",
  "api-client": "service",
  "api-docs": "service",
  orm: "backend",
  etl: "service",
  warehouse: "database",
  observability: "monitoring",
  protocol: "messaging",
  validation: "service",
  memory: "database",
};

export function resolveDefaultNodeType(defaultType?: string): NodeType | undefined {
  if (!defaultType) return undefined;
  if ((NODE_TYPES as readonly string[]).includes(defaultType)) {
    return defaultType as NodeType;
  }
  return DEFAULT_TYPE_ALIASES[defaultType];
}
