"use client";

import { createBrowserClient } from "@supabase/ssr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronRight,
  Copy,
  FileUp,
  Loader2,
  Paperclip,
  RotateCcw,
  Square,
  Terminal,
  Trash2,
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
import { updateUserPreferences } from "@/actions/users";
import { ResourceExhaustionModal } from "@/components/subscription/ResourceExhaustionModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ArchitectureMode } from "@/lib/prompt-engineering";
import { AVAILABLE_MODELS } from "@/lib/provider-registry";
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
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  isThinking?: boolean;
}

interface ArchitectureResponseData {
  nodes: any[];
  edges: any[];
  analysis?: string;
  selectedArchitectureStrategy?: string;
  preferenceConflicts?: string[];
  recommendedStack?: string[];
  preferenceAlignedAlternative?: string[];
  recommendations?: string[];
}

function isLikelyArchitecturePayload(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  return (
    (trimmed.startsWith("{") || trimmed.startsWith("```")) &&
    (trimmed.includes('"nodes"') || trimmed.includes('"edges"'))
  );
}

function extractArchitectureFromText(text: string): {
  nodes: any[];
  edges: any[];
} | null {
  if (!text.includes('"nodes"') || !text.includes('"edges"')) {
    return null;
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    return null;
  }

  return parsed as { nodes: any[]; edges: any[] };
}

interface Chat {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ProjectDocument {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  extraction_status: "pending" | "completed" | "failed";
  extraction_error?: string | null;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

type GenerationState =
  | "idle"
  | "preparing"
  | "generating"
  | "complete"
  | "error";

type StreamStage =
  | "analyzing"
  | "connecting"
  | "thinking"
  | "generating"
  | "validating"
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
function ProcessingSteps({
  isGenerating,
  stage,
}: {
  isGenerating: boolean;
  stage: StreamStage;
}) {
  const steps = [
    { label: "ANALYZING", stage: "analyzing" as const },
    { label: "CONNECTING", stage: "connecting" as const },
    { label: "THINKING", stage: "thinking" as const },
    { label: "GENERATING", stage: "generating" as const },
    { label: "VALIDATING", stage: "validating" as const },
  ];

  if (!isGenerating) return null;

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.stage === stage),
  );

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div key={step.stage} className="flex items-center gap-1 shrink-0">
              <span
                className={cn(
                  "font-mono text-[8px] uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-brand-orange font-bold"
                    : isCompleted
                      ? "text-brand-charcoal/70 dark:text-text-secondary/80"
                      : "text-brand-charcoal/30 dark:text-text-secondary/50",
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <span className="text-brand-charcoal/20 dark:text-border-primary/50">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
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
  onGenerationStart,
  onGenerationEnd,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamStage, setStreamStage] = useState<StreamStage>("analyzing");
  const [streamDetail, setStreamDetail] = useState("");
  const [showChatList, setShowChatList] = useState(false);
  const [_isThinkingOpen, _setIsThinkingOpen] = useState(true);
  const [suggestionChips, setSuggestionChips] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [_editingChatId, _setEditingChatId] = useState<string | null>(null);
  const [_editingTitle, _setEditingTitle] = useState("");
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>(
    [],
  );
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  // Generation state machine for reliable prompt processing
  const [generationState, setGenerationState] =
    useState<GenerationState>("idle");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Track if initial prompt was already processed to prevent double-processing
  const processedPromptRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Abort controller ref for stop generation + navigation cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  // Guard to prevent loadMessages from overwriting streaming state
  const skipLoadMessagesRef = useRef<boolean>(false);

  // Load initial settings or default mode
  const [chatMode, setChatModeState] = useState<ArchitectureMode>(
    (initialMetadata?.mode as ArchitectureMode) || "default",
  );

  // Rate limit / Quota state
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaResetAt, setQuotaResetAt] = useState<string | null>(null);
  const [quotaLimit, setQuotaLimit] = useState<number>(15);

  // Settings / Preferences
  // Settings / Preferences
  const [model, setModelState] = useState(
    (initialMetadata?.model as string) || "qwen:qwen3.5-plus",
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

  const updateStreamProgress = (
    nextProgress: number,
    nextStage?: StreamStage,
    detail?: string,
  ) => {
    setStreamProgress((prev) => {
      const clamped = Math.max(0, Math.min(100, Math.round(nextProgress)));
      return Math.max(prev, clamped);
    });
    if (nextStage) {
      setStreamStage(nextStage);
    }
    if (typeof detail === "string") {
      setStreamDetail(detail);
    }
  };

  // Wrappers to persist on change
  const setChatMode = (mode: ArchitectureMode) => {
    setChatModeState(mode);
    // Save preference to project
    import("@/actions/projects").then(({ saveProject }) => {
      saveProject(
        projectId,
        { metadata: { ...initialMetadata, mode, model } },
        false,
      );
    });
    // Sync to global user preferences
    updateUserPreferences({ defaultMode: mode });
  };

  const setModel = (newModel: string) => {
    setModelState(newModel);
    // Save preference to project
    import("@/actions/projects").then(({ saveProject }) => {
      saveProject(
        projectId,
        {
          metadata: { ...initialMetadata, mode: chatMode, model: newModel },
        },
        false,
      );
    });
    // Sync to global user preferences
    updateUserPreferences({ defaultModel: newModel });
  };

  // Load chats on mount
  useEffect(() => {
    loadChats();
    loadUserPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when current chat changes
  // Guard: skip when processMessage just set currentChatId mid-stream
  useEffect(() => {
    if (currentChatId) {
      if (skipLoadMessagesRef.current) {
        skipLoadMessagesRef.current = false;
        return; // Don't overwrite streaming state
      }
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

  // Abort stream on unmount (e.g. navigating to dashboard)
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Scroll to bottom on new messages — uses a sentinel div for reliable behaviour
  useEffect(() => {
    scrollSentinelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isGenerating]);

  // Reliable initial prompt processing with state machine
  useEffect(() => {
    // Skip if no initial prompt provided
    if (!initialPrompt) return;

    // Skip if we've already processed this exact prompt
    if (processedPromptRef.current === initialPrompt) return;

    // Skip if we're already processing (using ref for immediate check)
    if (isProcessingRef.current) return;

    // Skip if chats are still loading
    if (isLoadingChats) return;

    // Skip if we already have messages (user refreshed after starting)
    if (messages.length > 0) {
      // Mark as processed to prevent re-triggering
      processedPromptRef.current = initialPrompt;
      // Also notify parent that we've "processed" it (by skipping)
      onInitialPromptProcessed?.();
      return;
    }

    // Check if this prompt was already processed (from sessionStorage status)
    const storageKey = `initial-prompt-${projectId}-status`;
    const status = sessionStorage.getItem(storageKey);
    if (status === "completed" || status === "failed") {
      processedPromptRef.current = initialPrompt;
      onInitialPromptProcessed?.();
      return;
    }

    // Set up the pending prompt and transition to preparing state
    setPendingPrompt(initialPrompt);
    setGenerationState("preparing");
  }, [
    initialPrompt,
    isLoadingChats,
    messages.length,
    projectId,
    onInitialPromptProcessed,
  ]);

  // Handle the actual processing when in preparing state
  useEffect(() => {
    if (generationState !== "preparing" || !pendingPrompt) return;

    // Mark this prompt as being processed
    processedPromptRef.current = pendingPrompt;
    isProcessingRef.current = true;

    // Update sessionStorage status to processing
    const statusKey = `initial-prompt-${projectId}-status`;
    sessionStorage.setItem(statusKey, "processing");

    // Small delay to ensure UI is ready and show loading state
    const timeoutId = setTimeout(() => {
      setGenerationState("generating");
      processMessage(pendingPrompt)
        .then(() => {
          setGenerationState("complete");
          setPendingPrompt(null);
          setGenerationError(null);
          // Mark as completed in sessionStorage
          sessionStorage.setItem(statusKey, "completed");
          // Notify parent that processing is complete
          onInitialPromptProcessed?.();
        })
        .catch((error) => {
          setGenerationState("error");
          setGenerationError(
            error instanceof Error ? error.message : "Generation failed",
          );
          // Mark as failed in sessionStorage for retry
          sessionStorage.setItem(statusKey, "failed");
        })
        .finally(() => {
          isProcessingRef.current = false;
        });
    }, 500); // Slightly longer delay for better UX

    return () => clearTimeout(timeoutId);
  }, [generationState, pendingPrompt, projectId, onInitialPromptProcessed]);

  // Retry handler for failed initial prompt
  const handleRetryInitialPrompt = useCallback(() => {
    if (pendingPrompt) {
      // Reset the processed ref so the effect can trigger again
      processedPromptRef.current = null;
      isProcessingRef.current = false;
      // Reset sessionStorage status
      const statusKey = `initial-prompt-${projectId}-status`;
      sessionStorage.setItem(statusKey, "pending");
      // Reset state
      setGenerationState("preparing");
      setGenerationError(null);
    }
  }, [pendingPrompt, projectId]);

  // Stop generation handler
  const handleStopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

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

  const loadProjectDocuments = useCallback(async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await fetch(
        `/api/project-documents?projectId=${encodeURIComponent(projectId)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load project documents");
      }

      const payload = await response.json();
      setProjectDocuments(
        Array.isArray(payload?.documents)
          ? (payload.documents as ProjectDocument[])
          : [],
      );
    } catch (error) {
      console.error("Error loading project documents:", error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjectDocuments();
  }, [loadProjectDocuments]);

  const handlePdfUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Only PDF files are supported");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("file", file);

    setIsUploadingDocument(true);

    try {
      const response = await fetch("/api/project-documents", {
        method: "POST",
        body: formData,
      });

      const payload = await response
        .json()
        .catch(() => ({ error: "Upload failed" }));

      if (!response.ok) {
        throw new Error(payload.error || "Failed to upload PDF");
      }

      await loadProjectDocuments();
      if (payload?.extraction?.status === "failed") {
        toast.warning(
          "PDF uploaded, but text extraction failed. The file is saved and can be retried later.",
        );
      } else {
        toast.success("PDF uploaded and added to AI context");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload PDF",
      );
    } finally {
      setIsUploadingDocument(false);
      event.target.value = "";
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/project-documents?id=${encodeURIComponent(documentId)}`,
        { method: "DELETE" },
      );
      const payload = await response
        .json()
        .catch(() => ({ error: "Delete failed" }));

      if (!response.ok) {
        throw new Error(payload.error || "Failed to remove document");
      }

      setProjectDocuments((prev) =>
        prev.filter((item) => item.id !== documentId),
      );
      toast.success("Document removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove document",
      );
    }
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

        let finalMode = (prefs.defaultMode ||
          prefs.defaultArchitectureMode) as ArchitectureMode;

        // Migrate legacy corporate mode
        if ((finalMode as string) === "corporate") {
          finalMode = "enterprise";
        }

        if (
          finalMode &&
          ["default", "startup", "enterprise"].includes(finalMode)
        ) {
          setChatModeState(finalMode);
        }

        if (prefs.defaultModel) {
          setModelState(prefs.defaultModel);
        }

        // Set default model if not already set by project metadata
        if (prefs.defaultModel && !initialMetadata?.model) {
          setModelState(prefs.defaultModel);
        }

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

  // Generates a conversational response using the AI's actual reasoning
  const generateConversationalResponse = (
    data: ArchitectureResponseData,
    reasoningStr?: string,
    _usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    } | null,
  ) => {
    const nodeCount = data.nodes?.length || 0;
    const edgeCount = data.edges?.length || 0;

    const techs = Array.from(
      new Set(data.nodes?.map((n: any) => n.data?.tech).filter(Boolean) || []),
    ) as string[];

    // Capitalize/format known tech names
    const formatTech = (t: string) => {
      const map: Record<string, string> = {
        laravel: "Laravel",
        livewire: "Livewire",
        inertia: "Inertia.js",
        blade: "Blade",
        postgres: "PostgreSQL",
        postgresql: "PostgreSQL",
        openai: "OpenAI",
        redis: "Redis",
        mysql: "MySQL",
        mongodb: "MongoDB",
        react: "React",
        nextjs: "Next.js",
        vuejs: "Vue.js",
        nuxtjs: "Nuxt.js",
        express: "Express",
        fastapi: "FastAPI",
        django: "Django",
        rails: "Rails",
        node: "Node.js",
        nodejs: "Node.js",
        graphql: "GraphQL",
        kafka: "Kafka",
        rabbitmq: "RabbitMQ",
        elasticsearch: "Elasticsearch",
        nginx: "Nginx",
        docker: "Docker",
        kubernetes: "Kubernetes",
        terraform: "Terraform",
        aws: "AWS",
        gcp: "GCP",
        azure: "Azure",
        supabase: "Supabase",
        firebase: "Firebase",
        vercel: "Vercel",
        cloudflare: "Cloudflare",
        stripe: "Stripe",
        twilio: "Twilio",
        sendgrid: "SendGrid",
        tailwind: "Tailwind",
        typescript: "TypeScript",
        python: "Python",
        rust: "Rust",
        go: "Go",
        java: "Java",
        spring: "Spring",
        pinecone: "Pinecone",
        weaviate: "Weaviate",
        qdrant: "Qdrant",
        anthropic: "Anthropic",
        gemini: "Gemini",
        ollama: "Ollama",
        datadog: "Datadog",
        sentry: "Sentry",
        prometheus: "Prometheus",
        grafana: "Grafana",
        celery: "Celery",
        sidekiq: "Sidekiq",
      };
      return map[t.toLowerCase()] || t.charAt(0).toUpperCase() + t.slice(1);
    };

    const formattedTechs = techs.slice(0, 4).map(formatTech);
    const stackSnippet = formattedTechs.join(", ");
    const recommendedStack = data.recommendedStack || [];
    const preferenceAlignedAlternative =
      data.preferenceAlignedAlternative || [];
    const preferenceConflicts = data.preferenceConflicts || [];

    // LLM-generated analysis is the primary response — lead with it
    let insight = "";
    if (data.analysis && data.analysis.trim().length > 0) {
      insight = data.analysis.trim();
    } else if (reasoningStr && reasoningStr.trim().length > 0) {
      const cleanReasoning = reasoningStr
        .replace(/<think>|<\/think>/g, "")
        .trim();
      const firstParagraph = cleanReasoning.split("\n\n")[0];
      const trimmed = firstParagraph.slice(0, 400);
      insight = `> *${trimmed.trim()}${cleanReasoning.length > 400 ? "..." : ""}*`;
    } else if (techs.length > 0) {
      insight = `> *Optimized for high-performance ${formatTech(techs[0])} patterns and automated scalability.*`;
    }

    // Stats footer — brief, secondary
    let statsLine = `**${nodeCount} nodes** · **${edgeCount} connections**`;
    if (stackSnippet) statsLine += ` · ${stackSnippet}`;

    const sections: string[] = [];
    if (insight) {
      sections.push(insight);
    }

    if (data.selectedArchitectureStrategy?.trim()) {
      sections.push(
        `**Why This Architecture**\n${data.selectedArchitectureStrategy.trim()}`,
      );
    }

    if (recommendedStack.length > 0) {
      sections.push(
        `**Recommended Stack**\n${recommendedStack.map((item) => `- ${item}`).join("\n")}`,
      );
    }

    if (preferenceAlignedAlternative.length > 0) {
      sections.push(
        `**Preference-Aligned Option**\n${preferenceAlignedAlternative
          .map((item) => `- ${item}`)
          .join("\n")}`,
      );
    }

    if (preferenceConflicts.length > 0) {
      sections.push(
        `**Tradeoffs**\n${preferenceConflicts.map((item) => `- ${item}`).join("\n")}`,
      );
    }

    sections.push(`---\n${statsLine}`);

    const response = sections.join("\n\n");

    const chips: string[] = [];

    return { response, chips };
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
    if (onGenerationStart) onGenerationStart();

    setStreamProgress(5);
    setStreamStage("analyzing");
    setStreamDetail("Preparing your request");

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
      // Prevent the currentChatId effect from triggering loadMessages
      // which would overwrite our streaming message state
      skipLoadMessagesRef.current = true;
      setCurrentChatId(chatId);
    }

    await saveMessage(chatId, userMessage);

    // Create a placeholder message for AI (outside try block so catch can access it)
    const aiMsgId = (Date.now() + 1).toString();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s connection timeout

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

    let streamWatchdog: NodeJS.Timeout | null = null;
    const resetWatchdog = () => {
      if (streamWatchdog) clearTimeout(streamWatchdog);
      streamWatchdog = setTimeout(() => {
        console.warn("[Watchdog] Stream stalled for 60s. Aborting.");
        controller.abort();
      }, 60000); // Increased to 60s to accommodate reasoning models
    };

    let accumulatedContent = "";
    let accumulatedReasoning = "";
    let lastGeneratedData: any = null; // Capture generated data
    let showingArchitectureProgress = false;
    let tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    } | null = null;

    try {
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
        signal: controller.signal,
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

      updateStreamProgress(
        15,
        "connecting",
        "Connecting to the selected model",
      );
      clearTimeout(timeoutId); // Connection established, clear initial timeout
      resetWatchdog(); // Start stream watchdog

      if (response.status === 429) {
        const errorData = await response.json();
        setQuotaResetAt(errorData.resetAt || null);
        setQuotaLimit(errorData.limit || 15);
        setIsQuotaModalOpen(true);

        // Cleanup the placeholder AI message
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        setIsGenerating(false);
        clearTimeout(timeoutId);
        if (streamWatchdog) clearTimeout(streamWatchdog);
        return;
      }

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
        resetWatchdog(); // Got some data, reset watchdog
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
                  updateStreamProgress(
                    Math.min(
                      88,
                      40 + Math.floor(accumulatedContent.length / 120),
                    ),
                    "generating",
                    "Building architecture graph and recommendation",
                  );
                  showingArchitectureProgress =
                    showingArchitectureProgress ||
                    isLikelyArchitecturePayload(accumulatedContent);

                  if (!lastGeneratedData) {
                    try {
                      const parsed =
                        extractArchitectureFromText(accumulatedContent);
                      if (parsed) {
                        lastGeneratedData = parsed;
                        onGenerationSuccess(parsed);
                        updateStreamProgress(
                          95,
                          "validating",
                          "Validating graph quality and policy compliance",
                        );
                      }
                    } catch {
                      // Ignore incomplete JSON chunks or parse errors while streaming
                    }
                  }

                  // Always keep isThinking:true while streaming — never let it flip mid-stream
                  // (prevents the StreamingMessage from flickering away on non-JSON chunks)
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMsgId ? { ...m, isThinking: true } : m,
                    ),
                  );
                } else if (part.type === "reasoning" && part.text) {
                  accumulatedReasoning += part.text;
                  updateStreamProgress(
                    Math.min(
                      78,
                      28 + Math.floor(accumulatedReasoning.length / 140),
                    ),
                    "thinking",
                    "Checking overlaps, conflicts, and trade-offs",
                  );
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
              updateStreamProgress(
                Math.min(
                  78,
                  28 + Math.floor(accumulatedReasoning.length / 140),
                ),
                "thinking",
                "Checking overlaps, conflicts, and trade-offs",
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, reasoning: accumulatedReasoning }
                    : m,
                ),
              );
            } else if (json.type === "content" && json.data) {
              accumulatedContent += json.data;
              updateStreamProgress(
                Math.min(88, 40 + Math.floor(accumulatedContent.length / 120)),
                "generating",
                "Building architecture graph and recommendation",
              );
              showingArchitectureProgress =
                showingArchitectureProgress ||
                isLikelyArchitecturePayload(accumulatedContent);

              if (!lastGeneratedData) {
                try {
                  const parsed =
                    extractArchitectureFromText(accumulatedContent);
                  if (parsed) {
                    lastGeneratedData = parsed;
                    onGenerationSuccess(parsed);
                    updateStreamProgress(
                      95,
                      "validating",
                      "Validating graph quality and policy compliance",
                    );
                  }
                } catch {
                  // Ignore parse errors during stream.
                }
              }

              // Update the message content in real-time so it can be passed to UI
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: accumulatedContent, isThinking: true }
                    : m,
                ),
              );
            } else if (json.type === "result" && json.data) {
              console.log("Received architecture result:", json.data);
              lastGeneratedData = json.data;
              onGenerationSuccess(json.data);
              updateStreamProgress(
                95,
                "validating",
                "Validating graph quality and policy compliance",
              );
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        isThinking: true,
                        content:
                          "Architecture generated. Preparing explanation...",
                      }
                    : m,
                ),
              );
            } else if (json.type === "error" && json.data) {
              const streamError =
                typeof json.data === "string"
                  ? json.data
                  : "Generation stream failed";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, isThinking: false, content: `❌ ${streamError}` }
                    : m,
                ),
              );
              toast.error(streamError);
            } else if (json.type === "usage" && json.data) {
              tokenUsage = json.data;
            } else if (json.type === "progress" && json.data) {
              const progressPayload = json.data as {
                progress?: number;
                stage?: StreamStage;
                detail?: string;
              };

              if (typeof progressPayload.progress === "number") {
                updateStreamProgress(
                  progressPayload.progress,
                  progressPayload.stage,
                  progressPayload.detail,
                );
              }
            }
          } catch {
            // Ignore incomplete lines until the next chunk completes them.
          }
        }
      }

      // Construct Final Message
      let finalContent = accumulatedContent;
      let newChips: string[] = [];

      // If we have generated data, use punchy conversational response + chips
      if (lastGeneratedData) {
        const { response, chips } = generateConversationalResponse(
          lastGeneratedData,
          accumulatedReasoning,
          tokenUsage,
        );
        finalContent = response;
        newChips = chips;
      } else if (
        accumulatedContent.includes('"nodes"') ||
        accumulatedContent.trim().startsWith("{") ||
        accumulatedContent.trim().startsWith("```")
      ) {
        finalContent =
          "Architecture drafted — check the canvas for the full layout.";
      } else if (!accumulatedContent) {
        finalContent = "I couldn't generate a response.";
      } else {
        // If it's a completely arbitrary generation string, fallback string
        finalContent = accumulatedContent;
      }

      // Append token usage for the fallback cases (not handled by generateConversationalResponse)
      if (!lastGeneratedData && tokenUsage) {
        const total =
          tokenUsage.totalTokens ||
          tokenUsage.promptTokens + tokenUsage.completionTokens;
        finalContent += `\n\n*(Used **${total.toLocaleString()}** tokens)*`;
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
      setSuggestionChips(newChips);
      updateStreamProgress(
        100,
        "complete",
        "Recommended architecture and alternatives ready",
      );

      await saveMessage(chatId, finalAiMessage);
    } catch (err: any) {
      if (streamWatchdog) clearTimeout(streamWatchdog);

      const isAbortError = err.name === "AbortError";

      // Only log and toast if it's NOT a manual abort
      if (!isAbortError) {
        console.error("Error processing message:", err);
        const errorMessage = err?.message || "Generation failed";

        // Update the AI message to show the error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, isThinking: false, content: `❌ ${errorMessage}` }
              : m,
          ),
        );

        toast.error(errorMessage);
      } else {
        // For AbortError, just stop the UI state cleanly without "Error" UI
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  isThinking: false,
                  content: `${accumulatedContent} [Stopped by user]`,
                }
              : m,
          ),
        );
      }

      setStreamStage(isAbortError ? "complete" : "error");
      setStreamDetail(
        isAbortError ? "Generation stopped" : "Generation failed",
      );

      // Re-throw for the initial prompt handling if it's not an abort
      if (!isAbortError) throw err;
    } finally {
      if (streamWatchdog) clearTimeout(streamWatchdog);
      abortControllerRef.current = null;
      setIsGenerating(false);
      setStreamProgress(0);
      setStreamStage("analyzing");
      setStreamDetail("");
      if (onGenerationEnd) onGenerationEnd();
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
              (message.isThinking ||
                isLikelyArchitecturePayload(message.content)) ? (
                <StreamingMessage
                  isGenerating={true}
                  reasoning={message.reasoning}
                  content={message.content}
                  streamProgress={streamProgress}
                  stage={streamStage}
                  detail={streamDetail}
                />
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
                      Generation Notes
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

        {/* Suggestion Chips — shown after generation, cleared on next submit */}
        <AnimatePresence>
          {suggestionChips.length > 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5 pl-1"
            >
              {suggestionChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSuggestionChips([]);
                    setInputValue(chip);
                    // Auto-submit after a tick so inputValue is set
                    setTimeout(() => {
                      processMessage(chip);
                      setInputValue("");
                    }, 0);
                  }}
                  className="text-left font-mono text-[10px] px-2.5 py-1.5 border border-brand-charcoal/15 dark:border-border-primary/40 text-brand-charcoal/60 dark:text-text-secondary/70 hover:border-brand-orange/60 hover:text-brand-orange dark:hover:text-brand-orange hover:bg-brand-orange/5 transition-all duration-150 max-w-[95%] truncate"
                >
                  <span className="text-brand-orange/50 mr-1.5">›</span>
                  {chip}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll sentinel */}
        <div ref={scrollSentinelRef} className="h-1" />
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
                  <ProcessingSteps
                    isGenerating={isGenerating}
                    stage={streamStage}
                  />
                </div>
                {streamDetail ? (
                  <div className="font-mono text-[9px] leading-relaxed text-brand-charcoal/45 dark:text-text-secondary/55">
                    {streamDetail}
                  </div>
                ) : null}
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
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />

          <div className="flex flex-col gap-1.5 px-3 pb-3">
            {projectDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {projectDocuments.slice(0, 4).map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-brand-charcoal/5 dark:bg-bg-secondary border border-brand-charcoal/10 dark:border-border-primary/30 rounded-full"
                  >
                    <span className="font-mono text-[9px] truncate max-w-[120px] text-brand-charcoal/70 dark:text-text-secondary">
                      {document.file_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(document.id)}
                      className="text-brand-charcoal/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group">
              <form
                onSubmit={handleManualSubmit}
                className="relative flex items-center bg-bg-primary dark:bg-bg-secondary border border-brand-charcoal/20 dark:border-border-primary focus-within:border-brand-orange/50 transition-colors shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isUploadingDocument || isGenerating}
                  className="pl-3 pr-2 h-11 flex items-center justify-center shrink-0 text-brand-charcoal/40 dark:text-text-secondary/50 hover:text-brand-orange transition-colors disabled:opacity-50"
                  title="Attach PDF"
                >
                  {isUploadingDocument ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") setSuggestionChips([]);
                  }}
                  placeholder={
                    isGenerating
                      ? "PROCESSING..."
                      : generationState === "preparing"
                        ? "INITIALIZING..."
                        : "COMMAND //"
                  }
                  disabled={isGenerating || generationState === "preparing"}
                  className="flex-1 h-11 bg-transparent border-none text-brand-charcoal dark:text-text-primary placeholder:text-brand-charcoal/30 dark:placeholder:text-text-secondary/30 text-[13px] font-mono focus:outline-none focus:ring-0 disabled:opacity-50"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <Select value={chatMode} onValueChange={setChatMode}>
                    <SelectTrigger className="h-8 w-auto min-w-0 px-2 max-w-[100px] border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[9px] font-mono uppercase tracking-widest text-brand-charcoal/50 dark:text-text-secondary focus:ring-0 shadow-none appearance-none rounded-none">
                      <SelectValue placeholder="MODE" />
                    </SelectTrigger>
                    <SelectContent className="font-mono text-[10px] uppercase rounded-none border-brand-charcoal">
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="h-8 w-8 min-w-0 p-0 flex items-center justify-center border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[10px] font-mono text-brand-charcoal/50 dark:text-text-secondary focus:ring-0 shadow-none rounded-none">
                      <Bot className="w-4 h-4 shrink-0" />
                    </SelectTrigger>
                    <SelectContent
                      align="end"
                      className="font-mono text-[11px] max-w-[300px] rounded-none border-brand-charcoal"
                    >
                      <TooltipProvider delayDuration={100}>
                        {Object.entries(AVAILABLE_MODELS).map(([id, m]) => (
                          <Tooltip key={id}>
                            <TooltipTrigger asChild>
                              <div className="w-full">
                                <SelectItem
                                  value={id}
                                  className="flex items-center justify-between group rounded-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{m.name}</span>
                                    {m.badge === "hot_tag" && (
                                      <span className="text-brand-orange ml-1">
                                        🔥
                                      </span>
                                    )}
                                    {m.badge === "double_hot_tag" && (
                                      <span className="text-brand-orange ml-1">
                                        🔥🔥
                                      </span>
                                    )}
                                    {m.badge === "balance_tag" && (
                                      <span className="text-[8px] text-blue-500 border border-blue-500/20 px-1 py-0.5 ml-1 leading-none uppercase">
                                        BAL
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="max-w-[200px] font-mono text-[10px] bg-bg-elevated text-text-primary z-[100] p-2 leading-relaxed whitespace-pre-wrap rounded-none border-brand-charcoal"
                            >
                              <div className="font-bold text-brand-orange mb-1">
                                {m.name}
                              </div>
                              {m.description}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </SelectContent>
                  </Select>
                </div>

                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopGeneration}
                    className="h-11 w-11 flex items-center justify-center p-0 bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0"
                    title="Stop generation"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="h-11 w-11 flex items-center justify-center p-0 bg-brand-charcoal dark:bg-white text-white dark:text-zinc-950 hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <ResourceExhaustionModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        resetAt={quotaResetAt}
        limit={quotaLimit}
      />
    </div>
  );
}
