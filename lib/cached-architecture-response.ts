import {
  CACHE_TTL,
  getCachedResponse,
  setCachedResponse,
} from "@/lib/ai-cache";

export function buildArchitectureCachePrompt(params: {
  prompt: string;
  nodeCount: number;
  edgeCount: number;
  tier?: string;
  operation?: string;
  preferencesHash?: string;
}): string {
  return [
    params.prompt.trim(),
    `nodes:${params.nodeCount}`,
    `edges:${params.edgeCount}`,
    params.tier ? `tier:${params.tier}` : "",
    params.operation ? `op:${params.operation}` : "",
    params.preferencesHash ? `prefs:${params.preferencesHash}` : "",
  ]
    .filter(Boolean)
    .join("|");
}

export async function getCachedArchitecture<T>(params: {
  prompt: string;
  model?: string;
  mode?: string;
  userId: string;
  nodeCount?: number;
  edgeCount?: number;
  tier?: string;
  operation?: string;
  preferencesHash?: string;
}): Promise<T | null> {
  return getCachedResponse<T>({
    prompt: buildArchitectureCachePrompt({
      prompt: params.prompt,
      nodeCount: params.nodeCount ?? 0,
      edgeCount: params.edgeCount ?? 0,
      tier: params.tier,
      operation: params.operation,
      preferencesHash: params.preferencesHash,
    }),
    model: params.model,
    mode: params.mode,
    userId: params.userId,
  });
}

export async function cacheArchitectureResult<T>(params: {
  prompt: string;
  result: T;
  model?: string;
  provider?: string;
  mode?: string;
  userId: string;
  nodeCount?: number;
  edgeCount?: number;
}): Promise<void> {
  await setCachedResponse({
    prompt: buildArchitectureCachePrompt({
      prompt: params.prompt,
      nodeCount: params.nodeCount ?? 0,
      edgeCount: params.edgeCount ?? 0,
    }),
    result: params.result,
    model: params.model,
    provider: params.provider,
    mode: params.mode,
    userId: params.userId,
    ttl: CACHE_TTL.ARCHITECTURE,
  });
}

import type { DailyUsageSnapshot } from "@/lib/usage-status";

export function createCachedArchitectureStream<T>(
  cached: T,
  quota?: DailyUsageSnapshot,
  encoder: TextEncoder = new TextEncoder(),
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      if (quota) {
        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: "quota", data: quota })}\n`),
        );
      }
      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "progress",
            data: {
              progress: 100,
              stage: "complete",
              detail: "Loaded from cache",
            },
          })}\n`,
        ),
      );
      controller.enqueue(
        encoder.encode(`${JSON.stringify({ type: "result", data: cached })}\n`),
      );
      controller.close();
    },
  });
}
