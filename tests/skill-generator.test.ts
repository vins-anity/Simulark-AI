import type { Edge, Node } from "@xyflow/react";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { generateSkillContent, packageSkill } from "../lib/skill-generator";

const mockNodes: Node[] = [
  {
    id: "gateway-1",
    type: "gateway",
    position: { x: 0, y: 0 },
    data: { label: "API Gateway", tech: "nginx" },
  },
  {
    id: "service-1",
    type: "service",
    position: { x: 300, y: 0 },
    data: { label: "User Service", tech: "nodejs" },
  },
  {
    id: "db-1",
    type: "database",
    position: { x: 600, y: 0 },
    data: { label: "Users DB", tech: "postgres" },
  },
];

const mockEdges: Edge[] = [
  {
    id: "edge-1",
    source: "gateway-1",
    target: "service-1",
    data: { protocol: "https" },
  },
  {
    id: "edge-2",
    source: "service-1",
    target: "db-1",
    data: { protocol: "database" },
  },
];

describe("skill-generator", () => {
  it("generates richer skill package metadata and references", () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      projectDescription: "A resilient platform",
      nodes: mockNodes,
      edges: mockEdges,
    });

    expect(skill.metadata.name).toBe("acme-platform");
    expect(skill.metadata.version).toBe("1.1.0");
    expect(skill.files["manifest.json"]).toContain('"version": "1.1.0"');
    expect(skill.files["references/stress-test-plan.md"]).toBeUndefined();
    expect(skill.files["references/diagram.mmd"]).toContain("graph TD");
    expect(skill.skillMd).not.toContain("Stress Testing Focus");
    expect(skill.skillMd).not.toContain("stress-test-plan");
    expect(skill.files["README.md"]).not.toContain("stress-test");
  });

  it("packages zip with expected files", async () => {
    const skill = generateSkillContent({
      projectName: "Acme Platform",
      nodes: mockNodes,
      edges: mockEdges,
    });

    const blob = await packageSkill(skill);
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    expect(zip.file("SKILL.md")).toBeTruthy();
    expect(zip.file("manifest.json")).toBeTruthy();
    expect(zip.file("references/architecture.json")).toBeTruthy();
    expect(zip.file("references/stress-test-plan.md")).toBeFalsy();
  });
});
