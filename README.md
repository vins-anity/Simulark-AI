# Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

---

## Overview

Simulark is an AI-powered platform that transforms natural language requirements into semantic, auto-arranged architecture diagrams. It serves as a high-fidelity CAD tool for backend development, bridging the gap between system design and implementation. With our new **Brutalist Design System**, Simulark focuses on clarity, structural integrity, and raw functionality for developers.

The platform solves the "Context Loss" problem in modern software engineering—where architectural intent is often lost during AI-assisted coding transitions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER (Next.js 16)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Browser   │  │ Dashboard   │  │ AIAssistant │  │   Canvas Editor     │ │
│  │  (Web UI)   │  │ (Projects)  │  │ (Deep Chat) │  │   (XYFlow)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼──────────────┘
          │                │                │                    │
          ▼                ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API & MIDDLEWARE LAYER                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │  Auth & Oauth   │  │  Rate Limiter   │  │      Export & Bridge         │ │
│  │  (Supabase)     │  │  (Upstash)      │  │  (Mermaid & Cursorrules)     │ │
│  └────────┬────────┘  └────────┬────────┘  └─────────────┬──────────────┘ │
└───────────┼────────────────────┼─────────────────────────┼────────────────┘
            │                    │                         │
            ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CORE SERVICES (React Server Components/Actions)    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /generate  │  │   /chat     │  │ /projects   │  │ /quality-check      │ │
│  │  (AI Gen)   │  │ (Streaming) │  │   (CRUD)    │  │ (Arch Validation)   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
└─────────┼────────────────┼────────────────┼────────────────────┼──────────────┘
          │                │                │                    │
          ▼                │                ▼                    ▼
┌─────────────────────────┐│  ┌─────────────────────────────────────────────────┐
│      AI PROVIDERS       ││  │              DATABASE (Supabase)                │
├─────────────────────────┤│  ├─────────────────────────────────────────────────┤
│  ┌─────────────────┐    ││  │  ┌────────┐ ┌────────┐ ┌───────┐ ┌─────────┐  │
│  │    ZhipuAI      │    ││  │  │ users  │ │projects│ │ graphs│ │  chats  │  │
│  │  (GLM-4.7)      │    ││  │  └────────┘ └────────┘ └───────┘ └─────────┘  │
│  └─────────────────┘    ││  │  ┌────────┐ ┌────────┐ ┌───────┐ ┌─────────┐  │
│  ┌─────────────────┐    ││  │  │messages│ │templates││contexts││api_keys │  │
│  │   OpenRouter    │    ││  │  └────────┘ └────────┘ └───────┘ └─────────┘  │
│  │ (Multi-Provider)│    ││  └─────────────────────────────────────────────────┘
│  └─────────────────┘    ││
└─────────────────────────┘│
                           ▼
                ┌─────────────────────┐
                │    UPSTASH          │
                │    (Redis)          │
                │  - Rate Limits      │
                │  - AI Cache         │
                └─────────────────────┘
```

---

## Key Features

### Interactive Architecture Canvas

- **Comprehensive Node Ecosystem (20+ Semantic Types):** Gateway, Compute, Database, Queue, Cache, Storage, Functions, AI Nodes, Security, Payment, CI/CD, and more.
- **Smart Auto-Layout:** Dagre-directed graph algorithms for automatic structured arrangement.
- **Dynamic Interaction:** Direct manipulation with referential integrity.
- **Template Blueprints:** Start fast with predefined, scalable cloud patterns.

### AI-Powered Generation & deep assistance

- **Deep Thinking Models:** Built around GLM-4.7 Flash with robust reasoning capabilities.
- **Embedded AI Assistant Panel:** Integrated side-panel to chat directly regarding project architecture context.
- **Multi-Provider Fallback:** Intelligent request routing between ZhipuAI and OpenRouter to prevent outages.
- **Streaming Responses:** Real-time SSE for observing the AI thought process.

### Intelligent Analysis & Export

- **Quality Check:** Validate graph structures, highlighting potential architectural flaws or security bottlenecks.
- **Export "Skills" Bridge:** Convert architecture directly to contextual text (`.cursorrules`), Markdown, SVG, PDF, PNG, or high-fidelity Mermaid syntax for Cursor/Windsurf.
- **Project Documents:** AI seamlessly extracts constraints and architectural contexts and stores them against the project repository.

### Developer Experience

- **Brutalist Design:** A stark, functional UI powered by advanced CSS techniques and Framer Motion.
- **Comprehensive Onboarding Flow:** Custom guided multistep tours for new users and organizations.
- **Dark Mode:** Fully supported dark/light themes with system detection.

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| **Frontend**   | Next.js 16.1.6, React 19, TypeScript      |
| **Styling**    | Tailwind CSS v4, Shadcn/UI, Framer Motion |
| **Canvas**     | XYFlow (React Flow), Dagre                |
| **State**      | Zustand                                   |
| **Backend**    | Bun Runtime, Server Actions               |
| **Database**   | Supabase (PostgreSQL + Auth SSR)          |
| **AI**         | Vercel AI SDK, ZhipuAI, OpenRouter        |
| **Validation** | Valibot                                   |
| **Cache/RL**   | Upstash Redis                             |

---

## Getting Started

### Prerequisites

- Bun runtime v1+
- Supabase project
- AI provider API keys (ZhipuAI, OpenRouter)
- Upstash Redis instance

### Installation

```bash
# Clone and install
git clone https://github.com/your-repo/simulark-app.git
cd simulark-app
bun install

# Configure environment variables
cp .env.example .env.local

# Run Next.js securely atop Bun
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

## Subscription Plans

| Plan                     | Price | Features                                                           |
| ------------------------ | ----- | ------------------------------------------------------------------ |
| **Doodle** (Free)        | $0    | 3 Projects, Standard Nodes, 10 AI requests/day                     |
| **Sketch** (Starter)     | $5/mo | Unlimited Projects, Full node suite, Auto-Layouts, Fallback Models |
| **Blueprint** (Lifetime) | $10   | Forever Access, Commercial Rights, Priority Support                |

---

## License

MIT License.

---

## Acknowledgments

- [XYFlow](https://xyflow.com) — Powering our core architecture canvas.
- [Valibot](https://valibot.dev/) — Making schema validation type-safe & lightweight.
- [Supabase](https://supabase.com) — Best-in-class open-source Postgres auth & db.
- [ZhipuAI](https://zhipuai.com) — Driving our intelligent graph reasoning logic.
