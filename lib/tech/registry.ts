/**
 * Tech registry indexes — built once at module load.
 */

import { TECH_ECOSYSTEM, type TechItem } from "@/lib/tech-ecosystem";

export const TECH_BY_ID = new Map<string, TechItem>(
  TECH_ECOSYSTEM.map((item) => [item.id, item]),
);

export const TECH_BY_CATEGORY = new Map<string, TechItem[]>();

for (const item of TECH_ECOSYSTEM) {
  const list = TECH_BY_CATEGORY.get(item.category) || [];
  list.push(item);
  TECH_BY_CATEGORY.set(item.category, list);
}

export function getAllTechIds(): string[] {
  return TECH_ECOSYSTEM.map((t) => t.id);
}

export function isValidTechId(id: string): boolean {
  return TECH_BY_ID.has(id);
}
