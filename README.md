# Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

Simulark is an AI-powered "Generative UI" platform designed to bridge the gap between high-level system design and low-level implementation. By transforming natural language requirements into semantic, auto-arranged diagrams with active visual data flows, Simulark acts as a high-fidelity Computer-Aided Design (CAD) tool specifically engineered for backend development.

The platform addresses the "Context Loss" problem inherent in modern software engineering, where architectural intent is often lost when transitioning to AI-assisted coding. Simulark ensures that the visual model serves as the single source of truth for both human stakeholders and AI agents.

---

## Core Features

### Interactive Architecture Canvas
Simulark provides a professional-grade visual environment built on **XYFlow (React Flow)**, offering capabilities far beyond static diagramming tools.
- **Semantic Components**: Unlike generic shape tools, Simulark uses specialized nodes with strict semantic definitions for Gateways, Compute services, Databases, and Queues. This ensures the underlying data model remains structurally valid.
- **Smart Auto-Layout**: The system automatically arranges generated architectures using directed graph algorithms, ensuring legibility even for complex distributed systems.
- **Dynamic Interaction**: Users can manipulate the architecture directly, with the system maintaining referential integrity between components.

### Agentic "Deep Thinking" Generation
The platform utilizes a sophisticated multi-stage AI pipeline to generate architectures that are not just visually appealing but technically sound.
- **Reasoning-First Approach**: Leveraging models with "Deep Thinking" capabilities (such as GLM-4.7 Flash), the system analyzes architectural constraints—such as scalability, consistency, and availability—before generating any visual elements.
- **Multi-Agent Orchestration**: A dedicated **Aggregator Agent** outlines the high-level plan, while a **Generator Agent** transforms that plan into a strict JSON graph structure, minimizing hallucinations.
- **Hybrid AI Pipeline**: The system employs a robust fallback strategy, utilizing **OpenRouter** (Solar Pro/Mistral Large) and **ZhipuAI** to ensure high availability and optimal performance.

### Visual Simulation & Resilience
Simulark moves beyond static diagrams by visualizing the runtime behavior of the system.
- **Protocol Visualization**: Data flows are animated to strictly represent their protocol nature. Synchronous operations (HTTP/gRPC) and asynchronous patterns (Queues/Streams) are visually distinct, allowing instant recognition of blocking vs. non-blocking paths.
- **Chaos Mode (Resilience Testing)**: A gamified simulation environment that allows users to test system fault tolerance. Interacting with the "Kill Switch" on any node triggers a simulation of failure, visually demonstrating how traffic reroutes or where bottlenecks emerge without the component.

### The Context Bridge
Designed for the modern AI-assisted workflow, Simulark acts as a context provider for IDEs and coding assistants.
- **Live Context URL**: The platform exposes secure, read-only JSON endpoints that represent the current architectural state.
- **IDE Integration**: Automatically generates configuration files (such as `.cursorrules` or Markdown context) for tools like **Cursor** and **Windsurf**. This ensures that the code generation phase adheres strictly to the architectural constraints defined in the diagram.
- **Semantic Zoom**: A dual-view system allowing stakeholders to toggle between a "Concept Mode" for high-level discussion and an "Implementation Mode" featuring specific vendor technologies (e.g., AWS RDS, Apache Kafka) for engineering execution.

---

## Technical Architecture

The Simulark platform is built on a modern, type-safe stack designed for performance and maintainability.

### Frontend
- **Framework**: **Next.js 16** (App Router) for server-side rendering and efficient routing.
- **Language**: **TypeScript** for strict type safety across the entire application.
- **Styling**: **Tailwind CSS v4** for a high-performance, utility-first design system.
- **State Management**: **Zustand** for global client-side state, managing the complex interactions of the simulation engine.
- **Canvas Engine**: **XYFlow (React Flow)** custom implementation with **Dagre** for graph layout calculations.

### Backend & Infrastructure
- **Authentication & Database**: **Supabase** facilitates secure user authentication (Auth), persistent storage (PostgreSQL), and complex data relationships.
- **Data Security**: Implementation of Row-Level Security (RLS) policies ensures strong data isolation.
- **Rate Limiting**: Custom PostgreSQL RPC functions manage API usage limits based on user subscription tiers.

### Artificial Intelligence & Orchestration
- **Orchestration**: Server-side logic handles the communication between multiple AI providers.
- **Schema Validation**: **Valibot** provides runtime validation of AI-generated JSON, ensuring that all diagrams adhere to the strict internal schema before rendering.
- **Streaming**: Implementation of Server-Sent Events (SSE) to stream the AI's "thought process" directly to the UI, enhancing transparency.

---

## Project Structure

The codebase is organized to separate concerns between the visualization engine, data management, and AI orchestration.

- `actions/`: Contains Server Actions for backend logic, including AI orchestration and database operations.
- `app/`: Follows the Next.js App Router conventions for pages and API endpoints.
- `components/canvas/`: Houses the core logic for the visual editor, including custom node definitions and edge behaviors.
- `components/ui/`: Reusable UI components built with Shadcn/UI primitives.
- `lib/store.ts`: The central Zustand store managing the simulation state, view modes, and node statuses.
- `lib/ai-client.ts`: The abstraction layer for AI provider communication (OpenRouter/ZhipuAI).
- `supabase/migrations/`: Database schema definitions and SQL functions.

---

## Getting Started

### Prerequisites
- **Bun**: This project uses the Bun runtime for fast dependency installation and script execution.
- **Supabase**: A valid Supabase project is required for the backend.
- **API Keys**: Access to OpenRouter and/or ZhipuAI is necessary for the generative features.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/simulark-app.git
   cd simulark-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Configuration**
   Copy the example environment file and configure your keys.
   ```bash
   cp .env.example .env.local
   ```
   *Update `.env.local` with your Supabase credentials and AI provider keys.*

4. **Start the Development Server**
   ```bash
   bun dev
   ```

The application will be available at `http://localhost:3000`.

---

## License

This project is distributed under the MIT License. Please refer to the `LICENSE` file for more details.
