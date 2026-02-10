import { TECH_ECOSYSTEM } from "./tech-ecosystem";

export const TYPE_ICONS: Record<string, string> = {
  gateway: "lucide:network",
  service: "lucide:server",
  database: "lucide:database",
  queue: "lucide:layers",
  storage: "lucide:hard-drive",
  function: "lucide:zap",
  client: "lucide:monitor",
  ai: "lucide:bot",
};

/**
 * Get the most appropriate icon for a technology name or service type
 */
export function getTechIcon(
  tech: string = "",
  type: string = "service",
): string {
  if (!tech && !type) return TYPE_ICONS.service;
  if (!tech) return TYPE_ICONS[type] || TYPE_ICONS.service;

  const normalizedTech = tech.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Try exact match in ecosystem
  const exactMatch = TECH_ECOSYSTEM.find(
    (item) =>
      item.id === normalizedTech || item.label.toLowerCase() === normalizedTech,
  );
  if (exactMatch) return exactMatch.icon;

  // 2. Try substring match in ecosystem
  const fuzzyMatch = TECH_ECOSYSTEM.find(
    (item) =>
      item.id.includes(normalizedTech) ||
      normalizedTech.includes(item.id) ||
      item.label.toLowerCase().includes(normalizedTech),
  );
  if (fuzzyMatch) return fuzzyMatch.icon;

  // 3. Fallback to type icons
  return TYPE_ICONS[type] || TYPE_ICONS.service;
}
