# Simulark

**AI-assisted backend architecture design — free public beta**

Simulark turns plain-English descriptions into interactive architecture diagrams you can edit, stress-test, and export. Projects persist in Supabase; inference runs on **DeepSeek V4 Flash / Pro** via Alibaba Cloud DashScope.

---

## What it does today

- **Interactive canvas** — 20+ semantic node types on XYFlow, undo/redo, auto-layout (Dagre flow, hierarchical, radial)
- **AI assistant** — chat-driven architecture generation with Flash (fast) and Pro (deeper reasoning) tiers
- **Chaos & stress testing** — visual failure simulation and AI-assisted stress plans
- **Export** — PNG, SVG, PDF, Mermaid, and agent skill (auto-copies to clipboard + downloads files)
- **Persistence** — autosaved projects, version snapshots, chat history per project
- **Fair-use limits** — per-user daily caps, burst rate limiting, and IP limits via Upstash Redis

---

## What it does not do (yet)

- No subscriptions or paid tiers — everything is free during the beta
- No Terraform / CloudFormation generation from the UI
- No team collaboration or shared workspaces
- No MCP server — IDE context is exported as skills and REST context, not live MCP

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js 16 + React 19)                  │
│   Dashboard · Project editor (XYFlow) · AI assistant panel              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API ROUTES                                      │
│   /api/chat (primary) · /api/export-skill · /api/stress-tests/*         │
│   /api/quality-check · Server Actions (projects, chats)               │
└───────────────┬─────────────────────────────┬───────────────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────────────┐
│  DashScope (DeepSeek V4)   │   │  Supabase (PostgreSQL + Auth)           │
│  Flash + Pro inference     │   │  projects · chats · messages · usage    │
└───────────────────────────┘   └─────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────┐
│  Upstash Redis           │
│  Rate limits · AI cache  │
└───────────────────────────┘
```

---

## Tech stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | Next.js 16, React 19, TypeScript, Tailwind v4   |
| Canvas       | XYFlow, Dagre                                   |
| State        | Zustand                                         |
| Runtime      | Bun                                             |
| Database     | Supabase (PostgreSQL + Auth)                      |
| AI           | DeepSeek V4 via DashScope (OpenAI-compatible)   |
| Cache / RL   | Upstash Redis                                   |
| Validation   | Valibot                                         |
| Linting      | Biome                                           |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) v1+
- Supabase project
- DashScope API key (Alibaba Cloud Model Studio)
- Upstash Redis (recommended for production rate limits + AI response cache)

### Install

```bash
git clone https://github.com/your-org/simulark-app.git
cd simulark-app
bun install
cp .env.example .env.local   # if present, or create from below
bun dev
```

### Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI — Alibaba Cloud DashScope (DeepSeek V4)
DASHSCOPE_API_KEY=
DASHSCOPE_WORKSPACE_ID=

# Rate limiting & AI cache (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
FREE_TIER_DAILY_LIMIT=50
FLASH_DAILY_LIMIT=80
PRO_DAILY_LIMIT=25
IP_DAILY_LIMIT=60
BURST_RATE_LIMIT=8
BURST_RATE_WINDOW_SECONDS=60

# App
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## Scripts

```bash
bun dev          # Development server
bun run build    # Production build
bun run lint     # Biome lint
bun run format   # Auto-fix formatting
bun test         # Vitest suite
```

---

## License

MIT License.

---

## Acknowledgments

- [XYFlow](https://xyflow.com) — Interactive architecture canvas
- [Supabase](https://supabase.com) — Auth and project persistence
- [DeepSeek](https://www.deepseek.com) / Alibaba Cloud DashScope — Inference
- [Upstash](https://upstash.com) — Rate limiting and response cache
