#!/usr/bin/env bun
/**
 * Merges tech-ecosystem-full-2026.ts with legacy lib/tech-ecosystem.ts
 * Run: bun scripts/merge-tech-ecosystem.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NEW_PATH = join(
  process.env.HOME || "",
  "Downloads/tech-ecosystem-full-2026.ts",
);
const OLD_PATH = join(ROOT, "lib/tech-ecosystem.ts");
const OUT_PATH = join(ROOT, "lib/tech-ecosystem.ts");

function extractItems(source: string): Array<Record<string, string>> {
  const items: Array<Record<string, string>> = [];
  const blockRegex =
    /\{\s*id:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?icon:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"(?:[\s\S]*?defaultType:\s*"([^"]+)")?[\s\S]*?\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(source)) !== null) {
    const [, id, label, icon, category, defaultType] = match;
    items.push({
      id,
      label,
      icon,
      category,
      ...(defaultType ? { defaultType } : {}),
    });
  }
  return items;
}

const newSource = readFileSync(NEW_PATH, "utf8");
const oldSource = readFileSync(OLD_PATH, "utf8");

const newItems = extractItems(newSource);
const oldItems = extractItems(oldSource);

const byId = new Map<string, Record<string, string>>();

for (const item of newItems) {
  byId.set(item.id, item);
}

const preferOldCategories = new Set([
  "payment",
  "aws",
  "gcp",
  "automation",
]);

for (const item of oldItems) {
  const existing = byId.get(item.id);
  if (!existing) {
    byId.set(item.id, item);
    continue;
  }
  if (preferOldCategories.has(item.category)) {
    byId.set(item.id, { ...existing, ...item });
  }
}

const merged = [...byId.values()].sort((a, b) => {
  const cat = a.category.localeCompare(b.category);
  if (cat !== 0) return cat;
  return a.label.localeCompare(b.label);
});

const categories = [
  ...new Set(merged.map((i) => i.category)),
].sort();

const categoryUnion = [
  "ai",
  "auth",
  "automation",
  "aws",
  "backend",
  "cache",
  "cicd",
  "cloud",
  "cms",
  "compute",
  "data",
  "database",
  "desktop",
  "devops",
  "frontend",
  "gcp",
  "messaging",
  "mobile",
  "monitoring",
  "payment",
  "queue",
  "search",
  "security",
  "storage",
  "testing",
  "tooling",
  "vector-db",
];

const header = `export type TechCategory =
${categoryUnion.map((c) => `  | "${c}"`).join("\n")};

export interface TechItem {
  id: string;
  label: string;
  icon: string;
  category: TechCategory;
  defaultType?: string;
  aliases?: string[];
  keywords?: string[];
  description?: string;
  tier?: "common" | "niche";
}

export const TECH_ECOSYSTEM: TechItem[] = [
`;

const body = merged
  .map((item) => {
    const lines = [
      "  {",
      `    id: "${item.id}",`,
      `    label: "${item.label.replace(/"/g, '\\"')}",`,
      `    icon: "${item.icon}",`,
      `    category: "${item.category}",`,
    ];
    if (item.defaultType) {
      lines.push(`    defaultType: "${item.defaultType}",`);
    }
    lines.push("  },");
    return lines.join("\n");
  })
  .join("\n");

const footer = `
];

export function getTechById(id: string): TechItem | undefined {
  return TECH_ECOSYSTEM.find((t) => t.id === id);
}

export function getTechsByCategory(category: TechCategory): TechItem[] {
  return TECH_ECOSYSTEM.filter((t) => t.category === category);
}

export function getTechsByType(defaultType: string): TechItem[] {
  return TECH_ECOSYSTEM.filter((t) => t.defaultType === defaultType);
}
`;

writeFileSync(OUT_PATH, header + body + footer, "utf8");
console.log(
  `Merged ${merged.length} tech items (${newItems.length} new + ${oldItems.length} old) → ${OUT_PATH}`,
);
console.log("Categories:", categories.length);
