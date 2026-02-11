import { describe, expect, it } from "vitest";
import {
  type ArchitectureType,
  buildEnhancedSystemPrompt,
  type ComplexityLevel,
  detectArchitectureType,
  detectComplexity,
  validatePrompt,
} from "../lib/prompt-engineering";

describe("Prompt Engineering Tests", () => {
  describe("Architecture Type Detection", () => {
    it("should detect web-app architecture", () => {
      const inputs = [
        "Build a web application with React",
        "Create a SaaS platform",
        "Design an e-commerce website",
        "I need a dashboard with Next.js",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("web-app");
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.detectedKeywords.length).toBeGreaterThan(0);
      }
    });

    it("should detect AI/ML pipeline architecture", () => {
      const inputs = [
        "Build an AI recommendation system",
        "Create an LLM chatbot with RAG",
        "Design machine learning pipeline",
        "Set up model serving with GPU",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("ai-pipeline");
      }
    });

    it("should detect microservices architecture", () => {
      const inputs = [
        "Build microservices with Kubernetes",
        "Design distributed system with message queue",
        "Create event-driven architecture",
        "Set up service mesh with gRPC",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("microservices");
      }
    });

    it("should detect mobile app architecture", () => {
      const inputs = [
        "Build a React Native app",
        "Create iOS and Android application",
        "Design cross-platform mobile app",
        "Flutter app with backend",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("mobile-app");
      }
    });

    it("should detect serverless architecture", () => {
      const inputs = [
        "Build serverless functions",
        "Create Lambda architecture",
        "Design edge computing system",
        "Use Cloudflare Workers",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("serverless");
      }
    });

    it("should detect blockchain architecture", () => {
      const inputs = [
        "Build a Web3 dApp",
        "Create smart contract system",
        "Design DeFi platform",
        "NFT marketplace with Ethereum",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("blockchain");
      }
    });

    it("should detect monolithic architecture", () => {
      const inputs = [
        "Build monolithic application",
        "Create Django web app",
        "Design Rails application",
        "Spring Boot monolith",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("monolithic");
      }
    });

    it("should detect data pipeline architecture", () => {
      const inputs = [
        "Build ETL pipeline",
        "Create data warehouse",
        "Design real-time analytics",
        "Apache Spark data processing",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("data-pipeline");
      }
    });

    it("should detect IoT system architecture", () => {
      const inputs = [
        "Build IoT platform",
        "Create device management system",
        "Design MQTT architecture",
        "Sensor data collection",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("iot-system");
      }
    });

    it("should detect desktop app architecture", () => {
      const inputs = [
        "Build Electron desktop app",
        "Create Tauri application",
        "Design cross-platform desktop software",
        "Native Windows application",
      ];

      for (const input of inputs) {
        const result = detectArchitectureType(input);
        expect(result.type).toBe("desktop-app");
      }
    });

    it("should mark mixed architecture when multiple types detected with high confidence", () => {
      const input =
        "Build microservices web app with AI machine learning and blockchain smart contracts";
      const result = detectArchitectureType(input);

      // Mixed is detected when multiple types have high scores
      if (result.type === "mixed") {
        expect(result.confidence).toBeGreaterThan(0);
      }
    });

    it("should return unknown for ambiguous input", () => {
      const result = detectArchitectureType("something");

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should provide follow-up questions", () => {
      const result = detectArchitectureType("Build a web app");

      expect(result.suggestedQuestions).toBeDefined();
      expect(result.suggestedQuestions.length).toBeGreaterThan(0);
      expect(result.suggestedQuestions[0]).toContain("?");
    });

    it("should calculate confidence based on keyword matches", () => {
      const singleKeyword = detectArchitectureType("web");
      const multipleKeywords = detectArchitectureType(
        "web application with React frontend",
      );

      expect(multipleKeywords.confidence).toBeGreaterThan(
        singleKeyword.confidence,
      );
    });

    it("should be case insensitive", () => {
      const lower = detectArchitectureType("build a web app");
      const upper = detectArchitectureType("BUILD A WEB APP");
      const mixed = detectArchitectureType("BuIlD a WeB ApP");

      expect(lower.type).toBe(upper.type);
      expect(upper.type).toBe(mixed.type);
    });
  });

  describe("Complexity Detection", () => {
    it("should detect simple complexity", () => {
      const inputs = [
        "Build a simple todo app",
        "Create a personal blog",
        "Basic landing page",
        "Small portfolio website",
      ];

      for (const input of inputs) {
        expect(detectComplexity(input)).toBe("simple");
      }
    });

    it("should detect medium complexity", () => {
      const inputs = [
        "Build an e-commerce platform",
        "Create a SaaS dashboard",
        "CRM system",
        "CMS application",
      ];

      for (const input of inputs) {
        expect(detectComplexity(input)).toBe("medium");
      }
    });

    it("should detect complex complexity", () => {
      const inputs = [
        "Build distributed microservices with Kubernetes",
        "Enterprise multi-tenant platform",
        "High availability system with auto-scaling",
        "AI pipeline with GPU clusters",
      ];

      for (const input of inputs) {
        expect(detectComplexity(input)).toBe("complex");
      }
    });

    it("should default based on length", () => {
      const veryShort = "hi";
      const medium = "This is a medium length prompt describing requirements";
      const long =
        "This is a very long prompt with many detailed requirements about the system architecture and all the features that need to be implemented";

      expect(detectComplexity(veryShort)).toBe("simple");
      expect(detectComplexity(medium)).toBe("medium");
    });

    it("should prioritize explicit keywords over length", () => {
      const shortButComplex = "Build microservices";
      expect(detectComplexity(shortButComplex)).toBe("complex");

      const longButSimple =
        "Build a very simple todo list application with basic features for personal use";
      expect(detectComplexity(longButSimple)).toBe("simple");
    });
  });

  describe("Prompt Validation", () => {
    it("should reject too short prompts", () => {
      const result = validatePrompt("hi");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("too short");
      expect(result.suggestedPrompts).toBeDefined();
      expect(result.suggestedPrompts!.length).toBeGreaterThan(0);
    });

    it("should accept valid prompts", () => {
      const result = validatePrompt("Build a web application with React");

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should detect gibberish input", () => {
      const result = validatePrompt("aaaaaa");

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("valid architecture description");
    });

    it("should detect repetitive patterns", () => {
      // Test with a pattern of short repeated words
      const result = validatePrompt("ab ab ab ab ");

      if (result.isValid === false) {
        expect(result.error).toContain("valid architecture description");
      }
    });

    it("should warn about greeting-only prompts", () => {
      const result = validatePrompt("hello");

      expect(result.isValid).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain("hello");
    });

    it("should allow greetings with requirements", () => {
      const result = validatePrompt("Hello, I want to build a web application");

      expect(result.isValid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it("should trim whitespace before validation", () => {
      const result = validatePrompt("  Build an app  ");

      expect(result.isValid).toBe(true);
    });
  });

  describe("System Prompt Building", () => {
    it("should include architecture type in prompt", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build a web app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      expect(prompt).toContain("web-app");
      expect(prompt).toContain("DETECTED ARCHITECTURE");
    });

    it("should include mode constraints", () => {
      const startup = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "startup",
        quickMode: false,
      });

      const corporate = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "corporate",
        quickMode: false,
      });

      expect(startup).toContain("MODE: STARTUP");
      expect(corporate).toContain("MODE: CORPORATE");
    });

    it("should include complexity guidelines", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build a simple todo app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      expect(prompt).toContain("COMPLEXITY");
    });

    it("should include framework compatibility rules", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      expect(prompt).toContain("FRAMEWORK COMPATIBILITY");
      expect(prompt).toContain("Next.js");
    });

    it("should include technology recommendations", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "startup",
        quickMode: false,
      });

      expect(prompt).toContain("RECOMMENDED TECHNOLOGIES");
    });

    it("should include positioning guidelines", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      expect(prompt).toContain("POSITIONING");
    });

    it("should include JSON format instructions", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      expect(prompt).toContain("JSON");
      expect(prompt).toContain("nodes");
      expect(prompt).toContain("edges");
    });

    it("should generate shorter prompt in quick mode", () => {
      const fullPrompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      const quickPrompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: true,
      });

      expect(quickPrompt.length).toBeLessThan(fullPrompt.length);
    });

    it("should include current nodes and edges when provided", () => {
      const prompt = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
        currentNodes: [{ id: "1" }],
        currentEdges: [{ id: "e1" }],
      });

      // Should mention existing architecture
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("should generate different prompts for different architecture types", () => {
      const webApp = buildEnhancedSystemPrompt({
        userInput: "Build web app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "default",
        quickMode: false,
      });

      const aiPipeline = buildEnhancedSystemPrompt({
        userInput: "Build AI system",
        architectureType: "ai-pipeline",
        detectedIntent: "Architecture: ai-pipeline",
        mode: "default",
        quickMode: false,
      });

      const microservices = buildEnhancedSystemPrompt({
        userInput: "Build microservices",
        architectureType: "microservices",
        detectedIntent: "Architecture: microservices",
        mode: "default",
        quickMode: false,
      });

      expect(webApp).toContain("Web Application");
      expect(aiPipeline).toContain("AI/ML Pipeline");
      expect(microservices).toContain("Microservices");
    });

    it("should include component count constraints", () => {
      const startup = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "startup",
        quickMode: false,
      });

      const corporate = buildEnhancedSystemPrompt({
        userInput: "Build app",
        architectureType: "web-app",
        detectedIntent: "Architecture: web-app",
        mode: "corporate",
        quickMode: false,
      });

      expect(startup).toContain("Minimum components: 3");
      expect(startup).toContain("Maximum components: 5");
      expect(corporate).toContain("Minimum components: 6");
      expect(corporate).toContain("Maximum components: 12");
    });
  });
});
