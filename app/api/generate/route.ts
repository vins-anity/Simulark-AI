import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { getCachedResponse } from "@/lib/ai-cache";
import { generateArchitectureStream } from "@/lib/ai-client";
import {
  type ValidationIssue,
  validateArchitecture,
} from "@/lib/architecture-validator";
import { createLogger } from "@/lib/logger";
import {
  normalizeArchitectureMode,
  validatePrompt,
} from "@/lib/prompt-engineering";
import { checkRateLimit } from "@/lib/rate-limit";
import { GenerateRequestSchema } from "@/lib/schema/api";
import { createClient } from "@/lib/supabase/server";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";

export const runtime = "nodejs"; // Switch to Node.js runtime for better stream compatibility

// Create module-specific logger
const logger = createLogger("api:generate");

// Helper to add timeout to a promise
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

export async function POST(req: NextRequest) {
  // Generate request ID for tracing
  const requestId = randomUUID();
  const timer = logger.time("generate-request");

  try {
    // Authentication check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      logger.warn("Unauthorized access attempt", { requestId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create user-scoped logger
    const userLogger = logger.withRequest(requestId, user.id);
    userLogger.info("Generation request started");

    // Parse body early
    const rawBody = await req.json();
    const body =
      rawBody?.mode === "corporate"
        ? { ...rawBody, mode: "enterprise" }
        : rawBody;
    const parsedBody = v.safeParse(GenerateRequestSchema, body);
    if (!parsedBody.success) {
      userLogger.warn("Invalid generation request payload");
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const {
      prompt,
      model,
      mode,
      currentNodes = [],
      currentEdges = [],
    } = parsedBody.output;
    const normalizedMode = normalizeArchitectureMode(mode);

    // Rate Limiting Check (New DB-based logic)
    const rateLimitResult = await checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      userLogger.warn("Rate limit exceeded", {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
      });
      return NextResponse.json(
        {
          error: `Daily limit reached. Limit: ${rateLimitResult.limit}/day. Upgrade for more.`,
          resetAt: rateLimitResult.reset,
          limit: rateLimitResult.limit,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset,
          },
        },
      );
    }

    if (!prompt) {
      userLogger.warn("Missing prompt in request");
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Validate prompt quality
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      userLogger.warn("Prompt validation failed", { error: validation.error });
      return NextResponse.json(
        {
          error: validation.error,
          suggestedPrompts: validation.suggestedPrompts,
          type: "validation_error",
        },
        { status: 400 },
      );
    }

    // Log warning if prompt is just a greeting
    if (validation.warning) {
      userLogger.warn("Prompt validation warning", {
        warning: validation.warning,
      });
    }

    // Check for cached response
    const cachedResult = await getCachedResponse<{
      nodes: Array<
        Record<string, unknown> & { data?: Record<string, unknown> }
      >;
      edges: unknown[];
    }>({
      prompt,
      model,
      mode: normalizedMode,
      userId: user.id,
    });

    if (cachedResult) {
      userLogger.info("Returning cached architecture result");
      const enrichedNodes = enrichNodesWithTech(cachedResult.nodes);
      return NextResponse.json({
        type: "cached",
        data: { ...cachedResult, nodes: enrichedNodes },
      });
    }

    userLogger.info("Starting generation", {
      model: model || "auto",
      mode: normalizedMode,
      promptLength: prompt.length,
    });
    const stream = await generateArchitectureStream(
      prompt,
      model,
      normalizedMode,
      currentNodes,
      currentEdges,
    );

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
            // Add 120 second timeout for each chunk (Zhipu can be slow on complex generations)
            const { done, value: chunk } = await withTimeout(
              iterator.next(),
              120000,
              `Timeout waiting for chunk ${chunkCount + 1} after 120 seconds`,
            );

            if (done) break;
            chunkCount++;

            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;

            const reasoning =
              (delta as any).reasoning_content || (delta as any).reasoning;
            const content = delta.content;

            if (reasoning) {
              controller.enqueue(
                encoder.encode(
                  `${JSON.stringify({ type: "reasoning", data: reasoning })}\n`,
                ),
              );
            }
            if (content) {
              accumulatedContent += content;
              controller.enqueue(
                encoder.encode(
                  `${JSON.stringify({ type: "content", data: content })}\n`,
                ),
              );
            }
          }

          // DEBUG: Log accumulated content for diagnosis
          userLogger.debug("Raw accumulated content", {
            length: accumulatedContent.length,
            preview: accumulatedContent.substring(0, 100),
          });

          // Parse accumulated content and emit result chunk for canvas rendering
          if (accumulatedContent) {
            try {
              // Clean markdown code blocks if present
              let jsonStr = accumulatedContent.trim();

              // Try multiple cleanup strategies
              // Strategy 1: Remove code block markers
              if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.slice(7);
              } else if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.slice(3);
              }
              if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.slice(0, -3);
              }

              // Strategy 2: Find first { and last } to extract JSON
              const firstBrace = jsonStr.indexOf("{");
              const lastBrace = jsonStr.lastIndexOf("}");
              if (
                firstBrace !== -1 &&
                lastBrace !== -1 &&
                lastBrace > firstBrace
              ) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
              }

              userLogger.debug("Cleaned content for parsing", {
                length: jsonStr.length,
              });

              const parsed = JSON.parse(jsonStr.trim());
              if (parsed.nodes && parsed.edges) {
                // Enrich nodes with tech ecosystem data (icons, normalized IDs)
                const enrichedNodes = enrichNodesWithTech(parsed.nodes);

                // Validate the generated architecture
                const validationResult = validateArchitecture(
                  enrichedNodes,
                  parsed.edges,
                  normalizedMode,
                  { autoFix: true },
                );

                if (!validationResult.valid) {
                  userLogger.warn("Architecture validation issues", {
                    issues: validationResult.issues,
                  });
                }

                // Use fixed architecture if auto-fixes were applied
                const finalNodes =
                  validationResult.fixed?.nodes || enrichedNodes;
                const finalEdges =
                  validationResult.fixed?.edges || parsed.edges;

                const enrichedData = {
                  nodes: finalNodes,
                  edges: finalEdges,
                  validation: {
                    valid: validationResult.valid,
                    issues: validationResult.issues,
                    appliedFixes: validationResult.appliedFixes,
                  },
                };

                userLogger.info("Emitting result", {
                  nodes: finalNodes.length,
                  edges: finalEdges.length,
                  validationIssues: validationResult.issues.length,
                  appliedFixes: validationResult.appliedFixes.length,
                });
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ type: "result", data: enrichedData }) +
                      "\n",
                  ),
                );
                hasJsonResult = true;
              } else {
                userLogger.warn("Parsed JSON missing nodes or edges", {
                  hasNodes: !!parsed.nodes,
                  hasEdges: !!parsed.edges,
                });
              }
            } catch (parseErr: any) {
              userLogger.error(
                "Could not parse content as architecture JSON",
                parseErr,
                { contentLength: accumulatedContent.length },
              );
            }
          }

          if (!hasJsonResult && accumulatedContent.length > 0) {
            userLogger.warn("No valid JSON architecture found in response", {
              contentLength: accumulatedContent.length,
            });
            // Try one more time with more aggressive JSON extraction
            try {
              const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.nodes && parsed.edges) {
                  const enrichedNodes = enrichNodesWithTech(parsed.nodes);

                  // Validate recovered architecture
                  const validationResult = validateArchitecture(
                    enrichedNodes,
                    parsed.edges,
                    normalizedMode,
                    { autoFix: true },
                  );

                  const finalNodes =
                    validationResult.fixed?.nodes || enrichedNodes;
                  const finalEdges =
                    validationResult.fixed?.edges || parsed.edges;

                  const enrichedData = {
                    nodes: finalNodes,
                    edges: finalEdges,
                    validation: {
                      valid: validationResult.valid,
                      issues: validationResult.issues,
                      appliedFixes: validationResult.appliedFixes,
                    },
                  };

                  userLogger.info("Recovery: Found JSON with validation", {
                    nodes: finalNodes.length,
                    edges: finalEdges.length,
                    validationIssues: validationResult.issues.length,
                  });
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({ type: "result", data: enrichedData }) +
                        "\n",
                    ),
                  );
                  hasJsonResult = true;
                }
              }
            } catch (recoveryErr: any) {
              userLogger.error("Recovery parse also failed", recoveryErr);
            }
          }

          timer.end({ success: hasJsonResult, chunks: chunkCount });
          controller.close();
        } catch (err: any) {
          userLogger.error("Streaming error", err);
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                type: "error",
                data: "An error occurred during generation",
              })}\n`,
            ),
          );
          controller.error(err);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    timer.end({ success: false });
    logger.error("Generation request failed", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
