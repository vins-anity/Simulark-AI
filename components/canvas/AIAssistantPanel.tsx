"use client";

import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  addMessage,
  createChat as createChatAction,
  deleteChat as deleteChatAction,
  getChatWithMessages,
  getOrCreateDefaultChat,
  getProjectChats,
  updateChatTitle as updateChatTitleAction,
} from "@/actions/chats";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchitectureMode } from "@/lib/prompt-engineering";
import { cn } from "@/lib/utils";
import { StreamingMessage } from "./StreamingMessage";

interface AIAssistantPanelProps {
  onGenerationSuccess: (data: any) => void;
  projectId: string;
  isResizable?: boolean;
  getCurrentNodes?: () => any[];
  getCurrentEdges?: () => any[];
  initialPrompt?: string;
  initialMetadata?: Record<string, any>;
  isOpen?: boolean;
  onToggle?: () => void;
  onInitialPromptProcessed?: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  isThinking?: boolean;
}

interface Chat {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

type GenerationState =
  | "idle"
  | "preparing"
  | "generating"
  | "complete"
  | "error";

// Signal strength indicator based on streaming progress
function SignalStrengthIndicator({
  isGenerating,
  streamProgress,
}: {
  isGenerating: boolean;
  streamProgress: number;
}) {
  const bars = [
    { width: "20%", delay: 0 },
    { width: "40%", delay: 0.1 },
    { width: "60%", delay: 0.2 },
    { width: "80%", delay: 0.3 },
    { width: "100%", delay: 0.4 },
  ];

  const activeBars = Math.ceil((streamProgress / 100) * 5);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-0.5 h-3">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className={cn(
              "w-0.5 rounded-sm",
              isGenerating
                ? i < activeBars
                  ? "bg-brand-orange"
                  : "bg-brand-charcoal/10 dark:bg-border-primary"
                : "bg-brand-charcoal/10 dark:bg-border-primary",
            )}
            initial={{ height: 2 }}
            animate={{
              height: isGenerating && i < activeBars ? [2, 8, 4, 10, 6][i] : 2,
              opacity: isGenerating && i < activeBars ? 1 : 0.3,
            }}
            transition={{
              duration: 0.5,
              repeat: isGenerating ? Infinity : 0,
              repeatType: "reverse",
              delay: bar.delay,
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[8px] uppercase tracking-wider text-brand-charcoal/40">
        {isGenerating ? `${streamProgress.toFixed(0)}%` : "READY"}
      </span>
    </div>
  );
}

// Processing steps indicator
function ProcessingSteps({ isGenerating }: { isGenerating: boolean }) {
  const steps = ["ANALYZING", "PLANNING", "GENERATING", "VALIDATING"];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <motion.div
        className="flex items-center gap-1"
        animate={{ x: [0, -20] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <span
              className={cn(
                "font-mono text-[8px] uppercase tracking-wider transition-colors",
                i === currentStep
                  ? "text-brand-orange font-bold"
                  : "text-brand-charcoal/30 dark:text-text-secondary/50",
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="text-brand-charcoal/20 dark:text-border-primary/50">
                →
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Error display with retry option
function GenerationError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 rounded-sm"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Generation Failed
          </p>
          <p className="font-mono text-[10px] text-red-600/80 dark:text-red-400/80 mt-1">
            {message}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 font-mono text-[10px] uppercase tracking-wider transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Retry
      </button>
    </motion.div>
  );
}

// Loading state for initial prompt processing
function InitialPromptLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3 p-4 border border-brand-orange/30 bg-brand-orange/5"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Loader2 className="w-5 h-5 text-brand-orange animate-spin" />
          <div className="absolute inset-0 animate-ping opacity-20">
            <Loader2 className="w-5 h-5 text-brand-orange" />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-charcoal dark:text-text-primary">
            Initializing Architecture
          </p>
          <p className="font-mono text-[9px] text-brand-charcoal/60 dark:text-text-secondary/60 mt-0.5">
            Setting up environment...
          </p>
        </div>
      </div>
      <div className="h-1 bg-brand-charcoal/10 dark:bg-border-primary/30 overflow-hidden">
        <motion.div
          className="h-full bg-brand-orange"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "40%", "60%", "80%", "100%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

export function AIAssistantPanel({
  onGenerationSuccess,
  projectId,
  isResizable = false,
  getCurrentNodes = () => [],
  getCurrentEdges = () => [],
  initialPrompt,
  initialMetadata = {},
  isOpen = true,
  onToggle,
  onInitialPromptProcessed,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [showChatList, setShowChatList] = useState(false);
  const [_isThinkingOpen, _setIsThinkingOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [_editingChatId, _setEditingChatId] = useState<string | null>(null);
  const [_editingTitle, _setEditingTitle] = useState("");

  // Generation state machine for reliable prompt processing
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Track if initial prompt was already processed to prevent double-processing
  const processedPromptRef = useRef<string | null>(null);

  // Load initial settings or default mode
  const [chatMode, setChatModeState] = useState<ArchitectureMode>(
    (initialMetadata?.mode as ArchitectureMode) || "default",
  );

  // Settings / Preferences
  const [model, setModelState] = useState(
    (initialMetadata?.model as string) || "glm-4.7-flash",
  );

  const [userPreferences, setUserPreferences] = useState<{
    cloudProviders: string[];
    languages: string[];
    frameworks: string[];
    architectureTypes: string[];
    customInstructions: string;
  }>({
    cloudProviders: [],
    languages: [],
    frameworks: [],
    architectureTypes: [],
    customInstructions: "",
  });

  // Copy message content
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Wrappers to persist on change
  const setChatMode = (mode: ArchitectureMode) => {
    setChatModeState(mode);
    // Save to metadata (we only save metadata here, not nodes/edges)
    import("@/actions/projects").then(({ saveProject }) => {
      saveProject(projectId, { metadata: { ...initialMetadata, mode, model } });
    });
  };

  const setModel = (newModel: string) => {
    setModelState(newModel);
    import("@/actions/projects").then(({ saveProject }) => {
      saveProject(projectId, {
        metadata: { ...initialMetadata, mode: chatMode, model: newModel },
      });
    });
  };

  // Load chats on mount
  useEffect(() => {
    loadChats();
    loadUserPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, []);

  // Reliable initial prompt processing with state machine
  useEffect(() => {
    // Skip if no initial prompt provided
    if (!initialPrompt) return;

    // Skip if we've already processed this exact prompt
    if (processedPromptRef.current === initialPrompt) return;

    // Skip if we're already processing
    if (generationState !== "idle") return;

    // Skip if chats are still loading
    if (isLoadingChats) return;

    // Skip if we already have messages (user refreshed after starting)
    if (messages.length > 0) {
      // Mark as processed to prevent re-triggering
      processedPromptRef.current = initialPrompt;
      return;
    }

    // Set up the pending prompt and transition to preparing state
    setPendingPrompt(initialPrompt);
    setGenerationState("preparing");
  }, [initialPrompt, isLoadingChats, messages.length, generationState]);

  // Handle the actual processing when in preparing state
  useEffect(() => {
    if (generationState !== "preparing" || !pendingPrompt) return;

    // Mark this prompt as processed to prevent re-triggering
    processedPromptRef.current = pendingPrompt;

    // Small delay to ensure UI is ready and show loading state
    const timeoutId = setTimeout(() => {
      setGenerationState("generating");
      processMessage(pendingPrompt)
        .then(() => {
          setGenerationState("complete");
          setPendingPrompt(null);
          setGenerationError(null);
          // Notify parent that processing is complete
          onInitialPromptProcessed?.();
        })
        .catch((error) => {
          setGenerationState("error");
          setGenerationError(
            error instanceof Error ? error.message : "Generation failed",
          );
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [generationState, pendingPrompt, onInitialPromptProcessed]);

  // Retry handler for failed initial prompt
  const handleRetryInitialPrompt = useCallback(() => {
    if (pendingPrompt) {
      setGenerationState("preparing");
      setGenerationError(null);
    }
  }, [pendingPrompt]);

  // Clear generation state when user sends a new message manually
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    // Clear any pending/failed initial prompt state
    setGenerationState("idle");
    setPendingPrompt(null);
    setGenerationError(null);

    await processMessage(inputValue);
  };

  const loadUserPreferences = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("preferences")
        .eq("user_id", user.id)
        .single();
      if (data?.preferences) {
        // Robust handling of legacy strings vs new arrays
        const prefs = data.preferences;
        const cloudProviders = Array.isArray(prefs.cloudProviders)
          ? prefs.cloudProviders
          : prefs.cloudProvider
            ? [prefs.cloudProvider]
            : [];

        const languages = Array.isArray(prefs.languages)
          ? prefs.languages
          : prefs.language
            ? [prefs.language]
            : [];

        const frameworks = Array.isArray(prefs.frameworks)
          ? prefs.frameworks
          : prefs.framework
            ? [prefs.framework]
            : [];

        const architectureTypes = Array.isArray(prefs.architectureTypes)
          ? prefs.architectureTypes
          : [];
        const customInstructions =
          typeof prefs.customInstructions === "string"
            ? prefs.customInstructions
            : "";

        setUserPreferences({
          cloudProviders,
          languages,
          frameworks,
          architectureTypes,
          customInstructions,
        });
      }
    }
  };

  const loadChats = async () => {
    setIsLoadingChats(true);
    try {
      const { chats, error } = await getProjectChats(projectId);
      if (error) {
        toast.error("Error loading chats");
        return;
      }
      setChats(chats as Chat[]);

      if (chats && chats.length > 0) {
        setCurrentChatId(chats[0].id);
      } else {
        await createNewChat("Main Terminal", false);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { messages, error } = await getChatWithMessages(chatId);
      if (error) {
        console.error("Error loading messages", error);
        return;
      }
      const loadedMessages: Message[] = (messages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning || undefined,
        isThinking: false,
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const createNewChat = async (
    title: string = `Terminal ${chats.length + 1} `,
    select: boolean = true,
  ) => {
    try {
      const { chat, error } = await createChatAction(projectId, title);
      if (error || !chat) {
        toast.error("Failed to initialize new terminal");
        return;
      }

      setChats((prev) => [chat, ...prev]);
      if (select) {
        setCurrentChatId(chat.id);
        setMessages([]);
      }
      return chat;
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const _deleteChat = async (chatId: string) => {
    try {
      const { error } = await deleteChatAction(chatId, projectId);
      if (error) {
        toast.error("Failed to delete terminal");
        return;
      }

      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId);
        if (remaining.length > 0) {
          setCurrentChatId(remaining[0].id);
        } else {
          await createNewChat("Main Terminal");
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const _updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const { error } = await updateChatTitleAction(chatId, newTitle);
      if (error) {
        toast.error("Failed to rename terminal");
        return;
      }
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)),
      );
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
    _setEditingChatId(null);
  };

  const saveMessage = async (chatId: string, message: Message) => {
    try {
      await addMessage(
        chatId,
        message.role,
        message.content,
        message.reasoning,
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Dynamic architecture summary generator - parses LLM response data
  const generateArchitectureSummary = (data: {
    nodes: any[];
    edges: any[];
    analysis?: string;
    recommendations?: string[];
  }) => {
    const nodeCount = data.nodes?.length || 0;
    const edgeCount = data.edges?.length || 0;

    // Group by service type with better categorization
    const categories = {
      compute:
        data.nodes?.filter((n) =>
          ["service", "function", "ai"].includes(n.type),
        ) || [],
      data:
        data.nodes?.filter((n) =>
          ["database", "cache", "storage", "vector-db"].includes(n.type),
        ) || [],
      messaging:
        data.nodes?.filter((n) => ["queue", "messaging"].includes(n.type)) ||
        [],
      gateway:
        data.nodes?.filter((n) =>
          ["gateway", "loadbalancer", "client"].includes(n.type),
        ) || [],
      infrastructure:
        data.nodes?.filter((n) =>
          ["auth", "payment", "monitoring", "cicd", "security"].includes(
            n.type,
          ),
        ) || [],
    };

    // Extract unique technologies
    const techs = Array.from(
      new Set(data.nodes?.map((n) => n.data?.tech).filter(Boolean) || []),
    );

    // Build dynamic summary
    let summary = `## Architecture Analysis\n\n`;
    summary += `**Overview**: ${nodeCount} components connected by ${edgeCount} data flows\n\n`;

    // Add category breakdown
    const categoryNames: Record<string, string> = {
      compute: "Compute Layer",
      data: "Data Layer",
      messaging: "Messaging",
      gateway: "Gateway Layer",
      infrastructure: "Infrastructure",
    };

    for (const [key, nodes] of Object.entries(categories)) {
      if (nodes.length > 0) {
        const techList = Array.from(
          new Set(nodes.map((n) => n.data?.tech).filter(Boolean)),
        ).join(", ");
        summary += `**${categoryNames[key]}**: ${nodes.length} component${nodes.length !== 1 ? "s" : ""}${techList ? ` (${techList})` : ""}\n\n`;
      }
    }

    // Add technology stack summary
    if (techs.length > 0) {
      summary += `**Technology Stack**: ${techs.join(", ")}\n\n`;
    }

    // Add analysis from LLM if available
    if (data.analysis) {
      summary += `## Design Rationale\n\n${data.analysis}\n\n`;
    }

    // Add recommendations from LLM if available
    if (data.recommendations && data.recommendations.length > 0) {
      summary += `## Recommendations\n\n`;
      for (const rec of data.recommendations) {
        summary += `- ${rec}\n`;
      }
      summary += "\n";
    }

    // Add next steps
    summary += `## Next Steps\n\n`;
    summary += `- Review components on the canvas\n`;
    summary += `- Click any node to configure properties\n`;
    summary += `- Use **Autofix** to optimize layout\n`;
    summary += `- Enable **Chaos Mode** to test resilience\n`;

    return summary;
  };

  const processMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsGenerating(true);
    setStreamProgress(0);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    // Save user message to database
    let chatId = currentChatId;
    if (!chatId) {
      const defaultChatResult = await getOrCreateDefaultChat(projectId);
      if (!defaultChatResult.success) {
        toast.error(
          defaultChatResult.error || "Failed to retrieve chat session",
        );
        setIsGenerating(false);
        clearInterval(progressInterval);
        return;
      }
      chatId = defaultChatResult.chat.id;
      setCurrentChatId(chatId);
    }

    await saveMessage(chatId, userMessage);

    // Create a placeholder message for AI (outside try block so catch can access it)
    const aiMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: "assistant",
        content: "",
        isThinking: true,
        reasoning: "",
      },
    ]);

    try {
      let accumulatedContent = "";
      let accumulatedReasoning = "";
      let lastGeneratedData: any = null; // Capture generated data

      // NEW: Include conversation history for context-aware AI
      const conversationMessages = [...messages, userMessage].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        parts: [{ type: "text" as const, text: m.content }],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages, // Full conversation history!
          chatId,
          projectId,
          mode: chatMode,
          model: model,
          currentNodes: getCurrentNodes(),
          currentEdges: getCurrentEdges(),
          userPreferences,
        }),
      });

      // Check for error responses (validation, rate limit, etc.)
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        const errorMessage =
          errorData.error || `Error ${response.status}: ${response.statusText}`;

        // Show error in chat instead of throwing
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, isThinking: false, content: `❌ ${errorMessage}` }
              : m,
          ),
        );
        toast.error(errorMessage);
        setIsGenerating(false);
        clearInterval(progressInterval);
        setStreamProgress(0);
        return; // Exit gracefully instead of throwing
      }

      if (!response.body) {
        // Handle missing response body gracefully
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  isThinking: false,
                  content: "❌ No response from server",
                }
              : m,
          ),
        );
        toast.error("No response from server");
        setIsGenerating(false);
        clearInterval(progressInterval);
        setStreamProgress(0);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Collect nodes and edges from tool results
      const _generatedNodes: any[] = [];
      const _generatedEdges: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const json = JSON.parse(trimmedLine);

            // Handle Vercel AI SDK UIMessage format
            // Format: { type: "assistant", parts: [{ type: "text", text: "..." }] }
            if (json.type === "assistant" && json.parts) {
              for (const part of json.parts) {
                if (part.type === "text" && part.text) {
                  accumulatedContent += part.text;

                  // Check if content contains architecture JSON
                  const isJsonLike =
                    accumulatedContent.trim().startsWith("{") ||
                    accumulatedContent.trim().startsWith("```") ||
                    accumulatedContent.includes('"nodes"');

                  // Try to extract and apply architecture if complete JSON found
                  if (
                    accumulatedContent.includes('"nodes"') &&
                    accumulatedContent.includes('"edges"')
                  ) {
                    try {
                      const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        if (
                          parsed.nodes &&
                          parsed.edges &&
                          !lastGeneratedData
                        ) {
                          lastGeneratedData = parsed;
                          onGenerationSuccess(parsed);
                          setStreamProgress(100);
                        }
                      }
                    } catch (_e) {
                      // JSON not complete yet
                    }
                  }

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMsgId
                        ? {
                            ...m,
                            isThinking: false,
                            content: isJsonLike
                              ? "__LOADING__"
                              : accumulatedContent,
                          }
                        : m,
                    ),
                  );
                } else if (part.type === "reasoning" && part.text) {
                  accumulatedReasoning += part.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMsgId
                        ? { ...m, reasoning: accumulatedReasoning }
                        : m,
                    ),
                  );
                }
              }
            }

            // Handle legacy format for backward compatibility
            if (json.type === "reasoning" && json.data) {
              accumulatedReasoning += json.data;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, reasoning: accumulatedReasoning }
                    : m,
                ),
              );
            } else if (json.type === "content" && json.data) {
              accumulatedContent += json.data;
              const isJsonLike =
                accumulatedContent.trim().startsWith("{") ||
                accumulatedContent.trim().startsWith("```");
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        isThinking: false,
                        content: isJsonLike
                          ? "__LOADING__"
                          : accumulatedContent,
                      }
                    : m,
                ),
              );
            } else if (json.type === "result" && json.data) {
              lastGeneratedData = json.data;
              onGenerationSuccess(json.data);
              setStreamProgress(100);
            }
          } catch (e) {
            console.debug("Skipping incomplete JSON line", e);
          }
        }
      }

      // Construct Final Message
      let finalContent = accumulatedContent;

      // If we have generated data, prioritize the structured summary logic
      if (lastGeneratedData) {
        finalContent = generateArchitectureSummary(lastGeneratedData);
      } else if (
        accumulatedContent.includes('"nodes"') ||
        accumulatedContent.trim().startsWith("{") ||
        accumulatedContent.trim().startsWith("```")
      ) {
        // Fallback if result type missing but content has JSON/Code
        // This prevents showing the raw verbose JSON
        finalContent =
          "I've drafted the architecture. Check the canvas for details.";
      } else if (!accumulatedContent) {
        finalContent = "I couldn't generate a response.";
      }

      const finalAiMessage = {
        id: aiMsgId,
        role: "assistant" as const,
        content: finalContent,
        reasoning: accumulatedReasoning,
      };

      // Update local state to remove thinking flag and set final content
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, isThinking: false, content: finalAiMessage.content }
            : m,
        ),
      );

      await saveMessage(chatId, finalAiMessage);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "Generation failed";
      toast.error(errorMessage);

      // Update the AI message to show the error instead of removing it
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, isThinking: false, content: `❌ ${errorMessage}` }
            : m,
        ),
      );

      // Re-throw for the initial prompt handling
      throw err;
    } finally {
      setIsGenerating(false);
      clearInterval(progressInterval);
      setStreamProgress(0);
    }
  };

  const currentChat = chats.find((c) => c.id === currentChatId);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-bg-secondary font-sans text-sm overflow-hidden border-l border-brand-charcoal/10 dark:border-border-primary/50">
      {/* Terminal Header - Technical HUD */}
      <div className="h-11 flex-shrink-0 flex items-center justify-between px-3 border-b border-brand-charcoal/10 dark:border-border-primary/50 bg-gradient-to-r from-white to-neutral-50/50 dark:from-bg-secondary dark:to-bg-tertiary/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-charcoal dark:bg-bg-elevated flex items-center justify-center shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-white dark:text-text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-brand-charcoal dark:text-text-primary">
              OPERATOR
            </span>
            <span className="font-mono text-[8px] text-brand-charcoal/40 dark:text-text-secondary/50 uppercase tracking-wider">
              v2.4.1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="w-7 h-7 flex items-center justify-center border border-brand-charcoal/15 dark:border-border-primary/50 hover:bg-brand-charcoal hover:text-white dark:hover:bg-bg-elevated dark:hover:text-text-primary text-brand-charcoal/50 dark:text-text-secondary transition-all duration-200"
              title="Close Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Channel Selector */}
      <div className="flex-shrink-0 bg-neutral-50/80 dark:bg-bg-tertiary px-3 py-2 border-b border-brand-charcoal/10 dark:border-border-primary/50">
        <button
          type="button"
          onClick={() => setShowChatList(!showChatList)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-brand-charcoal/50 dark:text-text-secondary/50 uppercase tracking-wider">
              Channel:
            </span>
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-brand-charcoal dark:text-text-primary group-hover:text-brand-orange transition-colors truncate max-w-[180px]">
              {currentChat?.title || "UNSET"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-brand-charcoal/40 dark:text-text-secondary/50 transition-transform duration-200",
              showChatList && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {showChatList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-1 space-y-0.5 border-t border-brand-charcoal/10 mt-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setShowChatList(false);
                    }}
                    className={cn(
                      "w-full text-left font-mono text-[10px] uppercase py-1.5 px-2 hover:bg-brand-orange/10 transition-all rounded-sm",
                      currentChatId === chat.id
                        ? "text-brand-orange font-black bg-brand-orange/5"
                        : "text-brand-charcoal/60 dark:text-text-secondary",
                    )}
                  >
                    <span className="inline-block w-3">
                      {currentChatId === chat.id ? ">" : " "}
                    </span>
                    {chat.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area - Fixed horizontal overflow */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 bg-white dark:bg-bg-secondary"
        ref={messagesEndRef}
      >
        {/* Initial Prompt Loading States */}
        {generationState === "preparing" && <InitialPromptLoader />}

        {generationState === "error" && generationError && (
          <GenerationError
            message={generationError}
            onRetry={handleRetryInitialPrompt}
          />
        )}

        {/* Empty State */}
        {messages.length === 0 &&
          generationState !== "preparing" &&
          generationState !== "error" && (
            <div className="h-full flex flex-col items-center justify-center opacity-25 text-center">
              <div className="w-20 h-20 border-2 border-dashed border-brand-charcoal dark:border-border-primary mb-5 flex items-center justify-center animate-pulse">
                <Bot className="w-10 h-10" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] leading-relaxed dark:text-text-secondary">
                Waiting for operator input
              </p>
              <p className="font-mono text-[9px] text-brand-charcoal/60 dark:text-text-secondary/60 mt-1">
                [ STANDBY_MODE ]
              </p>
            </div>
          )}

        {/* Messages */}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex flex-col gap-1.5",
              message.role === "user" ? "ml-auto items-end" : "items-start",
            )}
          >
            {/* Message Header */}
            <div className="flex items-center gap-2 px-0.5">
              {message.role === "assistant" && (
                <div className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
              )}
              <span
                className={cn(
                  "font-mono text-[9px] font-black uppercase tracking-[0.12em]",
                  message.role === "user"
                    ? "text-brand-charcoal/50 dark:text-text-secondary/50"
                    : "text-brand-charcoal/40 dark:text-text-secondary/40",
                )}
              >
                {message.role === "user" ? "OPERATOR" : "ASSISTANT"}
              </span>
              <span className="font-mono text-[8px] text-brand-charcoal/30 dark:text-text-secondary/30">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Message Content */}
            <div
              className={cn(
                "relative max-w-[95%] px-3 py-2.5 text-[13px] leading-relaxed",
                message.role === "user"
                  ? "bg-brand-charcoal dark:bg-bg-elevated text-white dark:text-text-primary rounded-sm"
                  : "bg-neutral-100 dark:bg-bg-tertiary text-brand-charcoal dark:text-text-primary rounded-sm border-l-2 border-brand-orange",
              )}
            >
              {message.role === "assistant" &&
              message.content === "__LOADING__" ? (
                <StreamingMessage isGenerating={true} />
              ) : (
                <div
                  className={cn(
                    "prose prose-sm max-w-none dark:prose-invert",
                    "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
                    "prose-code:text-[11px] prose-code:bg-neutral-200 dark:prose-code:bg-bg-elevated prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
                    message.role === "user" && "prose-invert",
                  )}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}

              {/* Reasoning Block */}
              {message.role === "assistant" && message.reasoning && (
                <div className="mt-3 pt-2 border-t border-brand-charcoal/10 dark:border-border-primary/30">
                  <details className="group">
                    <summary className="flex items-center gap-1.5 cursor-pointer font-mono text-[8px] uppercase tracking-wider text-brand-charcoal/40 dark:text-text-secondary/50 hover:text-brand-orange transition-colors select-none">
                      <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                      Chain of Thought
                    </summary>
                    <div className="mt-2 p-2 bg-neutral-50 dark:bg-bg-primary/50 text-[11px] text-brand-charcoal/70 dark:text-text-secondary/70 font-mono rounded border border-brand-charcoal/5 dark:border-border-primary/20">
                      {message.reasoning}
                    </div>
                  </details>
                </div>
              )}

              {/* Copy Button */}
              <button
                type="button"
                onClick={() => copyToClipboard(message.content)}
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-brand-charcoal/5 dark:hover:bg-bg-elevated rounded"
                title="Copy"
              >
                <Copy className="w-3 h-3 text-brand-charcoal/40 dark:text-text-secondary/50" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-brand-charcoal/10 dark:border-border-primary/50 bg-white dark:bg-bg-secondary">
        {/* Progress Bar */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="border-b border-brand-charcoal/5 dark:border-border-primary/30 overflow-hidden"
            >
              <div className="px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <SignalStrengthIndicator
                    isGenerating={isGenerating}
                    streamProgress={streamProgress}
                  />
                  <ProcessingSteps isGenerating={isGenerating} />
                </div>
                <div className="h-0.5 bg-brand-charcoal/5 dark:bg-border-primary/30 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-orange"
                    style={{ width: `${streamProgress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Controls */}
        <div className="p-3 space-y-3">
          {/* Mode & Model Selectors */}
          <div className="flex gap-2">
            <Select value={chatMode} onValueChange={setChatMode}>
              <SelectTrigger className="w-full h-8 text-[11px] font-mono uppercase tracking-wider bg-neutral-50 dark:bg-bg-tertiary border-brand-charcoal/10 dark:border-border-primary/50 focus:ring-brand-orange/20">
                <SelectValue placeholder="MODE" />
              </SelectTrigger>
              <SelectContent className="font-mono text-[11px]">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="chaos">Chaos Mode</SelectItem>
                <SelectItem value="cost">Cost Optimizer</SelectItem>
                <SelectItem value="expert">Expert Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full h-8 text-[11px] font-mono uppercase tracking-wider bg-neutral-50 dark:bg-bg-tertiary border-brand-charcoal/10 dark:border-border-primary/50 focus:ring-brand-orange/20">
                <SelectValue placeholder="MODEL" />
              </SelectTrigger>
              <SelectContent className="font-mono text-[11px]">
                <SelectItem value="glm-4.7-flash">GLM-4.7-Flash</SelectItem>
                <SelectItem value="glm-4.7-air">GLM-4.7-Air</SelectItem>
                <SelectItem value="glm-4.7-plus">GLM-4.7-Plus</SelectItem>
                <SelectItem value="kimi-k2">Kimi-K2</SelectItem>
                <SelectItem value="deepseek-v3">DeepSeek-V3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Input Field */}
          <form onSubmit={handleManualSubmit} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isGenerating
                  ? "PROCESSING..."
                  : generationState === "preparing"
                    ? "INITIALIZING..."
                    : "ENTER_COMMAND..."
              }
              disabled={isGenerating || generationState === "preparing"}
              className="w-full h-11 pl-4 pr-12 bg-neutral-50 dark:bg-bg-tertiary border border-brand-charcoal/15 dark:border-border-primary/50 text-brand-charcoal dark:text-text-primary placeholder:text-brand-charcoal/30 dark:placeholder:text-text-secondary/30 text-[13px] font-mono focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-charcoal dark:bg-bg-elevated text-white dark:text-text-primary hover:bg-brand-orange dark:hover:bg-brand-orange disabled:opacity-30 disabled:hover:bg-brand-charcoal dark:disabled:hover:bg-bg-elevated transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
