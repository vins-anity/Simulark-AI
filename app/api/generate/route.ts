import { NextRequest, NextResponse } from "next/server";
import { generateArchitectureStream } from "@/lib/ai-client";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";

export const runtime = "nodejs"; // Switch to Node.js runtime for better stream compatibility

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
        const { prompt, model, mode, currentNodes, currentEdges, quickMode } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`[API] Starting generation (Model: ${model || "auto"}, Mode: ${mode || "default"}${quickMode ? ", QUICK" : ""})`);
        console.log(`[API DEBUG] User prompt: ${prompt.substring(0, 200).replace(/\n/g, " ")}${prompt.length > 200 ? "..." : ""}`);
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
                    console.log("[API DEBUG] Raw accumulated content length:", accumulatedContent.length);
                    console.log("[API DEBUG] Raw content preview (first 300 chars):", accumulatedContent.substring(0, 300).replace(/\n/g, " "));

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

                            console.log("[API DEBUG] Cleaned content for parsing (first 200 chars):", jsonStr.substring(0, 200).replace(/\n/g, " "));
                            console.log("[API DEBUG] Cleaned content length:", jsonStr.length);

                            const parsed = JSON.parse(jsonStr.trim());
                            if (parsed.nodes && parsed.edges) {
                                // Enrich nodes with tech ecosystem data (icons, normalized IDs)
                                const enrichedNodes = enrichNodesWithTech(parsed.nodes);
                                const enrichedData = { ...parsed, nodes: enrichedNodes };
                                console.log(`[API] Emitting result with ${enrichedNodes.length} nodes, ${parsed.edges.length} edges`);
                                controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: enrichedData }) + "\n"));
                                hasJsonResult = true;
                            } else {
                                console.warn("[API] Parsed JSON missing nodes or edges:", { hasNodes: !!parsed.nodes, hasEdges: !!parsed.edges });
                            }
                        } catch (parseErr: any) {
                            console.error("[API] Could not parse content as architecture JSON:", parseErr.message);
                            console.error("[API] Content that failed to parse (first 500 chars):", accumulatedContent.substring(0, 500).replace(/\n/g, " "));
                        }
                    }

                    // If no JSON result was emitted, send a warning to the client
                    if (!hasJsonResult && accumulatedContent.length > 0) {
                        console.warn("[API] No valid JSON architecture found in response. Content length:", accumulatedContent.length);
                        // Try one more time with more aggressive JSON extraction
                        try {
                            const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const parsed = JSON.parse(jsonMatch[0]);
                                if (parsed.nodes && parsed.edges) {
                                    const enrichedNodes = enrichNodesWithTech(parsed.nodes);
                                    const enrichedData = { ...parsed, nodes: enrichedNodes };
                                    console.log(`[API] Recovery: Found JSON with ${enrichedNodes.length} nodes, ${parsed.edges.length} edges`);
                                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: enrichedData }) + "\n"));
                                    hasJsonResult = true;
                                }
                            }
                        } catch (recoveryErr: any) {
                            console.error("[API] Recovery parse also failed:", recoveryErr.message);
                        }
                    }

                    controller.close();
                } catch (err: any) {
                    console.error("[API] Streaming error:", err.message);
                    controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', data: err.message }) + "\n"));
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
