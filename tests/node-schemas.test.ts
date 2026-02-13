import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  AISchema,
  ClientSchema,
  DatabaseSchema,
  FunctionSchema,
  getSchemaForType,
  QueueSchema,
  SCHEMAS,
  ServiceSchema,
  StorageSchema,
} from "../lib/node-schemas";

describe("Node Schemas Validation", () => {
  describe("FunctionSchema", () => {
    it("should validate a valid function node", () => {
      const validData = {
        label: "My Lambda",
        tech: "aws",
        tier: "pro",
        runtime: "nodejs20.x",
        memory: 256,
        timeout: 60,
        handler: "index.handler",
      };
      const result = v.safeParse(FunctionSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid runtime", () => {
      const invalidData = {
        label: "My Lambda",
        runtime: "invalid-runtime",
        memory: 256,
        timeout: 60,
        handler: "index.handler",
      };
      const result = v.safeParse(FunctionSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative memory", () => {
      const invalidData = {
        label: "My Lambda",
        runtime: "nodejs18.x",
        memory: -100,
        timeout: 60,
        handler: "index.handler",
      };
      const result = v.safeParse(FunctionSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("DatabaseSchema", () => {
    it("should validate a valid database node", () => {
      const validData = {
        label: "PostgreSQL DB",
        engine: "postgres",
        version: "15",
        storage_gb: 100,
        instance_type: "db.t3.medium",
      };
      const result = v.safeParse(DatabaseSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject non-positive storage", () => {
      const invalidData = {
        label: "DB",
        engine: "postgres",
        version: "15",
        storage_gb: 0,
        instance_type: "db.t3.micro",
      };
      const result = v.safeParse(DatabaseSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("QueueSchema", () => {
    it("should validate a valid queue node", () => {
      const validData = {
        label: "Task Queue",
        visibility_timeout: 30,
        retention_seconds: 86400,
        fifo: true,
      };
      const result = v.safeParse(QueueSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative visibility timeout", () => {
      const invalidData = {
        label: "Queue",
        visibility_timeout: -10,
        retention_seconds: 86400,
        fifo: false,
      };
      const result = v.safeParse(QueueSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("ServiceSchema", () => {
    it("should validate a valid service node", () => {
      const validData = {
        label: "API Service",
        replicas: 3,
        cpu: "1 vCPU",
        memory: "2 GB",
        image: "nginx:latest",
      };
      const result = v.safeParse(ServiceSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject zero replicas", () => {
      const invalidData = {
        label: "Service",
        replicas: 0,
        cpu: "0.5 vCPU",
        memory: "512 MB",
      };
      const result = v.safeParse(ServiceSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("StorageSchema", () => {
    it("should validate a valid storage node", () => {
      const validData = {
        label: "S3 Bucket",
        class: "intelligent-tiering",
        encryption: true,
        public_access: false,
      };
      const result = v.safeParse(StorageSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid storage class", () => {
      const invalidData = {
        label: "Storage",
        class: "invalid-class",
        encryption: true,
        public_access: false,
      };
      const result = v.safeParse(StorageSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("AISchema", () => {
    it("should validate a valid AI node", () => {
      const validData = {
        label: "GPT-4 Assistant",
        model: "gpt-4-turbo",
        context_window: 128000,
        temperature: 0.7,
      };
      const result = v.safeParse(AISchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject temperature out of range", () => {
      const invalidData = {
        label: "AI",
        model: "gpt-4",
        context_window: 8000,
        temperature: 2.5, // Should be 0-2
      };
      const result = v.safeParse(AISchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("ClientSchema", () => {
    it("should validate a valid client node", () => {
      const validData = {
        label: "Web App",
        platform: "web",
        framework: "nextjs",
        users_daily: 10000,
      };
      const result = v.safeParse(ClientSchema, validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid platform", () => {
      const invalidData = {
        label: "App",
        platform: "embedded",
        framework: "react",
        users_daily: 1000,
      };
      const result = v.safeParse(ClientSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("SCHEMAS mapping", () => {
    it("should have all required node types", () => {
      const requiredTypes = [
        "function",
        "database",
        "queue",
        "service",
        "storage",
        "ai",
        "client",
      ];
      requiredTypes.forEach((type) => {
        expect(SCHEMAS).toHaveProperty(type);
      });
    });

    it("should return correct schema for each type", () => {
      Object.keys(SCHEMAS).forEach((type) => {
        const schema = getSchemaForType(type);
        expect(schema).toBeDefined();
      });
    });

    it("should return BaseSchema for unknown type", () => {
      const schema = getSchemaForType("unknown-type");
      expect(schema).toBeDefined();
    });
  });
});
