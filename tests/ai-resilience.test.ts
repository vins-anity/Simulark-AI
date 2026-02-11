import { describe, expect, it } from "vitest";
import {
  calculateDelay,
  isRateLimitError,
  isRetryableError,
  parseAIResponse,
  type RetryConfig,
  validateAIResponse,
  withRetry,
} from "../lib/ai-resilience";
import { CircuitBreaker } from "../lib/circuit-breaker";

describe("AI Resilience Tests", () => {
  describe("Retry Logic", () => {
    describe("calculateDelay", () => {
      it("should calculate exponential backoff correctly", () => {
        const config: RetryConfig = {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          exponentialBase: 2,
        };

        expect(calculateDelay(1, config)).toBe(1000);
        expect(calculateDelay(2, config)).toBe(2000);
        expect(calculateDelay(3, config)).toBe(4000);
      });

      it("should respect max delay cap", () => {
        const config: RetryConfig = {
          maxRetries: 5,
          baseDelay: 1000,
          maxDelay: 5000,
          exponentialBase: 2,
        };

        expect(calculateDelay(4, config)).toBe(5000); // Would be 8000, capped to 5000
      });

      it("should handle base 1 (no exponential growth)", () => {
        const config: RetryConfig = {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          exponentialBase: 1,
        };

        expect(calculateDelay(1, config)).toBe(1000);
        expect(calculateDelay(3, config)).toBe(1000);
      });
    });

    describe("isRetryableError", () => {
      it("should identify network errors as retryable", () => {
        expect(isRetryableError(new Error("Network timeout"))).toBe(true);
        expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true);
        expect(isRetryableError(new Error("ETIMEDOUT"))).toBe(true);
      });

      it("should identify 5xx errors as retryable", () => {
        const error503 = new Error("Server error") as any;
        error503.status = 503;
        expect(isRetryableError(error503)).toBe(true);

        const error502 = new Error("Bad gateway") as any;
        error502.status = 502;
        expect(isRetryableError(error502)).toBe(true);

        const error504 = new Error("Gateway timeout") as any;
        error504.status = 504;
        expect(isRetryableError(error504)).toBe(true);
      });

      it("should identify rate limit errors (429) as retryable", () => {
        expect(isRetryableError(new Error("429 Too Many Requests"))).toBe(true);
      });

      it("should not identify client errors (4xx) as retryable", () => {
        const error400 = new Error("Bad request") as any;
        error400.status = 400;
        expect(isRetryableError(error400)).toBe(false);

        const error401 = new Error("Unauthorized") as any;
        error401.status = 401;
        expect(isRetryableError(error401)).toBe(false);

        const error404 = new Error("Not found") as any;
        error404.status = 404;
        expect(isRetryableError(error404)).toBe(false);

        const error422 = new Error("Unprocessable") as any;
        error422.status = 422;
        expect(isRetryableError(error422)).toBe(false);
      });

      it("should handle non-error inputs gracefully", () => {
        expect(isRetryableError(null)).toBe(false);
        expect(isRetryableError(undefined)).toBe(false);
        expect(isRetryableError("string error")).toBe(false);
        expect(isRetryableError(123)).toBe(false);
        expect(isRetryableError({})).toBe(false);
      });
    });

    describe("isRateLimitError", () => {
      it("should identify 429 status code", () => {
        const error = new Error("Rate limit") as any;
        error.status = 429;
        expect(isRateLimitError(error)).toBe(true);
      });

      it("should identify rate limit in message", () => {
        expect(isRateLimitError(new Error("429 Too Many Requests"))).toBe(true);
        expect(isRateLimitError(new Error("Rate limit exceeded"))).toBe(true);
        expect(isRateLimitError(new Error("rate limit reached"))).toBe(true);
      });

      it("should identify Chinese rate limit message", () => {
        expect(isRateLimitError(new Error("速率限制"))).toBe(true);
        expect(isRateLimitError(new Error("遇到速率限制"))).toBe(true);
      });

      it("should return false for non-rate-limit errors", () => {
        expect(isRateLimitError(new Error("Network error"))).toBe(false);
        expect(isRateLimitError(new Error("Timeout"))).toBe(false);
        expect(isRateLimitError(new Error("500 Server Error"))).toBe(false);
      });
    });

    describe("withRetry", () => {
      it("should succeed on first attempt", async () => {
        const fn = async () => "success";

        const result = await withRetry(fn, "test operation", {
          maxRetries: 3,
          baseDelay: 10,
        });

        expect(result).toBe("success");
      });

      it("should not retry rate limit errors", async () => {
        let callCount = 0;
        const fn = async () => {
          callCount++;
          throw new Error("429 Rate limit");
        };

        await expect(
          withRetry(fn, "test operation", { maxRetries: 3, baseDelay: 10 }),
        ).rejects.toThrow("429 Rate limit");

        expect(callCount).toBe(1);
      });

      it("should not retry non-retryable errors", async () => {
        let callCount = 0;
        const fn = async () => {
          callCount++;
          throw new Error("Bad request");
        };

        await expect(
          withRetry(fn, "test operation", { maxRetries: 3, baseDelay: 10 }),
        ).rejects.toThrow("Bad request");

        expect(callCount).toBe(1);
      });
    });
  });

  describe("Circuit Breaker Integration", () => {
    it("should create circuit breaker with default options", () => {
      const cb = new CircuitBreaker();
      expect(cb.canExecute("test")).toBe(true);
    });

    it("should create circuit breaker with custom options", () => {
      const cb = new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000,
        halfOpenMaxCalls: 3,
      });
      expect(cb.canExecute("test")).toBe(true);
    });
  });

  describe("Response Validation", () => {
    describe("validateAIResponse", () => {
      it("should validate correct response structure", () => {
        const response = {
          nodes: [
            {
              id: "1",
              type: "frontend",
              position: { x: 100, y: 100 },
              data: { label: "Frontend" },
            },
          ],
          edges: [
            {
              id: "e1",
              source: "1",
              target: "2",
              animated: true,
            },
          ],
        };

        const result = validateAIResponse(response);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should reject non-object response", () => {
        expect(validateAIResponse(null)).toEqual({
          valid: false,
          errors: ["Response is not an object"],
        });

        expect(validateAIResponse("string")).toEqual({
          valid: false,
          errors: ["Response is not an object"],
        });

        expect(validateAIResponse(123)).toEqual({
          valid: false,
          errors: ["Response is not an object"],
        });
      });

      it("should validate node structure", () => {
        const response = {
          nodes: [
            { id: "1", type: "frontend", data: {} },
            { type: "backend", data: {} }, // Missing id
            { id: "3", data: {} }, // Missing type
          ],
          edges: [],
        };

        const result = validateAIResponse(response);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Node 1 missing 'id'");
        expect(result.errors).toContain("Node 2 missing 'type'");
      });

      it("should validate node data field", () => {
        const response = {
          nodes: [{ id: "1", type: "frontend" }], // Missing data
          edges: [],
        };

        const result = validateAIResponse(response);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Node 0 missing 'data'");
      });

      it("should validate edge structure", () => {
        const response = {
          nodes: [],
          edges: [
            { id: "e1", source: "1", target: "2" },
            { id: "e2", target: "2" }, // Missing source
            { id: "e3", source: "1" }, // Missing target
          ],
        };

        const result = validateAIResponse(response);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Edge 1 missing 'source'");
        expect(result.errors).toContain("Edge 2 missing 'target'");
      });

      it("should require nodes and edges arrays", () => {
        expect(validateAIResponse({})).toEqual({
          valid: false,
          errors: [
            "Missing or invalid 'nodes' array",
            "Missing or invalid 'edges' array",
          ],
        });
      });

      it("should validate empty arrays", () => {
        const result = validateAIResponse({ nodes: [], edges: [] });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should handle nodes with non-object items", () => {
        const response = {
          nodes: [null, "string", 123],
          edges: [],
        };

        const result = validateAIResponse(response);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Node 0 is not an object");
        expect(result.errors).toContain("Node 1 is not an object");
      });
    });

    describe("parseAIResponse", () => {
      it("should parse valid JSON", () => {
        const content = JSON.stringify({
          nodes: [{ id: "1", type: "frontend", data: {} }],
          edges: [],
        });

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      });

      it("should parse JSON with markdown code blocks", () => {
        const content = '```json\n{"nodes":[],"edges":[]}\n```';

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ nodes: [], edges: [] });
      });

      it("should parse JSON with generic code blocks", () => {
        const content = '```\n{"nodes":[],"edges":[]}\n```';

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
      });

      it("should extract JSON from text", () => {
        const content =
          'Here is the architecture: {\n  "nodes": [],\n  "edges": []\n} Hope this helps!';

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ nodes: [], edges: [] });
      });

      it("should handle invalid JSON", () => {
        const result = parseAIResponse("not valid json");

        expect(result.success).toBe(false);
        expect(result.error).toContain("Failed to parse");
      });

      it("should validate structure after parsing", () => {
        const content = JSON.stringify({ invalid: "structure" });

        const result = parseAIResponse(content);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Invalid response structure");
      });

      it("should handle deeply nested structures", () => {
        const content = JSON.stringify({
          nodes: [
            {
              id: "1",
              type: "service",
              position: { x: 100, y: 100 },
              data: {
                label: "Service",
                config: { nested: { deeply: { value: "test" } } },
              },
            },
          ],
          edges: [],
        });

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
      });

      it("should handle JSON with whitespace", () => {
        const content = `   
        {
          "nodes": [],
          "edges": []
        }   `;

        const result = parseAIResponse(content);

        expect(result.success).toBe(true);
      });

      it("should handle empty string", () => {
        const result = parseAIResponse("");

        expect(result.success).toBe(false);
        expect(result.error).toContain("Failed to parse");
      });
    });
  });
});
