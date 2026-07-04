/**
 * Tech Intelligence Layer — resolve minimal candidate set per request.
 */

import type { InferenceTier } from "@/lib/inference-tier";
import { tierToArchitectureMode } from "@/lib/inference-tier";
import type { UserPreferences } from "@/lib/schema/user-preferences";
import { normalizeTechName } from "@/lib/tech/aliases";
import { TECH_BY_ID } from "@/lib/tech/registry";
import { TECH_ECOSYSTEM } from "@/lib/tech-ecosystem";
import { createHash } from "node:crypto";

export interface TechContextInput {
  userMessage: string;
  userPreferences?: UserPreferences;
  canvasTechIds?: string[];
  tier?: InferenceTier;
  operation?: string;
}

export interface TechContextBundle {
  candidateIds: string[];
  compactMatrix: string;
  knowledgeCards: string;
  practicalConstraints: string;
  cacheKey: string;
}

const COMMON_TECH_IDS = new Set([
  "nextjs",
  "react",
  "typescript",
  "nodejs",
  "postgres",
  "redis",
  "vercel",
  "aws",
  "supabase",
  "fastapi",
  "python",
  "go",
  "docker",
  "kubernetes",
  "nginx",
  "cloudflare",
  "stripe",
  "auth0",
  "clerk",
  "tailwindcss",
  "prisma",
  "graphql",
  "kafka",
  "rabbitmq",
  "mongodb",
  "mysql",
  "deepseek-v4",
]);

const OVER_ENGINEERING_KEYWORDS = [
  "kafka",
  "elasticsearch",
  "service mesh",
  "istio",
  "kubernetes",
  "microservices",
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#/\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function buildKeywordIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const item of TECH_ECOSYSTEM) {
    const keys = new Set<string>([
      item.id,
      item.label.toLowerCase(),
      ...(item.keywords || []),
      ...(item.aliases || []),
    ]);
    for (const key of keys) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized.length < 2) continue;
      const bucket = index.get(normalized) || new Set<string>();
      bucket.add(item.id);
      index.set(normalized, bucket);
    }
  }
  return index;
}

const KEYWORD_INDEX = buildKeywordIndex();

function scoreTechId(
  id: string,
  tokens: string[],
  prefs: UserPreferences | undefined,
  canvasIds: Set<string>,
): number {
  const item = TECH_BY_ID.get(id);
  if (!item) return 0;
  let score = 0;
  const label = item.label.toLowerCase();
  const idNorm = id.toLowerCase();

  for (const token of tokens) {
    if (idNorm.includes(token) || label.includes(token)) score += 3;
    const bucket = KEYWORD_INDEX.get(token.replace(/[^a-z0-9]/g, ""));
    if (bucket?.has(id)) score += 4;
  }

  if (prefs) {
    const prefIds = [
      ...prefs.cloudProviders,
      ...prefs.languages,
      ...prefs.frameworks,
    ];
    if (prefIds.includes(id)) score += 10;
  }

  if (canvasIds.has(id)) score += 12;
  if (COMMON_TECH_IDS.has(id)) score += 1;
  if (item.tier === "niche") score -= 1;

  return score;
}

function getPreferenceIds(prefs?: UserPreferences): string[] {
  if (!prefs) return [];
  return [
    ...prefs.cloudProviders,
    ...prefs.languages,
    ...prefs.frameworks,
  ].map((id) => normalizeTechName(id) || id);
}

function getMaxCandidates(tier: InferenceTier): number {
  return tier === "pro" ? 40 : 25;
}

export function resolveTechContext(input: TechContextInput): TechContextBundle {
  const tier = input.tier || "flash";
  const mode = tierToArchitectureMode(tier);
  const tokens = tokenize(input.userMessage);
  const canvasIds = new Set(
    (input.canvasTechIds || [])
      .map((id) => normalizeTechName(id) || id)
      .filter(Boolean),
  );
  const prefIds = getPreferenceIds(input.userPreferences);
  const maxCandidates = getMaxCandidates(tier);

  const scored = new Map<string, number>();

  for (const id of TECH_ECOSYSTEM.map((t) => t.id)) {
    scored.set(id, scoreTechId(id, tokens, input.userPreferences, canvasIds));
  }

  for (const id of prefIds) {
    scored.set(id, (scored.get(id) || 0) + 15);
  }
  for (const id of canvasIds) {
    scored.set(id, (scored.get(id) || 0) + 15);
  }

  const ranked = [...scored.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  const candidateIds = [
    ...new Set([
      ...prefIds,
      ...canvasIds,
      ...ranked,
      ...COMMON_TECH_IDS,
    ]),
  ].slice(0, maxCandidates);

  const compactMatrix = candidateIds
    .map((id) => {
      const item = TECH_BY_ID.get(id);
      if (!item) return null;
      const desc = item.description ? ` — ${item.description}` : "";
      return `${item.id} | ${item.defaultType || item.category} | ${item.label}${desc}`;
    })
    .filter(Boolean)
    .join("\n");

  const topForKnowledge = ranked.slice(0, tier === "pro" ? 8 : 0);
  const knowledgeCards =
    topForKnowledge.length > 0
      ? topForKnowledge
          .map((id) => {
            const item = TECH_BY_ID.get(id);
            return item ? `- ${item.label} (${item.id}): ${item.category}` : "";
          })
          .filter(Boolean)
          .join("\n")
      : "";

  const wantsComplex = OVER_ENGINEERING_KEYWORDS.some((kw) =>
    input.userMessage.toLowerCase().includes(kw),
  );

  const nodeCap =
    mode === "enterprise" ? "6-15 nodes" : mode === "startup" ? "3-6 nodes" : "4-10 nodes";

  const practicalConstraints = [
    `MODE: ${mode.toUpperCase()} — target ${nodeCap}.`,
    "Solve the stated problem with the fewest nodes that meet requirements.",
    wantsComplex
      ? "User requested complex infra — advanced components allowed when justified."
      : "Do NOT add Kafka, Elasticsearch, or service mesh unless explicitly required.",
    "Prefer boring, proven stacks for vague prompts.",
    `ALLOWED_TECH_IDS: ${candidateIds.join(", ")}`,
    "Use ONLY tech IDs from ALLOWED_TECH_IDS. If none fit, omit tech on the node.",
  ].join("\n");

  const cacheKey = createHash("sha256")
    .update(
      JSON.stringify({
        message: input.userMessage.slice(0, 500),
        prefs: prefIds.sort(),
        canvas: [...canvasIds].sort(),
        tier,
        operation: input.operation,
      }),
    )
    .digest("hex")
    .slice(0, 32);

  return {
    candidateIds,
    compactMatrix,
    knowledgeCards,
    practicalConstraints,
    cacheKey,
  };
}
