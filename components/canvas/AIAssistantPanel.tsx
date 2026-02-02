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
  ArrowUp
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ThinkingPanel } from "./ThinkingPanel";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function AIAssistantPanel({
  onGenerationSuccess,
  projectId,
  isResizable = false,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Settings / Preferences
  const [cloudProvider, setCloudProvider] = useState("Generic");

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Fetch user preferences
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    async function loadPrefs() {
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
    }
    loadPrefs();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

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
      let buffer = ""; // Buffer for incomplete lines

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split buffer into lines, keeping incomplete line in buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Last element is incomplete (or empty)

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const json = JSON.parse(trimmedLine);
            if (json.type === "reasoning") {
              accumulatedReasoning += json.data;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, reasoning: accumulatedReasoning } : m
              ));
            } else if (json.type === "content") {
              accumulatedContent += json.data;
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, isThinking: false, content: accumulatedContent } : m
              ));
            }
          } catch (e) {
            // Silently ignore parse errors for incomplete JSON
            console.debug("Incomplete JSON line, buffering...");
          }
        }
      }

      // Process any remaining data in buffer after stream ends
      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer.trim());
          if (json.type === "reasoning") {
            accumulatedReasoning += json.data;
          } else if (json.type === "content") {
            accumulatedContent += json.data;
          }
        } catch (e) {
          // Final buffer might be incomplete, ignore
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

    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, isThinking: false, content: `Error: ${err.message}` } : m
      ));
    } finally {
      setIsGenerating(false);
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, isThinking: false } : m
      ));
    }
  };

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
            <Link href="/dashboard/settings" title="Settings">
              <Settings size={16} className="text-brand-gray-mid hover:text-brand-charcoal transition-colors" />
            </Link>
          </div>

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
