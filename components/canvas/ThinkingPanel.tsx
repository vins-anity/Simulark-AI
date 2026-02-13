"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  Loader2,
  Network,
  Server,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ThinkingPanelProps {
  reasoning: string;
  isThinking: boolean;
}

interface ProgressStep {
  id: string;
  text: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "completed";
}

// Parse reasoning text to extract structured progress steps
function parseProgressSteps(reasoning: string): ProgressStep[] {
  const steps: ProgressStep[] = [];
  const seen = new Set<string>();

  // Define patterns to look for in the reasoning - order matters for display
  const patterns = [
    {
      regex: /analyz|understand|requirement|specification/i,
      text: "Analyzing requirements...",
      icon: <BrainCircuit size={12} />,
    },
    {
      regex: /planning|designing|architecting|structuring/i,
      text: "Planning architecture...",
      icon: <Layers size={12} />,
    },
    {
      regex: /gateway|api gateway|entry point|ingress/i,
      text: "Setting up API Gateway...",
      icon: <Network size={12} />,
    },
    {
      regex: /load balancer|loadbalancer|lb|nginx|haproxy/i,
      text: "Adding Load Balancer...",
      icon: <ArrowRight size={12} />,
    },
    {
      regex: /service|microservice|backend|server|compute/i,
      text: "Configuring Services...",
      icon: <Server size={12} />,
    },
    {
      regex: /database|db|postgres|mysql|mongodb|dynamodb/i,
      text: "Setting up Database...",
      icon: <Database size={12} />,
    },
    {
      regex: /cache|caching|redis|memcached|cdn/i,
      text: "Adding Cache Layer...",
      icon: <Layers size={12} />,
    },
    {
      regex: /queue|message|kafka|rabbitmq|sqs|sns/i,
      text: "Configuring Message Queue...",
      icon: <ArrowRight size={12} />,
    },
    {
      regex: /connect|connection|link|route|network/i,
      text: "Connecting services...",
      icon: <Network size={12} />,
    },
    {
      regex: /optimiz|improv|enhanc|scale|performance/i,
      text: "Optimizing architecture...",
      icon: <Layers size={12} />,
    },
    {
      regex: /validat|verify|check|test|review/i,
      text: "Validating configuration...",
      icon: <Check size={12} />,
    },
    {
      regex: /finaliz|complet|generate|output/i,
      text: "Finalizing architecture...",
      icon: <Check size={12} />,
    },
  ];

  // Check for each pattern in the reasoning
  for (const pattern of patterns) {
    if (pattern.regex.test(reasoning)) {
      const key = pattern.text;
      if (!seen.has(key)) {
        seen.add(key);
        steps.push({
          id: key,
          text: pattern.text,
          icon: pattern.icon,
          status: "pending",
        });
      }
    }
  }

  return steps;
}

export function ThinkingPanel({ reasoning, isThinking }: ThinkingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Parse progress steps from reasoning
  const progressSteps = useMemo(
    () => parseProgressSteps(reasoning),
    [reasoning],
  );

  // Determine which step is currently active based on reasoning content
  const stepsWithStatus = useMemo(() => {
    if (progressSteps.length === 0) {
      return [];
    }

    if (!isThinking) {
      // All steps completed when done thinking
      return progressSteps.map((step) => ({
        ...step,
        status: "completed" as const,
      }));
    }

    // Find which step is currently being mentioned in the reasoning
    // by looking at the most recent content
    const reasoningLower = reasoning.toLowerCase();
    const lastFewChars = reasoningLower.slice(-500); // Look at last 500 chars

    let activeIndex = 0;

    // Find the last pattern that matches in the reasoning
    for (let i = progressSteps.length - 1; i >= 0; i--) {
      const stepPattern = progressSteps[i].text
        .toLowerCase()
        .replace(/\./g, "");
      // Check if this step's keywords appear in recent reasoning
      const keywords = stepPattern.split(" ").filter((w) => w.length > 3);
      if (keywords.some((kw) => lastFewChars.includes(kw))) {
        activeIndex = i;
        break;
      }
    }

    // If no recent match, estimate based on reasoning length progression
    if (activeIndex === 0 && reasoning.length > 100) {
      const progress = Math.min(reasoning.length / 2000, 0.9); // Assume ~2000 chars total
      activeIndex = Math.floor(progress * progressSteps.length);
    }

    return progressSteps.map((step, index) => {
      let status: "pending" | "active" | "completed" = "pending";

      if (index < activeIndex) {
        status = "completed";
      } else if (index === activeIndex) {
        status = "active";
      }

      return { ...step, status };
    });
  }, [progressSteps, reasoning, isThinking]);

  // Auto-scroll to bottom as reasoning streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // If no steps detected, show a default message
  const hasSteps = stepsWithStatus.length > 0;

  return (
    <div className="w-full border-b border-brand-gray-light/30 bg-brand-light/50 backdrop-blur-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-xs font-poppins font-medium text-brand-gray-mid hover:text-foreground transition-colors group"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit
            size={14}
            className={cn(
              "transition-colors",
              isThinking
                ? "text-brand-orange animate-pulse"
                : "text-brand-gray-mid group-hover:text-brand-orange",
            )}
          />
          <span className="uppercase tracking-wider">
            {isThinking ? "Building Architecture..." : "Architecture Plan"}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div ref={scrollRef} className="max-h-60 overflow-y-auto p-4 pt-0">
              {hasSteps ? (
                <div className="space-y-2">
                  {stepsWithStatus.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-all",
                        step.status === "completed" &&
                          "text-green-600 bg-green-50/50",
                        step.status === "active" &&
                          "text-brand-orange bg-brand-orange/5",
                        step.status === "pending" && "text-brand-gray-mid",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                          step.status === "completed" && "bg-green-100",
                          step.status === "active" && "bg-brand-orange/10",
                          step.status === "pending" && "bg-brand-gray-light/30",
                        )}
                      >
                        {step.status === "completed" ? (
                          <Check size={10} className="text-green-600" />
                        ) : step.status === "active" ? (
                          <Loader2
                            size={10}
                            className="text-brand-orange animate-spin"
                          />
                        ) : (
                          <span className="text-[8px] text-brand-gray-mid">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5">
                        {step.icon}
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-brand-gray-mid italic py-2">
                  {isThinking ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={10} className="animate-spin" />
                      Analyzing requirements...
                    </span>
                  ) : (
                    "No specific steps detected"
                  )}
                </div>
              )}

              {/* Show raw reasoning in a collapsible section if user wants to see it */}
              {reasoning && (
                <details className="mt-3 border-t border-brand-gray-light/30 pt-2">
                  <summary className="text-[10px] text-brand-gray-mid cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                    <span>View AI thinking</span>
                    <span className="text-[8px] opacity-50">
                      ({Math.round(reasoning.length / 100) / 10}k chars)
                    </span>
                  </summary>
                  <div className="mt-2 font-mono text-[10px] leading-relaxed text-foreground/60 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {reasoning}
                  </div>
                </details>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
