import { NextRequest, NextResponse } from "next/server";
import { generateArchitectureStream } from "@/lib/ai-client";

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
    const startTime = Date.now();

    try {
        const { prompt, model, mode } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`[API] Starting generation (Model: ${model || "auto"}, Mode: ${mode || "default"})`);
        const stream = await generateArchitectureStream(prompt, model, mode);

        // Create a robust stream that separates reasoning from content
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                let chunkCount = 0;
                let accumulatedContent = ""; // Track full content for parsing

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

                    // Parse accumulated content and emit result chunk for canvas rendering
                    if (accumulatedContent) {
                        try {
                            // Clean markdown code blocks if present
                            let jsonStr = accumulatedContent.trim();
                            if (jsonStr.startsWith('```json')) {
                                jsonStr = jsonStr.slice(7);
                            }
                            if (jsonStr.startsWith('```')) {
                                jsonStr = jsonStr.slice(3);
                            }
                            if (jsonStr.endsWith('```')) {
                                jsonStr = jsonStr.slice(0, -3);
                            }
                            const parsed = JSON.parse(jsonStr.trim());
                            if (parsed.nodes && parsed.edges) {
                                console.log(`[API] Emitting result with ${parsed.nodes.length} nodes, ${parsed.edges.length} edges`);
                                controller.enqueue(encoder.encode(JSON.stringify({ type: 'result', data: parsed }) + "\n"));
                            }
                        } catch (parseErr) {
                            console.warn("[API] Could not parse content as architecture JSON:", parseErr);
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
