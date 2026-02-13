import { TECH_ECOSYSTEM } from "./tech-ecosystem";

export const TYPE_ICONS: Record<string, string> = {
  gateway: "lucide:network",
  service: "lucide:server",
  frontend: "lucide:layout",
  backend: "lucide:server-cog",
  database: "lucide:database",
  queue: "lucide:layers",
  storage: "lucide:hard-drive",
  function: "lucide:zap",
  client: "lucide:monitor",
  ai: "lucide:bot",
  "ai-model": "lucide:brain",
  auth: "lucide:shield",
  payment: "lucide:credit-card",
  automation: "lucide:workflow",
  messaging: "lucide:message-square",
  search: "lucide:search",
  monitoring: "lucide:activity",
  cicd: "lucide:git-branch",
  security: "lucide:shield-check",
  "vector-db": "lucide:layers",
  loadbalancer: "lucide:arrow-left-right",
  cache: "lucide:database",
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

/**
 * Check if an icon should be inverted in dark mode (usually for black logos)
 */
export function shouldInvertIcon(icon: string): boolean {
  const ICON_BLOCKLIST = [
    "logos:nextjs",
    "logos:nextjs-icon",
    "logos:vercel",
    "logos:vercel-icon",
    "logos:github",
    "logos:github-icon",
    "logos:express",
    "logos:flask",
    "logos:prisma",
    "logos:socket.io",
    "logos:expo",
    "logos:expo-icon",
    "logos:threejs",
    "logos:unity",
    "logos:unreal",
  ];
  return ICON_BLOCKLIST.includes(icon) || ICON_BLOCKLIST.some(i => icon.includes("nextjs") || icon.includes("vercel") || icon.includes("github"));
}
