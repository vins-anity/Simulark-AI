"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Activity, Cog, Binary, Network, CircuitBoard } from "lucide-react";

const LOADING_MESSAGES = [
    "INITIALIZING SYSTEM MODULES...",
    "CALCULATING LOAD DISTRIBUTION...",
    "ASSEMBLING INFRASTRUCTURE LAYERS...",
    "CALIBRATING DATA PATHWAYS...",
    "SYNTHESIZING COMPONENTS...",
    "MAPPING SERVICE TOPOLOGY...",
    "COMPILING RESOURCE GRAPH...",
] as const;

const ICONS = [Cpu, Zap, Activity, Cog, Binary, Network, CircuitBoard];

export const LoadingState = memo(function LoadingState() {
    const [index, setIndex] = useState(0);
    const Icon = ICONS[index % ICONS.length];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide text-brand-orange">
            <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Icon className="w-4 h-4" />
                </motion.div>
            </motion.div>
            <motion.span
                key={LOADING_MESSAGES[index]}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {LOADING_MESSAGES[index]}
            </motion.span>
        </div>
    );
});
