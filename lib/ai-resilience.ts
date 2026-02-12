import { createLogger } from "@/lib/logger";
import { aiCircuitBreaker } from "./circuit-breaker";

const logger = createLogger("ai-resilience");

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  exponentialBase: 2,
};

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function calculateDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): number {
  const delay = config.baseDelay * config.exponentialBase ** (attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Retry on network errors, timeouts, rate limits (429), and server errors (5xx)
    const message = error.message.toLowerCase();
    if (
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("etimedout") ||
      message.includes("429") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("504")
    ) {
      return true;
    }

    // Check status code if available
    const statusCode = (error as any).status;
    if (statusCode) {
      return statusCode === 429 || statusCode >= 500;
    }
  }
  return false;
}

/**
 * Check if error is a rate limit error (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("速率限制")
    ) {
      return true;
    }
    const statusCode = (error as any).status;
    if (statusCode === 429) {
      return true;
    }
  }
  return false;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const result = await fn();

      if (attempt > 1) {
        logger.info(`[Retry] ${operationName} succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry rate limit errors - let the caller handle fallback
      if (isRateLimitError(error)) {
        logger.warn(
          `[Retry] ${operationName} hit rate limit. Not retrying - should fallback to alternative provider.`,
        );
        throw error;
      }

      if (!isRetryableError(error)) {
        logger.warn(
          `[Retry] ${operationName} failed with non-retryable error: ${lastError.message}`,
        );
        throw error;
      }

      if (attempt < retryConfig.maxRetries) {
        const delay = calculateDelay(attempt, retryConfig);
        logger.warn(
          `[Retry] ${operationName} failed (attempt ${attempt}/${retryConfig.maxRetries}): ${lastError.message}. Retrying in ${delay}ms...`,
        );
        await sleep(delay);
      } else {
        logger.error(
          `[Retry] ${operationName} failed after ${retryConfig.maxRetries} attempts: ${lastError.message}`,
        );
      }
    }
  }

  throw lastError;
}

/**
 * Enhanced AI call with circuit breaker and retry logic
 */
export async function callAIWithResilience<T>(
  provider: string,
  fn: () => Promise<T>,
  operationName: string = "AI call",
): Promise<T> {
  // Check circuit breaker
  if (!aiCircuitBreaker.canExecute(provider)) {
    const status = aiCircuitBreaker.getStatus(provider);
    const timeUntilReset = status.lastFailureTime
      ? Math.max(0, 30000 - (Date.now() - status.lastFailureTime))
      : 30000;

    throw new Error(
      `[CircuitBreaker] ${provider} is unavailable. Circuit open. Try again in ${Math.ceil(timeUntilReset / 1000)}s`,
    );
  }

  try {
    const result = await withRetry(fn, `${operationName} (${provider})`, {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
    });

    // Record success
    aiCircuitBreaker.recordSuccess(provider);

    return result;
  } catch (error) {
    // Record failure
    aiCircuitBreaker.recordFailure(provider);
    throw error;
  }
}

/**
 * Validate AI response structure
 */
export function validateAIResponse(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Response is not an object"] };
  }

  const response = data as Record<string, unknown>;

  // Check for nodes array
  if (!Array.isArray(response.nodes)) {
    errors.push("Missing or invalid 'nodes' array");
  } else {
    // Validate each node
    response.nodes.forEach((node: unknown, index: number) => {
      if (!node || typeof node !== "object") {
        errors.push(`Node ${index} is not an object`);
        return;
      }

      const n = node as Record<string, unknown>;
      if (typeof n.id !== "string") {
        errors.push(`Node ${index} missing 'id'`);
      }
      if (typeof n.type !== "string") {
        errors.push(`Node ${index} missing 'type'`);
      }
      if (!n.data || typeof n.data !== "object") {
        errors.push(`Node ${index} missing 'data'`);
      }
    });
  }

  // Check for edges array
  if (!Array.isArray(response.edges)) {
    errors.push("Missing or invalid 'edges' array");
  } else {
    // Validate each edge
    response.edges.forEach((edge: unknown, index: number) => {
      if (!edge || typeof edge !== "object") {
        errors.push(`Edge ${index} is not an object`);
        return;
      }

      const e = edge as Record<string, unknown>;
      if (typeof e.id !== "string") {
        errors.push(`Edge ${index} missing 'id'`);
      }
      if (typeof e.source !== "string") {
        errors.push(`Edge ${index} missing 'source'`);
      }
      if (typeof e.target !== "string") {
        errors.push(`Edge ${index} missing 'target'`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Parse AI response with validation and error recovery
 */
export function parseAIResponse(content: string): {
  success: boolean;
  data?: unknown;
  error?: string;
} {
  try {
    // Try to find JSON in the content
    let jsonStr = content.trim();

    // Remove markdown code blocks
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }

    // Find JSON boundaries
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    // Parse JSON
    const data = JSON.parse(jsonStr.trim());

    // Validate structure
    const validation = validateAIResponse(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid response structure: ${validation.errors.join(", ")}`,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
