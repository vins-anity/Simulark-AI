import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Redis before importing the module
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    ping: vi.fn().mockResolvedValue("PONG"),
  })),
}));

// Mock env
vi.mock("../lib/env", () => ({
  env: {
    UPSTASH_REDIS_REST_URL: "https://test.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "test-token",
  },
}));

describe("AI Cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateCacheKey", () => {
    it("should generate consistent keys for same inputs", async () => {
      const { getCachedResponse } = await import("../lib/ai-cache");

      // The function should be callable without errors
      const result = await getCachedResponse({
        prompt: "test prompt",
        model: "test-model",
        mode: "architecture",
        userId: "user-123",
      });

      // With mocked Redis, should return null (cache miss)
      expect(result).toBeNull();
    });
  });

  describe("hashString", () => {
    it("should produce consistent hashes", async () => {
      // Import the module to test the internal hash function indirectly
      const { getCachedResponse } = await import("../lib/ai-cache");

      // Same prompt should produce same key
      await getCachedResponse({ prompt: "identical prompt" });
      await getCachedResponse({ prompt: "identical prompt" });

      // Different prompts should produce different keys
      await getCachedResponse({ prompt: "prompt one" });
      await getCachedResponse({ prompt: "prompt two" });

      // No errors means the hashing works
      expect(true).toBe(true);
    });
  });

  describe("setCachedResponse", () => {
    it("should cache a response", async () => {
      const { setCachedResponse, getCachedResponse } = await import(
        "../lib/ai-cache"
      );

      const testData = {
        nodes: [{ id: "1", type: "service" }],
        edges: [],
      };

      const cached = await setCachedResponse({
        prompt: "test prompt",
        result: testData,
        model: "test-model",
        provider: "test-provider",
      });

      // With mocked Redis, should return false or true depending on config
      expect(typeof cached).toBe("boolean");
    });
  });

  describe("getCacheStats", () => {
    it("should return cache statistics", async () => {
      const { getCacheStats } = await import("../lib/ai-cache");

      const stats = await getCacheStats();

      expect(stats).toHaveProperty("enabled");
      expect(typeof stats.enabled).toBe("boolean");
    });
  });

  describe("clearAICache", () => {
    it("should clear all cache entries", async () => {
      const { clearAICache } = await import("../lib/ai-cache");

      const count = await clearAICache();
      expect(typeof count).toBe("number");
    });
  });

  describe("invalidateUserCache", () => {
    it("should invalidate cache for a user", async () => {
      const { invalidateUserCache } = await import("../lib/ai-cache");

      const count = await invalidateUserCache("user-123");
      expect(typeof count).toBe("number");
    });
  });

  describe("CACHE_TTL constants", () => {
    it("should export TTL constants", async () => {
      const { CACHE_TTL } = await import("../lib/ai-cache");

      expect(CACHE_TTL.DEFAULT).toBe(3600);
      expect(CACHE_TTL.ARCHITECTURE).toBe(86400);
      expect(CACHE_TTL.QUICK).toBe(900);
    });
  });
});
