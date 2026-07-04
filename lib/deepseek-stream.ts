/**
 * @deprecated Import from @/lib/inference/stream-architecture instead.
 * Thin compatibility shim for existing imports.
 */
export {
  type ArchitectureStreamMessage as DeepSeekStreamMessage,
  type ArchitectureStreamPart as DeepSeekStreamPart,
  type ArchitectureStreamUsage as DeepSeekStreamUsage,
  type InferenceStreamMeta,
  streamArchitectureInference as streamDashScopeInference,
} from "@/lib/inference/stream-architecture";

export { isDashScopeConfigured } from "@/lib/inference/dashscope-provider";

/** @deprecated Use streamArchitectureInference */
export async function streamDeepSeekChat(
  options: Parameters<
    typeof import("@/lib/inference/stream-architecture").streamArchitectureInference
  >[0],
): Promise<{
  fullStream: AsyncIterable<
    import("@/lib/inference/stream-architecture").ArchitectureStreamPart
  >;
}> {
  const { fullStream } = await import(
    "@/lib/inference/stream-architecture"
  ).then((m) => m.streamArchitectureInference(options));
  return { fullStream };
}
