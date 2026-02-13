# Simulark Codebase Comprehensive Analysis

> **Generated:** 2026-02-13  
> **Version:** 1.0.0  
> **Analyzer:** Architect Mode

---

## 1. Executive Summary

**Simulark** is an AI-powered "Generative UI" platform designed to bridge the gap between high-level system design and low-level implementation. The platform transforms natural language requirements into semantic, auto-arranged diagrams with active visual data flows, serving as a high-fidelity CAD tool specifically engineered for backend development.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Files** | ~150+ TypeScript/TSX files |
| **Frontend Pages** | 25+ routes |
| **Custom Node Types** | 20+ node types |
| **Database Tables** | 13 tables |
| **AI Providers** | 6 providers (ZhipuAI, OpenRouter, Kimi, Google, Minimax, Anthropic) |

---

## 2. Technology Stack Analysis

### 2.1 Core Framework

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  React 19.2.3  │  Next.js 16.1.6  │  TypeScript 5.x       │
│  Tailwind CSS 4 │  Shadcn/UI      │  Radix Primitives     │
│  XYFlow 12.10  │  Framer Motion   │  Zustand              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Bun Runtime    │  Next.js API Routes  │  Server Actions   │
│  Supabase Auth │  PostgreSQL           │  Upstash Redis     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI/ML LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  OpenAI SDK    │  ZhipuAI Provider   │  Valibot           │
│  Multi-Provider│  Streaming (SSE)    │  Resilience Layer  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Dependencies Breakdown

#### Production Dependencies (Key)
- **UI Framework:** `@xyflow/react` (Canvas), `react` 19.2.3, `next` 16.1.6
- **Styling:** `tailwindcss` 4, `class-variance-authority`, `clsx`, `tailwind-merge`
- **UI Components:** `@radix-ui/*` (Dialog, Select, Dropdown, etc.)
- **State:** `zustand` (client state), `@supabase/ssr` (server state)
- **AI:** `ai` 6.0.79, `openai` 6.17.0, `@ai-sdk/react`, `@ai-sdk/openai`
- **Providers:** `@openrouter/ai-sdk-provider`, `zhipu-ai-provider`
- **Database:** `@supabase/supabase-js` 2.93.3, `@supabase/ssr` 0.8.0
- **Rate Limiting:** `@upstash/ratelimit`, `@upstash/redis`
- **Utilities:** `valibot` 1.2.0, `dagre` (layout), `framer-motion`

#### Dev Dependencies
- **Linting:** `@biomejs/biome` 2.2.0
- **TypeScript:** `@types/node`, `@types/react`, `@types/dagre`
- **Build:** `babel-plugin-react-compiler`

---

## 3. Frontend Architecture

### 3.1 Project Structure

```
components/
├── canvas/                    # Core canvas components
│   ├── FlowEditor.tsx        # Main canvas editor (XYFlow)
│   ├── AIAssistantPanel.tsx  # AI chat panel
│   ├── ChaosModePanel.tsx    # Fault simulation panel
│   ├── TechCombobox.tsx     # Technology selector
│   ├── ThinkingPanel.tsx     # AI reasoning display
│   ├── nodes/               # 20+ custom node types
│   │   ├── BaseNode.tsx     # Base node component
│   │   ├── GatewayNode.tsx
│   │   ├── ServiceNode.tsx
│   │   ├── DatabaseNode.tsx
│   │   ├── QueueNode.tsx
│   │   ├── AIModelNode.tsx
│   │   └── ... (15+ more)
│   └── edges/
│       └── SimulationEdge.tsx
├── ui/                       # Shadcn UI components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   └── ... (10+ more)
├── layout/
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   └── SidebarProvider.tsx
├── marketing/
│   ├── Hero.tsx
│   ├── FeatureShowcase.tsx
│   └── ... (15+ more)
└── auth/
    ├── AuthLayout.tsx
    └── OAuthButton.tsx
```

### 3.2 Canvas System

#### Node Architecture

```typescript
// Node Type Hierarchy
BaseNode (all nodes inherit from this)
├── GatewayNode
├── ServiceNode  
├── FunctionNode
├── DatabaseNode
├── QueueNode
├── CacheNode
├── StorageNode
├── MessagingNode
├── MonitoringNode
├── SecurityNode
├── CICDNode
├── PaymentNode
├── VectorDBNode
├── ClientNode
├── AINode
├── AIModelNode
├── AuthNode
├── AutomationNode
└── TextNode
```

#### Node Data Model

```typescript
interface NodeData {
  label: string;           // Display label
  tech?: string;           // Technology (e.g., "PostgreSQL", "Redis")
  techLabel?: string;      // Tech version label
  logo?: string;           // Iconify icon string
  tier?: string;           // Tier info (e.g., "Serverless")
  status?: NodeStatus;    // active | killed | degraded | recovering
  // ... node-specific properties
}
```

#### Edge System

```typescript
interface EdgeData {
  label?: string;          // Connection label
  protocol?: string;       // http | grpc | ws | queue
  status?: EdgeStatus;    // active | blocked | degraded | high_latency
  animated?: boolean;     // Animation enabled
}
```

### 3.3 Chaos Mode & Simulation

The [`lib/store.ts`](lib/store.ts) implements a sophisticated simulation system:

```typescript
// Failure Types
type FailureType = 
  | "node_failure"
  | "network_partition" 
  | "high_latency"
  | "packet_loss"
  | "cascade_failure"
  | "resource_exhaustion";

// Node/Edge States
type NodeStatus = "active" | "killed" | "degraded" | "recovering";
type EdgeStatus = "active" | "blocked" | "degraded" | "high_latency";

// Metrics Tracking
interface SimulationMetrics {
  availability: number;  // 0-100%
  latency: number;       // ms
  errorRate: number;     // 0-100%
  throughput: number;    // req/s
}
```

### 3.4 Auto-Layout System

The [`lib/layout.ts`](lib/layout.ts) (29KB) provides automatic graph arrangement using the Dagre algorithm:

```typescript
type LayoutAlgorithm = "dagre" | "elk" | "force";

interface LayoutOptions {
  direction: "TB" | "LR" | "BT" | "RL";  // Top-Bottom, Left-Right, etc.
  rankSep: number;     // Vertical spacing
  nodeSep: number;    // Horizontal spacing
  algorithm: LayoutAlgorithm;
}
```

---

## 4. Backend Architecture

### 4.1 API Routes Structure

```
app/api/
├── admin/
│   ├── lifecycle/         # User lifecycle management
│   └── subscriptions/     # Subscription CRUD
├── chat/
│   └── route.tsx          # AI chat endpoint
├── chats/
│   ├── route.ts           # Chat list CRUD
│   └── [id]/
│       ├── route.ts       # Chat detail
│       └── messages/
│           └── route.ts   # Message CRUD
├── context/
│   └── [id]/route.ts      # Context endpoints
├── export-skill/
│   └── route.ts           # AI Skill export
├── generate/
│   └── route.ts           # Architecture generation (core AI)
├── health/
│   └── route.ts           # Health check
├── projects/
│   ├── route.ts           # Project list
│   └── [id]/route.ts      # Project detail
├── simulark/
│   └── context/route.ts   # Context bridge
└── docs/
    └── route.ts           # Documentation
```

### 4.2 Server Actions

```typescript
// actions/projects.ts
export async function createProject(name: string, provider?: string)
export async function updateProjectName(projectId: string, name: string)
export async function saveProject(projectId: string, nodes: Node[], edges: Edge[])
export async function deleteProject(projectId: string)
export async function getProject(projectId: string)
export async function listProjects()
export async function duplicateProject(projectId: string)

// actions/chats.ts
export async function createChat(projectId: string)
export async function getProjectChats(projectId: string)
export async function addMessage(chatId: string, message: Message)
export async function deleteChat(chatId: string)
```

### 4.3 Generate Architecture Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│  /api/generate │────▶│ AI Client   │
│  (prompt)    │     │  (validate)   │     │  (stream)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ Rate Limit   │     │  Valibot    │
                     │ (Upstash)    │     │  (validate) │
                     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ AI Cache     │     │ Tech Normalizer │
                     │ (response)   │     │ (enrich)     │
                     └──────────────┘     └──────────────┘
```

---

## 5. AI/ML Pipeline

### 5.1 Multi-Provider Architecture

The [`lib/ai-client.ts`](lib/ai-client.ts) implements a resilient multi-provider system:

```typescript
// Supported Providers
type AIProvider = 
  | "zhipu"        // Primary - GLM-4.7 Flash
  | "openrouter"   // Fallback - Z-AI GLM-4.5 Air
  | "kimi"         // Kimi K2.5
  | "google"       // Gemini via OpenRouter
  | "minimax"      // Minimax M2.1 via OpenRouter
  | "anthropic";   // Claude via OpenRouter
```

#### Provider Configuration

| Provider | Base URL | Model | Reasoning |
|----------|----------|-------|-----------|
| **ZhipuAI** | `open.bigmodel.cn/api/paas/v4` | `glm-4.7-flash` | ✅ Enabled |
| **OpenRouter** | `openrouter.ai/api/v1` | `z-ai/glm-4.5-air:free` | ✅ Enabled |
| **Kimi** | `api.moonshot.ai/v1` | `kimi-k2.5` | ❌ |
| **Google** | `openrouter.ai/api/v1` | `google/gemini-3-pro-preview` | ❌ |
| **Minimax** | `openrouter.ai/api/v1` | `minimax/minimax-m2.1` | ❌ |
| **Anthropic** | `openrouter.ai/api/v1` | `anthropic/claude-3-opus` | ❌ |

### 5.2 Prompt Engineering System

The [`lib/prompt-engineering.ts`](lib/prompt-engineering.ts) (44KB) provides sophisticated prompt building:

```typescript
// Architecture Types
type ArchitectureType = 
  | "web-app"
  | "ai-pipeline"
  | "microservices"
  | "monolithic"
  | "serverless"
  | "data-pipeline"
  | "mobile-app"
  | "desktop-app"
  | "iot-system"
  | "blockchain"
  | "mixed"
  | "unknown";

// Complexity Detection
type ComplexityLevel = "simple" | "medium" | "complex";

// Generation Modes
type ArchitectureMode = "startup" | "corporate" | "enterprise";
```

### 5.3 Resilience Patterns

The [`lib/ai-resilience.ts`](lib/ai-resilience.ts) implements:

1. **Retry Logic:** Exponential backoff for transient failures
2. **Circuit Breaker:** Prevents cascading failures
3. **Timeout Handling:** 30-second request timeout
4. **Fallback Chain:** Zhipu → OpenRouter → Error

```typescript
// Circuit Breaker States
type CircuitState = "closed" | "open" | "half-open";

// Rate Limiting
interface RateLimitConfig {
  limit: number;      // Requests per window
  window: number;     // Window in seconds
  key: string;        // User ID
}
```

### 5.4 Technology Normalization

The [`lib/tech-normalizer.ts`](lib/tech-normalizer.ts) (21KB) maps user input to canonical technologies:

```typescript
interface TechMapping {
  id: string;
  aliases: string[];
  category: TechCategory;
  icon: string;
  defaultNodeType: string;
}
```

The [`lib/tech-ecosystem.ts`](lib/tech-ecosystem.ts) (60KB) contains a comprehensive database of 200+ technologies across categories:

- Frontend (React, Vue, Angular, Next.js)
- Backend (Node.js, Python, Go, Java)
- Databases (PostgreSQL, MySQL, MongoDB, Redis)
- Cloud (AWS, GCP, Azure services)
- AI/ML (OpenAI, HuggingFace, LangChain)
- DevOps (Docker, Kubernetes, Terraform)

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │ subscription│       │  projects   │
│             │       │   _tiers    │       │             │
│ - id (PK)   │◀──────│ - id (PK)   │       │ - id (PK)   │
│ - email     │       │ - name      │       │ - user_id   │────┐
│ - tier_id   │       │ - features  │       │ - name      │    │
│ - created   │       │ - limits    │       │ - status    │    │
└─────────────┘       └─────────────┘       └─────────────┘    │
                                                      │        │
                                                      ▼        │
                         ┌─────────────┐       ┌─────────────┐  │
                         │   graphs    │◀──────│   chats     │──┘
                         │             │       │             │
                         │ - id (PK)   │       │ - id (PK)   │
                         │ - project_id│       │ - project_id│
                         │ - nodes     │       │ - user_id   │
                         │ - edges     │       │ - messages  │
                         └─────────────┘       └─────────────┘
                                │                     │
                                ▼                     ▼
                         ┌─────────────┐       ┌─────────────┐
                         │    nodes    │       │  messages   │
                         │             │       │             │
                         │ - id (PK)   │       │ - id (PK)   │
                         │ - graph_id  │       │ - chat_id   │
                         │ - type      │       │ - role      │
                         │ - position  │       │ - content   │
                         │ - data      │       │ - tokens    │
                         └─────────────┘       └─────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │    edges    │
                         │             │
                         │ - id (PK)   │
                         │ - graph_id  │
                         │ - source    │
                         │ - target    │
                         │ - type      │
                         └─────────────┘
```

### 6.2 Key Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | id, email, subscription_tier, preferences |
| `subscription_tiers` | Pricing tiers | name, price, features, limits |
| `projects` | User projects | user_id, name, status, settings |
| `graphs` | Canvas state | project_id, nodes, edges, viewport |
| `chats` | AI conversations | project_id, messages, context |
| `contexts` | Reusable configs | user_id, content, type, tags |
| `templates` | Project templates | graph_data, category, is_premium |
| `api_keys` | User API keys | provider, api_key_encrypted |
| `audit_logs` | Security tracking | user_id, action, details |
| `usage_analytics` | Usage tracking | user_id, metric_type, count |

### 6.3 Row-Level Security (RLS)

The database implements RLS policies for:
- Users can only access their own projects
- Subscription tier-based feature access
- Public/private project visibility
- Audit logging for sensitive operations

---

## 7. State Management

### 7.1 Client State (Zustand)

#### Simulation Store ([`lib/store.ts`](lib/store.ts))

```typescript
interface SimulationState {
  viewMode: ViewMode;
  chaosMode: boolean;
  nodeStatus: Record<string, NodeStatus>;
  edgeStatus: Record<string, EdgeStatus>;
  failureEvents: FailureEvent[];
  metrics: SimulationMetrics;
  
  // Actions
  setChaosMode(enabled: boolean): void;
  killNode(nodeId: string): void;
  resurrectNode(nodeId: string): void;
  degradeNode(nodeId: string): void;
  blockEdge(edgeId: string): void;
  addFailureEvent(event: FailureEvent): void;
}
```

#### History Store ([`lib/history-store.ts`](lib/history-store.ts))

- Undo/redo for canvas operations
- State snapshots with timestamps
- Maximum history depth: 50 states

### 7.2 Server State

- **Supabase Auth:** User sessions via `@supabase/ssr`
- **Database:** PostgreSQL via `@supabase/supabase-js`
- **Caching:** Upstash Redis for AI responses

---

## 8. Security Architecture

### 8.1 Authentication

- **Provider:** Supabase Auth
- **Methods:** Email/password, OAuth (Google, GitHub)
- **Session:** HTTP-only cookies via `@supabase/ssr`

### 8.2 Authorization

```typescript
// RLS Policies
- users: SELECT by id
- projects: SELECT/INSERT/UPDATE/DELETE by user_id
- graphs: SELECT by project.user_id
- chats: SELECT/INSERT by project.user_id
```

### 8.3 Rate Limiting

- **Provider:** Upstash Redis
- **Strategy:** Tier-based daily limits
- **Free Tier:** 10 requests/day
- **Headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### 8.4 Environment Security

```typescript
// Server-only variables (env.ts)
- ZHIPU_API_KEY
- KIMI_API_KEY
- OPENROUTER_API_KEY
- SUPABASE_SERVICE_ROLE_KEY
- UPSTASH_REDIS_REST_URL/TOKEN

// Client-safe variables (NEXT_PUBLIC_*)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 9. Key Design Patterns

### 9.1 Discriminated Unions for Error Handling

```typescript
// Server Actions return type
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// API Responses
type APIResponse<T> = 
  | { status: "success"; data: T }
  | { status: "error"; message: string; code: string };
```

### 9.2 Builder Pattern for Prompts

```typescript
// lib/prompt-engineering.ts
const prompt = buildEnhancedSystemPrompt({
  userInput: prompt,
  architectureType: detection.type,
  detectedIntent: intent,
  currentNodes,
  currentEdges,
  mode,
});
```

### 9.3 Provider Abstraction

```typescript
// lib/ai-client.ts
const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  zhipu: { baseURL, apiKey, model, reasoningParam },
  openrouter: { ... },
  // ...
};

function createAIClient(provider: AIProvider) {
  return new OpenAI({ baseURL: config.baseURL, apiKey });
}
```

### 9.4 Component Composition

```typescript
// FlowEditor.tsx - Composable node system
const nodeTypes = {
  gateway: GatewayNode,
  service: ServiceNode,
  database: DatabaseNode,
  queue: QueueNode,
  // ...
};
```

---

## 10. Feature Flags System

The [`lib/feature-flags.ts`](lib/feature-flags.ts) implements a flexible feature gating system:

```typescript
// Master switches
ENABLE_ALL_FEATURES=true|false
RESTRICT_FEATURES_BY_TIER=true|false

// Per-feature tier restrictions
FEATURE_PRIVATE_MODE_TIERS=pro
FEATURE_CHAOS_ENGINEERING_TIERS=starter,pro
FEATURE_AUTO_LAYOUTS_TIERS=starter,pro
// ... 10+ more features
```

---

## 11. Performance Considerations

### 11.1 Optimizations

1. **Streaming Responses:** SSE for real-time AI output
2. **Response Caching:** AI responses cached in Redis
3. **Request Deduplication:** Prevent duplicate API calls
4. **Web Workers:** Layout calculations in background thread
5. **Image Export:** Client-side PNG/SVG generation

### 11.2 Bundle Size Concerns

| File | Size | Notes |
|------|------|-------|
| `lib/prompt-engineering.ts` | 44KB | Large prompt templates |
| `lib/tech-ecosystem.ts` | 60KB | Tech database |
| `lib/layout.ts` | 29KB | Dagre integration |
| `components/canvas/*` | ~200KB+ | Node components |

---

## 12. Identified Issues & Recommendations

### 12.1 High Priority

1. **Strict Mode TypeScript:** Some files have `any` types that should be properly typed
2. **Error Handling Consistency:** Some API routes lack comprehensive error handling
3. **Missing Tests:** No test files visible (vitest.config.ts.bak exists but no tests)

### 12.2 Medium Priority

1. **Bundle Size:** Consider code splitting for large libraries
2. **Edge Cases:** Some node types lack complete schema validation
3. **Monitoring:** No application performance monitoring (APM) visible

### 12.3 Low Priority

1. **Documentation:** Some complex functions lack JSDoc comments
2. **Logging:** Consider structured logging (currently uses console)
3. **CI/CD:** No visible CI/CD configuration files

---

## 13. File Inventory

### Core Application Files

| Path | Purpose | Lines |
|------|---------|-------|
| `app/api/generate/route.ts` | AI architecture generation | 300+ |
| `lib/ai-client.ts` | Multi-provider AI client | 274 |
| `lib/prompt-engineering.ts` | Prompt construction | 1200+ |
| `lib/tech-ecosystem.ts` | Technology database | 1500+ |
| `lib/store.ts` | Simulation state | 284 |
| `lib/layout.ts` | Auto-layout engine | 700+ |
| `components/canvas/FlowEditor.tsx` | Main canvas | 600+ |
| `components/canvas/AIAssistantPanel.tsx` | AI chat UI | 1200+ |

### Database Migrations

| File | Purpose |
|------|---------|
| `20260131_init_schema.sql` | Initial schema |
| `20260201_rate_limiting.sql` | Rate limit tables |
| `20260202_chat_history.sql` | Chat/messages |
| `20260210_enhanced_subscriptions.sql` | Subscription tiers |
| `20260210_security_fixes.sql` | RLS policies |

---

## 14. Summary

Simulark is a well-architected full-stack application with:

- ✅ **Modern Tech Stack:** Next.js 16, React 19, TypeScript, Bun
- ✅ **Sophisticated AI Pipeline:** Multi-provider, streaming, resilient
- ✅ **Rich Canvas System:** 20+ node types, auto-layout, chaos simulation
- ✅ **Solid Backend:** Server Actions, proper auth, rate limiting
- ✅ **Clean Architecture:** Separation of concerns, proper typing, error handling
- ⚠️ **Room for Improvement:** Testing, monitoring, bundle optimization

The codebase demonstrates good engineering practices and is well-structured for a complex AI-powered design tool.

---

*End of Analysis*
