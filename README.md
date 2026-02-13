# Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

---

## Overview

Simulark is an AI-powered platform that transforms natural language requirements into semantic, auto-arranged architecture diagrams. It serves as a high-fidelity CAD tool for backend development, bridging the gap between system design and implementation.

The platform solves the "Context Loss" problem in modern software engineering—where architectural intent is often lost during AI-assisted coding transitions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Browser   │  │   Mobile    │  │    IDE      │  │   Canvas Editor     │ │
│  │  (Next.js)  │  │  (PWA)      │  │ (Cursor/    │  │   (XYFlow)          │ │
│  │             │  │             │  │  Windsurf)  │  │                     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼──────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EDGE/MIDDLEWARE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐     │
│  │  Auth Callback  │  │  Rate Limiter  │  │      Context Bridge        │     │
│  │  (OAuth)        │  │  (Upstash)     │  │   (cursorrules export)    │     │
│  └────────┬────────┘  └────────┬────────┘  └─────────────┬──────────────┘     │
└───────────┼───────────────────┼─────────────────────────┼─────────────────────┘
            │                   │                         │
            ▼                   ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /generate  │  │   /chat     │  │ /projects   │  │    /admin/*        │ │
│  │  (AI Gen)   │  │  (Streaming)│  │  (CRUD)     │  │  (Subscriptions)   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼──────────────┘
          │                │                │                    │
          ▼                │                ▼                    ▼
┌─────────────────────────┐ │  ┌─────────────────────────────────────────────────┐
│      AI PROVIDERS      │ │  │              DATABASE (Supabase)                 │
├─────────────────────────┤ │  ├─────────────────────────────────────────────────┤
│  ┌─────────────────┐   │ │  │  ┌────────┐ ┌────────┐ ┌───────┐ ┌─────────┐  │
│  │    ZhipuAI      │   │ │  │  │ users  │ │projects│ │ graphs │ │  chats  │  │
│  │  (GLM-4.7)     │   │ │  │  └────────┘ └────────┘ └───────┘ └─────────┘  │
│  └─────────────────┘   │ │  │  ┌────────┐ ┌────────┐ ┌───────┐ ┌─────────┐  │
│  ┌─────────────────┐   │ │  │  │ messages│ │templates│ │contexts│ │api_keys │  │
│  │   OpenRouter    │   │ │  │  └────────┘ └────────┘ └───────┘ └─────────┘  │
│  │ (Multi-Provider)│   │ │  └─────────────────────────────────────────────────┘
│  └─────────────────┘   │ │
│  ┌─────────────────┐   │ │
│  │     Kimi       │   │ │
│  │   (Moonshot)   │   │ │
│  └─────────────────┘   │ │
└───────────────────────┘ │
                         │
                         ▼
              ┌─────────────────────┐
              │    UPSTASH         │
              │    (Redis)        │
              │  - Rate Limits    │
              │  - AI Response    │
              │    Cache          │
              └─────────────────────┘
```

---

## Features

### Interactive Architecture Canvas

- **20+ Semantic Node Types:** Gateway, Compute, Database, Queue, Cache, Storage, Functions, AI components
- **Smart Auto-Layout:** Dagre-directed graph algorithms for automatic arrangement
- **Dynamic Interaction:** Direct manipulation with referential integrity

### AI-Powered Generation

- **Deep Thinking Models:** GLM-4.7 Flash with reasoning capabilities
- **Multi-Provider Fallback:** ZhipuAI (primary), OpenRouter (fallback)
- **Streaming Responses:** Real-time SSE for AI thought process

### Visual Simulation

- **Protocol Visualization:** Animated data flows (HTTP/gRPC vs Queues/Streams)
- **Chaos Mode:** Fault tolerance testing with node "kill switches"
- **Congestion Detection:** Visual indicators for high fan-in/out

### Context Bridge

- **Live Context URLs:** Secure, read-only JSON endpoints
- **IDE Integration:** Generates `.cursorrules` and Markdown for Cursor/Windsurf
- **Export Options:** Mermaid, PNG, SVG, PDF

### User Experience

- **Dark Mode:** Fully supported dark/light themes with system detection
- **Responsive Design:** Optimized for mobile and desktop workstations

---

## Tech Stack

| Layer         | Technology                       |
| ------------- | -------------------------------- |
| Frontend      | Next.js 16, React 19, TypeScript |
| Styling       | Tailwind CSS v4, Shadcn/UI       |
| Canvas        | XYFlow (React Flow), Dagre       |
| State         | Zustand                          |
| Backend       | Bun Runtime, Server Actions      |
| Database      | Supabase (PostgreSQL + Auth)     |
| AI            | OpenAI SDK, ZhipuAI, OpenRouter  |
| Validation    | Valibot                          |
| Rate Limiting | Upstash Redis                    |

---

## Getting Started

### Prerequisites

- Bun runtime
- Supabase account
- AI provider API keys (ZhipuAI, OpenRouter)

### Installation

```bash
# Clone and install
git clone https://github.com/your-repo/simulark-app.git
cd simulark-app
bun install

# Configure environment
cp .env.example .env.local

# Start development
bun dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Providers
ZHIPU_API_KEY=
OPENROUTER_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## API Reference

### Generate Architecture

```http
POST /api/generate
Content-Type: application/json

{
  "prompt": "Design a serverless e-commerce backend",
  "model": "glm-4.7-flash",
  "mode": "startup"
}
```

### Health Check

```http
GET /api/health
```

---

## Subscription Plans

| Plan                     | Price | Features                                                          |
| ------------------------ | ----- | ----------------------------------------------------------------- |
| **Doodle** (Free)        | $0    | 3 Projects, Standard Nodes, 10 AI requests/day                    |
| **Sketch** (Starter)     | $5/mo | Unlimited Projects, Chaos Mode, Auto-Layouts, Kimi/Gemini/Minimax |
| **Blueprint** (Lifetime) | $10   | Forever Access, Commercial Rights, Private Mode, Claude Opus 4.5  |

---

## License

MIT License.

---

## Acknowledgments

- [XYFlow](https://xyflow.com) — Canvas library
- [Valibot](https://valibot.dev/) — Schema validation
- [Supabase](https://supabase.com) — Auth & database
- [ZhipuAI](https://zhipuai.com) — GLM MODEL
