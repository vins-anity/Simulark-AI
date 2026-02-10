import { logger } from "@/lib/logger";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

interface CircuitBreakerState {
  status: "closed" | "open" | "half-open";
  failures: number;
  lastFailureTime: number | null;
  halfOpenCalls: number;
}

/**
 * Circuit Breaker pattern implementation for AI providers
 * Prevents overwhelming failing services
 */
export class CircuitBreaker {
  private state: Map<string, CircuitBreakerState> = new Map();
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000, // 60 seconds
      halfOpenMaxCalls: options.halfOpenMaxCalls || 3,
    };
  }

  private getState(provider: string): CircuitBreakerState {
    if (!this.state.has(provider)) {
      this.state.set(provider, {
        status: "closed",
        failures: 0,
        lastFailureTime: null,
        halfOpenCalls: 0,
      });
    }
    return this.state.get(provider)!;
  }

  canExecute(provider: string): boolean {
    const state = this.getState(provider);

    if (state.status === "closed") {
      return true;
    }

    if (state.status === "open") {
      const timeSinceLastFailure = Date.now() - (state.lastFailureTime || 0);
      if (timeSinceLastFailure >= this.options.resetTimeout) {
        // Transition to half-open
        state.status = "half-open";
        state.halfOpenCalls = 0;
        logger.info(`[CircuitBreaker] ${provider} transitioning to half-open`);
        return true;
      }
      return false;
    }

    if (state.status === "half-open") {
      return state.halfOpenCalls < this.options.halfOpenMaxCalls;
    }

    return true;
  }

  recordSuccess(provider: string): void {
    const state = this.getState(provider);

    if (state.status === "half-open") {
      state.halfOpenCalls++;
      if (state.halfOpenCalls >= this.options.halfOpenMaxCalls) {
        // Transition back to closed
        state.status = "closed";
        state.failures = 0;
        state.halfOpenCalls = 0;
        logger.info(`[CircuitBreaker] ${provider} circuit closed (recovered)`);
      }
    } else {
      state.failures = 0;
    }
  }

  recordFailure(provider: string): void {
    const state = this.getState(provider);
    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.status === "half-open") {
      // Transition back to open
      state.status = "open";
      state.halfOpenCalls = 0;
      logger.warn(
        `[CircuitBreaker] ${provider} circuit opened (failed in half-open)`,
      );
    } else if (state.failures >= this.options.failureThreshold) {
      // Transition to open
      state.status = "open";
      logger.warn(
        `[CircuitBreaker] ${provider} circuit opened after ${state.failures} failures`,
      );
    }
  }

  getStatus(provider: string): CircuitBreakerState {
    return this.getState(provider);
  }

  reset(provider: string): void {
    this.state.set(provider, {
      status: "closed",
      failures: 0,
      lastFailureTime: null,
      halfOpenCalls: 0,
    });
    logger.info(`[CircuitBreaker] ${provider} manually reset`);
  }
}

// Global circuit breaker instance
export const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  halfOpenMaxCalls: 2,
});
