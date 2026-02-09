import OpenAI from "openai";

export type AIProvider = "zhipu" | "openrouter";

import { env } from "@/lib/env";

interface ProviderConfig {
    baseURL: string;
    apiKey: string | undefined;
    model: string;
    reasoningParam: Record<string, unknown>;
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
    zhipu: {
        baseURL: "https://open.bigmodel.cn/api/paas/v4",
        apiKey: env.ZHIPU_API_KEY,
        model: "glm-4.7-flash", // Using Flash as per doc
        // IMPORTANT: Keep thinking enabled but system prompt handles JSON in content
        reasoningParam: { thinking: { type: "enabled" } },
    },
    openrouter: {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_API_KEY,
        model: "arcee-ai/trinity-large-preview:free", // Fallback
        reasoningParam: { reasoning: { enabled: true } },
    },
};

export function createAIClient(provider: AIProvider = "zhipu") {
    const config = PROVIDERS[provider];

    if (!config.apiKey) {
        console.warn(`[AI Client] Missing API key for provider: ${provider}`);
    }

    const client = new OpenAI({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        timeout: 30 * 1000, // 30 seconds timeout
        defaultHeaders: {
            "HTTP-Referer": "https://simulark.app",
            "X-Title": "Simulark",
        }
    });

    return { client, config };
}

export async function generateArchitectureStream(
    prompt: string,
    modelId?: string,
    mode: "default" | "startup" | "corporate" = "default",
    currentNodes: any[] = [],
    currentEdges: any[] = [],
    quickMode: boolean = false
) {
    if (modelId) {
        console.log(`[AI Client] Generating with selected model: ${modelId} in mode: ${mode}${quickMode ? " (QUICK)" : ""}`);
        // Map modelId to provider
        if (modelId === "glm-4.7-flash") {
            return await callModelStream("zhipu", prompt, mode, currentNodes, currentEdges, quickMode);
        } else if (modelId === "arcee-ai") {
            return await callModelStream("openrouter", prompt, mode, currentNodes, currentEdges, quickMode);
        }
    }

    // Default fallback logic
    // 1. Try Primary (Zhipu)
    try {
        console.log(`[AI Client] Starting generation. Primary: Zhipu GLM-4.7 Flash. Mode: ${mode}${quickMode ? " (QUICK)" : ""}. Prompt length: ${prompt.length}`);
        const stream = await callModelStream("zhipu", prompt, mode, currentNodes, currentEdges, quickMode);
        console.log("[AI Client] Zhipu stream established successfully.");
        return stream;
    } catch (error: any) {
        console.warn(`[AI Client] Zhipu failed (Error: ${error.message}). Switching to OpenRouter fallback...`);
        // 2. Fallback (OpenRouter)
        try {
            const stream = await callModelStream("openrouter", prompt, mode, currentNodes, currentEdges, quickMode);
            console.log("[AI Client] OpenRouter stream established successfully.");
            return stream;
        } catch (fbError: any) {
            console.error(`[AI Client] OpenRouter fallback also failed: ${fbError.message}`);
            throw fbError;
        }
    }
}

async function callModelStream(
    provider: AIProvider,
    prompt: string,
    mode: "default" | "startup" | "corporate" = "default",
    currentNodes: any[] = [],
    currentEdges: any[] = [],
    quickMode: boolean = false
) {
    const { client, config } = createAIClient(provider);

    let roleDescription = "Senior Fullstack Solutions Architect";
    let focusArea = "scalability, fault tolerance, cost-efficiency, and rapid delivery";
    let archetypeInstructions = "";

    // Project Archetype Logic (Smart Node Selection)
    if (mode === "startup") {
        roleDescription = "Lean Startup CTO";
        focusArea = "MVP speed, minimal costs, and rapid iteration.";
        archetypeInstructions = `
        STRATEGY: STARTUP / LEAN
        - Prefer managed services and high-level abstractions (Next.js, Supabase, Vercel, Clerk, Stripe).
        - Avoid complex infrastructure like Kubernetes or self-hosted Kafka unless critical.
        - Focus on "Time to Market" and developer productivity.
        - Use modern, developer-friendly tech that minimizes maintenance.
        `;
    } else if (mode === "corporate") {
        roleDescription = "Enterprise Architect";
        focusArea = "high availability, compliance, security, and redundancy.";
        archetypeInstructions = `
        STRATEGY: ENTERPRISE / CORPORATE
        - Prioritize robustness, high availability, and security.
        - Use established enterprise patterns (Microservices, gRPC, Event-driven with Kafka, SQL with Read Replicas).
        - Consider compliance requirements and formal infrastructure (AWS/GCP/Azure, Kubernetes, IAM, dedicated VPCS).
        - Detail data isolation and high-throughput reliability.
        `;
    } else {
        // Standard / Default mode
        roleDescription = "Senior Fullstack Solutions Architect";
        focusArea = "best-in-class performance, scalability, and modern standards.";
        archetypeInstructions = `
        STRATEGY: MODERN FULLSTACK
        - Generate a balanced end-to-end stack using the most reliable modern tools.
        - Use "Best of Breed" technologies (e.g. Next.js + FastAPI + Postgres).
        `;
    }

    const contextPrompt = currentNodes.length > 0
        ? `\n\nCURRENT ARCHITECTURE STATE:
The user already has an existing diagram. 
Existing Nodes: ${JSON.stringify(currentNodes.map(n => ({ id: n.id, type: n.type, label: n.data?.label, tech: n.data?.tech })))}
Existing Edges: ${JSON.stringify(currentEdges.map(e => ({ id: e.id, source: e.source, target: e.target })))}

Your task is to MODIFY or IMPROVE this architecture based on the user's prompt. 
- You MUST maintain the context of existing components.
- If the user asks for a change, provide the UPDATED full architecture JSON.
- If the user asks to "add" something, include existing nodes plus new ones.
- If the user asks to "improve" or "simplify", rewrite the JSON accordingly.
- Ensure node IDs remain consistent if they refer to the same component.`
        : '';

    // QUICK MODE: Use a condensed prompt for faster generation
    let systemPrompt: string;

    if (quickMode) {
        systemPrompt = `You are a ${roleDescription}. Generate a JSON architecture for: "${prompt}"
${archetypeInstructions}
${contextPrompt}

OUTPUT ONLY JSON (no markdown, no explanation):
{
  "nodes": [{ "id": "string", "type": "gateway|service|frontend|backend|database|queue|ai", "position": {"x": number, "y": number}, "data": { "label": "string", "description": "brief purpose", "tech": "nextjs|react|nodejs|postgres|redis|supabase|vercel|etc", "serviceType": "same as type" }}],
  "edges": [{ "id": "string", "source": "string", "target": "string", "animated": boolean, "data": { "protocol": "http|https|graphql|websocket|queue|stream|database|cache|oauth|grpc" }}]
}

Use real tech IDs: nextjs, react, nodejs, postgres, redis, supabase, vercel, aws, gcp, openai, anthropic, kafka, rabbitmq, etc.`;
    } else {
        // Full detailed prompt for quality generation
        systemPrompt = `You are a ${roleDescription}. ${focusArea}
    Analyze the user's request and generate a detailed Fullstack Architecture.
    
    ${archetypeInstructions}
    
    INTELLIGENT TECH SELECTION:
    Automatically choose the best-suited stack based on the prompt intent and archetype.
    - Example: If user says "Python scraper", choose "FastAPI" + "Playwright" + "PostgreSQL".
    - Example: If user says "Realtime chat", choose "Next.js" + "Supabase" (or WebSocket server) + "Redis".
    - List alternative options in the reasoning phase if specific tech isn't mandated.
    - Ensure the frontend framework matches the backend ecosystem (e.g., React + Node, or Angular + Java, or just best-in-class).
    ${contextPrompt}
    
    CRITICAL INSTRUCTIONS:
    1. Think about the architecture in your reasoning/thinking process. Use the following LAYERING PATTERN:
       - Layer 1 (Top/Left): ENTRY - Load Balancers, API Gateways, CDN, Frontend Clients.
       - Layer 2 (Middle): APP - Core Services, Auth, Business Logic, Workers, AI Agents.
       - Layer 3 (Bottom/Right): DATA - Databases, Caches, Object Storage, Queues.
    2. Then, OUTPUT THE FINAL JSON in the content field.
    3. The reasoning should NOT contain the JSON.
    4. The content field MUST contain ONLY the JSON object.
    
    JSON Schema:
    {
      "nodes": [ { 
        "id": "string", 
        "type": "gateway" | "service" | "frontend" | "backend" | "database" | "queue" | "ai", 
        "position": { "x": number, "y": number }, 
        "data": { 
          "label": "string", 
          "description": "string",
          "tech": "string", // REQUIRED! Use EXACT IDs from this list:
          // Frontend: "react", "vue", "angular", "svelte", "nextjs", "remix", "vite", "astro", "flutter", "react-native"
          // Backend: "nodejs", "python", "go", "rust", "java", "bun", "deno", "express", "nestjs", "fastapi", "django", "spring"
          // Database: "postgres", "mysql", "mongodb", "redis", "cassandra", "elasticsearch", "dynamodb", "supabase", "firebase", "planetscale", "neon"
          // Cloud: "aws", "gcp", "azure", "vercel", "netlify", "heroku", "digitalocean", "flyio", "cloudflare"
          // Compute: "lambda", "cloud-run", "azure-functions", "workers"
          // Storage: "s3", "gcs", "r2"
          // AI: "openai", "anthropic", "huggingface", "pinecone", "langchain", "google-gemini", "meta-llama", "deepseek", "mistral"
          // DevOps: "docker", "kubernetes", "terraform", "github-actions", "jenkins", "prometheus", "grafana", "nginx"
          // Queues: "kafka", "rabbitmq", "sqs"
          "serviceType": "gateway" | "service" | "frontend" | "backend" | "database" | "queue" | "ai", 
          "validationStatus": "valid" | "warning" | "error", 
          "costEstimate": number 
        } 
      } ],
      "edges": [ { 
        "id": "string", 
        "source": "string", 
        "target": "string", 
        "animated": boolean, 
        "data": { 
          "protocol": "http" | "https" | "graphql" | "websocket" | "queue" | "stream" | "database" | "cache" | "oauth" | "grpc" 
        } 
      } ]
    }
    
    Node Description Guidelines:
    Each node should include a 'description' field that explains:
    - What this component does
    - Why it's needed for this architecture
    - Key configuration considerations
    
    Node Type Guidelines:
    - 'frontend': Web clients, Mobile apps, associated with "frontend" tech (React, Next.js, Flutter).
    - 'backend': API servers, Workers, associated with "backend" tech (Node.js, Python, Go).
    - 'service': Generic/Fallback for services where specific type is unclear or hybrid.
    - 'ai': For AI models, LLMs, Vector DBs (Pinecone), or AI Agents.
    - 'database': Databases, Caches, Storage.
    - 'queue': Message Queues, Event Buses.
    - 'gateway': API Gateways, Load Balancers, CDNs.
    
    Example node descriptions:
    - API Gateway: "Entry point for all client requests. Handles authentication, rate limiting, and request routing."
    - PostgreSQL: "Primary relational database for persistent data storage. Configured with read replicas for scalability."
    - Redis Cache: "In-memory cache layer for reducing database load and improving response times."
    - Kafka Queue: "Distributed event streaming platform for async communication between services."
    - Google Gemini: "Multimodal AI model for processing image and text inputs."
    
    Constraints:
    - Services must connect to Databases via defined protocols.
    - High traffic implies Load Balancers (Gateways).
    - Caches should be placed before Databases for read-heavy loads.
    - SELECT REAL WORLD TECHNOLOGIES for the "tech" field (e.g., "Next.js", "PostgreSQL", "Redis", "Kafka", "AWS", "Vercel").
    
    IMPORTANT: Output the complete JSON in the content field. Do not use markdown code blocks. Do not include the reasoning in the content. The content must start with "{" and contain the full architecture definition.`;
    }

    console.log(`[AI Client] Calling OpenAI API via provider: ${provider} (Model: ${config.model})${quickMode ? " [QUICK MODE]" : ""}`);

    return await client.chat.completions.create({
        model: config.model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ],
        stream: true,
        // @ts-ignore - provider specific params
        ...config.reasoningParam
    });
}

