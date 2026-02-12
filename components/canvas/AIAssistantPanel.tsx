"use client";

import { Icon } from "@iconify/react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit2,
  Link as LinkIcon,
  Loader2,
  Lock,
  Maximize2,
  MessageSquare,
  Minimize2,
  MoreVertical,
  Paperclip,
  Plus,
  Rocket,
  Send,
  Terminal,
  Trash2,
  User,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  addMessage,
  addMessages as addMessagesAction,
  createChat as createChatAction,
  deleteChat as deleteChatAction,
  getChatWithMessages,
  getOrCreateDefaultChat,
  getProjectChats,
  updateChatTitle as updateChatTitleAction,
} from "@/actions/chats";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchitectureMode } from "@/lib/prompt-engineering";
import { cn } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ThinkingPanel } from "./ThinkingPanel";

interface AIAssistantPanelProps {
  onGenerationSuccess: (data: any) => void;
  projectId: string;
  isResizable?: boolean;
  getCurrentNodes?: () => any[];
  getCurrentEdges?: () => any[];
  initialPrompt?: string; // New prop for auto-generation on page load
  initialMetadata?: Record<string, any>; // New prop for persistence
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

export function AIAssistantPanel({
  onGenerationSuccess,
  projectId,
  isResizable = false,
  getCurrentNodes = () => [],
  getCurrentEdges = () => [],
  initialPrompt,
  initialMetadata = {}, // Default empty
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Load initial settings or default mode
  const [chatMode, setChatModeState] = useState<ArchitectureMode>(
    (initialMetadata?.mode as ArchitectureMode) || "default",
  );

  // Settings / Preferences
  const [cloudProvider, setCloudProvider] = useState("Generic");
  const [model, setModelState] = useState(
    (initialMetadata?.model as string) || "glm-4.7-flash",
  );
  const [quickMode, setQuickMode] = useState(false); // Fast generation with lean prompt

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
  }, [projectId]);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Track if we've processed the initial prompt to prevent double-processing
  const hasProcessedInitialPrompt = useRef(false);

  // Reset the ref when projectId changes (handles navigation from dashboard)
  useEffect(() => {
    hasProcessedInitialPrompt.current = false;
  }, [projectId]);

  // Auto-generate architecture when initialPrompt is provided (from dashboard)
  useEffect(() => {
    // Only trigger if we have a prompt, haven't started generating, have no messages yet,
    // chats have finished loading, and we haven't already processed it
    if (
      initialPrompt &&
      !isGenerating &&
      messages.length === 0 &&
      !isLoadingChats &&
      !hasProcessedInitialPrompt.current
    ) {
      hasProcessedInitialPrompt.current = true;
      // Small delay to ensure UI is ready
      setTimeout(() => {
        processMessage(initialPrompt);
      }, 100);
    }
  }, [initialPrompt, isGenerating, messages.length, isLoadingChats, projectId]);

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
      if (data?.preferences?.cloudProvider) {
        setCloudProvider(data.preferences.cloudProvider);
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

  const deleteChat = async (chatId: string) => {
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

  const updateChatTitle = async (chatId: string, newTitle: string) => {
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
    setEditingChatId(null);
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

  // Helper to generate structured summary (professional, archimyst.com style)
  const generateArchitectureSummary = (data: {
    nodes: any[];
    edges: any[];
  }) => {
    const nodeCount = data.nodes.length;
    const edgeCount = data.edges.length;

    // Group by service type
    const services = data.nodes.filter(
      (n) => n.type === "service" || n.data?.serviceType === "service",
    );
    const dbs = data.nodes.filter((n) => n.type === "database");
    const queues = data.nodes.filter((n) => n.type === "queue");
    const others = data.nodes.filter(
      (n) => !["service", "database", "queue"].includes(n.type || ""),
    );

    // Extract techs
    const techs = Array.from(
      new Set(data.nodes.map((n) => n.data?.tech).filter(Boolean)),
    );

    // Build component summary
    const componentLines: string[] = [];
    if (services.length)
      componentLines.push(
        `**Services**: ${services.map((n) => n.data?.label || n.id).join(", ")}`,
      );
    if (dbs.length)
      componentLines.push(
        `**Data Layer**: ${dbs.map((n) => n.data?.label || n.id).join(", ")}`,
      );
    if (queues.length)
      componentLines.push(
        `**Messaging**: ${queues.map((n) => n.data?.label || n.id).join(", ")}`,
      );
    if (others.length)
      componentLines.push(
        `**Infrastructure**: ${others.map((n) => n.data?.label || n.id).join(", ")}`,
      );

    return `### Architecture Blueprint Generated

**System Overview**: ${nodeCount}-node architecture with ${edgeCount} connections.

${componentLines.length > 0 ? componentLines.join("\n\n") : ""}

| Component Type | Count | Technologies |
| :--- | :--- | :--- |
| Services | ${services.length} | ${techs.slice(0, 3).join(", ") || "-"} |
| Databases | ${dbs.length} | ${
      dbs
        .map((n) => n.data?.tech)
        .filter(Boolean)
        .join(", ") || "-"
    } |
| Queues | ${queues.length} | ${
      queues
        .map((n) => n.data?.tech)
        .filter(Boolean)
        .join(", ") || "-"
    } |
| Others | ${others.length} | - |

This architecture separates concerns across dedicated service layers, enabling independent scaling and simplified maintenance. The data flow follows a clear request-response pattern through the load balancer.

**Next Steps**
- Review the canvas for the visual layout.
- Click any node to configure specific properties.
- Use the **Autofix** tool to optimize the diagram structure.
`;
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

    // Save user message to database
    let chatId = currentChatId;
    if (!chatId) {
      const defaultChatResult = await getOrCreateDefaultChat(projectId);
      if (!defaultChatResult.success) {
        toast.error(
          defaultChatResult.error || "Failed to retrieve chat session",
        );
        setIsGenerating(false);
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
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Collect nodes and edges from tool results
      const generatedNodes: any[] = [];
      const generatedEdges: any[] = [];

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
                        }
                      }
                    } catch (e) {
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processMessage(inputValue);
  };

  const currentChat = chats.find((c) => c.id === currentChatId);

  return (
    <div className="flex flex-col h-full bg-white font-sans text-sm">
      {/* Terminal Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-brand-charcoal/10 bg-[#faf9f5]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand-orange" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/70">
            System Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Autofix and Share buttons moved to top header */}
          <div className="w-[1px] h-3 bg-brand-charcoal/10 mx-1" />

          {/* Status Indicator */}
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full block",
                isGenerating
                  ? "bg-green-500 animate-pulse"
                  : "bg-brand-charcoal/20",
              )}
            />
            <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/40">
              {isGenerating ? "PROCESSING" : "IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Chat List Select ... (unchanged) */}
      <div
        className="border-b border-brand-charcoal/5 px-3 py-2 bg-white flex items-center justify-between group cursor-pointer hover:bg-brand-charcoal/5"
        onClick={() => setShowChatList(!showChatList)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageSquare className="w-3.5 h-3.5 text-brand-charcoal/40" />
          <span className="font-mono text-xs font-medium text-brand-charcoal truncate">
            {currentChat?.title || "Select Terminal..."}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-brand-charcoal/40 transition-transform",
            showChatList && "rotate-180",
          )}
        />
      </div>

      {showChatList && (
        // ... (keep chat list logic)
        <div className="border-b border-brand-charcoal/10 bg-white max-h-48 overflow-y-auto shadow-inner">
          {isLoadingChats ? (
            <div className="p-3 text-[10px] font-mono text-brand-charcoal/40">
              Loading channels...
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white transition-colors group/item",
                  currentChatId === chat.id &&
                    "bg-white border-l-2 border-brand-orange",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentChatId(chat.id);
                  setShowChatList(false);
                }}
              >
                <span className="font-mono text-xs text-brand-charcoal/70 truncate">
                  {chat.title}
                </span>
                <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="hover:text-red-500 text-brand-charcoal/40"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
          <div
            className="p-2 flex items-center justify-center border-t border-brand-charcoal/5 cursor-pointer hover:bg-white text-brand-charcoal/50 hover:text-brand-orange transition-colors"
            onClick={() => {
              createNewChat("New Channel");
              setShowChatList(false);
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
              <Icon icon="lucide:plus" className="w-3 h-3" /> Initialize New
              Channel
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-brand-charcoal/10 scrollbar-track-transparent"
        ref={messagesEndRef}
      >
        {/* ... (keep existing message mapping) */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
            <div className="w-12 h-12 rounded-full border border-dashed border-brand-charcoal flex items-center justify-center">
              <Terminal className="w-6 h-6 text-brand-charcoal" />
            </div>
            <div className="max-w-[200px]">
              <p className="font-mono text-xs text-brand-charcoal mb-1">
                TERMINAL READY
              </p>
              <p className="font-serif italic text-xs text-brand-charcoal/70">
                Describe your architectural requirements to begin generation.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1 max-w-[95%]",
                message.role === "user" ? "ml-auto items-end" : "items-start",
              )}
            >
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/40 mb-0.5">
                {message.role === "user" ? "OPERATOR" : "SYSTEM"}
              </span>

              {message.reasoning && (
                <ThinkingPanel
                  reasoning={message.reasoning}
                  isThinking={!!message.isThinking}
                />
              )}

              {message.content && (
                <div
                  className={cn(
                    "rounded-tr-xl rounded-bl-xl rounded-br-xl p-3 text-sm shadow-sm border",
                    message.role === "user"
                      ? "bg-brand-charcoal text-white rounded-tl-xl rounded-tr-none border-brand-charcoal"
                      : "bg-white text-brand-charcoal border-brand-charcoal/10",
                  )}
                >
                  {message.role === "assistant" ? (
                    message.content === "__LOADING__" ? (
                      <LoadingState />
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-brand-charcoal/5 prose-pre:text-brand-charcoal prose-code:text-brand-orange text-[13px]">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </div>
                  )}{" "}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area - REFACTORED */}
      <div className="p-3 bg-white border-t border-brand-charcoal/10">
        <form
          id="ai-prompt-form"
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-2 bg-[#faf9f5] border border-brand-charcoal/20 p-2 focus-within:ring-1 focus-within:ring-brand-orange/50 focus-within:border-brand-orange/50 transition-all rounded-sm"
        >
          {/* Main Text Area */}
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Enter architectural requirements..."
            className="flex-1 bg-transparent text-xs font-mono text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none min-h-[40px] resize-none"
            rows={2}
          />

          {/* Bottom Toolbar: Model Select | Icons | Send */}
          <div className="flex items-center justify-between pt-1 border-t border-brand-charcoal/5">
            {/* Left: Model Selector */}
            <div className="flex items-center gap-4">
              {/* Model Selector */}
              <div className="">
                <Select
                  value={model}
                  onValueChange={(val) => {
                    if (val === "gemini-3.0-pro") {
                      toast("Upgrade to Pro", {
                        description:
                          "Gemini 3.0 Pro is available on the Pro plan.",
                      });
                      return;
                    }
                    setModel(val);
                  }}
                >
                  <SelectTrigger className="h-6 w-[130px] border-none bg-transparent text-[10px] uppercase font-mono tracking-wider focus:ring-0 px-0 gap-1 text-brand-charcoal/70 hover:text-brand-charcoal">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-brand-charcoal/20 shadow-xl">
                    <SelectItem
                      value="glm-4.7-flash"
                      className="text-xs font-mono"
                    >
                      GLM-4.7-Flash (Free)
                    </SelectItem>
                    <SelectItem
                      value="z-ai/glm-4.5-air:free"
                      className="text-xs font-mono"
                    >
                      GLM-4.5-Air (Free)
                    </SelectItem>
                    <SelectItem
                      value="deepseek-ai"
                      className="text-xs font-mono"
                    >
                      Deepseek (Free)
                    </SelectItem>
                    <SelectItem
                      value="kimi-k2.5"
                      className="text-xs font-mono opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <span className="line-through">Kimi k2.5</span> 🔒
                    </SelectItem>
                    <SelectItem
                      value="gemini-3.0-pro"
                      className="text-xs font-mono opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Gemini-3.0-Pro 🔒
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[1px] h-3 bg-brand-charcoal/10" />

              {/* Mode Toggle - Minimal Icon Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-brand-charcoal/40 hover:text-brand-orange rounded-full transition-colors"
                  >
                    {chatMode === "startup" ? (
                      <Rocket className="w-3.5 h-3.5 text-brand-orange" />
                    ) : chatMode === "corporate" ? (
                      <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                    ) : (
                      <Icon
                        icon="lucide:scale"
                        className="w-3.5 h-3.5 text-brand-charcoal/60"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-44 bg-white border border-brand-charcoal/20 shadow-xl p-1"
                >
                  <div className="px-2 py-1.5 text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-mono">
                    Output Mode
                  </div>
                  <DropdownMenuItem
                    onClick={() => setChatMode("default")}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer text-xs font-mono",
                      chatMode === "default" && "bg-brand-charcoal/5",
                    )}
                  >
                    <Icon icon="lucide:scale" className="w-3.5 h-3.5" />
                    Default (Balanced)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setChatMode("startup")}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer text-xs font-mono",
                      chatMode === "startup" &&
                        "bg-brand-orange/5 text-brand-orange",
                    )}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Startup (MVP)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setChatMode("corporate")}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer text-xs font-mono",
                      chatMode === "corporate" &&
                        "bg-brand-blue/5 text-brand-blue",
                    )}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Enterprise
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Mode Toggle */}
              <Button
                type="button"
                size="sm"
                variant={quickMode ? "default" : "ghost"}
                className={cn(
                  "h-6 px-2 text-xs rounded-full flex items-center gap-1 transition-all",
                  quickMode
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-brand-charcoal/60 hover:text-amber-500",
                )}
                onClick={() => setQuickMode(!quickMode)}
                title={
                  quickMode
                    ? "Quick Mode ON - Faster generation"
                    : "Enable Quick Mode for faster drafts"
                }
              >
                <Zap className="w-3 h-3" />
                {quickMode && <span>Quick</span>}
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Icons */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-brand-charcoal/40 hover:text-brand-orange rounded-full"
                  onClick={() => toast("Upload feature coming soon")}
                  title="Attach File"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-brand-charcoal/40 hover:text-brand-orange rounded-full"
                  onClick={() => toast("URL extraction coming soon")}
                  title="Add URL Configuration"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="w-[1px] h-4 bg-brand-charcoal/10 mx-1" />

              {/* Send Button */}
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isGenerating}
                className={cn(
                  "h-7 w-7 rounded-sm transition-all",
                  inputValue.trim()
                    ? "bg-brand-orange text-white hover:bg-brand-orange/90"
                    : "bg-brand-charcoal/10 text-brand-charcoal/40",
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[9px] font-mono text-brand-charcoal/30">
            v1.3.0
          </span>
        </div>
      </div>
    </div>
  );
}
