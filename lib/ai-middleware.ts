import { extractReasoningMiddleware } from "ai";
import {
  type Architecture,
  validateArchitecture,
} from "./architecture-schemas";
import { logger } from "./logger";
import { enrichNodesWithTech } from "./tech-normalizer";

/**
 * Middleware for extracting reasoning from model responses
 * Wraps the model to separate reasoning from final output
 */
export function createReasoningMiddleware(tagName = "thinking") {
  return extractReasoningMiddleware({ tagName });
}

/**
 * Validate architecture JSON
 * Ensures generated JSON matches the expected schema
 */
export function validateArchitectureOutput(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: Architecture;
} {
  return validateArchitecture(data);
}

/**
 * Extract architecture JSON from text response
 * Used when not using structured outputs
 */
export function extractArchitectureFromText(text: string): {
  found: boolean;
  architecture?: Architecture;
  errors?: string[];
} {
  try {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { found: false };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validation = validateArchitecture(parsed);

    if (validation.valid && validation.data) {
      return {
        found: true,
        architecture: validation.data,
      };
    } else {
      return {
        found: false,
        errors: validation.errors,
      };
    }
  } catch (error) {
    return {
      found: false,
      errors: [error instanceof Error ? error.message : "Failed to parse JSON"],
    };
  }
}

/**
 * Enrich nodes with technology icons
 */
export function enrichArchitectureNodes(nodes: unknown[]): unknown[] {
  return enrichNodesWithTech(nodes as Record<string, unknown>[]);
}
