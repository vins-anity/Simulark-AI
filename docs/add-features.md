# Capstone Project Report: Simulark

**Intelligent Backend Architecture Design and Visual Simulation Platform**

## Abstract

Simulark is an AI-powered "Generative UI" platform designed to bridge the critical gap between high-level system design and low-level implementation in software engineering. Unlike static diagramming tools that produce inert images, Simulark utilizes Large Language Models (GLM-4.7) to transform natural language requirements into semantic, interactive, and visually "alive" architecture graphs. The platform features a novel "Chaos Mode" for resilience visualization, "Semantic Zoom" for multi-stakeholder views, and a robust "Context Bridge" that exports architectural intent directly into developer IDEs. By leveraging a streamlined Single-Pass Generative architecture built on Next.js 16 and React Flow, Simulark provides a high-fidelity Computer-Aided Design (CAD) experience for backend engineering without the latency or complexity of traditional multi-agent simulations.

## Table of Contents

1. [Project Overview](https://www.google.com/search?q=%231-project-overview "null")
2. [System Architecture](https://www.google.com/search?q=%232-system-architecture "null")
3. [Feature Specification](https://www.google.com/search?q=%233-feature-specification "null")
4. [Technical Implementation](https://www.google.com/search?q=%234-technical-implementation "null")
5. [Results and Evaluation](https://www.google.com/search?q=%235-results-and-evaluation "null")
6. [Conclusion and Future Work](https://www.google.com/search?q=%236-conclusion-and-future-work "null")
7. [References](https://www.google.com/search?q=%237-references "null")

## 1. Project Overview

### 1.1 Introduction

In the contemporary software engineering landscape, a dissonance exists between design and code. Solutions Architects rely on static tools (e.g., Lucidchart) to visualize systems, but these artifacts lack semantic awareness and often become obsolete immediately. Infrastructure-as-Code (IaC) tools like Terraform are robust but lack visual immediacy.

**Simulark** addresses this inefficiency. It acts as a "Living Blueprint," allowing users to generate, simulate, and export backend architectures using natural language. It moves beyond simple drawing by enforcing architectural best practices through AI reasoning and providing visual heuristics for system behavior.

### 1.2 Objectives

The primary objectives of this capstone project are to:

1. **Develop a Generative UI Canvas:** Engineer a high-fidelity visual editor using React Flow and Next.js 16 that supports semantic node components (Compute, Database, Queue).
2. **Implement Logic-Driven AI Generation:** Utilize **GLM-4.7 Flash** with "Deep Thinking" capabilities to interpret requirements and generate strictly structured architectural graphs, ensuring logical consistency (e.g., placing caches before databases).
3. **Visualize System Resilience:** Create a "Chaos Mode" that gamifies reliability testing, allowing users to visually interact with Single Points of Failure.
4. **Establish a Context Bridge:** Implement a robust export suite that translates visual diagrams into machine-readable context (JSON, Cursor Rules) for AI coding assistants.
5. **Optimize for Performance:** Ensure the application maintains 60 FPS during graph manipulations by utilizing lightweight CSS animations for traffic heuristics instead of heavy physics engines.

### 1.3 Scope

**In Scope:**

* **AI Architect:** Natural Language to React Flow JSON generation.
* **Visual Simulation:** Particle-based traffic flow indicating protocol types (HTTP vs. Messaging).
* **Interactive State:** Chaos Mode (Kill Switch) and Semantic Zoom (Concept vs. Implementation views).
* **Tech Stack:** Next.js 16, React Flow (XYFlow), GLM-4.7, Tailwind v4.

**Out of Scope:**

* **Mathematical Stress Testing:** Replaced by Visual Heuristics to reduce scope risk.
* **Multi-Agent Orchestration:** Replaced by a Single-Pass "Deep Thinking" model for lower latency.
* **Real-time Cloud Deployment:** The tool generates  *designs* , not deployed infrastructure.

## 2. System Architecture

### 2.1 High-Level Architecture

Simulark abandons the complex "Multi-Agent" approach in favor of a streamlined **Client-Server-AI** pattern. This reduces generation latency from ~15s to ~3s and eliminates the need for heavy intermediate frameworks like LangGraph or CopilotKit. The architecture is explicitly designed to recognize and map a vast ecosystem of modern technologies, from lightweight runtimes like Bun to heavy enterprise stacks on AWS.

* **Frontend (The Client):** Built on  **Next.js 16 (App Router)** . It handles the React Flow canvas, state management via  **Zustand** , and the rendering of custom nodes.
* **Backend (The Bridge):** **Next.js Server Actions** serve as the secure proxy between the client and the AI provider. This layer handles API key security and response parsing.
* **Intelligence (The Brain):** **GLM-4.7 Flash** (via ZhipuAI/BigModel). We leverage its **Deep Thinking** (Chain of Thought) to reason through architectural constraints and **Structured Output** to guarantee valid JSON.

### 2.2 Data Flow Diagram

1. **User Input:** "Design a scalable E-commerce backend."
2. **Server Action:** Request sent to `api/paas/v4/chat/completions`.
3. **AI Reasoning:** GLM-4.7 analyzes: *High traffic -> Needs Load Balancer. Product Data -> Needs Read-Heavy DB.*
4. **JSON Generation:** GLM-4.7 outputs a JSON object containing `nodes[]` and `edges[]`.
5. **State Hydration:** Frontend parses JSON and updates the Zustand store.
6. **Rendering:** React Flow renders the graph; "Context Bridge" exposes the data to external tools.

### 2.3 Technology Stack

| **Component** | **Technology** | **Rationale**                                                |
| ------------------- | -------------------- | ------------------------------------------------------------------ |
| **Framework** | Next.js 16           | Latest React features, Server Actions, TurboPack speed.            |
| **Canvas**    | React Flow (XYFlow)  | Industry standard for node-based UIs, highly customizable.         |
| **AI Model**  | GLM-4.7 Flash        | **Free Tier** , supports "Thinking" process, fast inference. |
| **Styling**   | Tailwind CSS v4      | Zero-runtime overhead, premium design tokens.                      |
| **State**     | Zustand              | Lightweight, capable of handling complex graph state updates.      |
| **Icons**     | Iconify              | Dynamic loading of thousands of vendor logos (AWS, GCP).           |

## 3. Feature Specification

### 3.1 Agentic Architecture Generation

The core feature allows users to generate complex diagrams via prompts.

* **Innovation: Visualized Chain of Thought (CoT):** We utilize GLM-4.7's `reasoning_content` stream to implement the "Thinking..." UI effect seen in advanced AI interfaces. Instead of a static loading spinner, the user sees a transparent, collapsible stream of the AI's internal logic (e.g.,  *"Analyzing traffic patterns... Selecting Redis for session caching..."* ) before the final architecture is rendered. This "Glass Box" approach builds user trust and architectural transparency.
* **Constraint Enforcement:** The system prompt enforces strict rules, such as "Services must connect to Databases via defined protocols."

### 3.2 Chaos Mode (Interactive Resilience)

A gamified view that demonstrates system fragility.

* **Functionality:** Toggling "Chaos Mode" dims the interface. Users can click a "Kill" button on any node.
* **Visual Logic:** A killed node renders with a "cracked" overlay. Crucially, particle animations on connected edges stop or reroute. If a Redis cache is killed, traffic visually bypasses it to hit the primary DB, turning the DB node red to simulate overload.

### 3.3 Semantic Zoom

Solves the problem of "Too much detail" vs. "Too abstract."

* **Concept Mode:** Displays generic icons (Cylinder for DB, Cube for Compute). Suitable for high-level management discussions.
* **Implementation Mode:** Displays specific vendor logos (PostgreSQL elephant, AWS Lambda). Suitable for engineering hand-off.
* **Implementation:** CSS View Transitions allow for smooth morphing between these states without reloading the graph.

### 3.4 The Context Bridge

Simulark's competitive moat. It turns the diagram into code-ready context.

* **Live Context URL:** A public endpoint serving the graph as strict JSON.
* **.cursorrules Export:** Auto-generates a rules file for the Cursor IDE, prompting it to "Follow the architecture defined in Simulark ID #123."
* **Mermaid.js Export:** Converts the React Flow graph into Mermaid syntax for inclusion in GitHub `README.md` files.

### 3.5 Visual Traffic Heuristics

Instead of complex mathematical simulations, Simulark uses visual cues to imply system behavior.

* **Sync Traffic (HTTP):** Fast, solid particles.
* **Async Traffic (Queues):** Slow, hollow square particles.
* **Congestion:** If a node has high fan-in (many inputs), outgoing edges change color to orange/red, heuristically indicating a bottleneck.

### 3.6 Supported Technology Ecosystem

Simulark is engineered to cater to a diverse range of modern technical requirements. The system's prompt engineering and visual assets (via Iconify) support the following official technologies, frameworks, and services:

* **Runtimes & Languages**
  * **JavaScript/TypeScript:** Node.js, Bun, Deno.
  * **System:** Go (Golang), Rust, C++, Java, Kotlin, C# (.NET).
  * **Scripting:** Python, Ruby, PHP, Lua.
* **Web Frameworks**
  * **Modern JS/TS:** Hono, ElysiaJS, Express.js, Fastify, NestJS, Next.js, Nuxt, Remix, Astro, SvelteKit.
  * **Python:** FastAPI, Django, Flask.
  * **PHP:** Laravel, Symfony.
  * **Java:** Spring Boot, Quarkus.
  * **Go:** Gin, Echo, Fiber.
  * **Rust:** Actix, Axum.
* **Cloud Providers & Hosting**
  * **Hyperscalers:** AWS (Amazon Web Services), Google Cloud Platform (GCP), Microsoft Azure.
  * **PaaS / Serverless:** Vercel, Netlify, Heroku, Railway, Render, Fly.io, Supabase, Firebase, Cloudflare Workers.
  * **VPS/Infrastructure:** DigitalOcean, Linode (Akamai), Hetzner, Vultr.
* **Databases & Data Stores**
  * **Relational (SQL):** PostgreSQL, MySQL, MariaDB, SQLite, Microsoft SQL Server, CockroachDB, TiDB, Neon, PlanetScale.
  * **NoSQL / Document:** MongoDB, DynamoDB, Couchbase, Cassandra.
  * **Cache:** Redis, Memcached, Dragonfly.
  * **Vector / AI:** Pinecone, Milvus, Qdrant, Weaviate, ChromaDB.
  * **Object Storage:** AWS S3, Cloudflare R2, MinIO, Google Cloud Storage.
* **Infrastructure, Containers & DevOps**
  * **Containerization:** Docker, Podman.
  * **Orchestration:** Kubernetes (K8s), Docker Swarm, Nomad.
  * **IaC:** Terraform, Pulumi, Ansible.
  * **Observability:** Prometheus, Grafana, Datadog, New Relic, OpenTelemetry.
* **Messaging & Events**
  * Apache Kafka, RabbitMQ, NATS, Amazon SQS/SNS, Google Pub/Sub, MQTT.

This comprehensive ecosystem ensures that Simulark remains relevant whether the user is designing a micro-architecture on **Cloudflare Workers** or a monolith on  **AWS ECS** .

## 4. Technical Implementation

### 4.1 AI Integration Strategy (Unified OpenAI SDK with Fallback)

To ensure high availability and robust reasoning, Simulark implements a multi-provider strategy using the official `openai` Node.js SDK. This creates a unified interface for switching between our primary model (**GLM-4.7** via BigModel) and our fallback model (**Trinity** via OpenRouter).

This architecture allows us to handle vendor-specific parameters (like Zhipu's `thinking` vs. OpenRouter's `reasoning`) cleanly within a single service layer.

**File:** `app/lib/ai-client.ts` (Core Logic)

```
import OpenAI from "openai";

type AIProvider = "zhipu" | "openrouter";

interface ProviderConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  // Specific param to enable CoT/Reasoning for this provider
  reasoningParam: Record<string, unknown>;
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  zhipu: {
    baseURL: "[https://open.bigmodel.cn/api/paas/v4](https://open.bigmodel.cn/api/paas/v4)",
    apiKey: process.env.ZHIPU_API_KEY!,
    model: "glm-4.7",
    reasoningParam: { thinking: { type: "enabled" } } // Zhipu specific
  },
  openrouter: {
    baseURL: "[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)",
    apiKey: process.env.OPENROUTER_API_KEY!,
    model: "arcee-ai/trinity-large-preview:free",
    reasoningParam: { reasoning: { enabled: true } } // OpenRouter specific
  }
};

export async function createAIClient(provider: AIProvider = "zhipu") {
  const config = PROVIDERS[provider];
  
  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  return { client, config };
}

// Server Action Implementation
export async function generateArchitecture(prompt: string) {
  try {
    // 1. Try Primary Provider (Zhipu/GLM-4.7)
    return await callModel("zhipu", prompt);
  } catch (error) {
    console.warn("Primary model failed, switching to fallback...");
    // 2. Fallback to Secondary (OpenRouter/Trinity)
    return await callModel("openrouter", prompt);
  }
}

async function callModel(provider: AIProvider, prompt: string) {
  const { client, config } = await createAIClient(provider);

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: "system", content: "You are a Senior Solutions Architect. Return valid React Flow JSON." },
      { role: "user", content: prompt }
    ],
    stream: true,
    // Inject provider-specific reasoning parameters
    ...config.reasoningParam 
  } as any); // Cast to allow custom params

  return response;
}

```

### 4.2 Replicating the "Thinking..." UI Effect

To achieve the "Streaming Reasoning" effect seen in top AI tools (e.g., Claude, Gemini), we implement a dual-stream parser on the frontend. GLM-4.7 separates the internal monologue (`reasoning_content`) from the final answer (`content`) within the API response stream.

**Implementation Strategy:**

1. **Stream Parsing:** The frontend reads the Server-Sent Events (SSE).
2. **State Separation:** We maintain two distinct states: `reasoningLog` (for the collapsible "Thinking" accordion) and `finalJson` (for the architecture graph).
3. **Visual Feedback:** As `reasoning_content` chunks arrive, they are appended to the "Thinking" block in real-time. Once `reasoning_content` stops and `content` begins, the UI automatically collapses the thinking block and begins rendering the React Flow nodes.

```
// Sample Frontend Stream Handler Logic
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const json = JSON.parse(chunk); // Simplified parsing logic
  
  if (json.delta.reasoning_content) {
    // 1. Update the "Thinking..." UI stream
    setReasoning((prev) => prev + json.delta.reasoning_content);
    setIsThinking(true);
  } else if (json.delta.content) {
    // 2. Switch to generating the diagram
    setIsThinking(false);
    setGraphJson((prev) => prev + json.delta.content);
  }
}


```

### 4.3 Custom Node Logic (Service Node)

This component handles the visual state for both **Chaos Mode** and  **Semantic Zoom** .

```
// components/nodes/ServiceNode.tsx
export default function ServiceNode({ data, id }: NodeProps) {
  const isKilled = useStore(state => state.nodeStatus[id] === 'killed');
  const viewMode = useStore(state => state.viewMode); // 'concept' | 'impl'

  return (
    <div className={clsx(
      "transition-all duration-300 border-2 p-4 rounded-xl",
      isKilled ? "border-red-500 bg-red-50/10" : "border-blue-500 bg-white"
    )}>
      {/* Semantic Zoom Icon Logic */}
      <div className="text-4xl mb-2">
        <Icon icon={viewMode === 'impl' ? data.implIcon : data.conceptIcon} />
      </div>
    
      {/* Chaos Indicator */}
      {isKilled && <Icon icon="lucide:skull" className="absolute -top-2 -right-2 text-red-600" />}
    
      <span className="font-bold">{data.label}</span>
    </div>
  );
}


```

### 4.4 Context Bridge Data Structure

The standardized JSON format exposed to external IDEs.

```
{
  "project": "E-commerce V1",
  "nodes": [
    { "id": "svc-1", "type": "Compute", "tech": "Node.js", "role": "Auth Service" },
    { "id": "db-1", "type": "Database", "tech": "PostgreSQL", "tier": "db.t3.medium" }
  ],
  "edges": [
    { "source": "svc-1", "target": "db-1", "protocol": "TCP", "port": 5432 }
  ]
}


```

## 5. Results and Evaluation

### 5.1 Performance

By removing the Dual-Agent architecture and switching to a single GLM-4.7 call, generation latency dropped significantly.

* **Dual-Agent (Previous):** ~12-15 seconds.
* **GLM-4.7 Single Pass:** ~3-5 seconds.
* **Rendering:** React Flow maintains 60 FPS even with 50+ animated edges due to CSS-based particle animations rather than JavaScript-driven canvas drawing.

### 5.2 Reasoning Capability

The "Deep Thinking" feature of GLM-4.7 successfully prevents common hallucinations. In testing, requests for "High Scalability" consistently produced architectures with Caches and Load Balancers, whereas standard models often connected Clients directly to Databases.

### 5.3 Limitations

* **No Real Deployment:** The JSON is descriptive, not executable Terraform code.
* **Visual Only:** "Chaos Mode" is a heuristic visualization; it does not simulate actual network packet loss or backend timeout logic.

## 6. Conclusion and Future Work

### 6.1 Conclusion

Simulark successfully demonstrates that **Generative UI** can transform backend engineering workflows. By combining the reasoning power of **GLM-4.7** with the interactive capabilities of  **React Flow** , we have created a tool that is not just for drawing, but for *thinking* about systems. The "Context Bridge" further ensures that these designs provide tangible value to the coding phase, solving the "Design-to-Implementation Gap."

### 6.2 Future Work

* **Code-to-Diagram:** Implement the reverse flow—uploading a GitHub repo to generate a Simulark diagram automatically.
* **Team Collaboration:** Adding WebSocket support (Yjs) for multiplayer editing.
* **Terraform Export:** Upgrading the "Context Bridge" to generate actual Infrastructure-as-Code scripts.

## 7. References

1. **ZhipuAI (BigModel) Documentation** . (2025).  *GLM-4.7 Flash API Reference & Deep Thinking Guide* . https://docs.bigmodel.cn/
2. **React Flow Documentation** . (2025).  *Custom Nodes & Edge Animations* . https://reactflow.dev/docs/
3. **Next.js Documentation** . (2025).  *Server Actions & Route Handlers* . https://nextjs.org/docs
4. **Zustand Documentation** . (2025).  *State Management for React* . https://github.com/pmndrs/zustand
5. **Iconify** . (2025).  *Unified Open Source Icon Framework* . https://iconify.design/
6. **Trinity-Large-Model** (fallback). https://openrouter.ai/arcee-ai/trinity-large-preview:free
