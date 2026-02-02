"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThinkingPanelProps {
    reasoning: string;
    isThinking: boolean;
}

export function ThinkingPanel({ reasoning, isThinking }: ThinkingPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom as reasoning streams in
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [reasoning]);

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
                            isThinking ? "text-brand-orange animate-pulse" : "text-brand-gray-mid group-hover:text-brand-orange"
                        )}
                    />
                    <span className="uppercase tracking-wider">
                        {isThinking ? "Thinking Process..." : "Reasoning Log"}
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
                        <div
                            ref={scrollRef}
                            className="max-h-60 overflow-y-auto p-4 pt-0 font-mono text-[10px] leading-relaxed text-foreground/80 whitespace-pre-wrap"
                        >
                            {reasoning || (
                                <span className="text-brand-gray-mid/50 italic">
                                    Waiting for thought stream...
                                </span>
                            )}
                            {isThinking && (
                                <span className="inline-block w-1.5 h-3 ml-1 align-middle bg-brand-orange animate-pulse" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
