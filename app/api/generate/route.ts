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
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`[API Route] Starting generation at ${new Date().toISOString()}`);
        const stream = await generateArchitectureStream(prompt);
        console.log(`[API Route] Stream obtained in ${Date.now() - startTime}ms`);

        // Create a robust stream that separates reasoning from content
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                console.log("[API Route] Stream started. Iterating chunks...");
                let chunkCount = 0;
                let lastChunkTime = Date.now();

                try {
                    // Use the OpenAI SDK's native iterator pattern
                    const iterator = stream[Symbol.asyncIterator]();

                    while (true) {
                        const waitStart = Date.now();
                        console.log(`[API Route] Waiting for chunk ${chunkCount + 1}... (elapsed: ${waitStart - startTime}ms)`);

                        // Add 60 second timeout for each chunk (reasoning mode can be slow)
                        const { done, value: chunk } = await withTimeout(
                            iterator.next(),
                            60000,
                            `Timeout waiting for chunk ${chunkCount + 1} after 60 seconds`
                        );

                        const chunkReceivedTime = Date.now();
                        const waitDuration = chunkReceivedTime - waitStart;
                        console.log(`[API Route] Chunk ${chunkCount + 1} received after ${waitDuration}ms`);

                        if (done) {
                            console.log(`[API Route] Iterator done after ${chunkCount} chunks`);
                            break;
                        }

                        chunkCount++;

                        // Log raw chunk structure (truncated for readability)
                        const chunkStr = JSON.stringify(chunk);
                        console.log(`[API Route] Raw chunk ${chunkCount} (${chunkStr.length} chars): ${chunkStr.substring(0, 500)}...`);

                        const delta = chunk.choices?.[0]?.delta;
                        if (!delta) {
                            console.log(`[API Route] No delta in chunk ${chunkCount}, skipping...`);
                            continue;
                        }

                        const reasoning = (delta as any).reasoning_content || (delta as any).reasoning;
                        const content = delta.content;

                        if (reasoning) {
                            console.log(`[API Route] Reasoning chunk ${chunkCount} (${reasoning.length} chars)`);
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'reasoning', data: reasoning }) + "\n"));
                        }
                        if (content) {
                            console.log(`[API Route] Content chunk ${chunkCount} (${content.length} chars): ${content.substring(0, 100)}...`);
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'content', data: content }) + "\n"));
                        }

                        // If neither reasoning nor content, log what we got
                        if (!reasoning && !content) {
                            console.log(`[API Route] Chunk ${chunkCount} has no reasoning or content. Delta keys:`, Object.keys(delta));
                            console.log(`[API Route] Full delta:`, JSON.stringify(delta));
                        }

                        lastChunkTime = chunkReceivedTime;
                    }

                    console.log(`[API Route] Stream completed successfully. Total chunks: ${chunkCount}, Total time: ${Date.now() - startTime}ms`);
                    controller.close();
                } catch (err: any) {
                    console.error("[API Route] Streaming error:", err);
                    console.error(`[API Route] Error occurred after ${Date.now() - startTime}ms and ${chunkCount} chunks`);
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
