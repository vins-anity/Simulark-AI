import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deduplicateGeneration,
  RequestDeduplicator,
  useDeduplicatedRequest,
} from "../lib/request-deduplication";

describe("RequestDeduplicator", () => {
  let deduplicator: RequestDeduplicator;

  beforeEach(() => {
    deduplicator = new RequestDeduplicator(1000, 10); // 1 second TTL, max 10 entries
  });

  describe("execute", () => {
    it("should execute a new request", async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      const result = await deduplicator.execute("test-key", requestFn);

      expect(result).toEqual({ data: "test" });
      expect(requestFn).toHaveBeenCalledTimes(1);
    });

    it("should return cached result for identical requests", async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      await deduplicator.execute("test-key", requestFn);
      const result = await deduplicator.execute("test-key", requestFn);

      expect(result).toEqual({ data: "test" });
      expect(requestFn).toHaveBeenCalledTimes(1); // Only called once
    });

    it("should deduplicate concurrent requests", async () => {
      let resolvePromise: (value: { data: string }) => void;
      const requestFn = vi.fn().mockImplementation(
        () =>
          new Promise<{ data: string }>((resolve) => {
            resolvePromise = resolve;
          }),
      );

      // Start two concurrent requests
      const promise1 = deduplicator.execute("test-key", requestFn);
      const promise2 = deduplicator.execute("test-key", requestFn);

      // Resolve the promise
      resolvePromise?.({ data: "concurrent" });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual({ data: "concurrent" });
      expect(result2).toEqual({ data: "concurrent" });
      expect(requestFn).toHaveBeenCalledTimes(1); // Only one actual request
    });

    it("should skip cache when skipCache is true", async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      await deduplicator.execute("test-key", requestFn);
      const result = await deduplicator.execute("test-key", requestFn, {
        skipCache: true,
      });

      expect(result).toEqual({ data: "test" });
      expect(requestFn).toHaveBeenCalledTimes(2); // Called twice
    });

    it("should expire cached results after TTL", async () => {
      vi.useFakeTimers();

      const shortDeduplic = new RequestDeduplicator(100, 10); // 100ms TTL
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      await shortDeduplic.execute("test-key", requestFn);

      // Advance time past TTL
      vi.advanceTimersByTime(150);

      const result = await shortDeduplic.execute("test-key", requestFn);

      expect(result).toEqual({ data: "test" });
      expect(requestFn).toHaveBeenCalledTimes(2); // Called again after expiry

      vi.useRealTimers();
    });
  });

  describe("clearCache", () => {
    it("should clear all cached results", async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      await deduplicator.execute("test-key", requestFn);
      deduplicator.clearCache();
      const result = await deduplicator.execute("test-key", requestFn);

      expect(result).toEqual({ data: "test" });
      expect(requestFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("getStats", () => {
    it("should return correct statistics", async () => {
      const requestFn = vi.fn().mockResolvedValue({ data: "test" });

      await deduplicator.execute("key1", requestFn);
      await deduplicator.execute("key2", requestFn);

      const stats = deduplicator.getStats();

      expect(stats.cachedCount).toBe(2);
      expect(stats.pendingCount).toBe(0);
      expect(stats.cacheTTL).toBe(1000);
    });
  });

  describe("maxCacheSize", () => {
    it("should respect max cache size", async () => {
      const smallDeduplic = new RequestDeduplicator(1000, 2);
      const requestFn = vi
        .fn()
        .mockImplementation((key) => Promise.resolve({ data: key }));

      await smallDeduplic.execute("key1", requestFn);
      await smallDeduplic.execute("key2", requestFn);
      await smallDeduplic.execute("key3", requestFn); // Should evict oldest

      const stats = smallDeduplic.getStats();
      expect(stats.cachedCount).toBeLessThanOrEqual(2);
    });
  });
});

describe("deduplicateGeneration", () => {
  it("should deduplicate generation requests", async () => {
    const requestFn = vi.fn().mockResolvedValue({ nodes: [], edges: [] });

    const result1 = await deduplicateGeneration(
      "test prompt",
      "test-model",
      "architecture",
      requestFn,
    );

    const result2 = await deduplicateGeneration(
      "test prompt",
      "test-model",
      "architecture",
      requestFn,
    );

    expect(result1).toEqual({ nodes: [], edges: [] });
    expect(result2).toEqual({ nodes: [], edges: [] });
    expect(requestFn).toHaveBeenCalledTimes(1);
  });
});

describe("useDeduplicatedRequest", () => {
  it("should create a deduplicated request function", async () => {
    const originalFn = vi.fn().mockResolvedValue({ result: "success" });
    const deduplicatedFn = useDeduplicatedRequest(originalFn, {
      cacheKey: (input: string) => `key-${input}`,
    });

    const result1 = await deduplicatedFn("test");
    const result2 = await deduplicatedFn("test");

    expect(result1).toEqual({ result: "success" });
    expect(result2).toEqual({ result: "success" });
    expect(originalFn).toHaveBeenCalledTimes(1);
  });
});
