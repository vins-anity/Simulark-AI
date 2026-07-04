import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import type { StreamArchitecturePayload } from "@/lib/inference/stream-types";

export type { StreamArchitecturePayload };

export interface UIStreamEventHandlers {
  onArchitecture?: (payload: StreamArchitecturePayload) => void;
  onProgress?: (progress: number, stage: string, detail?: string) => void;
  onQuota?: (data: unknown) => void;
}

/**
 * Bridge legacy NDJSON events into AI SDK UI message stream parts.
 */
export function createArchitectureUIMessageStream(
  handlers: {
    emitLegacyEvent: (enqueue: (chunk: string) => void) => Promise<void>;
  },
  initialQuota?: unknown,
): ReadableStream {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (initialQuota) {
        writer.write({
          type: "data-quota",
          data: initialQuota,
        });
      }

      const enqueue = (line: string) => {
        try {
          const event = JSON.parse(line) as {
            type: string;
            data?: unknown;
          };
          switch (event.type) {
            case "progress": {
              const d = event.data as {
                progress: number;
                stage: string;
                detail?: string;
              };
              writer.write({
                type: "data-progress",
                data: d,
              });
              break;
            }
            case "result":
              writer.write({
                type: "data-architecture",
                data: event.data,
              });
              break;
            case "content":
              writer.write({
                type: "text-delta",
                delta: String(event.data ?? ""),
                id: "assistant-text",
              });
              break;
            case "reasoning":
              writer.write({
                type: "reasoning-delta",
                delta: String(event.data ?? ""),
                id: "assistant-reasoning",
              });
              break;
            case "quota":
              writer.write({
                type: "data-quota",
                data: event.data,
              });
              break;
            case "inference-meta":
              writer.write({
                type: "data-inference-meta",
                data: event.data,
              });
              break;
            case "usage":
              writer.write({
                type: "data-usage",
                data: event.data,
              });
              break;
            case "error":
              writer.write({
                type: "error",
                errorText: String(event.data ?? "Unknown error"),
              });
              break;
            default:
              break;
          }
        } catch {
          // ignore malformed lines
        }
      };

      await handlers.emitLegacyEvent(enqueue);
    },
  });

  return stream;
}

export function createArchitectureUIResponse(
  legacyStream: ReadableStream<Uint8Array>,
  initialQuota?: unknown,
): Response {
  const decoder = new TextDecoder();
  let buffer = "";

  const uiStream = createArchitectureUIMessageStream(
    {
      emitLegacyEvent: async (enqueue) => {
        const reader = legacyStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) enqueue(trimmed);
            }
          }
          if (buffer.trim()) {
            enqueue(buffer.trim());
          }
        } finally {
          reader.releaseLock();
        }
      },
    },
    initialQuota,
  );

  return createUIMessageStreamResponse({ stream: uiStream });
}

export type ChatUIMessage = UIMessage;
