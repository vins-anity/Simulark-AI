# Prompt Engineering: "Think, Then Build" Overhaul

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `buildEnhancedSystemPrompt()` and its helpers to use a phased decision-making structure that eliminates wrong-tech-on-wrong-layer errors and component count bloat.

**Architecture:** Replace the current "flat wall of instructions" with a 5-phase prompt: (1) Role+Context, (2) Decision Phase (count → tech → connections), (3) Hard Constraint Matrix (tabular, binding), (4) Build Phase, (5) Self-Validation Checklist + Few-Shot Examples. All existing public exports (`buildEnhancedSystemPrompt`, `detectArchitectureType`, `detectComplexity`, `validatePrompt`, `normalizeArchitectureMode`, `MODE_CONSTRAINTS`, `ArchitectureMode`, etc.) remain unchanged.

**Tech Stack:** TypeScript, pure string manipulation — no new dependencies.

---

## Files to touch

- **Modify:** `lib/prompt-engineering.ts` — the only file to change

---

## Task 1: Replace `getFrameworkCompatibilityRules()` with `getTechValidationMatrix()`

The current `getFrameworkCompatibilityRules()` returns prose bullets. Replace it with a hard tabular matrix that binds tech IDs to allowed node types.

**Files:**
- Modify: `lib/prompt-engineering.ts` — replace `getFrameworkCompatibilityRules()` function body

**Step 1: Delete `getFrameworkCompatibilityRules()` entirely and add `getTechValidationMatrix()` in its place**

Replace the entire `getFrameworkCompatibilityRules` function (lines ~632–683) with:

```typescript
/**
 * Hard tech-to-node-type validation matrix.
 * Replaces the old prose-based framework compatibility rules.
 * Tabular format is processed more reliably by all LLMs.
 */
function getTechValidationMatrix(): string {
  return `TECH VALIDATION MATRIX (BINDING — a node with tech outside its allowed set is an INVALID output):

| Node Type  | Allowed tech values                                                                                   |
|------------|-------------------------------------------------------------------------------------------------------|
| frontend   | react, vue, angular, svelte, nextjs, nuxt, sveltekit, remix, solid-start, tanstack-start,             |
|            | livewire, inertia, blade, htmx, stimulus, astro, qwik                                                |
| backend    | express, fastify, nestjs, hono, elysia, django, flask, fastapi, laravel, rails, spring,               |
|            | adonisjs, go, rust, dotnet, bun, deno, nitro, hattip                                                 |
| database   | postgresql, mysql, mongodb, sqlite, redis, dynamodb, cassandra, cockroachdb, supabase,                |
|            | firebase, planetscale, turso, neon, convex, faunadb, tidb, surrealdb                                 |
| cache      | redis, memcached, upstash, cloudflare-kv, varnish                                                    |
| queue      | kafka, rabbitmq, sqs, bullmq, celery, sidekiq, nats, pulsar, upstash-qstash                          |
| gateway    | kong, nginx, traefik, aws-apigw, cloudflare, ambassador, envoy, caddy                                |
| ai         | openai, anthropic, pinecone, weaviate, pgvector, langchain, langgraph, huggingface,                  |
|            | replicate, ollama, crewai, pydantic-ai, llamaindex                                                    |
| storage    | s3, cloudflare-r2, gcs, azure-blob, supabase-storage, backblaze, minio                               |
| external   | stripe, sendgrid, twilio, mailgun, pusher, algolia, mapbox, plaid, shippo                            |
| saas       | clerk, auth0, firebase-auth, cognito, okta, supabase-auth, nextauth, datadog, newrelic,               |
|            | grafana, sentry, posthog, segment, mixpanel, intercom, zendesk                                        |
| compute    | aws-lambda, vercel-functions, cloudflare-workers, netlify-functions, azure-functions                   |

FRAMEWORK ECOSYSTEM RULES (when user prefers a backend framework, use these for frontend nodes):
| User Prefers | Valid Frontend Tech                                          |
|--------------|--------------------------------------------------------------|
| laravel      | livewire (reactive server), inertia (SPA bridge),            |
|              | blade (templates), vue, react (decoupled SPA)                |
| django       | react, vue, htmx, django-templates                           |
| rails        | react, vue, stimulus, hotwire                                |
| spring       | react, angular, vue                                          |
| express/fastify/nestjs/hono | react, vue, angular, svelte               |
| fastapi      | react, vue, svelte                                           |

FULL-STACK FRAMEWORK RULE (critical — never pair these with a separate backend framework):
nextjs, nuxt, sveltekit, remix → these handle BOTH frontend AND API routes.
If user picks nextjs → DO NOT add express/fastify/nestjs as a separate backend node.`;
}
```

**Step 2: Verify the file still compiles**

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI && npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors. If errors appear, they'll be from the call site that referenced `getFrameworkCompatibilityRules` — fix by updating the call in `buildEnhancedSystemPrompt` to call `getTechValidationMatrix()` instead.

---

## Task 2: Replace `getModeConstraints()` + `getComplexityGuidelines()` with `getComponentDecisionTree()`

The current two functions produce competing count signals. Replace them with a single decision-tree function that has explicit precedence.

**Files:**
- Modify: `lib/prompt-engineering.ts`

**Step 1: Add `getComponentDecisionTree()` function after `getTechValidationMatrix()`**

```typescript
/**
 * Single authoritative component count decision tree.
 * Replaces getModeConstraints() + getComplexityGuidelines() signals.
 * Explicit precedence prevents competing constraints.
 */
function getComponentDecisionTree(
  mode: ArchitectureMode,
  complexity: ComplexityLevel,
  operationType: string,
  adjustedMin: number,
  adjustedMax: number,
): string {
  // Mode-specific guidance
  const modeGuidance: Record<ArchitectureMode, string> = {
    startup: "Bias toward LOWER end. Prefer full-stack frameworks that consolidate layers.",
    default: "Balance simplicity with best practices. Right-size for described scale.",
    enterprise: "Bias toward HIGHER end. Add monitoring, security, and redundancy nodes.",
  };

  // Complexity → baseline range
  const complexityRange: Record<ComplexityLevel, string> = {
    simple: "3–5 components",
    medium: "5–8 components",
    complex: "7–12 components",
  };

  // NEVER-INCLUDE rules
  const neverInclude = `NEVER include these unless explicitly requested or mode requires:
- CDN node: skip for <10K users, internal tools, or startup mode
- Load Balancer: skip for single-instance apps and startup mode
- Message Queue: skip unless async processing is explicitly needed
- Monitoring/Observability: skip for startup mode and simple apps
- WAF/Security node: only for enterprise mode
- API Gateway: only when multiple backend services need routing`;

  return `COMPONENT COUNT DECISION TREE (follow in order — do not skip steps):

STEP 1 — Start with complexity baseline: ${complexity.toUpperCase()} → ${complexityRange[complexity]}
STEP 2 — Apply mode modifier (${mode.toUpperCase()}): ${modeGuidance[mode]}
STEP 3 — Apply operation modifier: your adjusted range is MIN=${adjustedMin} to MAX=${adjustedMax}
STEP 4 — Final purpose check: for EVERY component you plan to include, ask:
          "Can I write a one-sentence justification for why this specific app needs this?"
          If NO → REMOVE IT.

${neverInclude}

ANTI-PATTERN EXAMPLES:
❌ WRONG — simple todo app with 9 nodes: Frontend + CDN + LB + Gateway + Backend + DB + Cache + Queue + Monitoring
   WHY WRONG: Simple apps don't need CDN/LB/Queue/Monitoring — this is cargo-cult architecture
✅ CORRECT — simple todo app with 3 nodes: Next.js App + PostgreSQL + Clerk Auth

❌ WRONG — enterprise SaaS with 3 nodes: Frontend + Backend + DB
   WHY WRONG: Enterprise mode requires observability, security, and redundancy
✅ CORRECT — enterprise SaaS with 8+ nodes: CDN + LB + Frontend + Backend + DB + Cache + Monitoring + WAF`;
}
```

**Step 2: Keep `getModeConstraints()` and `getComplexityGuidelines()` but mark them as internal-only (remove from the call in `buildEnhancedSystemPrompt`)**

They're referenced nowhere outside `buildEnhancedSystemPrompt`, so they'll be removed from the prompt assembly in Task 4.

---

## Task 3: Add `getFewShotExamples()` and `getSelfValidationChecklist()`

Few-shot examples are the highest-impact single addition. The self-validation checklist forces the model to catch its own errors.

**Files:**
- Modify: `lib/prompt-engineering.ts`

**Step 1: Add `getFewShotExamples()` after `getComponentDecisionTree()`**

```typescript
/**
 * Mode-appropriate few-shot examples.
 * Shows the model exactly what correct output looks like.
 * This is the highest-impact single prompt engineering technique.
 */
function getFewShotExamples(mode: ArchitectureMode): string {
  const startupExample = `EXAMPLE — Startup mode, simple todo app (prompt: "build a simple todo app"):
{
  "analysis": "Chose a Next.js monolith to eliminate ops overhead — a solo developer can ship and iterate without managing separate services.",
  "nodes": [
    { "id": "app-1", "type": "frontend", "position": {"x": 300, "y": 100},
      "data": { "label": "Next.js App", "description": "Full-stack app with API routes", "justification": "Handles both UI and API in one deployment — no separate backend needed for a todo app", "tech": "nextjs", "serviceType": "frontend" }},
    { "id": "db-1", "type": "database", "position": {"x": 200, "y": 350},
      "data": { "label": "PostgreSQL", "description": "Persistent task storage", "justification": "Relational DB for structured task data with user ownership queries", "tech": "postgresql", "serviceType": "database" }},
    { "id": "auth-1", "type": "saas", "position": {"x": 500, "y": 350},
      "data": { "label": "Clerk Auth", "description": "Managed user authentication", "justification": "Eliminates auth boilerplate — free tier covers startup scale", "tech": "clerk", "serviceType": "saas" }}
  ],
  "edges": [
    { "id": "e-1", "source": "app-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Read/Write Tasks" }},
    { "id": "e-2", "source": "app-1", "target": "auth-1", "animated": true, "data": { "protocol": "https", "label": "Auth Tokens & User Sessions" }}
  ]
}`;

  const defaultExample = `EXAMPLE — Default mode, SaaS dashboard (prompt: "build a SaaS analytics dashboard"):
{
  "analysis": "Separated frontend and backend to allow independent scaling of the API under analytics query load, with Redis caching to absorb repeated dashboard reads.",
  "nodes": [
    { "id": "cdn-1", "type": "gateway", "position": {"x": 300, "y": 50},
      "data": { "label": "Cloudflare CDN", "description": "Edge caching and DDoS protection", "justification": "Dashboard assets are static — CDN eliminates origin load for 80% of requests", "tech": "cloudflare", "serviceType": "gateway" }},
    { "id": "fe-1", "type": "frontend", "position": {"x": 300, "y": 200},
      "data": { "label": "React Dashboard", "description": "Interactive analytics UI with charts", "justification": "React ecosystem has the best charting libraries (Recharts, D3) for analytics use case", "tech": "react", "serviceType": "frontend" }},
    { "id": "api-1", "type": "backend", "position": {"x": 300, "y": 350},
      "data": { "label": "FastAPI Backend", "description": "REST API for analytics queries", "justification": "Python enables pandas/numpy for analytics processing; FastAPI is fastest Python framework", "tech": "fastapi", "serviceType": "backend" }},
    { "id": "db-1", "type": "database", "position": {"x": 150, "y": 500},
      "data": { "label": "PostgreSQL", "description": "Time-series analytics data", "justification": "TimescaleDB extension on Postgres handles time-series queries efficiently", "tech": "postgresql", "serviceType": "database" }},
    { "id": "cache-1", "type": "cache", "position": {"x": 450, "y": 500},
      "data": { "label": "Redis Cache", "description": "Dashboard query result cache", "justification": "Analytics queries are expensive — cache results for 5-minute windows to handle concurrent users", "tech": "redis", "serviceType": "cache" }}
  ],
  "edges": [
    { "id": "e-1", "source": "cdn-1", "target": "fe-1", "animated": true, "data": { "protocol": "https", "label": "Cached Assets" }},
    { "id": "e-2", "source": "fe-1", "target": "api-1", "animated": true, "data": { "protocol": "https", "label": "Analytics Queries" }},
    { "id": "e-3", "source": "api-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Raw Analytics Data" }},
    { "id": "e-4", "source": "api-1", "target": "cache-1", "animated": true, "data": { "protocol": "cache", "label": "Query Result Cache" }}
  ]
}`;

  const enterpriseExample = `EXAMPLE — Enterprise mode, fintech platform (prompt: "build an enterprise payment processing platform"):
{
  "analysis": "Separated auth, payment processing, and notifications into dedicated services behind a gateway to enable independent compliance auditing and zero-downtime updates to PCI-scoped components.",
  "nodes": [
    { "id": "waf-1", "type": "gateway", "position": {"x": 400, "y": 50},
      "data": { "label": "Cloudflare WAF", "description": "Web application firewall", "justification": "PCI-DSS requires WAF for cardholder data environments", "tech": "cloudflare", "serviceType": "gateway" }},
    { "id": "lb-1", "type": "gateway", "position": {"x": 400, "y": 150},
      "data": { "label": "Load Balancer", "description": "Traffic distribution with health checks", "justification": "Enterprise SLA requires zero single points of failure at the entry layer", "tech": "nginx", "serviceType": "gateway" }},
    { "id": "fe-1", "type": "frontend", "position": {"x": 200, "y": 280},
      "data": { "label": "React Frontend", "description": "Merchant dashboard and payment UI", "justification": "React with strict CSP headers for PCI-compliant cardholder data entry forms", "tech": "react", "serviceType": "frontend" }},
    { "id": "gw-1", "type": "gateway", "position": {"x": 500, "y": 280},
      "data": { "label": "API Gateway", "description": "Route and authenticate API requests", "justification": "Kong provides rate limiting, JWT validation, and audit logging required for PCI", "tech": "kong", "serviceType": "gateway" }},
    { "id": "pay-1", "type": "backend", "position": {"x": 300, "y": 420},
      "data": { "label": "Payment Service", "description": "PCI-scoped payment processing", "justification": "Isolated microservice limits PCI scope to a single deployable unit", "tech": "nestjs", "serviceType": "backend" }},
    { "id": "auth-1", "type": "backend", "position": {"x": 600, "y": 420},
      "data": { "label": "Auth Service", "description": "OAuth2/OIDC identity management", "justification": "Separate auth service enables SOC2-compliant access controls and audit trails", "tech": "nestjs", "serviceType": "backend" }},
    { "id": "db-1", "type": "database", "position": {"x": 200, "y": 570},
      "data": { "label": "PostgreSQL HA", "description": "Encrypted transaction storage", "justification": "Patroni HA cluster with column-level encryption for PCI cardholder data", "tech": "postgresql", "serviceType": "database" }},
    { "id": "monitor-1", "type": "saas", "position": {"x": 600, "y": 570},
      "data": { "label": "Datadog APM", "description": "Full-stack observability", "justification": "Enterprise SLA requires <1s P99 latency — Datadog provides distributed tracing across all services", "tech": "datadog", "serviceType": "saas" }}
  ],
  "edges": [
    { "id": "e-1", "source": "waf-1", "target": "lb-1", "animated": true, "data": { "protocol": "https", "label": "Filtered Traffic" }},
    { "id": "e-2", "source": "lb-1", "target": "fe-1", "animated": true, "data": { "protocol": "https", "label": "Web Requests" }},
    { "id": "e-3", "source": "lb-1", "target": "gw-1", "animated": true, "data": { "protocol": "https", "label": "API Requests" }},
    { "id": "e-4", "source": "gw-1", "target": "pay-1", "animated": true, "data": { "protocol": "https", "label": "Authenticated Payment Ops" }},
    { "id": "e-5", "source": "gw-1", "target": "auth-1", "animated": true, "data": { "protocol": "https", "label": "Token Validation" }},
    { "id": "e-6", "source": "pay-1", "target": "db-1", "animated": true, "data": { "protocol": "database", "label": "Transaction Records" }},
    { "id": "e-7", "source": "pay-1", "target": "monitor-1", "animated": true, "data": { "protocol": "https", "label": "Metrics & Traces" }},
    { "id": "e-8", "source": "auth-1", "target": "monitor-1", "animated": true, "data": { "protocol": "https", "label": "Auth Events & Audit Log" }}
  ]
}`;

  if (mode === "startup") return startupExample;
  if (mode === "enterprise") return enterpriseExample;
  return defaultExample;
}

/**
 * Self-validation checklist appended at the end of the prompt.
 * Forces the model to verify its output before finalizing.
 */
function getSelfValidationChecklist(): string {
  return `SELF-VALIDATION — Before outputting JSON, verify ALL of these:
□ 1. Every node's "tech" is in the allowed set for its "type" (check the TECH VALIDATION MATRIX above)
□ 2. Component count is within the adjusted MIN–MAX range from the decision tree
□ 3. Every node (except the single entry point) has at least ONE incoming edge
□ 4. No full-stack framework (nextjs/nuxt/sveltekit/remix) is paired with a separate backend framework
□ 5. Backend frameworks (laravel/django/rails/spring/express/nestjs) are NEVER assigned to a "frontend" type node
□ 6. Edge "label" values describe actual data (e.g., "User Auth Tokens", "Task CRUD Ops") — NOT generic ("connects to", "API call")
□ 7. Edge "protocol" matches actual transport: database connections use "database", cache ops use "cache", queues use "queue"
□ 8. Every node has a non-empty "justification" explaining WHY this tech was chosen for THIS specific use case
□ 9. No unnecessary infrastructure (CDN/LB/WAF/Queue/Monitoring) for startup mode or simple complexity
□ 10. The "analysis" field is a SINGLE sentence that explains the most interesting design trade-off made

If ANY check fails → fix the output before returning it.`;
}
```

---

## Task 4: Rewrite `buildEnhancedSystemPrompt()` with phased structure

This is the main change. Replace the flat text dump with the 5-phase structure.

**Files:**
- Modify: `lib/prompt-engineering.ts` — replace `buildEnhancedSystemPrompt()` body entirely

**Step 1: Replace the entire `buildEnhancedSystemPrompt` function body**

The function signature stays identical. Only the internal logic and returned string changes.

The new structure:
```
Phase 1: ROLE & CONTEXT
Phase 2: DECISION — count, tech, connections (think before building)
Phase 3: HARD CONSTRAINTS — tech matrix, ecosystem rules
Phase 4: BUILD — current state (if modifying), conversation context, preferences
Phase 5: SELF-VALIDATE & OUTPUT FORMAT — checklist, few-shot example, JSON schema
```

Replace the function body (lines ~1008–1341) with:

```typescript
export function buildEnhancedSystemPrompt(context: PromptContext): string {
  const {
    userInput,
    currentNodes,
    currentEdges,
    mode,
    conversationHistory,
    operationType,
    userPreferences,
  } = context;

  const complexity = detectComplexity(userInput);
  const detection = detectArchitectureType(userInput);
  const effectiveMode = normalizeArchitectureMode(mode);
  const modeConstraints = MODE_CONSTRAINTS[effectiveMode];
  const countAdjustment = getComponentCountAdjustment(operationType || "create");
  const shouldRelax = shouldRelaxConstraints(operationType || "create");

  const adjustedMin = Math.max(
    1,
    modeConstraints.minComponents + countAdjustment.minAdjustment,
  );
  const adjustedMax = Math.max(
    adjustedMin,
    modeConstraints.maxComponents + countAdjustment.maxAdjustment,
  );

  // ── CURRENT ARCHITECTURE CONTEXT (modification mode) ──────────────────────
  let currentArchitectureContext = "";
  if (currentNodes && currentNodes.length > 0) {
    const nodes = currentNodes;
    const edges = currentEdges || [];
    const architectureNodes = nodes.filter(
      (n: any) =>
        n.type !== "stickyNote" &&
        n.type !== "text" &&
        n.type !== "group" &&
        n.type !== "frame",
    );
    const customNodes = nodes.filter(
      (n: any) =>
        n.type === "stickyNote" ||
        n.type === "text" ||
        n.type === "group" ||
        n.type === "frame",
    );

    const operationInstructions = getOperationInstructions(operationType || "modify");

    currentArchitectureContext = `
═══════════════════════════════════════════════════
PHASE 0 — CURRENT STATE (you are MODIFYING, not creating from scratch)
═══════════════════════════════════════════════════
Existing components (${architectureNodes.length} nodes, ${edges.length} edges):
${architectureNodes
  .map(
    (n: any) =>
      `  • ${n.data?.label || n.id} [type=${n.type}, tech=${n.data?.tech || "unknown"}]: ${n.data?.description || ""}`,
  )
  .join("\n")}
${
  customNodes.length > 0
    ? `\nUser annotations (preserve these exactly):
${customNodes.map((n: any) => `  • ${n.type === "text" ? `Text: "${n.data?.label || ""}"` : `Shape: ${n.data?.label || n.id} (${n.type})`}).join("\n")}`
    : ""
}

OPERATION: ${operationInstructions}

PRESERVATION RULES:
1. Keep existing node IDs where possible
2. Only modify components explicitly mentioned in the request
3. Maintain connections unless they involve removed/replaced components
4. Preserve ALL custom annotations/text shapes — they are user notes`;
  }

  // ── CONVERSATION CONTEXT ───────────────────────────────────────────────────
  let conversationContext = "";
  if (conversationHistory && conversationHistory.length > 0) {
    const history = conversationHistory.slice(-10);
    const previousRequests = history
      .filter((m) => m.role === "user")
      .map((m, i) => `  ${i + 1}. "${m.content.substring(0, 150)}"`);

    if (previousRequests.length > 0) {
      conversationContext = `
CONVERSATION HISTORY (build upon or adapt the previous direction):
${previousRequests.join("\n")}
→ Current request: "${userInput}"
NOTE: If the user is changing direction entirely (e.g. "todo app" → "Netflix clone"), acknowledge the pivot and redesign from scratch.`;
    }
  }

  // ── USER PREFERENCES ───────────────────────────────────────────────────────
  let preferencesBlock = "";
  if (userPreferences) {
    const { cloudProviders, languages, frameworks, architectureTypes, applicationType, customInstructions, onboardingMetadata } = userPreferences;
    const prefLines: string[] = [];

    const clouds = (cloudProviders || []).filter((c) => c !== "Generic").map((c) => c.toUpperCase());
    if (clouds.length > 0) prefLines.push(`  • Cloud: ${clouds.join(", ")}`);
    else if (userPreferences.cloudProvider && userPreferences.cloudProvider !== "Generic")
      prefLines.push(`  • Cloud: ${userPreferences.cloudProvider.toUpperCase()}`);

    const langs = languages || (userPreferences.language ? [userPreferences.language] : []);
    if (langs.length > 0) prefLines.push(`  • Languages: ${langs.map((l) => l.toUpperCase()).join(", ")}`);

    const fws = frameworks || (userPreferences.framework ? [userPreferences.framework] : []);
    if (fws.length > 0) prefLines.push(`  • Frameworks: ${fws.map((f) => f.toUpperCase()).join(", ")} — see FRAMEWORK ECOSYSTEM RULES for correct frontend tech`);

    if (architectureTypes && architectureTypes.length > 0)
      prefLines.push(`  • Architecture Patterns: ${architectureTypes.join(", ")} (apply where relevant)`);

    if (applicationType && applicationType.length > 0)
      prefLines.push(`  • Application Type: ${applicationType.join(", ")}`);

    if (customInstructions?.trim())
      prefLines.push(`  • Custom Instructions (follow strictly): "${customInstructions}"`);

    if (onboardingMetadata) {
      const { experienceLevel, teamSize, includeServices } = onboardingMetadata;
      if (experienceLevel === "beginner") prefLines.push("  • Experience: Beginner — use well-documented, simple solutions");
      if (experienceLevel === "advanced") prefLines.push("  • Experience: Advanced — optimize for performance and production patterns");
      if (teamSize === "solo") prefLines.push("  • Team: Solo — keep architecture manageable by one developer");
      if (teamSize === "enterprise") prefLines.push("  • Team: Enterprise — design for team collaboration with clear service boundaries");
      const enabledServices = Object.entries(includeServices || {}).filter(([, v]) => v).map(([k]) => k);
      if (enabledServices.length > 0) prefLines.push(`  • Required Services: ${enabledServices.join(", ")}`);
    }

    if (prefLines.length > 0) {
      preferencesBlock = `
USER PREFERENCES (apply contextually per layer — not blindly to every node):
${prefLines.join("\n")}`;
    }
  }

  // ── TECH KNOWLEDGE INJECTION ───────────────────────────────────────────────
  const techKnowledge = getTechKnowledgeInjection(detection.type, userInput);

  // ── ASSEMBLE FINAL PROMPT ──────────────────────────────────────────────────
  return `You are an expert Solutions Architect specializing in ${detection.type.replace(/-/g, " ")} design.
${currentArchitectureContext}
${conversationContext}

═══════════════════════════════════════════════════
PHASE 1 — UNDERSTAND THE REQUEST
═══════════════════════════════════════════════════
User Request: "${userInput}"
Detected Architecture: ${detection.type} (${Math.round(detection.confidence * 100)}% confidence)
Detected Complexity: ${complexity.toUpperCase()}
Operation: ${(operationType || "create").toUpperCase()}
Mode: ${effectiveMode.toUpperCase()} — ${MODE_CONSTRAINTS[effectiveMode].description}
${preferencesBlock}

═══════════════════════════════════════════════════
PHASE 2 — DECIDE (think through these steps BEFORE writing any JSON)
═══════════════════════════════════════════════════
${getComponentDecisionTree(effectiveMode, complexity, operationType || "create", adjustedMin, adjustedMax)}

${techKnowledge}

═══════════════════════════════════════════════════
PHASE 3 — HARD CONSTRAINTS (never violate)
═══════════════════════════════════════════════════
${getTechValidationMatrix()}

POSITIONING GUIDELINES:
  Layer 1 (Entry/Edge): y: 50–150   → CDN, WAF, Load Balancer, API Gateway, Frontend
  Layer 2 (Application): y: 200–380 → Services, Auth, Workers, AI, Backend API
  Layer 3 (Data): y: 420–560        → Databases, Cache, Storage, Queues
  Horizontal spacing: 200–300px between nodes at the same layer
  NOTE: Full-stack frameworks (Next.js, Laravel, Django, Rails) often consolidate layers 1+2.
        Only separate them if high-scale distribution is explicitly needed.

CRITICAL OUTPUT RULES:
  1. Never exceed ${adjustedMax} components
  2. Never use fewer than ${adjustedMin} components${shouldRelax ? ` (relaxed for ${operationType} operation)` : ""}
  3. Never mix full-stack frameworks with separate backend frameworks (nextjs + express = INVALID)
  4. ${currentNodes && currentNodes.length > 0 ? "Preserve existing node IDs where possible — only change what was requested" : "Generate all new components with unique IDs"}
  5. EVERY third-party integration (Stripe, SendGrid, Twilio, etc.) must be its own "external" or "saas" node — never embed them in a backend node description

═══════════════════════════════════════════════════
PHASE 4 — BUILD (write the JSON architecture)
═══════════════════════════════════════════════════
Architecture pattern for ${detection.type}:
${getArchitectureGuidelines(detection.type)}

Technology context for your decisions:
${getTechRecommendations(detection.type, effectiveMode, complexity)}

═══════════════════════════════════════════════════
PHASE 5 — VALIDATE THEN OUTPUT
═══════════════════════════════════════════════════
${getSelfValidationChecklist()}

REQUIRED JSON FORMAT:
{
  "analysis": "Single sentence: the most important design trade-off or decision made",
  "nodes": [
    {
      "id": "unique-kebab-id",
      "type": "frontend|backend|database|gateway|cache|queue|ai|storage|external|saas|compute",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Display Name",
        "description": "One sentence: what this component does",
        "justification": "One sentence: WHY this specific tech for this specific use case",
        "tech": "technology-id-from-matrix",
        "serviceType": "same-value-as-type"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-unique-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "animated": true,
      "data": {
        "protocol": "https|http|websocket|grpc|database|cache|queue",
        "label": "Specific data description (e.g. 'JWT Auth Token', 'User Cart State', 'Payment Events')"
      }
    }
  ]
}

REFERENCE EXAMPLE FOR THIS MODE (${effectiveMode.toUpperCase()}):
${getFewShotExamples(effectiveMode)}

CONNECTION REQUIREMENTS:
  1. EVERY node except the single entry point must have at least ONE incoming edge
  2. Edge labels must name SPECIFIC data (not generic "data" or "request")
  3. Use "animated": true on all edges
  4. Protocol must match transport: database connections → "database", Redis ops → "cache", queue sends → "queue"

Now generate the complete JSON architecture. Start directly with {"analysis":`;
}
```

**Step 2: Verify compilation**

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero TypeScript errors.

**Step 3: Verify unused old helpers can be safely removed**

Check if `getModeConstraints` and `getComplexityGuidelines` are called anywhere outside `buildEnhancedSystemPrompt`:

```bash
grep -n "getModeConstraints\|getComplexityGuidelines\|getFrameworkCompatibilityRules" /Users/vinsanity/dev/personal/Simulark-AI/lib/prompt-engineering.ts
```

Expected: only definitions, no call sites (since we replaced all usage). They can be deleted.

---

## Task 5: Clean up dead code

Remove functions that are no longer called after the rewrite.

**Files:**
- Modify: `lib/prompt-engineering.ts`

**Step 1: Delete these functions** (they are replaced by the new helpers):
- `getModeConstraints()` — replaced by `getComponentDecisionTree()`
- `getComplexityGuidelines()` — replaced by `getComponentDecisionTree()`
- `getFrameworkCompatibilityRules()` — replaced by `getTechValidationMatrix()`

**Step 2: Verify `getArchitectureGuidelines()` and `getTechRecommendations()` are still called**

```bash
grep -n "getArchitectureGuidelines\|getTechRecommendations" /Users/vinsanity/dev/personal/Simulark-AI/lib/prompt-engineering.ts
```

Expected: definitions + call sites inside `buildEnhancedSystemPrompt`.

**Step 3: Final compile check**

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI && npx tsc --noEmit 2>&1
```

Expected: zero errors.

**Step 4: Run existing tests**

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI && npx vitest run tests/prompt-engineering.test.ts 2>&1 || npx jest tests/prompt-engineering.test.ts 2>&1 || echo "No test runner found — check package.json for test command"
```

Fix any test failures before committing.

---

## Task 6: Smoke test the output

Manually verify the prompt looks correct by adding a temporary log.

**Step 1: Create a quick smoke test script**

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI && cat > /tmp/smoke-test-prompt.ts << 'EOF'
import { buildEnhancedSystemPrompt, detectArchitectureType } from "./lib/prompt-engineering";

const detection = detectArchitectureType("build a simple todo app");
const prompt = buildEnhancedSystemPrompt({
  userInput: "build a simple todo app",
  architectureType: detection.type,
  detectedIntent: "simple web app",
  mode: "startup",
});

console.log("=== PROMPT LENGTH:", prompt.length, "chars ===");
console.log(prompt);
EOF
npx tsx /tmp/smoke-test-prompt.ts 2>&1 | head -100
```

**Step 2: Check the output**

Verify you can see:
- "PHASE 1 — UNDERSTAND THE REQUEST"
- "PHASE 2 — DECIDE"
- "TECH VALIDATION MATRIX"
- "COMPONENT COUNT DECISION TREE"
- "PHASE 5 — VALIDATE THEN OUTPUT"
- The few-shot example
- The self-validation checklist

**Step 3: Test with a Laravel preference to verify no regression**

```typescript
const laravelPrompt = buildEnhancedSystemPrompt({
  userInput: "build a web app",
  architectureType: "web-app",
  detectedIntent: "web app",
  mode: "default",
  userPreferences: { frameworks: ["laravel"] },
});
// Should contain "livewire" and "inertia" in the framework ecosystem rules
console.log(laravelPrompt.includes("livewire")); // must be true
console.log(laravelPrompt.includes("inertia"));  // must be true
```

---

## Task 7: Commit

```bash
cd /Users/vinsanity/dev/personal/Simulark-AI
git add lib/prompt-engineering.ts docs/plans/2026-03-04-prompt-engineering-think-then-build.md
git commit -m "feat: rewrite prompt engineering with phased think-then-build structure

- Replace flat instruction dump with 5-phase structured prompt
- Add hard tech validation matrix (table format) binding tech IDs to node types
- Add component count decision tree with explicit precedence
- Add few-shot golden examples per mode (startup/default/enterprise)
- Add self-validation checklist (10 checks model runs before output)
- Consolidate duplicate framework compatibility rules into single table
- Remove getModeConstraints/getComplexityGuidelines/getFrameworkCompatibilityRules

Fixes: wrong-tech-on-wrong-layer errors, component count bloat/under-provision

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
