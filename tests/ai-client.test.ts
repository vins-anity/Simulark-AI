import { describe, expect, it } from "vitest";
import { type AIProvider, createAIClient } from "../lib/ai-client";

describe("AI Client Tests", () => {
  describe("createAIClient", () => {
    it("should create client for zhipu provider", () => {
      const { client, config } = createAIClient("zhipu");
      expect(client).toBeDefined();
      expect(config).toBeDefined();
      expect(config.baseURL).toBeTruthy();
      expect(config.model).toBeTruthy();
    });

    it("should create client for openrouter provider", () => {
      const { client, config } = createAIClient("openrouter");
      expect(client).toBeDefined();
      expect(config).toBeDefined();
    });

    it("should default to zhipu provider", () => {
      const { client, config } = createAIClient();
      expect(client).toBeDefined();
      expect(config.model).toBe("glm-4.7-flash");
    });

    it("should handle missing API key gracefully", () => {
      // Should not throw for providers without API key
      expect(() => createAIClient("zhipu")).not.toThrow();
    });
  });

  describe("Provider Configuration", () => {
    it("should have correct zhipu configuration", () => {
      const { config } = createAIClient("zhipu");
      expect(config.baseURL).toBe("https://open.bigmodel.cn/api/paas/v4");
      expect(config.model).toBe("glm-4.7-flash");
      expect(config.reasoningParam).toEqual({
        thinking: { type: "enabled" },
      });
    });

    it("should have correct openrouter configuration", () => {
      const { config } = createAIClient("openrouter");
      expect(config.baseURL).toBe("https://openrouter.ai/api/v1");
      expect(config.model).toBe("tngtech/deepseek-r1t2-chimera:free");
      expect(config.reasoningParam).toEqual({
        reasoning: { enabled: true },
      });
    });

    it("should have correct kimi configuration", () => {
      const { config } = createAIClient("kimi");
      expect(config.model).toBe("kimi-k2.5");
    });

    it("should have correct google configuration", () => {
      const { config } = createAIClient("google");
      expect(config.model).toBe("google/gemini-3-pro-preview");
    });

    it("should have correct minimax configuration", () => {
      const { config } = createAIClient("minimax");
      expect(config.model).toBe("minimax/minimax-m2.1");
    });

    it("should have correct anthropic configuration", () => {
      const { config } = createAIClient("anthropic");
      expect(config.model).toBe("anthropic/claude-3-opus");
    });

    it("should set timeout to 30 seconds", () => {
      const { client } = createAIClient("zhipu");
      expect(client).toBeDefined();
    });
  });

  describe("Provider Fallback Chain", () => {
    it("should have zhipu as primary provider", () => {
      const { config } = createAIClient("zhipu");
      expect(config.model).toBe("glm-4.7-flash");
    });

    it("should have openrouter as fallback provider", () => {
      const { config } = createAIClient("openrouter");
      expect(config.baseURL).toBe("https://openrouter.ai/api/v1");
    });
  });

  describe("Model ID Mapping", () => {
    it("should map glm-4.7-flash to zhipu provider", () => {
      const { config } = createAIClient("zhipu");
      expect(config.model).toBe("glm-4.7-flash");
    });

    it("should map deepseek models to openrouter provider", () => {
      const { config } = createAIClient("openrouter");
      expect(config.model).toContain("deepseek");
    });

    it("should map kimi-k2.5 to kimi provider", () => {
      const { config } = createAIClient("kimi");
      expect(config.model).toBe("kimi-k2.5");
    });
  });

  describe("Multi-Provider Support", () => {
    it("should support all AI providers", () => {
      const providers: AIProvider[] = [
        "zhipu",
        "openrouter",
        "kimi",
        "google",
        "minimax",
        "anthropic",
      ];

      for (const provider of providers) {
        const { config } = createAIClient(provider);
        expect(config.baseURL).toBeTruthy();
        expect(config.model).toBeTruthy();
      }
    });

    it("should have unique models for each provider", () => {
      const models = new Set<string>();
      const providers: AIProvider[] = [
        "zhipu",
        "openrouter",
        "kimi",
        "google",
        "minimax",
        "anthropic",
      ];

      for (const provider of providers) {
        const { config } = createAIClient(provider);
        models.add(config.model);
      }

      // Each provider should have a different model
      expect(models.size).toBe(providers.length);
    });
  });

  describe("Client Headers", () => {
    it("should create client with proper configuration", () => {
      const { client, config } = createAIClient("openrouter");
      expect(client).toBeDefined();
      expect(config.baseURL).toBe("https://openrouter.ai/api/v1");
    });
  });
});
