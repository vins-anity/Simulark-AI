"use client";

import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { LoadingState } from "./LoadingState";

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
  initialMetadata = {},
  isOpen = true,
  onToggle,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const [_isThinkingOpen, _setIsThinkingOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [_editingChatId, _setEditingChatId] = useState<string | null>(null);
  const [_editingTitle, _setEditingTitle] = useState("");

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
    <div className="flex flex-col h-full bg-white font-sans text-sm overflow-hidden border-l border-brand-charcoal/10">
      {/* Terminal Header - Technical HUD */}
      <div className="h-11 flex-shrink-0 flex items-center justify-between px-3 border-b border-brand-charcoal/10 bg-gradient-to-r from-white to-neutral-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-charcoal flex items-center justify-center shadow-sm">
            <Terminal className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-brand-charcoal">
              OPERATOR
            </span>
            <span className="font-mono text-[8px] text-brand-charcoal/40 uppercase tracking-wider">
              v2.4.1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="w-7 h-7 flex items-center justify-center border border-brand-charcoal/15 hover:bg-brand-charcoal hover:text-white text-brand-charcoal/50 transition-all duration-200"
              title="Close Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Channel Selector */}
      <div className="flex-shrink-0 bg-neutral-50/80 px-3 py-2 border-b border-brand-charcoal/10">
        <button
          type="button"
          onClick={() => setShowChatList(!showChatList)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-brand-charcoal/50 uppercase tracking-wider">Channel:</span>
            <span className="font-mono text-[11px] font-black uppercase tracking-wider text-brand-charcoal group-hover:text-brand-orange transition-colors truncate max-w-[180px]">
              {currentChat?.title || "UNSET"}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-brand-charcoal/40 transition-transform duration-200", showChatList && "rotate-180")} />
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
                {chats.map(chat => (
                  <button key={chat.id} onClick={() => { setCurrentChatId(chat.id); setShowChatList(false); }}
                    className={cn(
                      "w-full text-left font-mono text-[10px] uppercase py-1.5 px-2 hover:bg-brand-orange/10 transition-all rounded-sm",
                      currentChatId === chat.id ? "text-brand-orange font-black bg-brand-orange/5" : "text-brand-charcoal/60"
                    )}
                  >
                    <span className="inline-block w-3">{currentChatId === chat.id ? ">" : " "}</span>
                    {chat.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-4 bg-white"
        ref={messagesEndRef}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-25 text-center">
             <div className="w-20 h-20 border-2 border-dashed border-brand-charcoal mb-5 flex items-center justify-center animate-pulse">
                <Bot className="w-10 h-10" />
             </div>
             <p className="font-mono text-[10px] uppercase tracking-[0.15em] leading-relaxed">
               Waiting for operator input
             </p>
             <p className="font-mono text-[9px] text-brand-charcoal/60 mt-1">
               [ STANDBY_MODE ]
             </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex flex-col gap-1.5 max-w-[98%]",
                message.role === "user" ? "ml-auto items-end" : "items-start",
              )}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 px-0.5">
                {message.role === "assistant" && (
                  <div className="w-1.5 h-1.5 bg-brand-orange animate-pulse" />
                )}
                <span className={cn(
                  "font-mono text-[9px] font-black uppercase tracking-[0.12em]",
                  message.role === "user" ? "text-brand-charcoal/50" : "text-brand-orange"
                )}>
                  {message.role === "user" ? "[ OPERATOR ]" : "[ SYSTEM ]"}
                </span>
                {message.role === "user" && (
                  <div className="w-1.5 h-1.5 bg-brand-charcoal/30" />
                )}
              </div>

              {/* Message Content */}
              {message.content && (
                <div
                  className={cn(
                    "relative group",
                    message.role === "user"
                      ? "bg-brand-charcoal text-white"
                      : "bg-neutral-50 text-brand-charcoal border border-brand-charcoal/10",
                    "px-3 py-2.5 shadow-sm",
                    message.role === "user"
                      ? "rounded-tl-xl rounded-bl-xl rounded-br-xl"
                      : "rounded-tr-xl rounded-br-xl rounded-bl-xl"
                  )}
                >
                  {/* Copy button for assistant messages */}
                  {message.role === "assistant" && message.content !== "__LOADING__" && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-brand-charcoal/10 rounded"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3 h-3 text-brand-charcoal/40" />
                    </button>
                  )}

                  {message.role === "assistant" ? (
                    message.content === "__LOADING__" ? (
                      <LoadingState />
                    ) : (
                      <div className="prose prose-sm max-w-none font-mono text-[10px] leading-relaxed
                        prose-p:my-1.5 prose-p:text-brand-charcoal/90
                        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-[0.08em] prose-headings:text-brand-charcoal prose-headings:mt-3 prose-headings:mb-2
                        prose-h1:text-sm prose-h2:text-xs prose-h3:text-[11px]
                        prose-strong:text-brand-orange prose-strong:font-bold
                        prose-ul:my-1.5 prose-ul:space-y-0.5
                        prose-li:my-0 prose-li:text-brand-charcoal/80
                        prose-code:text-[9px] prose-code:bg-brand-charcoal/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                        prose-pre:bg-brand-charcoal prose-pre:text-white prose-pre:p-2 prose-pre:rounded-lg prose-pre:my-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed uppercase tracking-wide">
                      {message.content}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-2.5 bg-gradient-to-t from-neutral-50 to-white border-t border-brand-charcoal/10">
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-1.5 border border-brand-charcoal/20 p-2 bg-white shadow-sm"
        >
          {/* Top Row: Controls & Model */}
          <div className="flex items-center justify-between gap-2 border-b border-brand-charcoal/10 pb-1.5">
             {/* Mode Selector */}
             <div className="flex gap-1">
               {(["default", "startup", "corporate"] as const).map((mode) => (
                 <button
                   key={mode}
                   type="button"
                   onClick={() => setChatMode(mode)}
                   className={cn(
                     "px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-all rounded-sm",
                     chatMode === mode
                       ? "bg-brand-charcoal text-white font-black"
                       : "text-brand-charcoal/50 hover:text-brand-charcoal hover:bg-brand-charcoal/5"
                   )}
                 >
                   {mode === "corporate" ? "ENT" : mode}
                 </button>
               ))}
             </div>

             {/* Model Selector */}
             <Select value={model} onValueChange={setModel}>
               <SelectTrigger className="h-6 w-auto min-w-[110px] border border-brand-charcoal/20 bg-neutral-50 font-mono text-[9px] uppercase focus:ring-0 focus:ring-offset-0 px-2 py-0 text-brand-charcoal transition-colors gap-2 hover:bg-white hover:border-brand-charcoal/40 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50 rounded-none">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="rounded-none border-2 border-brand-charcoal font-mono text-xs shadow-[4px_4px_0px_0px_rgba(26,26,26,0.15)]">
                 <SelectItem value="glm-4.5-air" className="text-[10px] uppercase">GLM_4.5_AIR</SelectItem>
                 <SelectItem value="glm-4.7-flash" className="text-[10px] uppercase">GLM_4.7_FLASH</SelectItem>
                 <SelectItem value="deepseek-ai" className="text-[10px] uppercase">DEEPSEEK_V3</SelectItem>
               </SelectContent>
             </Select>
          </div>

          {/* Input & Action Row */}
          <div className="relative flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              placeholder="[ ENTER CMD ]"
              className="flex-1 bg-transparent border-none p-1.5 font-mono text-[11px] uppercase tracking-wider placeholder:text-brand-charcoal/25 focus:outline-none focus:ring-0 min-h-[36px] max-h-[140px] resize-none leading-relaxed"
              rows={1}
            />
            
            <div className="flex flex-col justify-end">
               <button
                  type="submit"
                  disabled={!inputValue.trim() || isGenerating}
                  className={cn(
                    "h-8 px-3 flex items-center justify-center font-mono font-black uppercase text-[9px] tracking-[0.12em] transition-all duration-200",
                    "border-2 border-brand-charcoal bg-brand-charcoal text-white",
                    "hover:bg-brand-orange hover:border-brand-orange hover:shadow-md",
                    "active:scale-95",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100",
                  )}
                  title="TRANSMIT"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : "SEND"}
                </button>
            </div>
          </div>
        </form>
        
        {/* Status bar */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isGenerating ? "bg-brand-orange animate-pulse" : "bg-green-500"
            )} />
            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-charcoal/40">
              {isGenerating ? "PROCESSING..." : "READY"}
            </span>
          </div>
          <span className="font-mono text-[8px] text-brand-charcoal/30 uppercase">
            {inputValue.length} chars
          </span>
        </div>
      </div>


    </div>
  );
}
