"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className = "",
  animate = true,
}: GradientTextProps) {
  if (animate) {
    return (
      <motion.span
        className={`bg-gradient-to-r from-brand-orange via-brand-orange/80 to-brand-orange bg-clip-text text-transparent ${className}`}
        animate={{
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.span>
    );
  }

  return <span className={`text-brand-orange ${className}`}>{children}</span>;
}

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerText({ children, className = "" }: ShimmerTextProps) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
    </span>
  );
}

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover="hover"
    >
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 text-brand-orange opacity-0"
        variants={{
          hover: {
            opacity: [0, 1, 0, 1, 0],
            x: [-1, 1, -1, 0],
            transition: { duration: 0.2 },
          },
        }}
        aria-hidden
      >
        {text}
      </motion.span>
    </motion.span>
  );
}
