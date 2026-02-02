
# Capstone Project Report: Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

**Project Title:** Capstone Software Development Project

**Module Name:** CAI

**Course Name:** BDSE

**Student Name:** [Your Name]

**Student ID:** [Your ID]

**Submission Date:** January 24, 2026

## 1. Project Overview

### Introduction

In the contemporary software engineering landscape, a critical dissonance exists between high-level system design and low-level implementation. Solutions Architects typically rely on static diagramming tools (e.g., Lucidchart, Draw.io) to visualize distributed systems. However, these artifacts are technically inert—they lack semantic awareness of the components they represent and become obsolete the moment implementation begins. Conversely, Infrastructure-as-Code (IaC) frameworks like Terraform are robust but lack the visual immediacy required for rapid prototyping and stakeholder communication.

**Simulark** addresses this architectural inefficiency. It is an AI-powered "Generative UI" platform designed to bridge the "Design-to-Implementation Gap." By transforming natural language requirements into semantic, auto-arranged diagrams with "alive" visual data flows, Simulark acts as a high-fidelity Computer-Aided Design (CAD) tool for backend engineering. Crucially, it extends beyond visualization by acting as a Context Bridge for modern AI-assisted workflows, exporting architectural intent directly into the developer's Integrated Development Environment (IDE).

### Objectives

The primary objectives of this capstone project are to:

1. **Engineer a High-Fidelity Interactive Canvas:** Develop a professional-grade visual editor using React Flow (XYFlow) and Shadcn UI that supports custom, semantically rich node components (Gateways, Compute, Databases, Queues) capable of maintaining referential integrity.
2. **Implement Logic-Driven AI Generation:** Leverage **GLM-4.7 Flash** (via ZhipuAI) with its native **"Deep Thinking" (Chain of Thought)** capabilities to interpret requirements and generate strictly structured system graphs. This approach replaces complex multi-agent orchestration with a streamlined single-pass model that reasons through constraints (e.g., placing caches before databases) before generation.
3. **Develop a Visual Protocol Simulation Engine:** Implement a simulation layer that visualizes data flow semantics—distinguishing between synchronous (HTTP/gRPC) and asynchronous (AMQP/Stream) protocols via distinct particle animation signatures—to enhance architectural legibility.
4. **Establish a Cross-Platform Context Bridge:** Differentiate Simulark from standard tools by implementing a robust export suite. This includes Live Context URLs for dynamic state sharing, and model-specific context files (`.cursorrules`, Markdown) to facilitate high-fidelity hand-off to AI coding assistants.
5. **Visualize System Resilience (Chaos Mode):** Create a gamified reliability testing environment where users can visually interact with Single Points of Failure (SPOF) to observe how traffic reroutes or fails when specific nodes are "killed."
6. **Ensure Scalability & Performance:** Implement advanced rendering optimizations using Next.js 16 and CSS-based animations to ensure the canvas maintains 60 FPS performance during complex graph manipulations.

### Scope

To ensure a robust and deliverable product within the capstone timeline, the project follows a strict Minimum Viable Product (MVP) scope focused on the Backend Engineering niche:

**In Scope:**

* **Visual Interface:** Custom React Flow implementation with specialized backend node types using Tailwind v4.
* **Generative AI Pipeline:**
  * **Single-Pass Reasoning:** Utilization of GLM-4.7's `reasoning_content` stream to show the AI's "Thinking..." process before rendering.
  * **Multi-Provider Fallback:** A resilient API layer that defaults to ZhipuAI (GLM-4.7) but falls back to OpenRouter (Arcee Trinity) if the primary service fails.
* **Interactive Features:**
  * **Chaos Mode:** Interactive "Kill Switch" for nodes to demonstrate fault tolerance.
  * **Semantic Zoom:** A toggle to switch between Conceptual (generic icons) and Implementation (vendor-specific logos) views.
* **Visual Simulation:** Protocol-based animated edges (Standard vs. Async) and heuristic congestion visualization.
* **Context Bridge (Exports):**
  * **Live Context URL:** Secure, read-only JSON endpoint for IDE consumption.
  * **IDE Rules:** Auto-generation of `.cursorrules` for Cursor/Windsurf.
  * **Visual Exports:** High-resolution PNG and Mermaid.js code generation.

**Out of Scope:**

* **Mathematical Stress Testing:** Complex throughput/latency prediction calculations (replaced by Visual Heuristics).
* **Direct Cloud Deployment:** Writing actual Terraform/Pulumi code to deploy resources (focus is on *Design* context).
* **Real-time Multi-User Collaboration:** Live cursors and simultaneous editing (reserved for future "Team" tiers).

## 2. Background and Problem Statement

### Context and Motivation

Designing distributed systems requires a deep understanding of component interactions. Developers often suffer from "Blank Canvas Paralysis." Furthermore, with the rise of AI Coding Assistants, developers face  **Context Loss** : the AI assistant in the IDE is unaware of the broader system architecture defined in the diagram, leading to hallucinated imports or incorrect service connections.

### Problem Description

* **Semantic Disconnect:** Traditional diagrams are static pixels. They do not distinctively visualize the difference between a synchronous API call and an asynchronous queue message.
* **Context Hand-off Friction:** There is no standardized way to transfer the "mental model" of a system architecture into an AI coding assistant without manually typing lengthy system prompts.
* **Opaque AI Generation:** Many AI diagramming tools produce outputs without explanation. Users cannot see *why* the AI chose a specific database or pattern.

## 3. Project Proposal and Planning

### Methodology

The development followed a Rapid Application Development (RAD) methodology, prioritized into three sprints:

1. **Foundation:** Setup of Next.js 16 architecture, React Flow Canvas, and Custom Node Components.
2. **Intelligence:** Implementation of the Direct API integration (Next.js Server Actions) with GLM-4.7 and the "Visualized Chain of Thought" UI.
3. **Refinement:** Implementation of Chaos Mode, Semantic Zoom, and the Context Bridge export logic.

## 4. System Design and Architecture

### System Architecture Diagram

The platform utilizes a modern, type-safe stack centered around the T3 Stack principles (Next.js, TypeScript, Tailwind) with a streamlined Client-Server-AI pattern.

```
graph TD
    User[User Browser]
  
    subgraph "Frontend Layer (Next.js 16)"
        Canvas[Interactive Canvas<br/>(React Flow)]
        State[Zustand Store]
        VisEngine[Visual Effects<br/>(Tailwind v4)]
        StreamParser[SSE Stream Parser]
    end
  
    subgraph "Server Layer (Next.js Server Actions)"
        Action[Generate Action]
        AuthGuard[Auth Guard]
        ProviderMgr[Provider Manager<br/>(OpenAI SDK)]
    end
  
    subgraph "AI Layer (External APIs)"
        GLM[Primary: GLM-4.7<br/>(ZhipuAI)]
        Trinity[Fallback: Trinity<br/>(OpenRouter)]
    end
  
    User --> Canvas
    Canvas --> Action
    Action --> AuthGuard
    Action --> ProviderMgr
    ProviderMgr -- "Try Primary" --> GLM
    ProviderMgr -- "On Fail" --> Trinity
  
    GLM -- "Stream (Reasoning + JSON)" --> Action
    Action -- "Server Sent Events" --> StreamParser
    StreamParser -- "Hydrate" --> State
    State --> Canvas

```

### Architecture Description

1. **Frontend (The "Visual Engine"):** Built with  **Next.js 16 (App Router)** .
   * **Canvas:** A customized React Flow instance using **Iconify** for dynamic vendor logos.
   * **Stream Parser:** A specialized client-side parser that separates the incoming AI stream into `reasoning_content` (for the "Thinking" UI) and `content` (the final JSON graph).
2. **Backend (The "Bridge"):** **Next.js Server Actions** secure the API keys and manage the AI pipeline.
3. **Intelligence (The "Brain"):**
   * **Primary Model:**  **GLM-4.7 Flash** . Chosen for its free tier, speed, and specific "Deep Thinking" parameter (`thinking_type="enabled"`) which forces architectural reasoning before generation.
   * **Fallback Strategy:** A custom abstraction using the `openai` SDK allows seamless failover to **Arcee Trinity** via OpenRouter if the primary model is unavailable.

### Data Model (Architecture Graph)

The core data structure is a strict JSON graph schema used by React Flow:

```
interface SimularkGraph {
  nodes: {
    id: string;
    type: 'service' | 'database' | 'queue' | 'gateway';
    data: {
      label: string;
      techStack: string; // e.g., "Node.js", "PostgreSQL"
      provider: 'aws' | 'gcp' | 'azure';
      isAlive: boolean; // For Chaos Mode
    };
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    animated: boolean;
    type: 'default' | 'async'; // Visual style
  }[];
}

```

## 5. Feature Specification

### 5.1 Agentic Architecture Generation (Visualized CoT)

* **User Action:** Input prompt (e.g., "Design a scalable E-commerce backend").
* **Innovation:** The UI mimics top-tier AI tools by displaying a transparent, collapsible "Thinking..." stream. Users watch the AI analyze requirements (e.g.,  *"High traffic detected, adding Redis cache..."* ) in real-time before the graph is rendered. This builds trust and transparency.

### 5.2 Chaos Mode (Interactive Resilience)

* **Concept:** Gamified reliability testing.
* **Behavior:** Toggling "Chaos Mode" dims the UI. Users can click a "Kill" button on any node.
  * **Visual Consequence:** The node cracks and turns red. Traffic particles on connected edges stop or reroute. If a Cache is killed, traffic visually bypasses it to hit the Database directly, turning the DB node red to simulate overload.

### 5.3 Semantic Zoom

* **Concept:** Solving the "Too much detail" vs. "Too abstract" problem.
* **Implementation:** A toggle switch allows users to view the system at two levels of detail:
  1. **Concept Mode:** Generic icons (Cylinders for DBs, Boxes for Services). Best for high-level planning.
  2. **Implementation Mode:** Specific vendor logos (AWS RDS, Google Cloud Run) via Iconify. Best for engineering handoff.

### 5.4 The Context Bridge

* **Live Context URL:** A public endpoint serving the graph as strict JSON.
* **Cursor Rules:** Auto-generates a `.cursorrules` file. This file prompts the Cursor IDE to "Follow the architecture defined in Simulark ID #123," ensuring code generation aligns with the visual design.

### 5.5 Supported Technology Ecosystem

Simulark is engineered to cater to a diverse range of modern technical requirements. The system's prompt engineering and visual assets (via Iconify) support the following official technologies, frameworks, and services:

* **Runtimes & Languages:** Node.js, Bun, Deno, Go, Rust, C++, Java, Kotlin, C# (.NET), Python, Ruby, PHP, Lua.
* **Web Frameworks:** Hono, ElysiaJS, Express.js, Fastify, NestJS, Next.js, Nuxt, Remix, Astro, SvelteKit, FastAPI, Django, Flask, Laravel, Symfony, Spring Boot, Quarkus, Gin, Echo, Fiber, Actix, Axum.
* **Cloud Providers & Hosting:** AWS (Amazon Web Services), Google Cloud Platform (GCP), Microsoft Azure, Vercel, Netlify, Heroku, Railway, Render, Fly.io, Supabase, Firebase, Cloudflare Workers, DigitalOcean, Linode, Hetzner, Vultr.
* **Databases & Data Stores:** PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, CockroachDB, TiDB, Neon, PlanetScale, MongoDB, DynamoDB, Couchbase, Cassandra, Redis, Memcached, Dragonfly, Pinecone, Milvus, Qdrant, Weaviate, ChromaDB, AWS S3, Cloudflare R2, MinIO, Google Cloud Storage.
* **Infrastructure & Containers:** Docker, Podman, Kubernetes (K8s), Docker Swarm, Nomad, Terraform, Pulumi, Ansible, Prometheus, Grafana, Datadog, New Relic, OpenTelemetry.
* **Messaging:** Apache Kafka, RabbitMQ, NATS, Amazon SQS/SNS, Google Pub/Sub, MQTT.

## 6. Technical Implementation

### 6.1 Unified AI Client (with Fallback)

We implemented a robust client using the `openai` SDK to manage multiple providers.

```
// app/lib/ai-client.ts
import OpenAI from "openai";

const PROVIDERS = {
  zhipu: {
    baseURL: "[https://open.bigmodel.cn/api/paas/v4](https://open.bigmodel.cn/api/paas/v4)",
    model: "glm-4.7",
    extraBody: { thinking: { type: "enabled" } } // Zhipu specific
  },
  openrouter: {
    baseURL: "[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)",
    model: "arcee-ai/trinity-large-preview:free",
    extraBody: { reasoning: { enabled: true } } // OpenRouter specific
  }
};

export async function generateArchitecture(prompt: string) {
  try {
    return await callProvider("zhipu", prompt);
  } catch (e) {
    console.warn("Primary failed, switching to fallback");
    return await callProvider("openrouter", prompt);
  }
}

```

### 6.2 Custom Node Logic (Service Node)

This React component handles the visual state for both **Chaos Mode** and  **Semantic Zoom** .

```
export default function ServiceNode({ data, id }: NodeProps) {
  const isKilled = useStore(state => state.nodeStatus[id] === 'killed');
  const viewMode = useStore(state => state.viewMode);

  return (
    <div className={clsx(
      "transition-all duration-300 border-2 p-4 rounded-xl",
      isKilled ? "border-red-500 bg-red-50/10" : "border-blue-500 bg-white"
    )}>
      {/* Semantic Zoom Logic */}
      <Icon icon={viewMode === 'impl' ? data.implIcon : data.conceptIcon} />
    
      {/* Chaos Indicator */}
      {isKilled && <Icon icon="lucide:skull" className="absolute -top-2 -right-2 text-red-600" />}
    
      <span className="font-bold">{data.label}</span>
    </div>
  );
}

```

## 7. Results and Evaluation

### Performance

By removing the Dual-Agent architecture and switching to a single GLM-4.7 call, generation latency dropped significantly.

* **Dual-Agent (Previous):** ~12-15 seconds.
* **GLM-4.7 Single Pass:** ~3-5 seconds.
* **Rendering:** React Flow maintains 60 FPS even with 50+ animated edges due to CSS-based particle animations rather than JavaScript-driven canvas drawing.

### Reliability

The "Deep Thinking" capability of GLM-4.7 proved effective at reducing hallucinations. In testing, the model consistently correctly identified that a "High Availability" requirement necessitated a Load Balancer and Database Replicas, logic often missed by standard, faster models.

### Limitations

* **Heuristic Visualization:** Chaos Mode is a visual simulation, not a physics-based network stress test.
* **Snapshot-Based:** The tool generates a static snapshot of an architecture; it does not currently sync with live cloud infrastructure (e.g., AWS CloudWatch).

## 8. Conclusion and Future Work

Simulark successfully demonstrates that **Generative UI** can transform backend engineering workflows. By combining the reasoning power of **GLM-4.7** with the interactive capabilities of  **React Flow** , we have created a tool that is not just for drawing, but for *thinking* about systems. The "Context Bridge" further ensures that these designs provide tangible value to the coding phase, effectively solving the "Design-to-Implementation Gap."

**Future Work:**

* **Code-to-Diagram:** Implement the reverse flow—uploading a GitHub repo to automatically generate a Simulark diagram.
* **Terraform Export:** Upgrading the "Context Bridge" to generate actual Infrastructure-as-Code scripts based on the visual design.

## 9. References

1. **ZhipuAI (BigModel) Documentation** . (2025).  *GLM-4.7 Flash API Reference & Deep Thinking Guide* . https://docs.bigmodel.cn/
2. **React Flow Documentation** . (2025).  *Custom Nodes & Edge Animations* . https://reactflow.dev/docs/
3. **Next.js Documentation** . (2025).  *Server Actions & Route Handlers* . https://nextjs.org/docs
4. **OpenAI Node.js SDK** . (2025).  *Unified Client Interface* . https://github.com/openai/openai-node
5. **Iconify** . (2025).  *Unified Open Source Icon Framework* . https://iconify.design/
6. **Trinity-Large-Model** (fallback). https://openrouter.ai/arcee-ai/trinity-large-preview:free
7. **Valibot Documentation** . (2025).  *Schema Validation Library* . https://valibot.dev/
8. **Dagre Documentation** . (2025).  *Graph Layout Engine* . https://github.com/dagrejs/dagre

## 10. Appendices

### Appendix A: System Prompt for GLM-4.7

The prompt used to enforce structural integrity and deep reasoning.

```
You are a Senior Solutions Architect. Your goal is to design a robust, scalable backend architecture based on the user's request.

1. **Reasoning Phase (Hidden)**: First, analyze the requirements. Consider traffic patterns, data consistency needs, and failure modes. Decide on specific technologies (e.g., "Use Redis for caching" vs "Use Memcached").
2. **Generation Phase (JSON)**: Output a strictly formatted JSON object containing 'nodes' and 'edges'.

Rules:
- All Databases must be protected by a Service or API Gateway.
- Use specific icons from the Iconify library (e.g., "logos:postgresql").
- Label connections with protocols (e.g., "gRPC", "SQL", "HTTPS").

```

### Appendix B: Valibot Schema for Architecture Nodes

The TypeScript schema used to validate AI outputs before rendering.

```
import * as v from 'valibot';

const NodeSchema = v.object({
  id: v.string(),
  type: v.picklist(['service', 'database', 'queue', 'gateway']),
  data: v.object({
    label: v.string(),
    techStack: v.string(),
    provider: v.picklist(['aws', 'gcp', 'azure', 'vercel', 'supabase']),
    costEstimate: v.number(),
  }),
  position: v.object({ x: v.number(), y: v.number() }),
});

const GraphSchema = v.object({
  nodes: v.array(NodeSchema),
  edges: v.array(v.object({
    id: v.string(),
    source: v.string(),
    target: v.string(),
    type: v.picklist(['default', 'async']),
  }))
});

```

### Appendix C: Live Context Payload Example

An example of the JSON payload returned by the Live Context URL (`/api/context/:id`) for consumption by AI IDEs.

```
{
  "projectId": "123-abc",
  "name": "Microservices E-commerce",
  "generatedAt": "2026-01-24T12:00:00Z",
  "architecture": {
    "summary": "Event-driven architecture using Kafka for order processing.",
    "constraints": ["All inter-service communication must use gRPC."],
    "components": [
      { "id": "order-svc", "role": "Order Service", "tech": "Go/Gin" },
      { "id": "kafka-cluster", "role": "Event Bus", "tech": "Apache Kafka" }
    ]
  }
}

```
