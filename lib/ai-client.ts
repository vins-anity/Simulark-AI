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
        reasoningParam: { thinking: { type: "enabled" } },
        // reasoningParam: {}, optional disabled
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

export async function generateArchitectureStream(prompt: string) {
    // 1. Try Primary (Zhipu)
    try {
        console.log(`[AI Client] Starting generation. Primary: Zhipu GLM-4.7 Flash. Prompt length: ${prompt.length}`);
        const stream = await callModelStream("zhipu", prompt);
        console.log("[AI Client] Zhipu stream established successfully.");
        return stream;
    } catch (error: any) {
        console.warn(`[AI Client] Zhipu failed (Error: ${error.message}). Switching to OpenRouter fallback...`);
        // 2. Fallback (OpenRouter)
        try {
            const stream = await callModelStream("openrouter", prompt);
            console.log("[AI Client] OpenRouter stream established successfully.");
            return stream;
        } catch (fbError: any) {
            console.error(`[AI Client] OpenRouter fallback also failed: ${fbError.message}`);
            throw fbError;
        }
    }
}

async function callModelStream(provider: AIProvider, prompt: string) {
    const { client, config } = createAIClient(provider);

    const systemPrompt = `You are a Senior Solutions Architect. 
  Analyze the user's request and generate a detailed backend architecture.
  
  Phase 1: Deep Thinking. Plan the architecture, considering scalability, fault tolerance, and best practices. Output your thoughts in the reasoning stream.
  
  Phase 2: JSON Generation. Output the final architecture as a strict JSON object.
  The JSON MUST follow this schema:
  {
    "nodes": [ { "id": "string", "type": "gateway" | "service" | "database" | "queue", "position": { "x": number, "y": number }, "data": { "label": "string", "tech": "string", "serviceType": "gateway" | "service" | "database" | "queue", "validationStatus": "valid" | "warning" | "error", "costEstimate": number } } ],
    "edges": [ { "id": "string", "source": "string", "target": "string", "animated": boolean, "data": { "protocol": "http" | "queue" | "stream" } } ]
  }
  
  Examples of protocol usage:
  - Use "http" for synchronous calls (Service -> Service).
  - Use "queue" for async messaging (Service -> Queue, Queue -> Service).
  - Use "stream" for high-throughput data (Service -> Stream).
  
  Constraints:
  - Services must connect to Databases via defined protocols.
  - High traffic implies Load Balancers (Gateways).
  - Caches should be placed before Databases for read-heavy loads.
  - SELECT REAL WORLD TECHNOLOGIES for the "tech" field (e.g., "Next.js", "PostgreSQL", "Redis", "Kafka", "AWS", "Vercel").
  - "tech" field MUST match standard names to ensure icon rendering.
  
  Return ONLY the JSON in the final response content. Do not include markdown formatting like \`\`\`json.`;

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
