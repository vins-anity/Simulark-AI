"use client";

import {
  ArrowUp,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  X,
  Terminal,
  Cpu,
  Zap,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ThinkingPanel } from "./ThinkingPanel";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProjectChats, createChat as createChatAction, updateChatTitle as updateChatTitleAction, deleteChat as deleteChatAction, addMessage, addMessages as addMessagesAction, getChatWithMessages, getOrCreateDefaultChat } from "@/actions/chats";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  onGenerationSuccess: (data: any) => void;
  projectId: string;
  isResizable?: boolean;
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
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Settings / Preferences
  const [cloudProvider, setCloudProvider] = useState("Generic");

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const loadUserPreferences = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('preferences')
        .eq('user_id', user.id)
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

  const createNewChat = async (title: string = `Terminal ${chats.length + 1}`, select: boolean = true) => {
    try {
      const { chat, error } = await createChatAction(projectId, title);
      if (error || !chat) {
        toast.error("Failed to initialize new terminal");
        return;
      }

      setChats(prev => [chat, ...prev]);
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

      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        const remaining = chats.filter(c => c.id !== chatId);
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
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, title: newTitle } : c
      ));
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
    setEditingChatId(null);
  };

  const saveMessage = async (chatId: string, message: Message) => {
    try {
      await addMessage(chatId, message.role, message.content, message.reasoning);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    let activeChatId = currentChatId;
    if (!activeChatId) {
      const newChat = await createNewChat();
      if (!newChat) return;
      activeChatId = newChat.id;
    }
    const chatId = activeChatId as string;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsGenerating(true);

    await saveMessage(chatId, userMsg);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.content,
          provider: cloudProvider,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let accumulatedReasoning = "";
      let buffer = "";
      const aiMsgId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "assistant",
          content: "",
          isThinking: true,
        },
      ]);

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
            if (json.type === "reasoning" && json.data) {
              accumulatedReasoning += json.data;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, reasoning: accumulatedReasoning } : m
              ));
            } else if (json.type === "content" && json.data) {
              accumulatedContent += json.data;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, isThinking: false, content: accumulatedContent } : m
              ));
            } else if (json.type === "result" && json.data) {
              onGenerationSuccess(json.data);
            }
          } catch (e) {
            console.debug("Skipping incomplete JSON line");
          }
        }
      }

      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer.trim());
          if (json.type === "reasoning" && json.data) {
            accumulatedReasoning += json.data;
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, reasoning: accumulatedReasoning } : m
            ));
          } else if (json.type === "content" && json.data) {
            accumulatedContent += json.data;
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: accumulatedContent } : m
            ));
          } else if (json.type === "result" && json.data) {
            onGenerationSuccess(json.data);
          }
        } catch (e) { }
      }

      const finalAiMessage = {
        id: aiMsgId,
        role: "assistant" as const,
        content: accumulatedContent.includes('"nodes"') ? "I've drafted the architecture based on your request. Check the workstation canvas." : accumulatedContent || "I couldn't generate a response.",
        reasoning: accumulatedReasoning,
      };

      // Update local state to remove thinking flag and set final content
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, isThinking: false, content: finalAiMessage.content } : m
      ));

      await saveMessage(chatId, finalAiMessage);

    } catch (err: any) {
      const errorMsg = `Error: ${err.message}`;
      setMessages(prev => prev.map(m =>
        m.id === (Date.now() + 1).toString() ? { ...m, isThinking: false, content: errorMsg } : m
      ));

      await saveMessage(chatId, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="flex flex-col h-full bg-white font-sans text-sm">
      {/* Terminal Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-brand-charcoal/10 bg-[#faf9f5]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand-orange" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/70">System Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("w-1.5 h-1.5 rounded-full block", isGenerating ? "bg-green-500 animate-pulse" : "bg-brand-charcoal/20")} />
          <span className="font-mono text-[9px] uppercase tracking-widest text-brand-charcoal/40">
            {isGenerating ? "PROCESSING" : "IDLE"}
          </span>
        </div>
      </div>

      {/* Chat List Select (Dropdown/Drawer) */}
      <div className="border-b border-brand-charcoal/5 px-3 py-2 bg-white flex items-center justify-between group cursor-pointer hover:bg-brand-charcoal/5" onClick={() => setShowChatList(!showChatList)}>
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageSquare className="w-3.5 h-3.5 text-brand-charcoal/40" />
          <span className="font-mono text-xs font-medium text-brand-charcoal truncate">
            {currentChat?.title || "Select Terminal..."}
          </span>
        </div>
        <ChevronDown className={cn("w-3 h-3 text-brand-charcoal/40 transition-transform", showChatList && "rotate-180")} />
      </div>

      {showChatList && (
        <div className="border-b border-brand-charcoal/10 bg-brand-charcoal/5 max-h-48 overflow-y-auto">
          {isLoadingChats ? (
            <div className="p-3 text-[10px] font-mono text-brand-charcoal/40">Loading channels...</div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white transition-colors group/item",
                  currentChatId === chat.id && "bg-white border-l-2 border-brand-orange"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentChatId(chat.id);
                  setShowChatList(false);
                }}
              >
                <span className="font-mono text-xs text-brand-charcoal/70 truncate">{chat.title}</span>
                <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="hover:text-red-500 text-brand-charcoal/40"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))
          )}
          <div
            className="p-2 flex items-center justify-center border-t border-brand-charcoal/5 cursor-pointer hover:bg-white text-brand-charcoal/50 hover:text-brand-orange transition-colors"
            onClick={() => { createNewChat(); setShowChatList(false); }}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1">
              <Icon icon="lucide:plus" className="w-3 h-3" /> Initialize New Channel
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-brand-charcoal/10 scrollbar-track-transparent" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
            <div className="w-12 h-12 rounded-full border border-dashed border-brand-charcoal flex items-center justify-center">
              <Terminal className="w-6 h-6 text-brand-charcoal" />
            </div>
            <div className="max-w-[200px]">
              <p className="font-mono text-xs text-brand-charcoal mb-1">TERMINAL READY</p>
              <p className="font-serif italic text-xs text-brand-charcoal/70">Describe your architectural requirements to begin generation.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col gap-1 max-w-[95%]",
                message.role === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <span className="font-mono text-[9px] uppercase text-brand-charcoal/40 mb-0.5">
                {message.role === "user" ? "OPERATOR" : "SYSTEM"}
              </span>

              {message.reasoning && (
                <ThinkingPanel
                  reasoning={message.reasoning}
                  isThinking={message.isThinking}
                />
              )}

              {message.content && (
                <div
                  className={cn(
                    "rounded-tr-xl rounded-bl-xl rounded-br-xl p-3 text-sm shadow-sm border",
                    message.role === "user"
                      ? "bg-brand-charcoal text-white rounded-tl-xl rounded-tr-none border-brand-charcoal"
                      : "bg-white text-brand-charcoal border-brand-charcoal/10"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-brand-charcoal/5 prose-pre:text-brand-charcoal prose-code:text-brand-orange text-[13px]">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans">{message.content}</div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-brand-charcoal/10">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 bg-[#faf9f5] border border-brand-charcoal/20 p-1.5 focus-within:ring-1 focus-within:ring-brand-orange/50 focus-within:border-brand-orange/50 transition-all rounded-sm"
        >
          <div className="pl-2">
            <Icon icon="lucide:chevron-right" className="w-4 h-4 text-brand-charcoal/40 animate-pulse" />
          </div>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter command or requirements..."
            className="flex-1 bg-transparent text-xs font-mono text-brand-charcoal placeholder:text-brand-charcoal/30 focus:outline-none py-2"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isGenerating}
            className={cn(
              "h-8 w-8 rounded-sm transition-all",
              inputValue.trim()
                ? "bg-brand-orange text-white hover:bg-brand-orange/90"
                : "bg-brand-charcoal/10 text-brand-charcoal/40"
            )}
          >
            <ArrowUp size={14} />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="flex gap-2">
            <span className="text-[9px] font-mono text-brand-charcoal/40 uppercase cursor-pointer hover:text-brand-orange flex items-center gap-1">
              <Icon icon="lucide:paperclip" className="w-3 h-3" /> Context
            </span>
            <span className="text-[9px] font-mono text-brand-charcoal/40 uppercase cursor-pointer hover:text-brand-orange flex items-center gap-1">
              <Icon icon="lucide:mic" className="w-3 h-3" /> Voice
            </span>
          </div>
          <span className="text-[9px] font-mono text-brand-charcoal/30">v1.2.0</span>
        </div>
      </div>
    </div>
  );
}
