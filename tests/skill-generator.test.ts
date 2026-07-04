/**
 * Unit tests for lib/skill-generator.ts
 *
 * Validates conformance with the agentskills.io open standard:
 * https://agentskills.io/specification
 */

import type { Edge, Node } from "@xyflow/react";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { generateSkillContent, packageSkill } from "../lib/skill-generator";

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

/** Full-stack app: gateway → service → database (clean topology) */
const fullStackNodes: Node[] = [
  {
    id: "gw-1",
    type: "gateway",
    position: { x: 0, y: 0 },
    data: { label: "API Gateway", tech: "nginx" },
  },
  {
    id: "svc-1",
    type: "service",
    position: { x: 300, y: 0 },
    data: { label: "User Service", tech: "node" },
  },
  {
    id: "db-1",
    type: "database",
    position: { x: 600, y: 0 },
    data: { label: "Users DB", tech: "postgres" },
  },
  {
    id: "cache-1",
    type: "cache",
    position: { x: 300, y: 200 },
    data: { label: "Redis Cache", tech: "redis" },
  },
  {
    id: "queue-1",
    type: "queue",
    position: { x: 0, y: 200 },
    data: { label: "Job Queue", tech: "bullmq" },
  },
  {
    id: "mon-1",
    type: "monitoring",
    position: { x: 600, y: 200 },
    data: { label: "Datadog", tech: "datadog" },
  },
];

const fullStackEdges: Edge[] = [
  { id: "e1", source: "gw-1", target: "svc-1", data: {} },
  { id: "e2", source: "svc-1", target: "db-1", data: {} },
  { id: "e3", source: "svc-1", target: "cache-1", data: {} },
  { id: "e4", source: "gw-1", target: "queue-1", data: {} },
];

/** Anti-pattern topology: frontend wired directly to database */
const antiPatternNodes: Node[] = [
  {
    id: "fe-1",
    type: "frontend",
    position: { x: 0, y: 0 },
    data: { label: "React App" },
  },
  {
    id: "db-1",
    type: "database",
    position: { x: 300, y: 0 },
    data: { label: "Postgres" },
  },
];

const antiPatternEdges: Edge[] = [
  { id: "e1", source: "fe-1", target: "db-1", data: {} }, // direct frontend → DB
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Name field — agentskills.io/specification#name-field
// ─────────────────────────────────────────────────────────────────────────────

describe("skill name — spec compliance", () => {
  it("converts spaces to hyphens and lowercases", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.name).toBe("acme-platform");
  });

  it("strips illegal characters (parentheses, slashes, dots)", () => {
    const { metadata } = generateSkillContent({
      projectName: "My.Project (v2)/Beta",
      nodes: [],
      edges: [],
    });
    expect(metadata.name).toMatch(/^[a-z0-9-]+$/);
    expect(metadata.name).not.toContain(".");
    expect(metadata.name).not.toContain("(");
    expect(metadata.name).not.toContain("/");
  });

  it("collapses consecutive hyphens (spec: no --)", () => {
    const { metadata } = generateSkillContent({
      projectName: "foo--bar---baz",
      nodes: [],
      edges: [],
    });
    expect(metadata.name).not.toMatch(/--/);
    expect(metadata.name).toBe("foo-bar-baz");
  });

  it("does not start or end with a hyphen", () => {
    const { metadata } = generateSkillContent({
      projectName: "  -my project- ",
      nodes: [],
      edges: [],
    });
    expect(metadata.name).not.toMatch(/^-/);
    expect(metadata.name).not.toMatch(/-$/);
  });

  it("enforces 64-character maximum", () => {
    const { metadata } = generateSkillContent({
      projectName: "a".repeat(100),
      nodes: [],
      edges: [],
    });
    expect(metadata.name.length).toBeLessThanOrEqual(64);
  });

  it("falls back to 'architecture-skill' when input produces empty name", () => {
    const { metadata } = generateSkillContent({
      projectName: "!!!###@@@",
      nodes: [],
      edges: [],
    });
    expect(metadata.name).toBe("architecture-skill");
  });

  it("does NOT strip 'claude' or 'anthropic' (not reserved in agentskills.io spec)", () => {
    const { metadata } = generateSkillContent({
      projectName: "claude-assistant",
      nodes: [],
      edges: [],
    });
    // agentskills.io has no reserved words — only the Anthropic API did
    expect(metadata.name).toBe("claude-assistant");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Description field — agentskills.io/specification#description-field
// ─────────────────────────────────────────────────────────────────────────────

describe("skill description — spec compliance", () => {
  it("uses imperative phrasing ('Use this skill when...')", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).toContain("Use this skill when");
  });

  it("mentions implicit triggers ('even if they don't mention...')", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).toContain("even if they don't explicitly");
  });

  it("stays within 1024-character limit", () => {
    const { metadata } = generateSkillContent({
      projectName: "A Very Long Project Name That Keeps Going And Going On",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description.length).toBeLessThanOrEqual(1024);
  });

  it("includes the project name in the what-clause", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).toContain("Acme Platform");
  });

  it("includes entry point labels when present", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).toContain("API Gateway");
  });

  it("includes database-related trigger when databases are present", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).toContain("database migrations");
  });

  it("does not start with 'Expert on' (old declarative pattern, now replaced)", () => {
    const { metadata } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(metadata.description).not.toMatch(/^Expert on/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SKILL.md frontmatter — optional fields
// ─────────────────────────────────────────────────────────────────────────────

describe("SKILL.md frontmatter — optional fields", () => {
  it("includes a 'license' field", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("license:");
  });

  it("includes a 'compatibility' field within 500 chars", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("compatibility:");
    // Extract and validate length
    const compatMatch = skillMd.match(/compatibility:\s*"([^"]+)"/);
    if (compatMatch) {
      expect(compatMatch[1].length).toBeLessThanOrEqual(500);
    }
  });

  it("includes a 'metadata' block with generated-by and node-count", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("metadata:");
    expect(skillMd).toContain("generated-by:");
    expect(skillMd).toContain("node-count:");
    expect(skillMd).toContain("edge-count:");
  });

  it("metadata node-count matches actual node array length", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const match = skillMd.match(/node-count:\s*"(\d+)"/);
    expect(match).toBeTruthy();
    expect(Number(match![1])).toBe(fullStackNodes.length);
  });

  it("does NOT produce a manifest.json file (non-spec artifact)", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(files["manifest.json"]).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SKILL.md structure and progressive disclosure
// ─────────────────────────────────────────────────────────────────────────────

describe("SKILL.md body — progressive disclosure", () => {
  it("opens with the project name as h1", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("# Acme Platform Architecture Skill");
  });

  it("has a Quick Start section", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("## Quick Start");
  });

  it("has conditional reference triggers ('If X → read Y')", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    // Spec best practice: tell the agent WHEN to load each file
    expect(skillMd).toMatch(/If .+→ read `references\//);
  });

  it("references service-catalog.md with a conditional trigger", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("references/service-catalog.md");
  });

  it("references data-flows.md with a conditional trigger", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("references/data-flows.md");
  });

  it("stays under 500 lines (spec recommendation)", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const lines = skillMd.split("\n").length;
    expect(lines).toBeLessThan(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Architecture rules generation
// ─────────────────────────────────────────────────────────────────────────────

describe("architecture rules", () => {
  it("emits a gateway routing rule when a gateway node exists", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain("ALWAYS route external requests through");
    expect(skillMd).toContain("API Gateway");
  });

  it("emits a data-store protection rule when a database node exists", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain(
      "NEVER allow direct client or frontend access to data stores",
    );
  });

  it("emits a retry/DLQ rule when a queue node exists", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain(
      "ALWAYS implement retry and dead-letter queue handling",
    );
  });

  it("emits an observability rule when a monitoring node exists", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).toContain(
      "ALWAYS emit metrics, traces, and structured logs",
    );
  });

  it("emits no rules for an empty graph", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Empty",
      nodes: [],
      edges: [],
    });
    expect(skillMd).toContain("No strict rules detected");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Anti-pattern detection
// ─────────────────────────────────────────────────────────────────────────────

describe("anti-pattern detection", () => {
  it("detects direct frontend → database connection", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Bad App",
      nodes: antiPatternNodes,
      edges: antiPatternEdges,
    });
    expect(skillMd).toContain("bypass service layer");
    expect(skillMd).toContain("React App");
  });

  it("detects missing ingress layer (no gateway or loadbalancer)", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Bad App",
      nodes: antiPatternNodes,
      edges: antiPatternEdges,
    });
    expect(skillMd).toContain("external traffic enters unguarded");
  });

  it("reports no anti-patterns for a well-formed topology", () => {
    const { skillMd } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(skillMd).not.toContain("bypass service layer");
    expect(skillMd).not.toContain("external traffic enters unguarded");
    expect(skillMd).toContain("No obvious anti-patterns detected");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Reference files (Level 3)
// ─────────────────────────────────────────────────────────────────────────────

describe("reference files", () => {
  it("generates references/service-catalog.md with a markdown table", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(files["references/service-catalog.md"]).toBeTruthy();
    expect(files["references/service-catalog.md"]).toContain("| Component |");
    expect(files["references/service-catalog.md"]).toContain("API Gateway");
  });

  it("generates references/data-flows.md with BFS paths", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(files["references/data-flows.md"]).toBeTruthy();
    expect(files["references/data-flows.md"]).toContain("API Gateway");
    expect(files["references/data-flows.md"]).toContain("->");
  });

  it("generates references/diagram.mmd as a Mermaid graph", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    expect(files["references/diagram.mmd"]).toMatch(/(graph|flowchart)\s+TD/);
  });

  it("generates references/quality-summary.md when quality report is provided", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
      quality: {
        score: 85,
        grade: "B",
        status: "pass",
        summary: {
          totalIssues: 2,
          errors: 0,
          warnings: 2,
          suggestions: 0,
          nodeCount: 6,
          edgeCount: 4,
          connectedComponents: 1,
          isolatedNodes: 0,
        },
        blockers: [],
      } as any,
    });
    expect(files["references/quality-summary.md"]).toContain("85/100");
    expect(files["references/quality-summary.md"]).toContain("Grade: **B**");
  });

  it("does NOT generate references/quality-report.json (raw JSON removed)", () => {
    const { files } = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    // quality-report.json was a non-spec extra; summary.md replaced it
    expect(files["references/quality-report.json"]).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. ZIP package structure — spec: name must match parent directory
// ─────────────────────────────────────────────────────────────────────────────

describe("packageSkill — ZIP directory structure", () => {
  it("places SKILL.md inside a single skill folder (not at ZIP root)", async () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const blob = await packageSkill(skill);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(zip.file("acme-platform/SKILL.md")).toBeTruthy();
    expect(zip.file("SKILL.md")).toBeFalsy();
    expect(zip.file(".agents/skills/acme-platform/SKILL.md")).toBeFalsy();
    expect(zip.file("INSTALL.md")).toBeFalsy();
  });

  it("places all reference files under the skill folder", async () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const blob = await packageSkill(skill);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(
      zip.file("acme-platform/references/service-catalog.md"),
    ).toBeTruthy();
    expect(zip.file("acme-platform/references/data-flows.md")).toBeTruthy();
    expect(zip.file("acme-platform/references/diagram.mmd")).toBeTruthy();
    expect(zip.file("acme-platform/references/architecture.json")).toBeTruthy();
  });

  it("does NOT include manifest.json in the ZIP (non-spec file)", async () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const blob = await packageSkill(skill);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    expect(zip.file("acme-platform/manifest.json")).toBeFalsy();
  });

  it("SKILL.md inside ZIP contains valid YAML frontmatter with name and description", async () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const blob = await packageSkill(skill);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    const content = await zip.file("acme-platform/SKILL.md")!.async("string");
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('name: "acme-platform"');
    expect(content).toContain("description:");
    expect(content).toContain("license:");
    expect(content).toContain("compatibility:");
    expect(content).toContain("metadata:");
  });

  it("skill directory name matches the skill metadata name", async () => {
    const skill = generateSkillContent({
      projectName: "My Cool API",
      nodes: fullStackNodes,
      edges: fullStackEdges,
    });
    const blob = await packageSkill(skill);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());

    const expectedDir = skill.metadata.name;
    expect(zip.file(`${expectedDir}/SKILL.md`)).toBeTruthy();
  });
});
