"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function GlowButton({
  children,
  className = "",
  onClick,
  href,
  variant = "primary",
}: GlowButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center px-0 text-sm font-mono uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 border-0";

  const variantStyles = {
    primary: "bg-brand-charcoal text-brand-sand-light hover:bg-brand-orange",
    secondary:
      "bg-brand-orange text-white hover:bg-white hover:text-brand-charcoal",
    outline:
      "bg-transparent text-brand-charcoal hover:text-brand-orange hover:bg-transparent",
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className} group h-14`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Bracket Left */}
      <span
        className={`px-4 transition-colors ${
          variant === "primary"
            ? "text-brand-charcoal/40 group-hover:text-white/40"
            : "text-brand-charcoal/30 group-hover:text-brand-orange/50"
        }`}
      >
        [
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 px-2">
        {children}
      </span>

      {/* Bracket Right */}
      <span
        className={`px-4 transition-colors ${
          variant === "primary"
            ? "text-brand-charcoal/40 group-hover:text-white/40"
            : "text-brand-charcoal/30 group-hover:text-brand-orange/50"
        }`}
      >
        ]
      </span>
    </Component>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  href,
}: MagneticButtonProps) {
  const Component = href ? motion.a : motion.button;

  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Component
        href={href}
        onClick={onClick}
        className="relative inline-flex items-center justify-center h-14 px-0 text-sm font-mono uppercase tracking-[0.15em] bg-brand-charcoal text-brand-sand-light overflow-hidden group"
      >
        {/* Bracket Left */}
        <span className="px-4 text-brand-charcoal/40 group-hover:text-white/40 transition-colors">
          [
        </span>

        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-brand-orange"
          initial={{ x: "-100%" }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2 px-2 transition-colors duration-300 group-hover:text-white">
          {children}
        </span>

        {/* Bracket Right */}
        <span className="px-4 text-brand-charcoal/40 group-hover:text-white/40 transition-colors">
          ]
        </span>
      </Component>
    </motion.div>
  );
}
