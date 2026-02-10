/**
 * Tech Name Normalizer
 * Maps AI-generated tech names to TECH_ECOSYSTEM IDs for consistent icon lookup
 */

import { TECH_ECOSYSTEM, type TechItem } from "./tech-ecosystem";

// Common variations and aliases
const TECH_ALIASES: Record<string, string> = {
  // Frontend
  "next.js": "nextjs",
  next: "nextjs",
  "next.js frontend": "nextjs",
  "react.js": "react",
  "vue.js": "vue",
  vuejs: "vue",
  "svelte.js": "svelte",
  "vite.js": "vite",

  // Backend
  "node.js": "nodejs",
  node: "nodejs",
  "express.js": "express",
  "nest.js": "nestjs",
  "fast api": "fastapi",
  "spring boot": "spring",

  // Database
  postgresql: "postgres",
  mongo: "mongodb",
  "mongo db": "mongodb",
  "supabase postgresql": "supabase",
  "supabase postgres": "supabase",

  // Cloud
  "amazon web services": "aws",
  "google cloud platform": "gcp",
  "microsoft azure": "azure",
  "cloudflare workers": "workers",
  "cloudflare r2": "r2",
  "amazon s3": "s3",
  "aws s3": "s3",
  "aws lambda": "lambda",
  "google cloud run": "cloud-run",
  "cloud functions": "cloud-run",

  // AI
  "open ai": "openai",
  gpt: "openai",
  claude: "anthropic",
  "hugging face": "huggingface",
  "google gemini": "google-gemini",
  gemini: "google-gemini",
  llama: "meta-llama",

  // DevOps
  k8s: "kubernetes",
  "github ci": "github-actions",
  "ci/cd": "github-actions",

  // Queues
  "rabbit mq": "rabbitmq",
  "amazon sqs": "sqs",
  "aws sqs": "sqs",
};

/**
 * Normalize a tech name to its ecosystem ID
 * Uses exact match, alias lookup, and fuzzy matching
 */
export function normalizeTechName(input: string): string | undefined {
  if (!input) return undefined;

  const normalized = input.toLowerCase().trim();

  // 1. Direct ID match
  const directMatch = TECH_ECOSYSTEM.find((t) => t.id === normalized);
  if (directMatch) return directMatch.id;

  // 2. Alias lookup
  if (TECH_ALIASES[normalized]) {
    return TECH_ALIASES[normalized];
  }

  // 3. Label match (case-insensitive)
  const labelMatch = TECH_ECOSYSTEM.find(
    (t) => t.label.toLowerCase() === normalized,
  );
  if (labelMatch) return labelMatch.id;

  // 4. Partial match (contains)
  const partialMatch = TECH_ECOSYSTEM.find(
    (t) =>
      normalized.includes(t.id) || normalized.includes(t.label.toLowerCase()),
  );
  if (partialMatch) return partialMatch.id;

  // 5. Reverse partial (ID or label contained in input)
  for (const tech of TECH_ECOSYSTEM) {
    if (
      normalized.includes(tech.id) ||
      tech.label
        .toLowerCase()
        .split(" ")
        .some((word) => normalized.includes(word) && word.length > 3)
    ) {
      return tech.id;
    }
  }

  return undefined;
}

/**
 * Get TechItem with all metadata for a given input
 */
export function getTechFromLabel(input: string): TechItem | undefined {
  const id = normalizeTechName(input);
  if (!id) return undefined;
  return TECH_ECOSYSTEM.find((t) => t.id === id);
}

/**
 * Auto-enrich a node with tech ecosystem data
 */
export function enrichNodeWithTech(node: any): any {
  if (!node?.data) return node;

  // Try to extract tech from label or tech field
  const techSource = node.data.tech || node.data.label || "";
  const techItem = getTechFromLabel(techSource);

  if (techItem) {
    return {
      ...node,
      data: {
        ...node.data,
        tech: techItem.id,
        techLabel: techItem.label,
        logo: techItem.icon,
        // Preserve existing label but ensure category is set
        category: node.data.category || techItem.category,
      },
    };
  }

  return node;
}

/**
 * Enrich all nodes in an array
 */
export function enrichNodesWithTech(nodes: any[]): any[] {
  return nodes.map(enrichNodeWithTech);
}
