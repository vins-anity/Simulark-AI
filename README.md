# Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

Simulark is an AI-powered "Generative UI" platform designed to bridge the gap between high-level system design and low-level implementation. By transforming natural language requirements into semantic, auto-arranged diagrams with active visual data flows, Simulark acts as a high-fidelity Computer-Aided Design (CAD) tool specifically engineered for backend development.

The platform addresses the "Context Loss" problem inherent in modern software engineering, where architectural intent is often lost when transitioning to AI-assisted coding. Simulark ensures that the visual model serves as the single source of truth for both human stakeholders and AI agents.

---

## Core Features

### Interactive Architecture Canvas
Simulark provides a professional-grade visual environment built on **XYFlow (React Flow)**, offering capabilities far beyond static diagramming tools.
- **Semantic Components**: Specialized nodes with strict semantic definitions for Gateways, Compute services, Databases, Queues, Caches, Storage, Functions, and AI components.
- **Smart Auto-Layout**: Automatic arrangement using directed graph algorithms (Dagre) for legibility even with complex distributed systems.
- **Dynamic Interaction**: Direct manipulation of architecture with referential integrity between components.

### Agentic "Deep Thinking" Generation
A sophisticated multi-stage AI pipeline generates technically sound architectures.
- **Reasoning-First Approach**: Leveraging models with "Deep Thinking" capabilities (GLM-4.7 Flash) to analyze constraints before generating visual elements.
- **Multi-Provider Fallback**: Hybrid pipeline using **ZhipuAI** (primary) and **OpenRouter** (fallback) for high availability.
- **Streaming Architecture**: Server-Sent Events (SSE) stream the AI's thought process directly to the UI.

### Visual Simulation & Resilience Testing
Beyond static diagrams with runtime behavior visualization.
- **Protocol Visualization**: Animated data flows representing protocol nature (HTTP/gRPC vs Queues/Streams).
- **Chaos Mode**: Gamified simulation for fault tolerance testing. "Kill Switch" on nodes triggers failure simulation.
- **Congestion Detection**: Visual indicators when nodes have high fan-in/out.

### The Context Bridge
Modern AI-assisted workflow context provider.
- **Live Context URL**: Secure, read-only JSON endpoints for current architectural state.
- **IDE Integration**: Generates `.cursorrules` and Markdown context for **Cursor** and **Windsurf**.
- **Skill Export**: Downloadable AI Skills (SKILL.md) for use with AI coding agents.
- **Export Options**: Mermaid diagrams, PNG, SVG, PDF formats.

---

## Technical Architecture

A modern, type-safe stack designed for performance and maintainability.

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand for global client state
- **Canvas Engine**: XYFlow (React Flow) with Dagre layout
- **UI Components**: Shadcn/UI with Radix primitives
- **Animations**: Framer Motion

### Backend & Infrastructure
- **Runtime**: Bun runtime for fast execution
- **Authentication & Database**: Supabase (Auth + PostgreSQL)
- **Security**: Row-Level Security (RLS) policies
- **Rate Limiting**: Upstash Redis with tiered limits
- **AI Providers**: ZhipuAI (GLM-4.7 Flash), OpenRouter

### AI & Validation
- **Schema Validation**: Valibot for runtime validation of AI-generated JSON
- **Streaming**: Server-Sent Events for real-time AI responses
- **Tech Ecosystem**: Normalized technology mappings for consistent rendering

---

## Project Structure

```
simulark-app/
├── actions/                 # Server Actions (AI orchestration, DB ops)
├── app/                     # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── generate/        # AI architecture generation endpoint
│   │   ├── chats/          # Chat history management
│   │   ├── projects/       # Project CRUD operations
│   │   ├── health/         # Health check endpoint
│   │   └── export-skill/   # Skill export functionality
│   ├── dashboard/           # Protected dashboard pages
│   └── projects/[id]/       # Project editor
├── components/
│   ├── canvas/              # Core canvas components
│   │   ├── nodes/          # Custom node definitions
│   │   ├── edges/          # Custom edge behaviors
│   │   └── FlowEditor.tsx  # Main canvas component
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── lib/
│   ├── ai-client.ts         # AI provider abstraction
│   ├── ai-orchestrator.ts   # Multi-agent orchestration
│   ├── schema/              # Valibot schemas
│   ├── store.ts             # Zustand stores
│   ├── tech-normalizer.ts   # Technology normalization
│   ├── skill-generator.ts   # AI Skill export logic
│   └── logger.ts            # Production logging
├── supabase/
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

---

## Getting Started

### Prerequisites
- **Bun**: Runtime for fast dependency installation
- **Supabase**: Backend (Auth + Database)
- **API Keys**: ZhipuAI and/or OpenRouter for generative features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/simulark-app.git
   cd simulark-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Required environment variables:
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

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Application available at `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
```

---

## API Reference

### Generate Architecture
```typescript
POST /api/generate
Content-Type: application/json

{
  "prompt": "Design a serverless e-commerce backend",
  "model": "glm-4.7-flash",
  "mode": "startup",  // startup | corporate | default
  "quickMode": false
}
```

### Health Check
```typescript
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2026-02-09T...",
  "version": "1.0.0",
  "services": {
    "supabase": { "status": "configured" },
    "redis": { "status": "healthy", "latency": 5 }
  }
}
```

---

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Doodle** (Free) | $0 | 3 Projects, Standard Nodes, GLM-4.7-Flash (10/day), Public Exports |
| **Sketch** (Starter) | $5/mo | Unlimited, Chaos Mode, Auto-Layouts, Kimi/Gemini/Minimax |
| **Blueprint** (Lifetime) | $10 | Forever Access, Commercial Rights, Priority Queue, Private Mode, Claude Opus 4.5 |

---

## License

MIT License. See LICENSE file for details.

---

## Acknowledgments

- **XYFlow** for the React Flow canvas library
- **Valibot** for modular schema validation
- **Supabase** for authentication and database
- **ZhipuAI** for GLM-4 reasoning capabilities
