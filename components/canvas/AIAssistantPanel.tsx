"use client";

import {
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { generateArchitecture } from "@/actions/ai-orchestrator";
import { cn } from "@/components/canvas/nodes/BaseNode";

interface AIAssistantPanelProps {
  onGenerationSuccess: (data: any) => void;
  projectId: string;
  isResizable?: boolean;
}

export function AIAssistantPanel({
  onGenerationSuccess,
  projectId,
  isResizable = false,
}: AIAssistantPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"AWS" | "GCP" | "Azure" | "Generic">(
    "Generic",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateArchitecture({ prompt, provider });
      if (result.success && result.data) {
        onGenerationSuccess(result.data);
        setPrompt("");
      } else {
        setError(result.error || "Generation failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // If resizable, we typically disable the internal toggle or rely on the resizable panel to hide/collapse
  // But for now, we'll just force open and full width to fill the panel.
  const showContent = isResizable || isOpen;

  return (
    <div
      className={cn(
        "relative flex h-full transition-all duration-500 ease-in-out",
        isResizable ? "w-full" : isOpen ? "w-[380px]" : "w-12",
      )}
    >
      {/* Toggle Button - Only show if NOT resizable */}
      {!isResizable && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-brand-gray-light rounded-full flex items-center justify-center shadow-md z-10 hover:bg-brand-gray-light/10 transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-opacity duration-300",
          !isResizable && "glass-card border-r border-white/20",
          showContent ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-gray-light/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-brand-orange/10 rounded-lg">
              <Sparkles size={18} className="text-brand-orange" />
            </div>
            <h2 className="text-lg font-poppins font-bold text-foreground">
              AI Architect
            </h2>
          </div>
          <p className="text-xs font-lora italic text-brand-gray-mid">
            Describe your vision, and I'll draft the blueprint.
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-poppins font-bold text-brand-gray-mid uppercase tracking-wider">
                Cloud Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Generic", "AWS", "GCP", "Azure"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p as any)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-poppins font-medium border transition-all",
                      provider === p
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-white/50 border-brand-gray-light text-brand-gray-mid hover:border-brand-gray-mid",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-poppins font-bold text-brand-gray-mid uppercase tracking-wider">
                Architecture Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A serverless web app using Lambda, S3, and DynamoDB for high availability..."
                className="w-full h-40 p-4 bg-white/50 border border-brand-gray-light rounded-2xl resize-none font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/10 focus:border-brand-orange transition-all placeholder:text-brand-gray-mid/50"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Info size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-poppins font-medium text-red-600 leading-tight">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className={cn(
                "mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-poppins font-bold text-sm transition-all shadow-lg",
                isGenerating || !prompt.trim()
                  ? "bg-brand-gray-light text-brand-gray-mid cursor-not-allowed shadow-none"
                  : "bg-brand-orange text-white hover:bg-brand-orange/90 hover:shadow-brand-orange/20 active:scale-[0.98]",
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Masterpiece...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Draft Architecture
                </>
              )}
            </button>
          </form>

          {/* Tips / Examples */}
          <div className="mt-auto pt-6 border-t border-brand-gray-light/30">
            <h3 className="text-[11px] font-poppins font-bold text-brand-gray-mid uppercase tracking-wider mb-3">
              Quick Suggestions
            </h3>
            <div className="flex flex-col gap-2">
              {[
                "Modern Microservices on AWS",
                "Scalable E-commerce with Redis",
                "Data Pipeline for Real-time Analytics",
              ].map((tip) => (
                <button
                  key={tip}
                  onClick={() => setPrompt(tip)}
                  className="text-left p-3 rounded-xl bg-brand-gray-light/20 hover:bg-brand-gray-light/40 text-[11px] font-lora italic text-foreground/80 transition-colors"
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Sidebar Indicator - Only show if NOT resizable */}
      {!isResizable && !isOpen && (
        <div className="w-12 flex flex-col items-center pt-8 gap-6 border-r border-white/20 glass-card">
          <Sparkles size={20} className="text-brand-orange/40" />
          <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-poppins font-bold tracking-[0.2em] text-brand-gray-mid uppercase">
            AI Architect
          </div>
        </div>
      )}
    </div>
  );
}
