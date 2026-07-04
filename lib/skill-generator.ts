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
    displayName: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// Skill name/description — agentskills.io open standard
// https://agentskills.io/specification
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_NAME_MAX = 64;
const SKILL_DESC_MAX = 1024;

/**
 * Converts a project name to a spec-compliant skill name.
 *
 * agentskills.io rules:
 * - Lowercase letters, numbers, hyphens only
 * - Must not start or end with a hyphen
 * - Must not contain consecutive hyphens (--)
 * - Max 64 characters
 * - Must match the parent directory name (enforced in packageSkill)
 */
function toSkillName(input: string): string {
  const name = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip illegal chars
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-{2,}/g, "-") // collapse consecutive hyphens (spec requirement)
    .replace(/^-|-$/g, ""); // no leading/trailing hyphens

  // Enforce max length, trimming cleanly at a hyphen boundary
  const truncated =
    name.length > SKILL_NAME_MAX
      ? name.slice(0, SKILL_NAME_MAX).replace(/-$/, "")
      : name;

  return truncated || "architecture-skill";
}

/**
 * Builds a spec-compliant description using imperative phrasing.
 *
 * agentskills.io best practices:
 * - Imperative: "Use this skill when..." not "This skill does..."
 * - Focus on user intent (what they're trying to achieve)
 * - List implicit triggers ("even if they don't mention X")
 * - Max 1024 characters
 */
function buildDescription(
  projectName: string,
  componentList: string,
  analysis: ArchitectureAnalysis,
): string {
  const entryPointNames =
    analysis.entryPoints.length > 0
      ? analysis.entryPoints
          .map((n) => getNodeLabel(n))
          .slice(0, 2)
          .join(", ")
      : null;

  const capabilities = [
    `implements or modifies ${projectName} services`,
    "reviews architecture decisions and pull requests",
    analysis.databases.length > 0 ? "writes database migrations" : null,
    analysis.antiPatterns.length > 0
      ? "investigates architecture warnings or incidents"
      : null,
    "plans resilience or scaling changes",
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");

  const what =
    `Guides work on the ${projectName} architecture` +
    ` (${componentList}` +
    `${entryPointNames ? `, routed through ${entryPointNames}` : ""}).`;

  // Imperative phrasing per spec — tells the agent when to act
  const when =
    `Use this skill when the developer ${capabilities},` +
    " even if they don't explicitly mention the architecture or service names.";

  const full = `${what} ${when}`;

  if (full.length <= SKILL_DESC_MAX) return full;
  return full.slice(0, SKILL_DESC_MAX - 1).replace(/[,\s]+$/, "") + ".";
}

// ─────────────────────────────────────────────────────────────────────────────
// Node helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Architecture analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyzes diagram nodes to detect architecture patterns and anti-patterns.
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

  // Detect direct non-service → datastore connections (security anti-pattern)
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
        `Direct connection from ${getNodeLabel(source)} to data store — bypass service layer`,
      );
    }
  }

  if (entryPoints.length === 0) {
    antiPatterns.push(
      "No explicit ingress layer (gateway/load balancer) — external traffic enters unguarded",
    );
  }

  return { entryPoints, databases, services, infrastructure, antiPatterns };
}

/**
 * Generates imperative architecture rules grounded in actual node labels.
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
    rules.push("NEVER allow direct client or frontend access to data stores");
    rules.push("ALWAYS enforce schema migrations with backward compatibility");
  }

  if (analysis.services.length > 0) {
    rules.push(
      "ALWAYS keep business logic inside service or function boundaries",
    );
  }

  const hasQueue = nodes.some((node) =>
    ["queue", "messaging"].includes(node.type || ""),
  );
  if (hasQueue) {
    rules.push(
      "ALWAYS implement retry and dead-letter queue handling for async flows",
    );
  }

  const hasMonitoring = nodes.some((node) => node.type === "monitoring");
  if (hasMonitoring) {
    rules.push(
      "ALWAYS emit metrics, traces, and structured logs on critical paths",
    );
  }

  const hasAuth = nodes.some((node) =>
    ["auth", "security"].includes(node.type || ""),
  );
  if (hasAuth) {
    rules.push(
      "NEVER skip authentication checks before reaching business services",
    );
  }

  return rules;
}

/**
 * Generates a Markdown service catalog table from nodes.
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
 * BFS from entry-point nodes, tracing representative data-flow paths.
 * Produces human-readable path strings like "API Gateway -> Auth -> PostgreSQL".
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

// ─────────────────────────────────────────────────────────────────────────────
// SKILL.md body — Level 2 content (loaded when triggered)
// Follows progressive disclosure: quick-start first, then explicit references
// to Level 3 files so Claude loads them on demand via bash.
// ─────────────────────────────────────────────────────────────────────────────

function buildSkillBody(
  projectName: string,
  systemOverview: string,
  rules: string[],
  antiPatterns: string[],
  analysis: ArchitectureAnalysis,
): string {
  const rulesSection =
    rules.length > 0
      ? rules.map((r) => `- ${r}`).join("\n")
      : "- No strict rules detected from current graph topology.";

  const antiPatternSection =
    antiPatterns.length > 0
      ? antiPatterns.map((p) => `- ⚠️ ${p}`).join("\n")
      : "- No obvious anti-patterns detected from current graph topology.";

  const entryPointHint =
    analysis.entryPoints.length > 0
      ? `All external traffic enters through **${analysis.entryPoints.map(getNodeLabel).join(" / ")}**.`
      : "No dedicated ingress node detected.";

  return `# ${projectName} Architecture Skill

## Quick Start

${systemOverview}

${entryPointHint}

Before writing or reviewing code, load the component inventory and traced request paths:

\`\`\`bash
cat references/service-catalog.md
cat references/data-flows.md
\`\`\`

---

## Architecture Rules

${rulesSection}

---

## Anti-Patterns to Avoid

${antiPatternSection}

---

## Reference Files

Load these files on demand — only when the task requires them:

- **If implementing a new service or changing service boundaries** → read \`references/service-catalog.md\`
- **If tracing a request flow or debugging a latency issue** → read \`references/data-flows.md\`
- **If you need a visual overview of the full graph** → read \`references/diagram.mmd\`
- **If evaluating architecture quality or reviewing blockers** → read \`references/quality-summary.md\`
- **If you need programmatic access to the raw node/edge graph** → read \`references/architecture.json\`
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Install hint — one line for UI copy
// ─────────────────────────────────────────────────────────────────────────────

export const SKILL_DROP_IN_DIR = ".agents/skills";

export function getSkillDropInPath(skillName: string): string {
  return `${SKILL_DROP_IN_DIR}/${skillName}`;
}

export function getSkillInstallHint(skillName: string): string {
  return `Put the folder inside ${getSkillDropInPath(skillName)} in your project.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

function writeSkillTree(
  zip: { file: (path: string, content: string) => void },
  basePath: string,
  skill: GeneratedSkill,
): void {
  zip.file(`${basePath}/SKILL.md`, skill.skillMd);
  for (const [path, content] of Object.entries(skill.files)) {
    zip.file(`${basePath}/${path}`, content);
  }
}

/**
 * Generates a spec-compliant Anthropic Agent Skill package from a Simulark
 * architecture graph.
 *
 * Output conforms to:
 * https://docs.anthropic.com/en/agents-and-tools/agent-skills
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

  // ── Level 1: Metadata (name + description) ────────────────────────────────
  const skillName = toSkillName(projectName);

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

  // Spec: description must state what the skill does AND when to use it
  const description = buildDescription(projectName, componentList, analysis);

  // ── Level 2: SKILL.md body ────────────────────────────────────────────────
  const systemOverview =
    projectDescription ||
    `${projectName} contains ${nodes.length} components and ${edges.length} connections.`;

  const skillBody = buildSkillBody(
    projectName,
    systemOverview,
    rules,
    analysis.antiPatterns,
    analysis,
  );

  // ── SKILL.md: YAML frontmatter + body ───────────────────────────────────
  // Frontmatter fields per agentskills.io/specification
  const generatedAt = new Date().toISOString();
  const skillMd = [
    "---",
    `name: ${JSON.stringify(skillName)}`,
    `description: ${JSON.stringify(description)}`,
    `license: "Generated by Simulark (https://simulark.app)"`,
    `compatibility: "Compatible with npx skills (Cursor, Claude Code, Codex, OpenCode, and 70+ agents). No external tools required."`,
    "metadata:",
    `  generated-by: simulark`,
    `  generated-at: ${JSON.stringify(generatedAt)}`,
    `  node-count: ${JSON.stringify(String(nodes.length))}`,
    `  edge-count: ${JSON.stringify(String(edges.length))}`,
    quality
      ? `  quality-score: ${JSON.stringify(String(quality.score))}`
      : null,
    quality ? `  quality-grade: ${JSON.stringify(quality.grade)}` : null,
    "---",
    "",
    skillBody,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  // ── Level 3: Bundled reference files ─────────────────────────────────────
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
          ? quality.blockers.map((b) => `- ${b}`).join("\n")
          : "- None",
        "",
      ].join("\n")
    : "# Architecture Quality Summary\n\nNo quality report available.\n";

  // JS-side metadata (not written to a file — frontmatter YAML metadata field
  // is the spec-compliant place for this; manifest.json is not in the spec)
  const metadata = {
    name: skillName,
    displayName: projectName,
    description,
    version: "2.0.0",
    createdAt: generatedAt,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    qualityScore: quality?.score,
    qualityGrade: quality?.grade,
  };

  return {
    skillMd,
    files: {
      // Level 3 reference files (loaded by agent on demand)
      "references/architecture.json": JSON.stringify(
        architectureSnapshot,
        null,
        2,
      ),
      "references/diagram.mmd": mermaid,
      "references/service-catalog.md": `# Service Catalog\n\n${catalog}\n`,
      "references/data-flows.md": `# Data Flows\n\n${dataFlows}\n`,
      "references/quality-summary.md": qualitySummaryMarkdown,
    },
    metadata,
  };
}

/**
 * ZIP with one folder: `{skillName}/SKILL.md` + `references/`.
 * User moves that folder into `.agents/skills/` in their project.
 */
export async function packageSkill(skill: GeneratedSkill): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  writeSkillTree(zip, skill.metadata.name, skill);
  return zip.generateAsync({ type: "blob" });
}
