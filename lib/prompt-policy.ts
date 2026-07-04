/**
 * Explicit prompt policy contract for architecture generation.
 * See docs/plans/2026-03-06-architecture-generation-design.md
 */
export const PROMPT_POLICY_CONTRACT = `
PROMPT POLICY CONTRACT (BINDING):
1. Architecture correctness and mode requirements come before preference matching.
2. Enterprise mode is intentionally opinionated — best architecture wins over preferences.
3. User preferences are soft constraints unless explicitly marked mandatory.
4. Reuse preferences only when they strengthen or do not materially weaken the result.
5. On conflict: produce the strongest recommendation first, then a preference-aligned alternative.
6. Document conflicts in preferenceConflicts with brief trade-off notes.
`.trim();

export const PRACTICAL_ARCHITECTURE_DOCTRINE = `
PRACTICAL ARCHITECTURE DOCTRINE:
1. Solve the stated problem with the fewest nodes that meet requirements.
2. Most apps need only: client, API/backend, database, auth — not 15 components.
3. Do not add Kafka, Elasticsearch, service mesh, or multi-region unless explicitly required.
4. Prefer boring, proven stacks for vague prompts; reserve exotic tech for explicit requests.
5. Match complexity to tier: Flash/startup = MVP; Pro/enterprise = justified depth only.
`.trim();

export const CACHE_BLOCK_POLICY = `${PROMPT_POLICY_CONTRACT}\n\n${PRACTICAL_ARCHITECTURE_DOCTRINE}`;
