import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { createZhipu } from "zhipu-ai-provider";
import { diagramTools, getToolsForOperation } from "@/lib/diagram-tools";
import { env } from "@/lib/env";
import { detectOperation, type OperationType } from "@/lib/intent-detector";
import { logger } from "@/lib/logger";
import {
  type ArchitectureMode,
  buildEnhancedSystemPrompt,
  detectArchitectureType,
  detectComplexity,
  validatePrompt,
} from "@/lib/prompt-engineering";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";

export const maxDuration = 120; // 2 minutes for complex generations
export const runtime = "nodejs";

// Initialize providers
const zhipu = createZhipu({
  apiKey: env.ZHIPU_API_KEY,
});

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

// Kimi uses OpenAI-compatible API
const kimi = createOpenAI({
  baseURL: env.KIMI_BASE_URL || "https://api.moonshot.ai/v1",
  apiKey: env.KIMI_API_KEY,
});

type ProviderType = "zhipu" | "kimi" | "openrouter";

function getProvider(modelId?: string): {
  provider: ProviderType;
  model: string;
} {
  // Map modelId to provider
  // GLM models from Zhipu (bigmodel.cn) - starts with glm-
  if (modelId?.startsWith("glm-")) {
    return { provider: "zhipu", model: modelId };
  }
  // GLM models from OpenRouter (Z.AI) - starts with z-ai/
  if (modelId?.startsWith("z-ai/")) {
    return { provider: "openrouter", model: modelId };
  }
  if (modelId?.includes("kimi") || modelId?.includes("moonshot")) {
    return { provider: "kimi", model: modelId };
  }
  if (
    modelId?.includes("deepseek") ||
    modelId?.includes("gemini") ||
    modelId?.includes("claude")
  ) {
    return { provider: "openrouter", model: modelId };
  }

  // Default to Zhipu
  return { provider: "zhipu", model: "glm-4.7-flash" };
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Daily limit reached. Limit: ${rateLimitResult.limit}/day. Upgrade for more.`,
          resetAt: rateLimitResult.reset,
        },
        { status: 429 },
      );
    }

    // Parse request body with conversation history
    const body = await req.json();
    const {
      messages: rawMessages,
      chatId,
      mode = "default",
      model: modelId,
      currentNodes = [],
      currentEdges = [],
      projectId,
    } = body;

    // Validate messages
    if (
      !rawMessages ||
      !Array.isArray(rawMessages) ||
      rawMessages.length === 0
    ) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 },
      );
    }

    // Convert to UIMessage format and limit to last 10 messages
    const messages: UIMessage[] = rawMessages
      .slice(-10) // Keep only last 10 messages
      .map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        parts: m.parts || [{ type: "text" as const, text: m.content }],
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      }));

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      logger.warn("Validation failed: Last message is not from user", {
        lastMessageRole: lastMessage.role,
        messageCount: messages.length,
      });
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 },
      );
    }

    // Extract text content from the last message
    const lastMessageContent = lastMessage.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

    if (!lastMessageContent.trim()) {
      logger.warn("Validation failed: Empty message content", {
        messageId: lastMessage.id,
        parts: lastMessage.parts,
      });
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 },
      );
    }

    // Validate prompt quality
    const validation = validatePrompt(lastMessageContent);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error,
          suggestedPrompts: validation.suggestedPrompts,
          type: "validation_error",
        },
        { status: 400 },
      );
    }

    if (validation.warning) {
      logger.warn("Prompt validation warning", { warning: validation.warning });
    }

    // Detect architecture type and complexity
    const detection = detectArchitectureType(lastMessageContent);
    const complexity = detectComplexity(lastMessageContent);

    logger.info("Starting generation", {
      model: modelId || "auto",
      mode: mode || "default",
      complexity,
      architectureType: detection.type,
      messageCount: messages.length,
    });

    // Build conversation history for context (exclude the last message)
    const conversationHistory = messages.slice(0, -1).map((m) => {
      const content = m.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
      return {
        role: m.role as "user" | "assistant",
        content,
      };
    });

    // Detect operation type for dynamic modifications
    const operationType = detectOperation(lastMessageContent, currentNodes);
    logger.info("Detected operation type", { operationType });

    // Build system prompt with full context including operation type
    const systemPrompt = buildEnhancedSystemPrompt({
      userInput: lastMessageContent,
      architectureType: detection.type,
      detectedIntent: `Architecture: ${detection.type}, Complexity: ${complexity}`,
      currentNodes,
      currentEdges,
      mode: (mode || "default") as ArchitectureMode,
      quickMode: false,
      conversationHistory,
      operationType,
    });

    // Get provider and model
    const { provider: providerType, model: effectiveModel } =
      getProvider(modelId);

    // Select the appropriate provider instance
    let model:
      | ReturnType<typeof zhipu>
      | ReturnType<typeof kimi>
      | ReturnType<typeof openrouter.chat>;
    switch (providerType) {
      case "zhipu":
        model = zhipu(effectiveModel);
        break;
      case "kimi":
        model = kimi(effectiveModel);
        break;
      case "openrouter":
        model = openrouter.chat(effectiveModel);
        break;
      default:
        model = zhipu(effectiveModel);
    }

    // Determine reasoning level based on mode and complexity
    const reasoningLevel =
      mode === "startup"
        ? "disabled"
        : mode === "enterprise" || complexity === "complex"
          ? "enabled"
          : "low";

    logger.debug("Provider configuration", {
      provider: providerType,
      model: effectiveModel,
      mode,
      complexity,
      reasoningLevel,
    });

    // Stream text with conversation history
    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    // Create custom stream that transforms to legacy format for frontend compatibility
    const encoder = new TextEncoder();
    let accumulatedText = "";
    let accumulatedReasoning = "";
    let architectureData: any = null;

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          // Process the stream
          for await (const part of result.fullStream) {
            switch (part.type) {
              case "text-delta": {
                accumulatedText += part.text;
                // Send content chunk in legacy format
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ type: "content", data: part.text }) + "\n",
                  ),
                );

                // Try to extract architecture JSON as it streams
                if (
                  accumulatedText.includes('"nodes"') &&
                  accumulatedText.includes('"edges"') &&
                  !architectureData
                ) {
                  try {
                    const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0]);
                      if (parsed.nodes && parsed.edges) {
                        architectureData = {
                          ...parsed,
                          nodes: enrichNodesWithTech(parsed.nodes),
                        };
                        // Send result in legacy format
                        controller.enqueue(
                          encoder.encode(
                            JSON.stringify({
                              type: "result",
                              data: architectureData,
                            }) + "\n",
                          ),
                        );
                      }
                    }
                  } catch (e) {
                    // JSON not complete yet
                  }
                }
                break;
              }
              case "reasoning-delta": {
                accumulatedReasoning += part.text;
                // Send reasoning chunk in legacy format
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ type: "reasoning", data: part.text }) +
                      "\n",
                  ),
                );
                break;
              }
              case "finish": {
                // Save to database if chatId provided
                if (chatId) {
                  try {
                    await supabase.from("chat_messages").insert({
                      chat_id: chatId,
                      role: "assistant",
                      content: accumulatedText,
                      reasoning: accumulatedReasoning,
                    });
                  } catch (saveError: any) {
                    logger.error("Failed to save message", saveError);
                  }
                }

                logger.info("Generation completed", {
                  messageLength: accumulatedText.length,
                  hasArchitecture: !!architectureData,
                });

                controller.close();
                break;
              }
            }
          }
        } catch (error: any) {
          logger.error("Stream error", error);
          controller.error(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    logger.error("[API Chat] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
