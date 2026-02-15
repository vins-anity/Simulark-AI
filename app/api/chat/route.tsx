import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { createZhipu } from "zhipu-ai-provider";
import { env } from "@/lib/env";
import { detectOperation } from "@/lib/intent-detector";
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

import OpenAI from "openai"; // Import standard OpenAI SDK

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

// NVIDIA (GLM-5) - Direct OpenAI Client
// We use the official OpenAI SDK to bypass Vercel AI SDK issues with NVIDIA's API
const nvidiaClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: env.NVIDIA_API_KEY,
});

type ProviderType = "zhipu" | "kimi" | "openrouter" | "nvidia";

function getProvider(modelId?: string): {
  provider: ProviderType;
  model: string;
} {
  // Map modelId to provider
  // NVIDIA models (starts with nvidia:)
  if (modelId?.startsWith("nvidia:")) {
    return { provider: "nvidia", model: modelId.replace("nvidia:", "") };
  }

  // GLM models from Zhipu (bigmodel.cn) - starts with glm-
  if (modelId?.startsWith("glm-")) {
    return { provider: "zhipu", model: modelId };
  }

  // GLM models from OpenRouter (Z.AI) - starts with z-ai/
  if (modelId?.startsWith("z-ai/") && !modelId.includes("glm5")) {
    return { provider: "openrouter", model: modelId };
  }

  // Standalone Kimi
  if (modelId?.startsWith("kimi:") || modelId?.startsWith("moonshot:")) {
    const cleanId = modelId.split(":")[1] || "kimi-k2.5";
    return { provider: "kimi", model: cleanId };
  }

  if (
    modelId?.includes("deepseek") ||
    modelId?.includes("gemini") ||
    modelId?.includes("claude") ||
    modelId?.includes("minimax") // Non-nvidia minimax
  ) {
    return { provider: "openrouter", model: modelId };
  }

  // Legacy NVIDIA fallback
  if (modelId?.includes("glm5") || modelId?.includes("nvidia")) {
    return { provider: "nvidia", model: "z-ai/glm5" };
  }

  // Default to GLM-5 (NVIDIA)
  return { provider: "nvidia", model: "z-ai/glm5" };
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
      userPreferences,
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

      conversationHistory,
      operationType,
      userPreferences,
    });

    // Get provider and model
    const { provider: providerType, model: effectiveModel } =
      getProvider(modelId);

    // Select the appropriate provider instance helpers
    const getModelInstance = (pType: ProviderType, mName: string) => {
      switch (pType) {
        case "zhipu":
          return zhipu(mName);
        case "kimi":
          return kimi(mName);
        case "openrouter":
          return openrouter.chat(mName);
        default:
          return zhipu(mName);
      }
    };

    let result: any;
    let fallbackToZhipu = false;

    // Direct OpenAI SDK path for NVIDIA
    if (providerType === "nvidia") {
        try {
            logger.info("Using direct NVIDIA client", { model: effectiveModel });
            // Tweak parameters based on the model
            let chat_template_kwargs: any = { enable_thinking: true, clear_thinking: false };
            let extra_body: any = {};

            if (effectiveModel.includes("minimax")) {
              // MiniMax M2.1 recommendations: top_k=40, temperature=1.0
              chat_template_kwargs = undefined;
              extra_body = { top_k: 40 };
            } else if (effectiveModel.includes("kimi")) {
              // Kimi K2.5 recommendations: thinking=true, temperature=1.0
              chat_template_kwargs = { thinking: true };
            }

            const completion = await nvidiaClient.chat.completions.create({
                model: effectiveModel, // e.g. "minimaxai/minimax-m2.1"
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map(m => ({
                        role: m.role as "user" | "assistant" | "system",
                        content: m.parts.map(p => p.type === 'text' ? p.text : '').join('')
                    }))
                ],
                temperature: 1.0, // Updated to 1.0 as recommended for these agentic models
                stream: true,
                ...(chat_template_kwargs ? { chat_template_kwargs } : {}),
                ...extra_body,
            } as any) as any;

            // Create an async iterable that mimics ai-sdk's fullStream
            const generator = async function* () {
                let usage = { promptTokens: 0, completionTokens: 0 };
                
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    // @ts-ignore - NVIDIA specific field
                    const reasoning = chunk.choices[0]?.delta?.reasoning_content;

                    if (reasoning) {
                        yield { type: "reasoning-delta", text: reasoning };
                    }
                    if (content) {
                        yield { type: "text-delta", text: content };
                    }
                    
                    if (chunk.usage) {
                        usage = {
                            promptTokens: chunk.usage.prompt_tokens || 0,
                            completionTokens: chunk.usage.completion_tokens || 0
                        };
                    }
                }
                
                // Simulating the finish event which is expected by the consumer loop
                yield { 
                    type: "finish", 
                    finishReason: "stop",
                    usage: { ...usage, totalTokens: usage.promptTokens + usage.completionTokens }
                };
            };

            result = { fullStream: generator() };

        } catch (error: any) {
            logger.error("NVIDIA Direct API Error", error);
             // Fallback logic for NVIDIA/GLM-5 Rate Limits or Errors
            if (
                error?.status === 429 ||
                error?.message?.includes("429") ||
                error?.statusCode === 429 ||
                 error?.status === 404 // Also fallback on 404 just in case
            ) {
                logger.warn(
                    "GLM-5 (NVIDIA) failed. Falling back to GLM-4.7 (Zhipu)",
                );
                fallbackToZhipu = true;
            } else {
                throw error;
            }
        }
    }

    if (providerType !== "nvidia" || fallbackToZhipu) {
      // Standard AI SDK path
      try {
            const fallbackModel = fallbackToZhipu ? "glm-4.7-flash" : effectiveModel;
            const fallbackProvider = fallbackToZhipu ? "zhipu" : providerType;

            // Stream text with conversation history
            result = streamText({
                model: getModelInstance(fallbackProvider as ProviderType, fallbackModel),
                system: systemPrompt,
                messages: await convertToModelMessages(messages),
                temperature: 0.7,
                maxOutputTokens: 131072,
            });
       } catch (error: any) {
           // For now assuming Zhipu fallback won't fail with same error
           throw error;
       }
    }

    logger.info("Stream started", {
      systemPromptLength: systemPrompt.length,
      userMessage: lastMessageContent.substring(0, 50),
      provider: providerType,
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
                // logger.debug("Text delta received", { len: part.text.length });
                // Send content chunk in legacy format
                controller.enqueue(
                  encoder.encode(
                    `${JSON.stringify({ type: "content", data: part.text })}\n`,
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
                      // clean potential markdown formatting from the match
                      const cleanJson = jsonMatch[0].replace(/```json\n?|```/g, "");
                      const parsed = JSON.parse(cleanJson);
                      if (parsed.nodes && parsed.edges) {
                        architectureData = {
                          ...parsed,
                          nodes: enrichNodesWithTech(parsed.nodes),
                        };
                        // Send result in legacy format
                        controller.enqueue(
                          encoder.encode(
                            `${JSON.stringify({
                              type: "result",
                              data: architectureData,
                            })}\n`,
                          ),
                        );
                      }
                    }
                  } catch (_e) {
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
                // Fallback: If we haven't extracted architecture yet, try one last time with the full text
                if (!architectureData) {
                  try {
                    // 1. Try to extract specific markdown code block first (most reliable)
                    const codeBlockMatch = accumulatedText.match(/```json\n([\s\S]*?)\n```/);
                    if (codeBlockMatch) {
                        try {
                            const parsed = JSON.parse(codeBlockMatch[1]);
                            if (parsed.nodes && parsed.edges) {
                                architectureData = {
                                  ...parsed,
                                  nodes: enrichNodesWithTech(parsed.nodes),
                                };
                            }
                        } catch (e) {
                            logger.warn("Failed to parse markedown code block", { error: String(e) });
                        }
                    }

                    // 2. If no code block or parse failed, try finding the largest JSON object
                    if (!architectureData) {
                    const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      // Attempt to clean any potential leftover markdown if match was too greedy
                      const cleanJson = jsonMatch[0].replace(/```json\n?|```/g, "");
                      const parsed = JSON.parse(cleanJson);
                      if (parsed.nodes && parsed.edges) {
                        architectureData = {
                          ...parsed,
                          nodes: enrichNodesWithTech(parsed.nodes),
                        };
                      }
                    }
                    }
                    
                    if (architectureData) {
                         // Send result in legacy format if found
                        controller.enqueue(
                          encoder.encode(
                            `${JSON.stringify({
                              type: "result",
                              data: architectureData,
                            })}\n`,
                          ),
                        );
                    }
                  } catch (e) {
                    logger.warn("Failed to parse architecture in finish step", { error: String(e) });
                  }
                }

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
                  fullResponseSnapshot: accumulatedText.substring(0, 200) + "..."
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
