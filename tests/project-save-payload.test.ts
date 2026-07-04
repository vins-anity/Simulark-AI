import { describe, expect, it } from "vitest";
import * as v from "valibot";

const UpdateProjectPayloadSchema = v.pipe(
  v.object({
    nodes: v.optional(v.array(v.unknown())),
    edges: v.optional(v.array(v.unknown())),
    metadata: v.optional(v.record(v.string(), v.unknown())),
  }),
  v.check(
    (input) =>
      (Array.isArray(input.nodes) && Array.isArray(input.edges)) ||
      input.metadata !== undefined,
    "Provide nodes and edges together, or metadata",
  ),
);

describe("project PATCH payload", () => {
  it("accepts nodes and edges together", () => {
    const parsed = v.safeParse(UpdateProjectPayloadSchema, {
      nodes: [{ id: "a" }],
      edges: [],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts metadata-only updates", () => {
    const parsed = v.safeParse(UpdateProjectPayloadSchema, {
      metadata: { tier: "pro" },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty payloads", () => {
    const parsed = v.safeParse(UpdateProjectPayloadSchema, {});
    expect(parsed.success).toBe(false);
  });
});
