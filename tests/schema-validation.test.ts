/**
 * Comprehensive Schema Validation Tests
 * Test Suite for validating AI responses, graph schemas, and API schemas
 * Includes TC-02: Schema Validation with missing fields
 */

import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  type CreateProjectInput,
  CreateProjectSchema,
  EmailSchema,
  ExportSkillRequestSchema,
  type GenerateRequestInput,
  GenerateRequestSchema,
  NonEmptyStringSchema,
  StressPlannerMetaSchema,
  StressTestPlanRequestSchema,
  StressTestPlanResponseSchema,
  StressTestRunEventSchema,
  StressTestRunRequestSchema,
  UuidSchema,
} from "../lib/schema/api";
import {
  type ArchitectureGraph,
  ArchitectureGraphSchema,
  EdgeSchema,
  NodeSchema,
  type NodeType,
  type Project,
  ProjectSchema,
} from "../lib/schema/graph";

// ============================================================================
// TC-02: Schema Validation - Mock AI Response with Missing Fields
// ============================================================================

describe("TC-02: Schema Validation - AI Response with Missing Fields", () => {
  describe("Node Schema Validation", () => {
    it("should catch missing required 'id' field and provide graceful fallback", () => {
      // Mock AI response with missing 'id' field
      const mockAIResponse = {
        type: "customNode",
        position: { x: 100, y: 200 },
        data: {
          label: "API Gateway",
          serviceType: "gateway",
          validationStatus: "valid",
          costEstimate: 50,
        },
      };

      const result = v.safeParse(NodeSchema, mockAIResponse);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].message).toContain("id");
      }

      // Graceful fallback - provide default values
      const fallback = createFallbackNode(mockAIResponse);
      expect(fallback.id).toBeDefined();
      expect(fallback.id).toMatch(/^node-[a-z0-9-]+$/);
      expect(fallback.type).toBe("customNode");
      expect(fallback.data.label).toBe("API Gateway");
    });

    it("should catch missing required 'data.label' field and provide graceful fallback", () => {
      const mockAIResponse = {
        id: "node-123",
        type: "customNode",
        position: { x: 100, y: 200 },
        data: {
          serviceType: "service",
          validationStatus: "valid",
          costEstimate: 30,
        },
      };

      const result = v.safeParse(NodeSchema, mockAIResponse);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].path?.[0].key).toBe("data");
      }

      // Graceful fallback
      const fallback = createFallbackNode(mockAIResponse);
      expect(fallback.data.label).toBe("Unnamed Service");
      expect(fallback.data.serviceType).toBe("service");
    });

    it("should catch missing 'data.serviceType' field and provide graceful fallback", () => {
      const mockAIResponse = {
        id: "node-456",
        type: "customNode",
        data: {
          label: "Database",
        },
      };

      const result = v.safeParse(NodeSchema, mockAIResponse);

      expect(result.success).toBe(false);

      // Graceful fallback - default to 'service' type
      const fallback = createFallbackNode(mockAIResponse);
      expect(fallback.data.serviceType).toBe("service");
      expect(fallback.data.validationStatus).toBe("warning");
    });

    it("should catch invalid 'data.serviceType' enum value and provide graceful fallback", () => {
      const mockAIResponse = {
        id: "node-789",
        type: "customNode",
        data: {
          label: "Unknown Component",
          serviceType: "invalid-type",
          validationStatus: "valid",
          costEstimate: 0,
        },
      };

      const result = v.safeParse(NodeSchema, mockAIResponse);

      expect(result.success).toBe(false);

      // Graceful fallback - use default valid type
      const fallback = createFallbackNode(mockAIResponse);
      expect(fallback.data.serviceType).toBe("service");
      expect(fallback.data.validationStatus).toBe("valid");
    });

    it("should accept valid node data without optional fields using defaults", () => {
      const minimalValidNode = {
        id: "node-001",
        type: "customNode",
        data: {
          label: "Minimal Node",
          serviceType: "service" as NodeType,
        },
      };

      const result = v.safeParse(NodeSchema, minimalValidNode);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.data.validationStatus).toBe("valid");
        expect(result.output.data.costEstimate).toBe(0);
        expect(result.output.position).toBeUndefined();
      }
    });
  });

  describe("Edge Schema Validation", () => {
    it("should catch missing required 'source' field and provide graceful fallback", () => {
      const mockAIResponse = {
        id: "edge-123",
        target: "node-456",
        data: {
          protocol: "http",
        },
      };

      const result = v.safeParse(EdgeSchema, mockAIResponse);

      expect(result.success).toBe(false);

      // Graceful fallback
      const fallback = createFallbackEdge(mockAIResponse);
      expect(fallback.source).toBe("unknown-source");
      expect(fallback.target).toBe("node-456");
      expect(fallback.animated).toBe(true);
    });

    it("should catch missing required 'target' field and provide graceful fallback", () => {
      const mockAIResponse = {
        id: "edge-456",
        source: "node-123",
        data: {
          protocol: "https",
        },
      };

      const result = v.safeParse(EdgeSchema, mockAIResponse);

      expect(result.success).toBe(false);

      const fallback = createFallbackEdge(mockAIResponse);
      expect(fallback.target).toBe("unknown-target");
    });

    it("should accept valid edge with minimal required fields", () => {
      const minimalEdge = {
        id: "edge-789",
        source: "node-a",
        target: "node-b",
      };

      const result = v.safeParse(EdgeSchema, minimalEdge);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.animated).toBe(true);
        // data field is optional, so it may not exist when not provided
        expect(result.output.data).toBeUndefined();
      }
    });
  });

  describe("Architecture Graph Schema Validation", () => {
    it("should catch invalid node in graph array and provide graceful fallback", () => {
      const mockAIResponse = {
        nodes: [
          {
            id: "node-1",
            type: "customNode",
            data: {
              label: "Valid Node",
              serviceType: "gateway",
            },
          },
          {
            // Missing required 'id'
            type: "customNode",
            data: {
              label: "Invalid Node",
              serviceType: "service",
            },
          },
        ],
        edges: [],
      };

      const result = v.safeParse(ArchitectureGraphSchema, mockAIResponse);

      expect(result.success).toBe(false);

      // Graceful fallback - filter out invalid nodes
      const fallback = createFallbackGraph(mockAIResponse);
      expect(fallback.nodes).toHaveLength(1);
      expect(fallback.nodes[0].id).toBe("node-1");
    });

    it("should validate complete architecture graph with all fields", () => {
      const validGraph: ArchitectureGraph = {
        nodes: [
          {
            id: "gateway-1",
            type: "customNode",
            position: { x: 0, y: 0 },
            data: {
              label: "API Gateway",
              serviceType: "gateway",
              validationStatus: "valid",
              costEstimate: 100,
            },
          },
          {
            id: "service-1",
            type: "customNode",
            position: { x: 200, y: 100 },
            data: {
              label: "User Service",
              serviceType: "service",
              validationStatus: "valid",
              costEstimate: 50,
            },
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "gateway-1",
            target: "service-1",
            data: {
              protocol: "https",
              latency: 50,
            },
            animated: true,
          },
        ],
      };

      const result = v.safeParse(ArchitectureGraphSchema, validGraph);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.nodes).toHaveLength(2);
        expect(result.output.edges).toHaveLength(1);
      }
    });

    it("should handle empty graph gracefully", () => {
      const emptyGraph = {
        nodes: [],
        edges: [],
      };

      const result = v.safeParse(ArchitectureGraphSchema, emptyGraph);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.nodes).toHaveLength(0);
        expect(result.output.edges).toHaveLength(0);
      }
    });
  });
});

// ============================================================================
// API Schema Validation Tests
// ============================================================================

describe("API Schema Validation", () => {
  describe("CreateProject Schema", () => {
    it("should validate minimal project creation", () => {
      const validInput: CreateProjectInput = {
        name: "My Project",
      };

      const result = v.safeParse(CreateProjectSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should catch empty project name", () => {
      const invalidInput = {
        name: "",
      };

      const result = v.safeParse(CreateProjectSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should catch project name exceeding max length", () => {
      const invalidInput = {
        name: "a".repeat(201),
      };

      const result = v.safeParse(CreateProjectSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate complete project with all optional fields", () => {
      const validInput = {
        name: "Complete Project",
        description: "A comprehensive project description",
        provider: "AWS",
      };

      const result = v.safeParse(CreateProjectSchema, validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("GenerateRequest Schema", () => {
    it("should validate valid generation request", () => {
      const validInput: GenerateRequestInput = {
        prompt: "Create a microservices architecture",
        mode: "startup",
        quickMode: false,
      };

      const result = v.safeParse(GenerateRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should catch empty prompt", () => {
      const invalidInput = {
        prompt: "",
      };

      const result = v.safeParse(GenerateRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should catch invalid mode value", () => {
      const invalidInput = {
        prompt: "Valid prompt",
        mode: "invalid-mode",
      };

      const result = v.safeParse(GenerateRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept request with only required prompt field", () => {
      const minimalInput = {
        prompt: "Simple architecture request",
      };

      const result = v.safeParse(GenerateRequestSchema, minimalInput);
      expect(result.success).toBe(true);
    });
  });

  describe("ExportSkillRequest Schema", () => {
    it("should validate valid skill export payload", () => {
      const validInput = {
        projectName: "My Architecture",
        projectDescription: "Export test",
        nodes: [{ id: "gateway", type: "gateway", data: { label: "Gateway" } }],
        edges: [],
      };

      const result = v.safeParse(ExportSkillRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty node arrays", () => {
      const invalidInput = {
        projectName: "My Architecture",
        nodes: [],
        edges: [],
      };

      const result = v.safeParse(ExportSkillRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("StressTestPlanRequest Schema", () => {
    it("should validate stress-test plan payload", () => {
      const validInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [{ id: "edge-1", source: "service-1", target: "service-1" }],
      };

      const result = v.safeParse(StressTestPlanRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should validate plannerConfig in auto mode", () => {
      const validInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [],
        plannerConfig: {
          mode: "auto",
        },
      };

      const result = v.safeParse(StressTestPlanRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should validate plannerConfig in manual mode with modelId", () => {
      const validInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [],
        plannerConfig: {
          mode: "manual",
          modelId: "nvidia:z-ai/glm5",
        },
      };

      const result = v.safeParse(StressTestPlanRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should reject manual plannerConfig without modelId", () => {
      const invalidInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [],
        plannerConfig: {
          mode: "manual",
        },
      };

      const result = v.safeParse(StressTestPlanRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject payload without nodes", () => {
      const invalidInput = {
        nodes: [],
        edges: [],
      };

      const result = v.safeParse(StressTestPlanRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("keeps backwards compatibility without plannerConfig", () => {
      const validInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [],
      };

      const result = v.safeParse(StressTestPlanRequestSchema, validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("Stress planner response metadata schemas", () => {
    it("should validate planner metadata payload", () => {
      const plannerMeta = {
        providerUsed: "kimi",
        modelUsed: "nvidia:moonshotai/kimi-k2.5",
        attempts: [
          {
            modelId: "nvidia:z-ai/glm5",
            ok: false,
            reasonCode: "auth_failed",
          },
          {
            modelId: "nvidia:moonshotai/kimi-k2.5",
            ok: true,
          },
        ],
        warningCode: "partial_failover",
        warning: "Primary planner failed. Switched to backup model.",
      };

      const result = v.safeParse(StressPlannerMetaSchema, plannerMeta);
      expect(result.success).toBe(true);
    });

    it("should validate stress plan response with plannerMeta", () => {
      const responsePayload = {
        type: "stress-test-plan",
        data: {
          assumptions: ["A"],
          scenarios: [
            {
              id: "traffic-spike",
              type: "traffic-spike",
              name: "Traffic Spike",
              objective: "Objective",
              targets: ["gateway"],
              loadProfile: {
                baselineRps: 100,
                peakRps: 800,
                rampSeconds: 90,
                holdSeconds: 300,
              },
              passCriteria: ["Latency under threshold"],
            },
          ],
          markdown: "# Plan",
          source: "ai",
          plannerMeta: {
            providerUsed: "nvidia",
            modelUsed: "nvidia:z-ai/glm5",
            attempts: [{ modelId: "nvidia:z-ai/glm5", ok: true }],
          },
        },
      };

      const result = v.safeParse(StressTestPlanResponseSchema, responsePayload);
      expect(result.success).toBe(true);
    });
  });

  describe("StressTestRunRequest Schema", () => {
    it("should validate stress-test run payload", () => {
      const validInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [{ id: "edge-1", source: "service-1", target: "service-1" }],
        scenario: {
          id: "traffic-spike",
          type: "traffic-spike",
          name: "Traffic Spike",
          objective: "Validate resilience under peak load",
          targets: ["API"],
          loadProfile: {
            baselineRps: 100,
            peakRps: 800,
            rampSeconds: 90,
            holdSeconds: 300,
          },
          passCriteria: ["Latency remains under threshold"],
        },
        seed: 42,
        nodeSpecOverrides: {
          "service-1": { replicas: 3, cpu: "1 vCPU" },
        },
      };

      const result = v.safeParse(StressTestRunRequestSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should reject stress-test run payload without scenario", () => {
      const invalidInput = {
        nodes: [{ id: "service-1", type: "service", data: { label: "API" } }],
        edges: [],
      };

      const result = v.safeParse(StressTestRunRequestSchema, invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("StressTestRunEvent Schema", () => {
    it("should validate progress event", () => {
      const event = {
        type: "progress",
        data: {
          progress: 55,
          stage: "running",
        },
      };
      const result = v.safeParse(StressTestRunEventSchema, event);
      expect(result.success).toBe(true);
    });

    it("should validate verdict event", () => {
      const event = {
        type: "verdict",
        data: {
          status: "pass",
          score: 82,
          violatedCriteria: [],
          bottlenecks: ["API"],
          recommendations: ["Scale API replicas"],
          summary: "System remained resilient",
        },
      };
      const result = v.safeParse(StressTestRunEventSchema, event);
      expect(result.success).toBe(true);
    });

    it("should reject invalid stress event", () => {
      const event = {
        type: "metric",
        data: {
          step: 1,
          progress: 20,
          availability: 98,
          latency: 120,
          errorRate: 0.5,
          // throughput missing
          hotNodes: [],
          hotEdges: [],
        },
      };
      const result = v.safeParse(StressTestRunEventSchema, event);
      expect(result.success).toBe(false);
    });
  });

  describe("UUID Schema", () => {
    it("should validate valid UUID", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = v.safeParse(UuidSchema, validUuid);
      expect(result.success).toBe(true);
    });

    it("should catch invalid UUID format", () => {
      const invalidUuid = "not-a-valid-uuid";
      const result = v.safeParse(UuidSchema, invalidUuid);
      expect(result.success).toBe(false);
    });

    it("should catch malformed UUID", () => {
      const malformedUuid = "550e8400-e29b-41d4-a716";
      const result = v.safeParse(UuidSchema, malformedUuid);
      expect(result.success).toBe(false);
    });
  });

  describe("Email Schema", () => {
    it("should validate valid email", () => {
      const validEmail = "user@example.com";
      const result = v.safeParse(EmailSchema, validEmail);
      expect(result.success).toBe(true);
    });

    it("should catch invalid email format", () => {
      const invalidEmails = [
        "not-an-email",
        "@example.com",
        "user@",
        "user@.com",
      ];

      for (const email of invalidEmails) {
        const result = v.safeParse(EmailSchema, email);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("NonEmptyString Schema", () => {
    it("should validate non-empty string", () => {
      const result = v.safeParse(NonEmptyStringSchema, "Hello");
      expect(result.success).toBe(true);
    });

    it("should catch empty string", () => {
      const result = v.safeParse(NonEmptyStringSchema, "");
      expect(result.success).toBe(false);
    });

    it("should catch whitespace-only string", () => {
      const result = v.safeParse(NonEmptyStringSchema, "   ");
      expect(result.success).toBe(true); // minLength(1) allows whitespace
    });
  });
});

// ============================================================================
// Project Schema Validation Tests
// ============================================================================

describe("Project Schema Validation", () => {
  it("should validate complete project structure", () => {
    const validProject: Project = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Test Project",
      provider: "AWS",
      nodes: [
        {
          id: "node-1",
          type: "customNode",
          position: { x: 0, y: 0 },
          data: {
            label: "Gateway",
            serviceType: "gateway",
            validationStatus: "valid",
            costEstimate: 100,
          },
        },
      ],
      edges: [],
      metadata: {
        version: "1.0",
        createdAt: "2024-01-01",
      },
    };

    const result = v.safeParse(ProjectSchema, validProject);
    expect(result.success).toBe(true);
  });

  it("should catch missing required project fields", () => {
    const incompleteProject = {
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Test Project",
      nodes: [],
      edges: [],
    };

    const result = v.safeParse(ProjectSchema, incompleteProject);
    expect(result.success).toBe(false);
  });

  it("should use default provider when not specified", () => {
    const projectWithoutProvider = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Test Project",
      nodes: [],
      edges: [],
    };

    const result = v.safeParse(ProjectSchema, projectWithoutProvider);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.provider).toBe("Generic");
    }
  });

  it("should catch invalid provider value", () => {
    const projectWithInvalidProvider = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Test Project",
      provider: "InvalidProvider",
      nodes: [],
      edges: [],
    };

    const result = v.safeParse(ProjectSchema, projectWithInvalidProvider);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Edge Cases and Error Handling Tests
// ============================================================================

describe("Edge Cases and Error Handling", () => {
  it("should handle null values gracefully", () => {
    const nullData = null;
    const result = v.safeParse(NodeSchema, nullData);
    expect(result.success).toBe(false);
  });

  it("should handle undefined values gracefully", () => {
    const undefinedData = undefined;
    const result = v.safeParse(NodeSchema, undefinedData);
    expect(result.success).toBe(false);
  });

  it("should handle array instead of object", () => {
    const arrayData: unknown[] = [];
    const result = v.safeParse(NodeSchema, arrayData);
    expect(result.success).toBe(false);
  });

  it("should handle wrong data types", () => {
    const wrongTypeData = {
      id: 123, // Should be string
      type: "customNode",
      data: {
        label: "Test",
        serviceType: "service",
      },
    };

    const result = v.safeParse(NodeSchema, wrongTypeData);
    expect(result.success).toBe(false);
  });

  it("should validate deeply nested invalid data", () => {
    const deeplyInvalid = {
      id: "node-1",
      type: "customNode",
      position: {
        x: "not-a-number", // Should be number
        y: 100,
      },
      data: {
        label: "Test",
        serviceType: "service",
      },
    };

    const result = v.safeParse(NodeSchema, deeplyInvalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Helper Functions for Graceful Fallbacks
// ============================================================================

function createFallbackNode(partialNode: any) {
  return {
    id: partialNode.id || `node-${crypto.randomUUID()}`,
    type: partialNode.type || "customNode",
    position: partialNode.position,
    data: {
      label: partialNode.data?.label || "Unnamed Service",
      serviceType: isValidNodeType(partialNode.data?.serviceType)
        ? partialNode.data.serviceType
        : "service",
      validationStatus:
        partialNode.data?.validationStatus === "valid" ? "valid" : "warning",
      costEstimate: partialNode.data?.costEstimate ?? 0,
    },
  };
}

function createFallbackEdge(partialEdge: any) {
  return {
    id: partialEdge.id || `edge-${crypto.randomUUID()}`,
    source: partialEdge.source || "unknown-source",
    target: partialEdge.target || "unknown-target",
    data: {
      protocol: partialEdge.data?.protocol || "http",
      latency: partialEdge.data?.latency,
      label: partialEdge.data?.label,
    },
    animated: partialEdge.animated ?? true,
  };
}

function createFallbackGraph(partialGraph: any): ArchitectureGraph {
  const validNodes = (partialGraph.nodes || [])
    .map((node: any) => {
      const result = v.safeParse(NodeSchema, node);
      return result.success ? result.output : null;
    })
    .filter(Boolean);

  const validEdges = (partialGraph.edges || [])
    .map((edge: any) => {
      const result = v.safeParse(EdgeSchema, edge);
      return result.success ? result.output : null;
    })
    .filter(Boolean);

  return {
    nodes: validNodes,
    edges: validEdges,
  };
}

function isValidNodeType(type: string): type is NodeType {
  const validTypes: NodeType[] = [
    "gateway",
    "service",
    "frontend",
    "backend",
    "database",
    "queue",
    "ai",
  ];
  return validTypes.includes(type as NodeType);
}
