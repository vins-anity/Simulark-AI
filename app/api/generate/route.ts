import { NextRequest, NextResponse } from "next/server";
import { generateArchitectureStream } from "@/lib/ai-client";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";
import { createClient } from "@/lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";
import { logger } from "@/lib/logger";

export const runtime = "nodejs"; // Switch to Node.js runtime for better stream compatibility

// Rate limiter: counts all generations per user regardless of project
// FREE_TIER_DAILY_LIMIT is configured in .env.local (default: 10)
const ratelimit = new Ratelimit({
    redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(env.FREE_TIER_DAILY_LIMIT, "1 d"),
    analytics: true,
});

// Helper to add timeout to a promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        )
    ]);
}

export async function POST(req: NextRequest) {
    try {
        // Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting (10 generations per day for free tier)
        const { success, limit, reset, remaining } = await ratelimit.limit(user.id);
        if (!success) {
            const resetDate = new Date(reset);
            return NextResponse.json(
                {
                    error: "Daily limit reached. Free tier users have 10 generations per day.",
                    resetAt: resetDate.toISOString(),
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                    }
                }
            );
        }

        const { prompt, model, mode, currentNodes, currentEdges, quickMode } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        logger.info("Starting generation", { model: model || "auto", mode: mode || "default", quickMode });
        logger.debug("User prompt", { preview: prompt.substring(0, 200), length: prompt.length });
        const stream = await generateArchitectureStream(prompt, model, mode, currentNodes, currentEdges, quickMode || false);

        // Create a robust stream that separates reasoning from content
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                let chunkCount = 0;
                let accumulatedContent = ""; // Track full content for parsing
                let hasJsonResult = false; // Track if we got a proper JSON result

                try {
                    // Use the OpenAI SDK's native iterator pattern
                    const iterator = stream[Symbol.asyncIterator]();

                    while (true) {
                        // Add 60 second timeout for each chunk (reasoning mode can be slow)
                        const { done, value: chunk } = await withTimeout(
                            iterator.next(),
                            60000,
                            `Timeout waiting for chunk ${chunkCount + 1} after 60 seconds`
                        );

                        if (done) break;
                        chunkCount++;

                        const delta = chunk.choices?.[0]?.delta;
                        if (!delta) continue;

                        const reasoning = (delta as any).reasoning_content || (delta as any).reasoning;
                        const content = delta.content;

                        if (reasoning) {
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'reasoning', data: reasoning }) + "\n"));
                        }
                        if (content) {
                            accumulatedContent += content;
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'content', data: content }) + "\n"));
                        }
                    }

                    // DEBUG: Log accumulated content for diagnosis
                    logger.debug("Raw accumulated content", { length: accumulatedContent.length, preview: accumulatedContent.substring(0, 100) });

                    // Parse accumulated content and emit result chunk for canvas rendering
                    if (accumulatedContent) {
                        try {
                            // Clean markdown code blocks if present
                            let jsonStr = accumulatedContent.trim();

                            // Try multiple cleanup strategies
                            // Strategy 1: Remove code block markers
                            if (jsonStr.startsWith('```json')) {
                                jsonStr = jsonStr.slice(7);
                            } else if (jsonStr.startsWith('```')) {
                                jsonStr = jsonStr.slice(3);
                            }
                            if (jsonStr.endsWith('```')) {
                                jsonStr = jsonStr.slice(0, -3);
                            }

                            // Strategy 2: Find first { and last } to extract JSON
                            const firstBrace = jsonStr.indexOf('{');
                            const lastBrace = jsonStr.lastIndexOf('}');
                            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
                            }

                            logger.debug("Cleaned content for parsing", { length: jsonStr.length });

                            const parsed = JSON.parse(jsonStr.trim());
                            if (parsed.nodes && parsed.edges) {
                                // Enrich nodes with tech ecosystem data (icons, normalized IDs)
                                const enrichedNodes = enrichNodesWithTech(parsed.nodes);
                                const enrichedData = { ...parsed, nodes: enrichedNodes };
                                logger.info("Emitting result", { nodes: enrichedNodes.length, edges: parsed.edges.length });
                                controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: enrichedData }) + "\n"));
                                hasJsonResult = true;
                            } else {
                                logger.warn("Parsed JSON missing nodes or edges", { hasNodes: !!parsed.nodes, hasEdges: !!parsed.edges });
                            }
                        } catch (parseErr: any) {
                            logger.error("Could not parse content as architecture JSON", parseErr, { contentLength: accumulatedContent.length });
                        }
                    }

                    if (!hasJsonResult && accumulatedContent.length > 0) {
                        logger.warn("No valid JSON architecture found in response", { contentLength: accumulatedContent.length });
                        // Try one more time with more aggressive JSON extraction
                        try {
                            const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const parsed = JSON.parse(jsonMatch[0]);
                                if (parsed.nodes && parsed.edges) {
                                    const enrichedNodes = enrichNodesWithTech(parsed.nodes);
                                    const enrichedData = { ...parsed, nodes: enrichedNodes };
                                    logger.info("Recovery: Found JSON", { nodes: enrichedNodes.length, edges: parsed.edges.length });
                                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: enrichedData }) + "\n"));
                                    hasJsonResult = true;
                                }
                            }
                        } catch (recoveryErr: any) {
                            logger.error("Recovery parse also failed", recoveryErr);
                        }
                    }

                    controller.close();
                } catch (err: any) {
                    logger.error("Streaming error", err);
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', data: "An error occurred during generation" }) + "\n"));
                    controller.error(err);
                }
            },
        });

        return new NextResponse(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error: any) {
        console.error("[API Generate] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
