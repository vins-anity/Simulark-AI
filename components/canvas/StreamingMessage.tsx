"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Database,
  GitBranch,
  Layers,
  Network,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StreamingMessageProps {
  isGenerating: boolean;
  reasoning?: string;
  content?: string;
  streamProgress?: number;
}

interface LogLine {
  id: string;
  prefix: string;
  label: string;
  description: string;
  status: "running" | "done";
}

const ARCHITECTURE_PATTERNS = [
  {
    keywords: ["analyzing", "understand", "requirements", "parsing", "intent"],
    icon: Brain,
    label: "ANALYZING",
    description: "Parsing architecture requirements",
  },
  {
    keywords: ["planning", "design", "structure", "approach", "pattern"],
    icon: Layers,
    label: "PLANNING",
    description: "Selecting optimal architecture pattern",
  },
  {
    keywords: ["gateway", "api", "ingress", "entry", "edge", "routing"],
    icon: Network,
    label: "GATEWAY LAYER",
    description: "Wiring API gateway and routing rules",
  },
  {
    keywords: ["compute", "service", "microservice", "function", "server"],
    icon: Server,
    label: "COMPUTE LAYER",
    description: "Provisioning services and runtimes",
  },
  {
    keywords: ["database", "db", "storage", "cache", "redis", "postgres"],
    icon: Database,
    label: "DATA LAYER",
    description: "Configuring databases and persistence",
  },
  {
    keywords: ["connect", "integrate", "link", "wire", "flow", "edge"],
    icon: GitBranch,
    label: "WIRING",
    description: "Connecting data flows and dependencies",
  },
  {
    keywords: ["security", "auth", "authentication", "authorization"],
    icon: Shield,
    label: "SECURITY",
    description: "Applying authentication and access control",
  },
  {
    keywords: ["optimize", "performance", "scale", "resilience", "load"],
    icon: Zap,
    label: "OPTIMIZATION",
    description: "Tuning for performance and scale",
  },
];

function parseLogLines(reasoning: string): LogLine[] {
  const lower = reasoning.toLowerCase();
  const lines: LogLine[] = [];
  const seenLabels = new Set<string>();

  for (const pattern of ARCHITECTURE_PATTERNS) {
    if (
      pattern.keywords.some((kw) => lower.includes(kw)) &&
      !seenLabels.has(pattern.label)
    ) {
      lines.push({
        id: pattern.label,
        prefix: "✓",
        label: pattern.label,
        description: pattern.description,
        status: "done",
      });
      seenLabels.add(pattern.label);
    }
  }

  return lines;
}

export function StreamingMessage({
  isGenerating,
  reasoning,
  content,
  streamProgress = 0,
}: StreamingMessageProps) {
  const [cursor, setCursor] = useState(true);
  const [visibleLines, setVisibleLines] = useState<LogLine[]>([]);
  const [allLines, setAllLines] = useState<LogLine[]>([]);

  // Blink the cursor
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Parse reasoning into log lines
  useEffect(() => {
    if (!reasoning) return;
    const parsed = parseLogLines(reasoning);
    setAllLines(parsed);
  }, [reasoning]);

  // Reveal lines one by one for a typewriter effect
  useEffect(() => {
    if (allLines.length === 0) return;
    const next = allLines[visibleLines.length];
    if (!next) return;
    const timer = setTimeout(() => {
      setVisibleLines((prev) => [...prev, next]);
    }, 180);
    return () => clearTimeout(timer);
  }, [allLines, visibleLines]);

  if (!isGenerating) return null;

  const displayLines =
    visibleLines.length > 0
      ? visibleLines
      : [
          {
            id: "boot",
            prefix: "~",
            label: "INITIALIZING",
            description: "Booting architecture engine",
            status: "running" as const,
          },
        ];

  const progress = Math.max(5, streamProgress);

  // Determine what to show after the $ prompt
  // We prioritize the latest reasoning if it's currently thinking,
  // or the latest content if it's currently generating.
  const activeStreamChunk = content 
    ? content.split('\n').filter(Boolean).pop()?.slice(-60) 
    : reasoning?.split('\n').filter(Boolean).pop()?.slice(-60);

  return (
    <div className="w-full border border-brand-charcoal/12 dark:border-border-primary/40 bg-neutral-50 dark:bg-bg-primary font-mono shrink-0">
      {/* Terminal chrome bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-brand-charcoal/8 dark:border-border-primary/30 bg-neutral-100/70 dark:bg-bg-tertiary/50">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
        <span className="text-[8px] uppercase tracking-[0.2em] text-brand-charcoal/40 dark:text-text-secondary/40">
          ARCH_ENGINE // LIVE
        </span>
        <div className="ml-auto text-[8px] text-brand-charcoal/30 dark:text-text-secondary/30">
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* Log output */}
      <div className="px-3 py-2.5 space-y-1 min-h-[60px]">
        <AnimatePresence initial={false}>
          {displayLines.map((line, i) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-start gap-2.5 text-[10px] leading-relaxed"
            >
              {/* Prefix */}
              <span
                className={
                  line.status === "done"
                    ? "text-green-500 shrink-0 w-3"
                    : "text-brand-orange/60 shrink-0 w-3"
                }
              >
                {line.prefix}
              </span>

              {/* Label */}
              <span
                className={
                  line.status === "done"
                    ? "text-brand-charcoal/70 dark:text-text-secondary uppercase tracking-wider shrink-0"
                    : "text-brand-orange uppercase tracking-wider shrink-0"
                }
              >
                {line.label}
              </span>

              {/* Separator */}
              <span className="text-brand-charcoal/25 dark:text-border-primary shrink-0">
                →
              </span>

              {/* Description */}
              <span className="text-brand-charcoal/50 dark:text-text-secondary/60 truncate">
                {line.description}
              </span>

              {/* Active pulse on last line */}
              {i === displayLines.length - 1 && line.status !== "done" && (
                <motion.span
                  className="shrink-0 text-brand-orange"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                >
                  ●
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor line with real-time trace */}
        <div className="flex items-center gap-1 text-[10px] text-brand-charcoal/30 dark:text-text-secondary/30 pt-0.5">
          <span className="text-brand-orange/50">$</span>
          {activeStreamChunk && (
            <span className="text-brand-charcoal/40 dark:text-text-secondary/40 opacity-70 italic">
              {activeStreamChunk}
            </span>
          )}
          <motion.span
            animate={{ opacity: cursor ? 1 : 0 }}
            className="w-1.5 h-3 bg-brand-orange/50 inline-block align-middle"
          />
        </div>
      </div>

      {/* Progress rail */}
      <div className="h-px w-full bg-brand-charcoal/5 dark:bg-border-primary/20 overflow-hidden">
        <motion.div
          className="h-full bg-brand-orange"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Raw trace log */}
      {reasoning && reasoning.length > 80 && (
        <details className="group">
          <summary className="px-3 py-1.5 text-[8px] uppercase tracking-[0.18em] text-brand-charcoal/30 dark:text-text-secondary/30 cursor-pointer hover:text-brand-orange/60 transition-colors select-none list-none flex items-center gap-1.5">
            <span className="group-open:hidden">▶</span>
            <span className="hidden group-open:inline">▼</span>
            TRACE LOG
          </summary>
          <div className="px-3 pb-2.5 max-h-20 overflow-y-auto">
            <p className="text-[9px] font-mono text-brand-charcoal/35 dark:text-text-secondary/35 whitespace-pre-wrap leading-relaxed">
              {reasoning.slice(-400)}
            </p>
          </div>
        </details>
      )}
    </div>
  );
}
