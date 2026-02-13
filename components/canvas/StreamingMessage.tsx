"use client";

import { motion } from "framer-motion";
import {
  Box,
  Brain,
  CheckCircle2,
  Circle,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Network,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreamingMessageProps {
  isGenerating: boolean;
  reasoning?: string;
  stage?: "thinking" | "planning" | "building" | "finalizing";
}

interface ThoughtStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  status: "pending" | "active" | "completed";
}

// Parse reasoning text to extract architecture concepts
function parseArchitectureThoughts(reasoning: string): ThoughtStep[] {
  const thoughts: ThoughtStep[] = [];
  const lowerReasoning = reasoning.toLowerCase();

  // Define architecture patterns to detect
  const patterns = [
    {
      keywords: [
        "analyzing",
        "understand",
        "requirements",
        "parsing",
        "intent",
      ],
      icon: <Brain className="w-3.5 h-3.5" />,
      label: "ANALYZING",
      description: "Understanding your architecture requirements",
    },
    {
      keywords: ["planning", "design", "structure", "approach", "pattern"],
      icon: <Layers className="w-3.5 h-3.5" />,
      label: "PLANNING",
      description: "Designing the optimal architecture pattern",
    },
    {
      keywords: ["gateway", "api", "ingress", "entry", "edge"],
      icon: <Network className="w-3.5 h-3.5" />,
      label: "GATEWAY LAYER",
      description: "Configuring API gateway and routing",
    },
    {
      keywords: ["compute", "service", "microservice", "function", "server"],
      icon: <Server className="w-3.5 h-3.5" />,
      label: "COMPUTE LAYER",
      description: "Setting up services and compute resources",
    },
    {
      keywords: ["database", "db", "storage", "cache", "redis", "postgres"],
      icon: <Database className="w-3.5 h-3.5" />,
      label: "DATA LAYER",
      description: "Configuring databases and storage",
    },
    {
      keywords: ["security", "auth", "authentication", "authorization"],
      icon: <Shield className="w-3.5 h-3.5" />,
      label: "SECURITY",
      description: "Adding authentication and security layers",
    },
    {
      keywords: ["optimize", "performance", "scale", "resilience"],
      icon: <Zap className="w-3.5 h-3.5" />,
      label: "OPTIMIZATION",
      description: "Optimizing for performance and scale",
    },
    {
      keywords: ["connect", "integrate", "link", "wire", "flow"],
      icon: <GitBranch className="w-3.5 h-3.5" />,
      label: "INTEGRATION",
      description: "Connecting services and data flows",
    },
  ];

  // Check which patterns appear in reasoning
  for (const pattern of patterns) {
    const found = pattern.keywords.some((kw) => lowerReasoning.includes(kw));
    if (found) {
      thoughts.push({
        id: pattern.label,
        icon: pattern.icon,
        label: pattern.label,
        description: pattern.description,
        status: "completed",
      });
    }
  }

  return thoughts;
}

// Determine current stage based on reasoning content
function _getCurrentStage(reasoning: string): ThoughtStep["status"] {
  if (!reasoning) return "pending";
  const length = reasoning.length;
  if (length < 100) return "active";
  return "completed";
}

export function StreamingMessage({
  isGenerating,
  reasoning,
}: StreamingMessageProps) {
  const [dots, setDots] = useState("");
  const [detectedSteps, setDetectedSteps] = useState<ThoughtStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Animate thinking dots
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : `${prev}.`));
    }, 400);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Parse reasoning and update steps
  useEffect(() => {
    if (!reasoning) {
      setDetectedSteps([]);
      return;
    }

    const steps = parseArchitectureThoughts(reasoning);
    setDetectedSteps(steps);

    // Update current step based on reasoning length
    const progress = Math.min(Math.floor(reasoning.length / 200), steps.length);
    setCurrentStepIndex(progress);
  }, [reasoning]);

  if (!isGenerating) return null;

  // Default thinking steps if none detected yet
  const defaultSteps: ThoughtStep[] = [
    {
      id: "thinking",
      icon: <Brain className="w-3.5 h-3.5" />,
      label: "THINKING",
      description: "Processing your request",
      status: detectedSteps.length > 0 ? "completed" : "active",
    },
    {
      id: "architecting",
      icon: <Box className="w-3.5 h-3.5" />,
      label: "ARCHITECTING",
      description: "Designing your system",
      status: detectedSteps.length > 0 ? "active" : "pending",
    },
    {
      id: "building",
      icon: <Cpu className="w-3.5 h-3.5" />,
      label: "BUILDING",
      description: "Generating components",
      status: "pending",
    },
  ];

  const displaySteps = detectedSteps.length > 0 ? detectedSteps : defaultSteps;

  // Update step statuses based on current index
  const stepsWithStatus = displaySteps.map((step, idx) => ({
    ...step,
    status:
      idx < currentStepIndex
        ? ("completed" as const)
        : idx === currentStepIndex
          ? ("active" as const)
          : ("pending" as const),
  }));

  return (
    <div className="w-full bg-gradient-to-br from-neutral-50 to-white border border-brand-charcoal/10 rounded-tr-xl rounded-br-xl rounded-bl-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.div
            className="w-6 h-6 bg-brand-orange/10 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-brand-orange/20 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-charcoal">
          Architecting{dots}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="space-y-2">
        {stepsWithStatus.slice(0, 4).map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
              step.status === "active" &&
                "bg-brand-orange/5 border border-brand-orange/20",
              step.status === "completed" && "bg-green-50/50",
              step.status === "pending" && "opacity-40",
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                step.status === "completed" && "bg-green-100 text-green-600",
                step.status === "active" &&
                  "bg-brand-orange/20 text-brand-orange",
                step.status === "pending" && "bg-neutral-100 text-neutral-400",
              )}
            >
              {step.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : step.status === "active" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {step.icon}
                </motion.div>
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-mono text-[9px] font-bold uppercase tracking-wider",
                    step.status === "active" && "text-brand-orange",
                    step.status === "completed" && "text-green-600",
                    step.status === "pending" && "text-neutral-400",
                  )}
                >
                  {step.label}
                </span>
                {step.status === "active" && (
                  <motion.span
                    className="text-[8px] text-brand-orange/60"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ●
                  </motion.span>
                )}
              </div>
              <p
                className={cn(
                  "text-[10px] truncate",
                  step.status === "pending"
                    ? "text-neutral-300"
                    : "text-brand-charcoal/50",
                )}
              >
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] font-mono uppercase tracking-wider text-brand-charcoal/40">
          <span>Progress</span>
          <span>
            {Math.min(
              100,
              Math.round(
                (currentStepIndex / Math.max(1, stepsWithStatus.length)) * 100,
              ),
            )}
            %
          </span>
        </div>
        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-orange to-brand-orange/60 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, (currentStepIndex / Math.max(1, stepsWithStatus.length)) * 100)}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Raw Reasoning Preview (Collapsible) */}
      {reasoning && reasoning.length > 50 && (
        <details className="mt-2">
          <summary className="text-[9px] font-mono uppercase tracking-wider text-brand-charcoal/30 cursor-pointer hover:text-brand-charcoal/50 transition-colors">
            View Raw Thinking
          </summary>
          <div className="mt-2 p-2 bg-neutral-100 rounded text-[9px] font-mono text-brand-charcoal/40 max-h-24 overflow-y-auto">
            {reasoning.slice(-200)}...
          </div>
        </details>
      )}
    </div>
  );
}
