import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureQualityReport } from "@/lib/architecture-quality";
import { generateMermaidCode } from "@/lib/utils";

export interface SkillGenerationOptions {
  projectName: string;
  projectDescription?: string;
  nodes: Node[];
  edges: Edge[];
  quality?: ArchitectureQualityReport;
}

export interface GeneratedSkill {
  skillMd: string;
  files: Record<string, string>;
  metadata: {
    name: string;
    description: string;
    version: string;
    createdAt: string;
    nodeCount: number;
    edgeCount: number;
    qualityScore?: number;
    qualityGrade?: string;
  };
}

interface ArchitectureAnalysis {
  entryPoints: Node[];
  databases: Node[];
  services: Node[];
  infrastructure: Node[];
  antiPatterns: string[];
}

function toKebabCase(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "architecture-skill";
}

function quoteYaml(value: string): string {
  return JSON.stringify(value);
}

function getNodeLabel(node: Node): string {
  const label = node.data?.label;
  if (typeof label === "string" && label.trim().length > 0) {
    return label.trim();
  }
  return node.id;
}

function getNodeDescription(node: Node): string {
  const description = node.data?.description;
  if (typeof description === "string" && description.trim().length > 0) {
    return description.trim();
  }

  const type = node.type || "component";
  return `${type} component in the architecture.`;
}

/**
 * Analyzes diagram nodes to detect architecture patterns.
 */
function analyzeArchitecture(
  nodes: Node[],
  edges: Edge[],
): ArchitectureAnalysis {
  const entryPoints = nodes.filter(
    (node) => node.type === "gateway" || node.type === "loadbalancer",
  );

  const databases = nodes.filter(
    (node) =>
      node.type === "database" ||
      node.type === "storage" ||
      node.type === "vector-db",
  );

  const services = nodes.filter((node) =>
    ["service", "frontend", "backend", "function", "ai"].includes(
      node.type || "",
    ),
  );

  const infrastructure = nodes.filter((node) =>
    ["cache", "queue", "messaging", "monitoring", "security", "auth"].includes(
      node.type || "",
    ),
  );

  const antiPatterns: string[] = [];

  // Direct non-service -> datastore links are usually unsafe in this model.
  const dbConnections = edges.filter((edge) => {
    const target = nodes.find((node) => node.id === edge.target);
    return target
      ? ["database", "storage", "vector-db"].includes(target.type || "")
      : false;
  });

  for (const edge of dbConnections) {
    const source = nodes.find((node) => node.id === edge.source);
    if (!source) continue;

    const allowedSource = ["service", "backend", "function", "ai"].includes(
      source.type || "",
    );

    if (!allowedSource) {
      antiPatterns.push(
        `Direct connection from ${getNodeLabel(source)} to data store detected`,
      );
    }
  }

  if (entryPoints.length === 0) {
    antiPatterns.push(
      "No explicit ingress layer detected (gateway/load balancer)",
    );
  }

  return {
    entryPoints,
    databases,
    services,
    infrastructure,
    antiPatterns,
  };
}

/**
 * Generates architecture rules based on diagram patterns.
 */
function generateArchitectureRules(
  nodes: Node[],
  analysis: ArchitectureAnalysis,
): string[] {
  const rules: string[] = [];

  if (analysis.entryPoints.length > 0) {
    const gatewayNames = analysis.entryPoints.map(getNodeLabel).join(" or ");
    rules.push(`ALWAYS route external requests through ${gatewayNames}`);
  }

  if (analysis.databases.length > 0) {
    rules.push("NEVER allow direct client access to data stores");
    rules.push("ALWAYS enforce schema migrations and backward compatibility");
  }

  if (analysis.services.length > 0) {
    rules.push("ALWAYS keep business logic in service or function boundaries");
  }

  const hasQueue = nodes.some((node) =>
    ["queue", "messaging"].includes(node.type || ""),
  );
  if (hasQueue) {
    rules.push(
      "ALWAYS implement retry and dead-letter handling for async flows",
    );
  }

  const hasMonitoring = nodes.some((node) => node.type === "monitoring");
  if (hasMonitoring) {
    rules.push("ALWAYS emit metrics, traces, and logs for critical paths");
  }

  return rules;
}

/**
 * Generates service catalog from nodes.
 */
function generateServiceCatalog(nodes: Node[]): string {
  const header =
    "| Component | Type | Tech | Description |\n| --- | --- | --- | --- |";
  const rows = nodes.map((node) => {
    const tech = typeof node.data?.tech === "string" ? node.data.tech : "-";
    const type = node.type || "unknown";

    return `| ${getNodeLabel(node)} | ${type} | ${tech} | ${getNodeDescription(node)} |`;
  });

  return [header, ...rows].join("\n");
}

/**
 * Traces representative data-flow paths through the architecture.
 */
function generateDataFlowPatterns(nodes: Node[], edges: Edge[]): string {
  const entries = nodes.filter((node) =>
    ["gateway", "loadbalancer", "client"].includes(node.type || ""),
  );

  if (entries.length === 0) {
    return "No clear entry points detected. Components appear to interact peer-to-peer.";
  }

  const lines: string[] = [];

  for (const entry of entries.slice(0, 3)) {
    const entryLabel = getNodeLabel(entry);
    lines.push(`### From ${entryLabel}`);

    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [
      { id: entry.id, path: [entryLabel] },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current.id)) continue;
      visited.add(current.id);

      const outgoing = edges.filter((edge) => edge.source === current.id);
      for (const edge of outgoing) {
        const target = nodes.find((node) => node.id === edge.target);
        if (!target) continue;

        const targetLabel = getNodeLabel(target);
        const nextPath = [...current.path, targetLabel];

        if (
          outgoing.length === 1 ||
          ["database", "storage"].includes(target.type || "")
        ) {
          lines.push(`- ${nextPath.join(" -> ")}`);
        }

        queue.push({ id: target.id, path: nextPath });
      }
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

function generateReadme(projectName: string): string {
  return `# ${projectName} Skill Package

This package was generated by Simulark and is ready for import into coding agents that support \
\`SKILL.md\` conventions.

## Package Contents

- \`SKILL.md\`: Core architecture guidance and usage instructions
- \`manifest.json\`: Metadata for versioning and tooling
- \`references/architecture.json\`: Raw architecture graph snapshot
- \`references/diagram.mmd\`: Mermaid representation for quick visualization
- \`references/service-catalog.md\`: Component inventory and descriptions
- \`references/data-flows.md\`: Key request/data paths
- \`references/quality-report.json\`: Export-time architecture quality report
- \`references/quality-summary.md\`: Human-readable quality summary

## Suggested Workflow

1. Load \`SKILL.md\` in your coding assistant
2. Review \`references/diagram.mmd\` and \`references/data-flows.md\`
3. Use the service catalog and flow references during implementation and reviews
`;
}

/**
 * Main function to generate SKILL.md content and references.
 */
export function generateSkillContent(
  options: SkillGenerationOptions,
): GeneratedSkill {
  const { projectName, projectDescription, nodes, edges, quality } = options;

  const analysis = analyzeArchitecture(nodes, edges);
  const rules = generateArchitectureRules(nodes, analysis);
  const catalog = generateServiceCatalog(nodes);
  const dataFlows = generateDataFlowPatterns(nodes, edges);
  const mermaid = generateMermaidCode(nodes, edges);

  const skillName = toKebabCase(projectName);
  const componentTypes = Array.from(
    new Set(
      nodes
        .map((node) => node.type)
        .filter((type): type is string => Boolean(type)),
    ),
  );

  const componentList =
    componentTypes.length > 0
      ? componentTypes
          .map((type) => type[0].toUpperCase() + type.slice(1))
          .join(", ")
      : "architecture components";

  const description =
    `Expert on the ${projectName} architecture. ` +
    "Use when implementing features, reviewing design changes, and validating operational safety. " +
    `Covers ${componentList}.`;

  const systemOverview =
    projectDescription ||
    `${projectName} contains ${nodes.length} components and ${edges.length} connections.`;

  const antiPatternSection =
    analysis.antiPatterns.length > 0
      ? analysis.antiPatterns.map((item) => `- ${item}`).join("\n")
      : "- No obvious anti-patterns detected from current graph topology.";

  const skillMd = `---
name: ${quoteYaml(skillName)}
description: ${quoteYaml(description)}
---

# ${projectName} Architecture Skill

## System Overview

${systemOverview}

## Architecture Rules

${rules.length > 0 ? rules.map((rule) => `- ${rule}`).join("\n") : "- No strict rules detected."}

## Anti-Patterns to Avoid

${antiPatternSection}

## Service Catalog

${catalog}

## Data Flow Patterns

${dataFlows}

## When to Use This Skill

Load this skill when:
- Implementing new services or modifying service boundaries
- Reviewing pull requests for architecture compliance
- Planning incident response and resilience hardening
- Preparing architecture reviews before release
`;

  const architectureSnapshot = {
    generatedAt: new Date().toISOString(),
    projectName,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data,
      position: node.position,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: edge.data,
    })),
  };

  const metadata = {
    name: skillName,
    description,
    version: "1.1.0",
    createdAt: new Date().toISOString(),
    nodeCount: nodes.length,
    edgeCount: edges.length,
    qualityScore: quality?.score,
    qualityGrade: quality?.grade,
  };

  const qualitySummaryMarkdown = quality
    ? [
        "# Architecture Quality Summary",
        "",
        `- Score: **${quality.score}/100**`,
        `- Grade: **${quality.grade}**`,
        `- Status: **${quality.status.toUpperCase()}**`,
        `- Issues: ${quality.summary.totalIssues} total (${quality.summary.errors} errors, ${quality.summary.warnings} warnings, ${quality.summary.suggestions} suggestions)`,
        `- Topology: ${quality.summary.nodeCount} nodes, ${quality.summary.edgeCount} edges, ${quality.summary.connectedComponents} connected component(s), ${quality.summary.isolatedNodes} isolated node(s)`,
        "",
        "## Blockers",
        quality.blockers.length > 0
          ? quality.blockers.map((blocker) => `- ${blocker}`).join("\n")
          : "- None",
        "",
      ].join("\n")
    : "# Architecture Quality Summary\n\nNo quality report available.\n";

  return {
    skillMd,
    files: {
      "README.md": generateReadme(projectName),
      "manifest.json": JSON.stringify(metadata, null, 2),
      "references/architecture.json": JSON.stringify(
        architectureSnapshot,
        null,
        2,
      ),
      "references/diagram.mmd": mermaid,
      "references/service-catalog.md": `# Service Catalog\n\n${catalog}\n`,
      "references/data-flows.md": `# Data Flows\n\n${dataFlows}\n`,
      "references/quality-report.json": JSON.stringify(quality || {}, null, 2),
      "references/quality-summary.md": qualitySummaryMarkdown,
    },
    metadata,
  };
}

/**
 * Creates a downloadable ZIP file with the skill package.
 */
export async function packageSkill(skill: GeneratedSkill): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file("SKILL.md", skill.skillMd);

  for (const [path, content] of Object.entries(skill.files)) {
    zip.file(path, content);
  }

  return zip.generateAsync({ type: "blob" });
}
