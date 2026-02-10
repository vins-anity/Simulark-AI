import type { ArchitectureGraph } from "../schema/graph";

// --- Types ---

export type ExportFormat = "gemini" | "claude" | "cursorrules" | "json";

// --- Exporters ---

export function generateClaudeMarkdown(graph: ArchitectureGraph): string {
  return `<context>
  <architecture>
    <nodes>
      ${graph.nodes.map((n) => `<node id="${n.id}" type="${n.data.serviceType}">${n.data.label}</node>`).join("\n      ")}
    </nodes>
    <edges>
      ${graph.edges.map((e) => `<edge source="${e.source}" target="${e.target}" protocol="${e.data?.protocol || "http"}" />`).join("\n      ")}
    </edges>
  </architecture>
</context>`;
}

export function generateGeminiMarkdown(graph: ArchitectureGraph): string {
  return `# Architecture Context
## Nodes
${graph.nodes.map((n) => `- ${n.data.label} (${n.data.serviceType})`).join("\n")}

## Connections
${graph.edges.map((e) => `- ${e.source} -> ${e.target} [${e.data?.protocol || "http"}]`).join("\n")}
`;
}

export function generateCursorRules(graph: ArchitectureGraph): string {
  const techStack = "Next.js 16, Supabase, Tailwind v4, React Flow";
  const dbNodes = graph.nodes
    .filter((n) => n.data.serviceType === "database")
    .map((n) => n.data.label)
    .join(", ");

  return `
# Project Context: Simulark Architecture
# Tech Stack: ${techStack}

# Database Context
The project uses the following databases: ${dbNodes}

# Rules
- Use Server Actions for all database mutations.
- Use Valibot for all schema validation.
    `;
}

// --- Main Engine ---

export function generateContext(
  graph: ArchitectureGraph,
  format: ExportFormat,
): string {
  switch (format) {
    case "claude":
      return generateClaudeMarkdown(graph);
    case "gemini":
      return generateGeminiMarkdown(graph);
    case "cursorrules":
      return generateCursorRules(graph);
    case "json":
      return JSON.stringify(graph, null, 2);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
