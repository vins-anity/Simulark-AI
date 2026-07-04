import { type Telemetry, registerTelemetry } from "ai";
import { createLogger } from "@/lib/logger";

const logger = createLogger("ai-telemetry");

let registered = false;

const simularkTelemetry: Telemetry = {
  onStart: (event) => {
    logger.info("AI SDK operation started", {
      operationId: event.operationId,
      modelId: event.modelId,
      provider: event.provider,
    });
  },
  onEnd: (event) => {
    logger.info("AI SDK operation finished", {
      callId: "callId" in event ? event.callId : undefined,
    });
  },
  onError: (event) => {
    logger.error("AI SDK operation error", {
      error: String(event),
    });
  },
};

/**
 * Register AI SDK telemetry hooks once at startup.
 */
export function registerInferenceTelemetry(): void {
  if (registered) {
    return;
  }
  registered = true;
  registerTelemetry(simularkTelemetry);
}
