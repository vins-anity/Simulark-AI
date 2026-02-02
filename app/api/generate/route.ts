import { NextRequest, NextResponse } from "next/server";
import { generateArchitectureStream } from "@/lib/ai-client";

export const runtime = "edge"; // Use Edge Runtime for streaming if possible, or nodejs if not supported by dependencies

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const stream = await generateArchitectureStream(prompt);

        // Create a robust stream that separates reasoning from content
        const encoder = new TextEncoder();

        // @ts-ignore
        const readable = new ReadableStream({
            async start(controller) {
                console.log("[API Route] Stream started. Iterating chunks...");
                try {
                    // @ts-ignore
                    for await (const chunk of stream) {
                        // @ts-ignore
                        const delta = chunk.choices[0]?.delta;
                        if (!delta) continue;

                        const reasoning = (delta as any).reasoning_content || (delta as any).reasoning;
                        const content = delta.content;

                        if (reasoning) {
                            // console.log(`[API Route] Received Thinking chunk (${reasoning.length} chars)`); // Optional: Uncomment for very verbose
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'reasoning', data: reasoning }) + "\n"));
                        }
                        if (content) {
                            console.log(`[API Route] Received Content chunk (${content.length} chars)`);
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'content', data: content }) + "\n"));
                        }
                    }
                    console.log("[API Route] Stream completed successfully.");
                    controller.close();
                } catch (err: any) {
                    console.error("[API Route] Streaming error:", err);
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
