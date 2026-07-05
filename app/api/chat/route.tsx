import { type NextRequest, NextResponse } from "next/server";
import * as v from "valibot";
import { validateArchitecture } from "@/lib/architecture-validator";
import {
  cacheArchitectureResult,
  createCachedArchitectureStream,
  getCachedArchitecture,
} from "@/lib/cached-architecture-response";
import {
  ensureArchitectureEdges,
  type ArchitectureEdgeLike,
  type ArchitectureNodeLike,
} from "@/lib/infer-architecture-edges";
import { isDashScopeConfigured } from "@/lib/inference/dashscope-provider";
import { streamArchitectureInference } from "@/lib/inference/stream-architecture";
import type { StreamArchitecturePayload } from "@/lib/inference/stream-types";
import { runSimularkAgentStream } from "@/lib/agent/run-agent-stream";
import { shouldUseAgentPath } from "@/lib/agent/routing";
import type { SimularkAgentContext } from "@/lib/agent/types";
import { detectOperation } from "@/lib/intent-detector";
import {
  getInferenceTierConfig,
  resolveInferenceTier,
  tierToArchitectureMode,
} from "@/lib/inference-tier";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/network";
import { getUserPreferences } from "@/actions/users";
import {
  buildInferenceContextAsync,
  type InferenceContextInput,
} from "@/lib/inference/context-builder";
import {
  checkBurstRateLimit,
  checkIPRateLimit,
  checkRateLimit,
} from "@/lib/rate-limit";
import {
  type ArchitectureMode,
  detectArchitectureType,
  detectComplexity,
  validatePrompt,
} from "@/lib/prompt-engineering";
import {
  normalizeUserPreferences,
  type UserPreferences,
} from "@/lib/schema/user-preferences";
import { createArchitectureUIResponse } from "@/lib/inference/ui-stream";
import { snapshotFromRateLimitResult } from "@/lib/usage-status";
import { createClient } from "@/lib/supabase/server";
import { enrichNodesWithTech } from "@/lib/tech-normalizer";
import { validateTechOutput } from "@/lib/tech/validate-output";

export const maxDuration = 120;

const MessagePartSchema = v.object({
  type: v.string(),
  text: v.optional(v.string()),
});

const RawMessageSchema = v.object({
  id: v.optional(v.string()),
  role: v.union([
    v.literal("user"),
    v.literal("assistant"),
    v.literal("system"),
  ]),
  content: v.optional(v.string()),
  parts: v.optional(v.array(MessagePartSchema)),
  createdAt: v.optional(v.union([v.string(), v.date()])),
});

const ChatRequestSchema = v.object({
  messages: v.array(RawMessageSchema),
  chatId: v.optional(v.string()),
  mode: v.optional(
    v.union([
      v.literal("default"),
      v.literal("startup"),
      v.literal("enterprise"),
      v.literal("corporate"),
    ]),
  ),
  tier: v.optional(v.union([v.literal("flash"), v.literal("pro")])),
  model: v.optional(v.string()),
  currentNodes: v.optional(v.array(v.unknown())),
  currentEdges: v.optional(v.array(v.unknown())),
  projectId: v.optional(v.pipe(v.string(), v.uuid())),
  userPreferences: v.optional(v.record(v.string(), v.unknown())),
  streamFormat: v.optional(v.union([v.literal("legacy"), v.literal("ui")])),
});

interface ChatUIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Array<{ type: string; text?: string }>;
  createdAt: Date;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

const MAX_PROJECT_DOCUMENTS = 3;
const MAX_DOCUMENT_CHARS = 2400;
const MAX_TOTAL_DOCUMENT_CONTEXT_CHARS = 7200;

interface ProjectDocumentContext {
  context: string;
  documentCount: number;
}

async function buildProjectDocumentContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  projectId?: string,
): Promise<ProjectDocumentContext | null> {
  if (!projectId) {
    return null;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (projectError || !project) {
    return null;
  }

  const { data: docs, error } = await supabase
    .from("project_documents")
    .select("file_name, extracted_text, extraction_status, created_at")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .eq("extraction_status", "completed")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !docs || docs.length === 0) {
    return null;
  }

  const lines: string[] = [];
  let consumed = 0;
  let usedDocuments = 0;

  for (const doc of docs) {
    if (usedDocuments >= MAX_PROJECT_DOCUMENTS) break;
    const rawText =
      typeof doc.extracted_text === "string" ? doc.extracted_text.trim() : "";
    if (!rawText) continue;

    const remaining = MAX_TOTAL_DOCUMENT_CONTEXT_CHARS - consumed;
    if (remaining <= 0) break;

    const budget = Math.max(400, Math.min(MAX_DOCUMENT_CHARS, remaining));
    const snippet = rawText.slice(0, budget);
    if (!snippet) continue;

    const suffix =
      rawText.length > snippet.length
        ? "\n[...document excerpt truncated for context window...]"
        : "";

    lines.push(
      `Document ${usedDocuments + 1}: ${doc.file_name || "uploaded.pdf"}\n${snippet}${suffix}`,
    );
    consumed += snippet.length;
    usedDocuments += 1;
  }

  if (usedDocuments === 0) {
    return null;
  }

  return {
    documentCount: usedDocuments,
    context: [
      "PROJECT DOCUMENT CONTEXT (uploaded plans — PDF/TXT):",
      "Use this as supporting context when answering or generating architecture output.",
      "If the document context conflicts with direct user instructions in this request, prioritize the user request and mention the conflict briefly.",
      "",
      ...lines,
    ].join("\n"),
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!isDashScopeConfigured()) {
      return NextResponse.json(
        { error: "AI inference is not configured. Set DASHSCOPE_API_KEY." },
        { status: 503 },
      );
    }

    // Authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body with conversation history
    const body = await req.json();
    const parsedBody = v.safeParse(ChatRequestSchema, body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const parsed = parsedBody.output;
    const inferenceTier = resolveInferenceTier({
      tier: parsed.tier,
      model: parsed.model,
      mode: parsed.mode,
    });
    const tierConfig = getInferenceTierConfig(inferenceTier);
    const resolvedModelId = tierConfig.modelId;

    const ip = getClientIp(req.headers);
    const ipRateLimitResult = await checkIPRateLimit(ip);
    if (!ipRateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Daily limit reached for your network. Try again after reset.`,
          limitType: "ip",
          resetAt: ipRateLimitResult.reset,
          limit: ipRateLimitResult.limit,
        },
        { status: 429 },
      );
    }

    const burstResult = await checkBurstRateLimit(user.id);
    if (!burstResult.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Please wait a moment before trying again.`,
          limitType: "burst",
          resetAt: burstResult.reset,
          limit: burstResult.limit,
        },
        { status: 429 },
      );
    }

    const rateLimitResult = await checkRateLimit(user.id, resolvedModelId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: `Daily AI limit reached. Limit: ${rateLimitResult.limit}/day.`,
          limitType: "daily",
          resetAt: rateLimitResult.reset,
          limit: rateLimitResult.limit,
        },
        { status: 429 },
      );
    }

    const usageSnapshot = snapshotFromRateLimitResult({
      tier: inferenceTier,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    });

    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(rateLimitResult.limit),
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      "X-RateLimit-Reset": rateLimitResult.reset,
    };

    const {
      messages: rawMessages,
      chatId,
      mode,
      tier: requestedTier,
      model: modelId,
      currentNodes = [],
      currentEdges = [],
      projectId,
      userPreferences,
      streamFormat = "legacy",
    } = parsed;

    const serverPrefsResult = await getUserPreferences();
    const serverPreferences = serverPrefsResult.success
      ? normalizeUserPreferences(serverPrefsResult.preferences)
      : normalizeUserPreferences({});

    const mergedPreferences: UserPreferences = normalizeUserPreferences({
      ...serverPreferences,
      ...(userPreferences || {}),
    });

    const normalizedMode = tierToArchitectureMode(inferenceTier);

    // Convert to UIMessage format and limit to last 10 messages
    const messages: ChatUIMessage[] = rawMessages
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

    // Detect operation type for dynamic modifications
    const operationType = detectOperation(lastMessageContent, currentNodes);
    logger.info("Detected operation type", { operationType });

    const cachedArchitecture =
      await getCachedArchitecture<StreamArchitecturePayload>({
        prompt: lastMessageContent,
        model: resolvedModelId,
        mode: normalizedMode,
        userId: user.id,
        nodeCount: currentNodes.length,
        edgeCount: currentEdges.length,
        tier: inferenceTier,
        operation: operationType,
        preferencesHash: JSON.stringify({
          cloud: mergedPreferences.cloudProviders,
          lang: mergedPreferences.languages,
          fw: mergedPreferences.frameworks,
          tier: mergedPreferences.defaultInferenceTier,
        }),
      });

    if (cachedArchitecture) {
      const enrichedNodes = enrichNodesWithTech(
        (cachedArchitecture.nodes ?? []) as Record<string, unknown>[],
      );
      const edgeEnsured = ensureArchitectureEdges(
        enrichedNodes as unknown as ArchitectureNodeLike[],
        (cachedArchitecture.edges ?? []) as ArchitectureEdgeLike[],
      );
      const payload: StreamArchitecturePayload = {
        ...cachedArchitecture,
        nodes: enrichedNodes,
        edges: edgeEnsured.edges,
        validation: {
          ...cachedArchitecture.validation,
          appliedFixes: [
            ...(cachedArchitecture.validation?.appliedFixes ?? []),
            ...edgeEnsured.appliedFixes,
          ],
        },
      };

      if (edgeEnsured.inferred) {
        logger.info("Inferred edges for cached architecture", {
          edgeCount: edgeEnsured.edges.length,
        });
      }

      logger.info("Returning cached architecture result", {
        inferenceTier,
        model: resolvedModelId,
      });

      return new NextResponse(
        createCachedArchitectureStream(payload, usageSnapshot),
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            ...rateLimitHeaders,
          },
        },
      );
    }

    const encoder = new TextEncoder();
    let accumulatedText = "";
    let accumulatedReasoning = "";
    let architectureData: StreamArchitecturePayload | null = null;

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

    const streamMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join(""),
    }));

    const customStream = new ReadableStream({
      async start(controller) {
        let lastProgress = 0;
        let firstReasoningSeen = false;
        let firstContentSeen = false;

        const emitProgress = (
          progress: number,
          stage:
            | "analyzing"
            | "connecting"
            | "thinking"
            | "generating"
            | "validating"
            | "complete",
          detail?: string,
        ) => {
          const nextProgress = Math.min(
            100,
            Math.max(lastProgress, Math.round(progress)),
          );
          if (nextProgress === lastProgress && stage !== "complete") {
            return;
          }
          lastProgress = nextProgress;
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                type: "progress",
                data: { progress: nextProgress, stage, detail },
              })}\n`,
            ),
          );
        };

        const buildArchitecturePayload = (
          parsed: Record<string, unknown>,
          candidateTechIds: string[],
        ): StreamArchitecturePayload | null => {
          if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            return null;
          }

          const enrichedNodes = enrichNodesWithTech(parsed.nodes);
          const edgeEnsured = ensureArchitectureEdges(
            enrichedNodes as unknown as ArchitectureNodeLike[],
            (parsed.edges ?? []) as ArchitectureEdgeLike[],
          );
          const techValidated = validateTechOutput(
            enrichedNodes as Array<{ id: string; data?: { tech?: string } }>,
            candidateTechIds,
          );
          const validationResult = validateArchitecture(
            techValidated.nodes,
            edgeEnsured.edges,
            normalizedMode as ArchitectureMode,
            { autoFix: true },
          );

          return {
            nodes: validationResult.fixed?.nodes || enrichedNodes,
            edges: validationResult.fixed?.edges || edgeEnsured.edges,
            analysis:
              typeof parsed.analysis === "string" ? parsed.analysis : undefined,
            selectedArchitectureStrategy:
              typeof parsed.selectedArchitectureStrategy === "string"
                ? parsed.selectedArchitectureStrategy
                : undefined,
            preferenceConflicts: toStringArray(parsed.preferenceConflicts),
            recommendedStack: toStringArray(parsed.recommendedStack),
            preferenceAlignedAlternative: toStringArray(
              parsed.preferenceAlignedAlternative,
            ),
            validation: {
              valid: validationResult.valid,
              issues: [
                ...validationResult.issues,
                ...techValidated.issues.map((i) => i.message),
              ],
              appliedFixes: [
                ...edgeEnsured.appliedFixes,
                ...validationResult.appliedFixes,
              ],
            },
            candidateTechIds,
          };
        };

        try {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({ type: "quota", data: usageSnapshot })}\n`,
            ),
          );

          emitProgress(
            8,
            "analyzing",
            "Understanding requirements, mode, and current architecture",
          );

          const detection = detectArchitectureType(lastMessageContent);
          const complexity = detectComplexity(lastMessageContent);

          logger.info("Starting generation", {
            model: modelId || "auto",
            mode: normalizedMode,
            complexity,
            architectureType: detection.type,
            messageCount: messages.length,
          });

          let projectDocumentContext: ProjectDocumentContext | null = null;
          if (projectId) {
            try {
              projectDocumentContext = await buildProjectDocumentContext(
                supabase,
                user.id,
                projectId,
              );
            } catch (error) {
              logger.warn("Failed to load project PDF context", {
                projectId,
                error: String(error),
              });
            }
          }

          emitProgress(
            12,
            "analyzing",
            "Loading stack preferences and project context",
          );

          const inferenceContext = await buildInferenceContextAsync({
            userPreferences: mergedPreferences,
            currentNodes: currentNodes as InferenceContextInput["currentNodes"],
            currentEdges: currentEdges as InferenceContextInput["currentEdges"],
            conversationHistory,
            projectDocuments: projectDocumentContext?.context,
            tier: inferenceTier,
            operation: operationType,
            userMessage: lastMessageContent,
            userRequest: lastMessageContent,
            architectureType: detection.type,
            complexity,
          });

          const systemPrompt = inferenceContext.systemPrompt;
          const useAgentPath = shouldUseAgentPath(
            operationType,
            currentNodes.length,
            currentEdges.length,
          );

          emitProgress(16, "connecting", "Connecting to the selected model");

          const streamResult = useAgentPath
            ? await runSimularkAgentStream({
                ctx: {
                  userInput: lastMessageContent,
                  mode: normalizedMode as ArchitectureMode,
                  operationType,
                  nodes: currentNodes as SimularkAgentContext["nodes"],
                  edges: currentEdges as SimularkAgentContext["edges"],
                  userId: user.id,
                  architectureType: detection.type,
                  complexity,
                  userPreferences: mergedPreferences,
                  systemPrompt,
                  candidateTechIds: inferenceContext.techBundle.candidateIds,
                },
                tierConfig,
                messages: streamMessages,
              })
            : await streamArchitectureInference({
                tierConfig,
                systemPrompt,
                messages: streamMessages,
                structured: true,
              });

          const { fullStream: resultStream, meta: inferenceMeta } = streamResult;

          logger.info("Stream started", {
            systemPromptLength: systemPrompt.length,
            userMessage: lastMessageContent.substring(0, 50),
            inferenceTier,
            dashscopeModel: inferenceMeta.modelUsed,
            fallbackUsed: inferenceMeta.fallbackUsed,
            projectDocumentCount: projectDocumentContext?.documentCount || 0,
            path: useAgentPath ? "agent" : "structured",
          });

          emitProgress(18, "connecting", "Waiting for the model to respond");
          const candidateTechIds = inferenceContext.techBundle.candidateIds;

          // Process the stream
          for await (const part of resultStream) {
            switch (part.type) {
              case "inference-meta": {
                controller.enqueue(
                  encoder.encode(
                    `${JSON.stringify({
                      type: "inference-meta",
                      data: {
                        modelUsed: part.modelUsed,
                        primaryModel: part.primaryModel,
                        fallbackUsed: part.fallbackUsed,
                        attemptedModels: part.attemptedModels,
                      },
                    })}\n`,
                  ),
                );
                emitProgress(
                  28,
                  "thinking",
                  "Model connected — reasoning about your architecture",
                );
                break;
              }
              case "activity": {
                emitProgress(
                  part.progress ?? 45,
                  "generating",
                  part.detail,
                );
                break;
              }
              case "object-partial": {
                if (!firstContentSeen) {
                  firstContentSeen = true;
                  emitProgress(
                    42,
                    "generating",
                    "Generating the recommended architecture",
                  );
                }
                const payload = buildArchitecturePayload(part.object, candidateTechIds);
                if (payload) {
                  architectureData = payload;
                  emitProgress(
                    95,
                    "validating",
                    "Validating graph quality and policy compliance",
                  );
                  controller.enqueue(
                    encoder.encode(
                      `${JSON.stringify({
                        type: "result",
                        data: architectureData,
                      })}\n`,
                    ),
                  );
                }
                break;
              }
              case "text-delta": {
                accumulatedText += part.text;
                if (!firstContentSeen) {
                  firstContentSeen = true;
                  emitProgress(
                    42,
                    "generating",
                    "Generating the recommended architecture",
                  );
                }

                const contentProgress = Math.min(
                  88,
                  42 + Math.floor(accumulatedText.length / 120),
                );
                emitProgress(
                  contentProgress,
                  "generating",
                  "Building architecture graph and recommendation",
                );
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
                      const cleanJson = jsonMatch[0].replace(
                        /```json\n?|```/g,
                        "",
                      );
                      const parsed = JSON.parse(cleanJson);
                      const payload = buildArchitecturePayload(
                        parsed as Record<string, unknown>,
                        candidateTechIds,
                      );
                      if (payload) {
                        architectureData = payload;
                        emitProgress(
                          95,
                          "validating",
                          "Validating graph quality and policy compliance",
                        );
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
                if (!firstReasoningSeen) {
                  firstReasoningSeen = true;
                  emitProgress(
                    30,
                    "thinking",
                    "Ranking architecture options against your preferences",
                  );
                }

                const reasoningProgress = Math.min(
                  78,
                  30 + Math.floor(accumulatedReasoning.length / 140),
                );
                emitProgress(
                  reasoningProgress,
                  "thinking",
                  "Checking overlaps, conflicts, and trade-offs",
                );
                // Send reasoning chunk in legacy format
                controller.enqueue(
                  encoder.encode(
                    `${JSON.stringify({ type: "reasoning", data: part.text })}\n`,
                  ),
                );
                break;
              }
              case "finish": {
                if ("usage" in part && part.usage) {
                  controller.enqueue(
                    encoder.encode(
                      `${JSON.stringify({ type: "usage", data: part.usage })}\n`,
                    ),
                  );
                }

                if (!architectureData && part.object) {
                  const payload = buildArchitecturePayload(part.object, candidateTechIds);
                  if (payload) {
                    architectureData = payload;
                    emitProgress(
                      95,
                      "validating",
                      "Validating graph quality and policy compliance",
                    );
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

                // Fallback: parse accumulated text if structured output unavailable
                if (!architectureData) {
                  try {
                    // 1. Try to extract specific markdown code block first (most reliable)
                    const codeBlockMatch = accumulatedText.match(
                      /```json\n([\s\S]*?)\n```/,
                    );
                    if (codeBlockMatch) {
                      try {
                        const parsed = JSON.parse(codeBlockMatch[1]);
                        const payload = buildArchitecturePayload(
                          parsed as Record<string, unknown>,
                          candidateTechIds,
                        );
                        if (payload) {
                          architectureData = payload;
                        }
                      } catch (e) {
                        logger.warn("Failed to parse markedown code block", {
                          error: String(e),
                        });
                      }
                    }

                    // 2. If no code block or parse failed, try finding the largest JSON object
                    if (!architectureData) {
                      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        // Attempt to clean any potential leftover markdown if match was too greedy
                        const cleanJson = jsonMatch[0].replace(
                          /```json\n?|```/g,
                          "",
                        );
                        const parsed = JSON.parse(cleanJson);
                        const payload = buildArchitecturePayload(
                          parsed as Record<string, unknown>,
                          candidateTechIds,
                        );
                        if (payload) {
                          architectureData = payload;
                        }
                      }
                    }

                    if (architectureData) {
                      emitProgress(
                        95,
                        "validating",
                        "Validating graph quality and policy compliance",
                      );
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
                    logger.warn("Failed to parse architecture in finish step", {
                      error: String(e),
                    });
                  }
                }

                if (architectureData) {
                  void cacheArchitectureResult({
                    prompt: lastMessageContent,
                    result: architectureData,
                    model: resolvedModelId,
                    provider: "deepseek",
                    mode: normalizedMode,
                    userId: user.id,
                    nodeCount: currentNodes.length,
                    edgeCount: currentEdges.length,
                  });
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
                  fullResponseSnapshot: `${accumulatedText.substring(0, 200)}...`,
                });

                emitProgress(
                  100,
                  "complete",
                  "Recommended architecture and alternatives ready",
                );
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

    return new NextResponse(
      streamFormat === "ui"
        ? createArchitectureUIResponse(customStream, usageSnapshot).body
        : customStream,
      {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...(streamFormat === "ui"
          ? { "x-vercel-ai-ui-message-stream": "v1" }
          : {}),
        ...rateLimitHeaders,
      },
    },
    );
  } catch (error: any) {
    logger.error("[API Chat] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
