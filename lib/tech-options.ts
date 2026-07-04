/**
 * Shared tech picker options derived from TECH_ECOSYSTEM.
 */

import {
  TECH_ECOSYSTEM,
  type TechCategory,
  type TechItem,
} from "@/lib/tech-ecosystem";

export const TECH_PICKER_CATEGORIES = {
  cloud: ["cloud", "aws", "gcp", "compute", "devops"] as TechCategory[],
  languages: [
    "backend",
    "frontend",
    "tooling",
    "mobile",
    "desktop",
  ] as TechCategory[],
  frameworks: ["frontend", "backend", "mobile", "cms"] as TechCategory[],
} as const;

const LANGUAGE_IDS = new Set([
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "php",
  "ruby",
  "elixir",
  "swift",
  "kotlin",
  "nodejs",
  "bun",
  "deno",
  "csharp",
  "scala",
  "zig",
  "dart",
  "c",
  "cpp",
]);

export function getTechOptionsByCategory(
  group: keyof typeof TECH_PICKER_CATEGORIES,
): TechItem[] {
  const categories = TECH_PICKER_CATEGORIES[group];
  const items = TECH_ECOSYSTEM.filter((item) =>
    categories.includes(item.category as TechCategory),
  );

  if (group === "languages") {
    return items.filter(
      (item) =>
        LANGUAGE_IDS.has(item.id) ||
        item.category === "backend" ||
        item.category === "tooling",
    );
  }

  if (group === "frameworks") {
    return items.filter((item) => !LANGUAGE_IDS.has(item.id));
  }

  return items;
}

export function searchTechOptions(
  query: string,
  group?: keyof typeof TECH_PICKER_CATEGORIES,
): TechItem[] {
  const base = group
    ? getTechOptionsByCategory(group)
    : TECH_ECOSYSTEM;
  const q = query.trim().toLowerCase();
  if (!q) return base;
  return base.filter(
    (item) =>
      item.id.includes(q) ||
      item.label.toLowerCase().includes(q) ||
      item.category.includes(q),
  );
}

export function getTechById(id: string): TechItem | undefined {
  return TECH_ECOSYSTEM.find((item) => item.id === id);
}
