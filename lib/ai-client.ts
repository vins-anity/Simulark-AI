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
    currentEdges: any[] = []
) {
    if (modelId) {
        console.log(`[AI Client] Generating with selected model: ${modelId} in mode: ${mode}`);
        // Map modelId to provider
        if (modelId === "glm-4.7-flash") {
            return await callModelStream("zhipu", prompt, mode, currentNodes, currentEdges);
        } else if (modelId === "arcee-ai") {
            return await callModelStream("openrouter", prompt, mode, currentNodes, currentEdges);
        }
    }

    // Default fallback logic
    // 1. Try Primary (Zhipu)
    try {
        console.log(`[AI Client] Starting generation. Primary: Zhipu GLM-4.7 Flash. Mode: ${mode}. Prompt length: ${prompt.length}`);
        const stream = await callModelStream("zhipu", prompt, mode, currentNodes, currentEdges);
        console.log("[AI Client] Zhipu stream established successfully.");
        return stream;
    } catch (error: any) {
        console.warn(`[AI Client] Zhipu failed (Error: ${error.message}). Switching to OpenRouter fallback...`);
        // 2. Fallback (OpenRouter)
        try {
            const stream = await callModelStream("openrouter", prompt, mode, currentNodes, currentEdges);
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
    currentEdges: any[] = []
) {
    const { client, config } = createAIClient(provider);

    let roleDescription = "Senior Solutions Architect";
    let focusArea = "scalability, fault tolerance, and best practices";

    if (mode === "startup") {
        roleDescription = "Lean Startup CTO";
        focusArea = "MVP speed, minimal costs, managed services, and rapid iteration. Avoid over-engineering.";
    } else if (mode === "corporate") {
        roleDescription = "Enterprise Architect";
        focusArea = "high availability, compliance, security, redundancy, and enterprise integration patterns.";
    } else {
        // Standard / Default mode
        roleDescription = "Senior Solutions Architect";
        focusArea = "scalability, fault tolerance, cost-efficiency, and modern architectural best practices.";
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

    const systemPrompt = `You are a ${roleDescription}. 
    Analyze the user's request and generate a detailed backend architecture.
    ${contextPrompt}
    
    CRITICAL INSTRUCTIONS:
    1. Think about the architecture in your reasoning/thinking process.
    2. Then, OUTPUT THE FINAL JSON in the content field - this is REQUIRED.
    3. The reasoning should NOT contain the JSON.
    4. The content field MUST contain ONLY the JSON object.
    
    JSON Schema (output this in the content field, NOT in reasoning):
    {
      "nodes": [ { "id": "string", "type": "gateway" | "service" | "database" | "queue", "position": { "x": number, "y": number }, "data": { "label": "string", "tech": "string", "serviceType": "gateway" | "service" | "database" | "queue", "validationStatus": "valid" | "warning" | "error", "costEstimate": number } } ],
      "edges": [ { "id": "string", "source": "string", "target": "string", "animated": boolean, "data": { "protocol": "http" | "queue" | "stream" } } ]
    }
    
    Protocol Examples:
    - Use "http" for synchronous calls (Service -> Service).
    - Use "queue" for async messaging (Service -> Queue, Queue -> Service).
    - Use "stream" for high-throughput data (Service -> Stream).
    
    Constraints:
    - Services must connect to Databases via defined protocols.
    - High traffic implies Load Balancers (Gateways).
    - Caches should be placed before Databases for read-heavy loads.
    - SELECT REAL WORLD TECHNOLOGIES for the "tech" field (e.g., "Next.js", "PostgreSQL", "Redis", "Kafka", "AWS", "Vercel").
    
    IMPORTANT: Output the complete JSON in the content field. Do not use markdown code blocks. Do not include the reasoning in the content. The content must start with "{" and contain the full architecture definition.`;

    console.log(`[AI Client] Calling OpenAI API via provider: ${provider} (Model: ${config.model})`);

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
