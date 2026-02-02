"use client";

import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Settings,
  Bot,
  User,
  Paperclip,
  Mic,
  ArrowUp,
  Plus,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  X
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ThinkingPanel } from "./ThinkingPanel";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isOpen, setIsOpen] = useState(true);
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
  }, [messages]);

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
      const response = await fetch(`/api/chats?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);

        // If there are chats, select the most recent one
        if (data.chats && data.chats.length > 0) {
          setCurrentChatId(data.chats[0].id);
        } else {
          // Create a default chat if none exist
          await createNewChat("Chat 1", false);
        }
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        // Transform messages to our format
        const loadedMessages: Message[] = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          reasoning: m.reasoning || undefined,
          isThinking: false,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const createNewChat = async (title: string = `Chat ${chats.length + 1}`, select: boolean = true) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title }),
      });

      if (response.ok) {
        const data = await response.json();
        setChats(prev => [data.chat, ...prev]);
        if (select) {
          setCurrentChatId(data.chat.id);
          setMessages([]);
        }
        return data.chat;
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
          // Switch to another chat or create new one
          const remaining = chats.filter(c => c.id !== chatId);
          if (remaining.length > 0) {
            setCurrentChatId(remaining[0].id);
          } else {
            await createNewChat("Chat 1");
          }
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        setChats(prev => prev.map(c =>
          c.id === chatId ? { ...c, title: newTitle } : c
        ));
      }
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
    setEditingChatId(null);
  };

  const saveMessage = async (chatId: string, message: Message) => {
    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          reasoning: message.reasoning,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    // Ensure we have a chat
    let activeChatId = currentChatId;
    if (!activeChatId) {
      const newChat = await createNewChat();
      if (!newChat) return;
      activeChatId = newChat.id;
    }

    // At this point activeChatId is guaranteed to be non-null
    const chatId = activeChatId as string;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim()
    };

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: Message = {
      id: aiMsgId,
      role: "assistant",
      content: "",
      reasoning: "",
      isThinking: true
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputValue("");
    setIsGenerating(true);

    // Save user message
    await saveMessage(chatId, userMsg);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.content, provider: cloudProvider }),
      });

      if (!response.ok) throw new Error(response.statusText);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let accumulatedReasoning = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines from buffer
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in buffer
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
            }
          } catch (e) {
            // Line might be incomplete JSON, will be processed in next iteration
            console.debug("Skipping incomplete JSON line");
          }
        }
      }

      // Process any remaining data in buffer
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
          }
        } catch (e) {
          // Final buffer is incomplete, ignore
        }
      }

      // Parse final JSON
      try {
        const finalJson = JSON.parse(accumulatedContent);
        if (finalJson.nodes && finalJson.edges) {
          onGenerationSuccess(finalJson);
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId ? { ...m, content: "I've drafted the architecture based on your request. Check the canvas!" } : m
          ));
        }
      } catch (e) {
        console.error("JSON parse error", e);
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, isThinking: false, content: "I encountered an error parsing the architecture. Please try again." } : m
        ));
      }

      // Save AI message after completion
      const finalAiMessage = {
        id: aiMsgId,
        role: "assistant" as const,
        content: accumulatedContent.includes('"nodes"') ? "I've drafted the architecture based on your request. Check the canvas!" : accumulatedContent || "I couldn't generate a response.",
        reasoning: accumulatedReasoning,
      };
      await saveMessage(chatId, finalAiMessage);

    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, isThinking: false, content: `Error: ${err.message}` } : m
      ));

      // Save error message
      await saveMessage(chatId, {
        id: aiMsgId,
        role: "assistant",
        content: `Error: ${err.message}`,
      });
    } finally {
      setIsGenerating(false);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, isThinking: false } : m
      ));
    }
  };

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-[#faf9f5]",
      isResizable ? "w-full" : isOpen ? "w-[400px]" : "w-16",
      !isResizable && "transition-all duration-300 border-l border-brand-charcoal/5 shadow-xl"
    )}>
      {/* Toggle Button */}
      {!isResizable && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -left-3 top-6 w-6 h-6 bg-white border border-brand-charcoal/10 rounded-full flex items-center justify-center shadow-sm z-50 hover:bg-brand-orange hover:text-white transition-colors"
        >
          {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Closed State */}
      {!isOpen && !isResizable && (
        <div className="flex flex-col items-center pt-8 gap-4">
          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Sparkles size={16} />
          </div>
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest text-brand-gray-mid">AI ARCHITECT</span>
        </div>
      )}

      {/* Content */}
      {(isOpen || isResizable) && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-brand-charcoal/5 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange/80 flex items-center justify-center text-white shadow-brand-orange/20 shadow-lg">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="font-poppins font-bold text-sm text-brand-charcoal">AI Architect</h2>
                <p className="text-[10px] text-brand-gray-mid font-medium">Powered by DeepSeek R1</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowChatList(!showChatList)}
                title="Chat History"
              >
                <MessageSquare size={16} className="text-brand-gray-mid" />
              </Button>
              <Link href="/dashboard/settings" title="Settings">
                <Settings size={16} className="text-brand-gray-mid hover:text-brand-charcoal transition-colors" />
              </Link>
            </div>
          </div>

          {/* Chat List Sidebar */}
          {showChatList && (
            <div className="border-b border-brand-charcoal/5 bg-white/30 backdrop-blur-sm">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-brand-gray-mid">Chat History</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => createNewChat()}
                  >
                    <Plus size={12} />
                    New Chat
                  </Button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {isLoadingChats ? (
                    <div className="text-xs text-brand-gray-mid py-2">Loading...</div>
                  ) : chats.length === 0 ? (
                    <div className="text-xs text-brand-gray-mid py-2">No chats yet</div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer group",
                          currentChatId === chat.id
                            ? "bg-brand-orange/10 text-brand-orange"
                            : "hover:bg-white/50 text-brand-charcoal"
                        )}
                        onClick={() => {
                          setCurrentChatId(chat.id);
                          setShowChatList(false);
                        }}
                      >
                        {editingChatId === chat.id ? (
                          <div className="flex items-center gap-1 flex-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 text-xs px-1 py-0.5 border rounded"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateChatTitle(chat.id, editingTitle);
                                } else if (e.key === 'Escape') {
                                  setEditingChatId(null);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateChatTitle(chat.id, editingTitle);
                              }}
                            >
                              <Check size={10} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingChatId(null);
                              }}
                            >
                              <X size={10} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs truncate flex-1">{chat.title}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal size={10} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingChatId(chat.id);
                                    setEditingTitle(chat.title);
                                  }}
                                >
                                  <Edit2 size={12} className="mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                  }}
                                >
                                  <Trash2 size={12} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Chat Title */}
          {currentChat && !showChatList && (
            <div className="px-4 py-2 border-b border-brand-charcoal/5 bg-white/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brand-gray-mid truncate">
                  {currentChat.title}
                </span>
                <span className="text-[10px] text-brand-gray-mid">
                  {messages.filter(m => m.role === 'user').length} messages
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                <div className="w-16 h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-brand-charcoal/40" />
                </div>
                <h3 className="font-poppins font-semibold text-brand-charcoal mb-2">How can I help you architect?</h3>
                <p className="text-xs text-brand-gray-mid max-w-[200px]">
                  Try asking for a "Microservices app on AWS" or "Real-time chat with Supabase".
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="w-6 h-6 mt-1 border border-black/5">
                  <AvatarFallback className={cn("text-[10px]", msg.role === "assistant" ? "bg-brand-orange text-white" : "bg-brand-charcoal text-white")}>
                    {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-brand-charcoal text-white rounded-tr-none"
                      : "bg-white border border-brand-charcoal/5 text-brand-charcoal rounded-tl-none"
                  )}>
                    {msg.content || (msg.isThinking ? "Thinking..." : "")}
                  </div>
                  {msg.reasoning && (
                    <div className="mt-2 w-full">
                      <ThinkingPanel reasoning={msg.reasoning} isThinking={!!msg.isThinking} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <Avatar className="w-6 h-6 mt-1 border border-black/5">
                  <AvatarFallback className="bg-brand-orange text-white text-[10px]"><Bot size={14} /></AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 p-3 bg-white border border-brand-charcoal/5 rounded-2xl rounded-tl-none shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-orange/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-orange/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-brand-orange/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 backdrop-blur-md border-t border-brand-charcoal/5">
            {messages.length === 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {["Event-Driven System", "SaaS Boilerplate", "RAG Pipeline"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1.5 bg-white border border-brand-charcoal/10 rounded-full text-[10px] font-medium text-brand-charcoal hover:bg-brand-orange/5 hover:border-brand-orange/30 transition-colors whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div className="relative group">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Describe your architecture..."
                className="w-full min-h-[50px] max-h-[150px] p-3 pr-12 bg-white rounded-xl border border-brand-charcoal/10 focus:border-brand-orange/50 focus:ring-4 focus:ring-brand-orange/5 outline-none resize-none text-sm font-poppins shadow-sm transition-all"
                rows={1}
              />
              <button
                onClick={(e) => handleSubmit(e)}
                disabled={!inputValue.trim() || isGenerating}
                className="absolute right-2 bottom-2 p-2 bg-brand-charcoal text-white rounded-lg hover:bg-brand-orange disabled:opacity-50 disabled:hover:bg-brand-charcoal transition-all shadow-md active:scale-95"
              >
                <ArrowUp size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex gap-2 text-[10px] text-brand-gray-mid">
                <span className="flex items-center gap-1"><Paperclip size={10} /> Attach Context</span>
                <span className="flex items-center gap-1"><Mic size={10} /> Voice</span>
              </div>
              <div className="text-[10px] text-brand-gray-mid font-medium">
                {cloudProvider} Mode
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
