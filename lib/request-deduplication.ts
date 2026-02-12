import { createLogger } from "@/lib/logger";

const logger = createLogger("request-dedup");

/**
 * Pending request entry
 */
interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
  requestHash: string;
}

/**
 * Request deduplication cache
 * Prevents duplicate concurrent requests and caches recent results
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private resultCache: Map<string, { result: unknown; timestamp: number }> =
    new Map();
  private cacheTTL: number;
  private maxCacheSize: number;

  constructor(cacheTTL = 30000, maxCacheSize = 100) {
    this.cacheTTL = cacheTTL;
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Generate a hash for the request
   */
  private hashRequest(input: unknown): string {
    try {
      return JSON.stringify(input);
    } catch {
      return String(input);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.resultCache) {
      if (now - entry.timestamp > this.cacheTTL) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.resultCache.delete(key);
    }

    // If still over size limit, remove oldest entries
    if (this.resultCache.size > this.maxCacheSize) {
      const entries = Array.from(this.resultCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = entries.slice(
        0,
        this.resultCache.size - this.maxCacheSize,
      );
      for (const [key] of toRemove) {
        this.resultCache.delete(key);
      }
    }
  }

  /**
   * Execute a request with deduplication
   * If an identical request is already pending, returns the existing promise
   * If an identical request was recently completed, returns the cached result
   */
  async execute<T>(
    requestInput: unknown,
    requestFn: () => Promise<T>,
    options?: {
      skipCache?: boolean;
      cacheKey?: string;
    },
  ): Promise<T> {
    const hash = options?.cacheKey || this.hashRequest(requestInput);
    const now = Date.now();

    // Check cache first (unless skipped)
    if (!options?.skipCache) {
      const cached = this.resultCache.get(hash);
      if (cached && now - cached.timestamp < this.cacheTTL) {
        logger.debug("Request cache hit", { hash: hash.substring(0, 50) });
        return cached.result as T;
      }
    }

    // Check for pending request
    const pending = this.pendingRequests.get(hash);
    if (pending) {
      logger.debug("Request deduplicated (pending)", {
        hash: hash.substring(0, 50),
      });
      return pending.promise as Promise<T>;
    }

    // Execute new request
    logger.debug("Executing new request", { hash: hash.substring(0, 50) });

    const promise = requestFn();

    // Store as pending
    this.pendingRequests.set(hash, {
      promise: promise as Promise<unknown>,
      timestamp: now,
      requestHash: hash,
    });

    try {
      const result = await promise;

      // Cache the result
      this.resultCache.set(hash, {
        result: result as unknown,
        timestamp: Date.now(),
      });

      this.cleanupCache();

      return result;
    } finally {
      // Remove from pending
      this.pendingRequests.delete(hash);
    }
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.resultCache.clear();
    logger.info("Request cache cleared");
  }

  /**
   * Clear pending requests (useful for cleanup on error)
   */
  clearPending(): void {
    this.pendingRequests.clear();
    logger.info("Pending requests cleared");
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    pendingCount: number;
    cachedCount: number;
    cacheTTL: number;
  } {
    return {
      pendingCount: this.pendingRequests.size,
      cachedCount: this.resultCache.size,
      cacheTTL: this.cacheTTL,
    };
  }
}

/**
 * Global request deduplicator instance
 */
export const globalDeduplicator = new RequestDeduplicator(30000, 200);

/**
 * Deduplicate AI generation requests
 */
export async function deduplicateGeneration<T>(
  prompt: string,
  model: string | undefined,
  mode: string | undefined,
  requestFn: () => Promise<T>,
): Promise<T> {
  const cacheKey = `gen:${model || "default"}:${mode || "default"}:${prompt}`;

  return globalDeduplicator.execute(cacheKey, requestFn, {
    skipCache: false,
    cacheKey,
  });
}

/**
 * Deduplicate project fetch requests
 */
export async function deduplicateProjectFetch<T>(
  projectId: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  return globalDeduplicator.execute(`project:${projectId}`, requestFn);
}

/**
 * Hook for React components to use deduplicated requests
 */
export function useDeduplicatedRequest<T, R>(
  requestFn: (input: T) => Promise<R>,
  options?: {
    cacheTTL?: number;
    cacheKey?: (input: T) => string;
  },
): (input: T) => Promise<R> {
  const deduplicator = new RequestDeduplicator(options?.cacheTTL || 30000, 50);

  return async (input: T) => {
    const cacheKey = options?.cacheKey?.(input);
    return deduplicator.execute(input, () => requestFn(input), { cacheKey });
  };
}
