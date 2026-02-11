import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aiCircuitBreaker, CircuitBreaker } from "../lib/circuit-breaker";

describe("Circuit Breaker Tests", () => {
  describe("CircuitBreaker Class", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 1000, // 1 second for testing
        halfOpenMaxCalls: 2,
      });
    });

    describe("Initial State", () => {
      it("should start in closed state", () => {
        expect(circuitBreaker.canExecute("test-provider")).toBe(true);
        const status = circuitBreaker.getStatus("test-provider");
        expect(status.status).toBe("closed");
        expect(status.failures).toBe(0);
      });

      it("should track multiple providers independently", () => {
        circuitBreaker.recordFailure("provider-a");
        circuitBreaker.recordFailure("provider-a");

        expect(circuitBreaker.canExecute("provider-b")).toBe(true);
        expect(circuitBreaker.getStatus("provider-b").failures).toBe(0);
      });
    });

    describe("Closed State", () => {
      it("should allow execution in closed state", () => {
        expect(circuitBreaker.canExecute("test")).toBe(true);
      });

      it("should count failures in closed state", () => {
        circuitBreaker.recordFailure("test");
        circuitBreaker.recordFailure("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.failures).toBe(2);
        expect(status.status).toBe("closed");
      });

      it("should reset failure count on success", () => {
        circuitBreaker.recordFailure("test");
        circuitBreaker.recordFailure("test");
        circuitBreaker.recordSuccess("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.failures).toBe(0);
      });
    });

    describe("Open State", () => {
      it("should open circuit after threshold failures", () => {
        circuitBreaker.recordFailure("test");
        circuitBreaker.recordFailure("test");
        circuitBreaker.recordFailure("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.status).toBe("open");
        expect(circuitBreaker.canExecute("test")).toBe(false);
      });

      it("should block execution when circuit is open", () => {
        // Trigger open state
        for (let i = 0; i < 3; i++) {
          circuitBreaker.recordFailure("test");
        }

        expect(circuitBreaker.canExecute("test")).toBe(false);
      });

      it("should transition to half-open after reset timeout", () => {
        // Open the circuit
        for (let i = 0; i < 3; i++) {
          circuitBreaker.recordFailure("test");
        }

        expect(circuitBreaker.getStatus("test").status).toBe("open");

        // Simulate time passing
        const futureTime = Date.now() + 2000; // 2 seconds later
        vi.spyOn(Date, "now").mockReturnValue(futureTime);

        expect(circuitBreaker.canExecute("test")).toBe(true);
        expect(circuitBreaker.getStatus("test").status).toBe("half-open");

        vi.restoreAllMocks();
      });
    });

    describe("Half-Open State", () => {
      beforeEach(() => {
        // Open the circuit first
        for (let i = 0; i < 3; i++) {
          circuitBreaker.recordFailure("test");
        }

        // Transition to half-open
        const futureTime = Date.now() + 2000;
        vi.spyOn(Date, "now").mockReturnValue(futureTime);
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it("should track half-open call attempts", () => {
        // In half-open state, canExecute returns true if halfOpenCalls < max
        // halfOpenCalls is incremented by recordSuccess, not canExecute
        expect(circuitBreaker.canExecute("test")).toBe(true); // halfOpenCalls = 0
        circuitBreaker.recordSuccess("test"); // halfOpenCalls = 1
        expect(circuitBreaker.canExecute("test")).toBe(true); // halfOpenCalls = 1 < 2
        circuitBreaker.recordSuccess("test"); // halfOpenCalls = 2, circuit closes
        expect(circuitBreaker.canExecute("test")).toBe(true); // Now closed, always true
      });

      it("should close circuit after successful half-open calls", () => {
        circuitBreaker.canExecute("test"); // First call
        circuitBreaker.recordSuccess("test");

        circuitBreaker.canExecute("test"); // Second call
        circuitBreaker.recordSuccess("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.status).toBe("closed");
        expect(status.failures).toBe(0);
      });

      it("should reopen circuit on failure in half-open", () => {
        circuitBreaker.canExecute("test");
        circuitBreaker.recordFailure("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.status).toBe("open");
        expect(status.halfOpenCalls).toBe(0);
      });
    });

    describe("Manual Reset", () => {
      it("should reset circuit to closed state", () => {
        // Open the circuit
        for (let i = 0; i < 3; i++) {
          circuitBreaker.recordFailure("test");
        }

        expect(circuitBreaker.getStatus("test").status).toBe("open");

        circuitBreaker.reset("test");

        const status = circuitBreaker.getStatus("test");
        expect(status.status).toBe("closed");
        expect(status.failures).toBe(0);
        expect(status.lastFailureTime).toBeNull();
      });
    });

    describe("Status Tracking", () => {
      it("should track last failure time", () => {
        const beforeTime = Date.now();
        circuitBreaker.recordFailure("test");
        const afterTime = Date.now();

        const status = circuitBreaker.getStatus("test");
        expect(status.lastFailureTime).toBeGreaterThanOrEqual(beforeTime);
        expect(status.lastFailureTime).toBeLessThanOrEqual(afterTime);
      });

      it("should return correct status object", () => {
        circuitBreaker.recordFailure("test");

        const status = circuitBreaker.getStatus("test");
        expect(status).toHaveProperty("status");
        expect(status).toHaveProperty("failures");
        expect(status).toHaveProperty("lastFailureTime");
        expect(status).toHaveProperty("halfOpenCalls");
      });
    });
  });

  describe("Global Circuit Breaker Instance", () => {
    beforeEach(() => {
      // Reset the global instance before each test
      aiCircuitBreaker.reset("zhipu");
      aiCircuitBreaker.reset("openrouter");
      aiCircuitBreaker.reset("kimi");
    });

    it("should use configured thresholds", () => {
      // The global instance has failureThreshold: 3
      aiCircuitBreaker.recordFailure("test");
      aiCircuitBreaker.recordFailure("test");

      expect(aiCircuitBreaker.getStatus("test").status).toBe("closed");

      aiCircuitBreaker.recordFailure("test");
      expect(aiCircuitBreaker.getStatus("test").status).toBe("open");
    });

    it("should track multiple AI providers", () => {
      // Simulate failures on different providers
      aiCircuitBreaker.recordFailure("zhipu");
      aiCircuitBreaker.recordFailure("zhipu");
      aiCircuitBreaker.recordFailure("zhipu");

      expect(aiCircuitBreaker.canExecute("zhipu")).toBe(false);
      expect(aiCircuitBreaker.canExecute("openrouter")).toBe(true);
    });

    it("should isolate provider states", () => {
      // Open zhipu
      for (let i = 0; i < 3; i++) {
        aiCircuitBreaker.recordFailure("zhipu");
      }

      // OpenRouter should still work
      expect(aiCircuitBreaker.canExecute("openrouter")).toBe(true);

      // Record success on openrouter
      aiCircuitBreaker.recordSuccess("openrouter");
      expect(aiCircuitBreaker.getStatus("openrouter").failures).toBe(0);

      // Zhipu should still be open
      expect(aiCircuitBreaker.canExecute("zhipu")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 1000,
        halfOpenMaxCalls: 2,
      });
    });

    it("should handle rapid successive failures", () => {
      for (let i = 0; i < 10; i++) {
        circuitBreaker.recordFailure("test");
      }

      expect(circuitBreaker.getStatus("test").status).toBe("open");
    });

    it("should handle alternating success and failure", () => {
      circuitBreaker.recordFailure("test");
      circuitBreaker.recordSuccess("test");
      circuitBreaker.recordFailure("test");
      circuitBreaker.recordSuccess("test");

      expect(circuitBreaker.getStatus("test").failures).toBe(0);
      expect(circuitBreaker.getStatus("test").status).toBe("closed");
    });

    it("should handle success in open state (should not happen but be safe)", () => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.recordFailure("test");
      }

      // Try to record success while open
      circuitBreaker.recordSuccess("test");

      // Should stay in open state
      expect(circuitBreaker.getStatus("test").status).toBe("open");
    });

    it("should work with empty provider name", () => {
      expect(circuitBreaker.canExecute("")).toBe(true);
      circuitBreaker.recordFailure("");
      expect(circuitBreaker.getStatus("").failures).toBe(1);
    });
  });
});
