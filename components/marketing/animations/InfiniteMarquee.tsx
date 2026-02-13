"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface InfiniteMarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
  pauseOnHover?: boolean;
}

export function InfiniteMarquee({
  children,
  className = "",
  speed = 30,
  direction = "left",
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  return (
    <div
      className={`group flex overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <motion.div
        className="flex shrink-0 gap-8 items-center"
        animate={{
          x: direction === "left" ? [0, "-50%"] : ["-50%", 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          willChange: "transform",
        }}
      >
        {children}
        {children}
      </motion.div>
      <motion.div
        className="flex shrink-0 gap-8 items-center"
        animate={{
          x: direction === "left" ? [0, "-50%"] : ["-50%", 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          willChange: "transform",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

interface MarqueeItemProps {
  children: ReactNode;
  className?: string;
}

export function MarqueeItem({ children, className = "" }: MarqueeItemProps) {
  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      {children}
    </div>
  );
}
