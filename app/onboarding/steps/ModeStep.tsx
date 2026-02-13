"use client";

import { motion } from "framer-motion";
import { Building2, Check, Rocket, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeStepProps {
  value?: "startup" | "default" | "enterprise";
  onChange: (value: "startup" | "default" | "enterprise") => void;
}

const MODES = [
  {
    id: "startup" as const,
    name: "Startup",
    icon: Rocket,
    emoji: "🚀",
    description: "MVP-focused, cost-optimized",
    details: "3-5 components • Speed first",
    features: [
      "Quick deployment",
      "Minimal complexity",
      "Cost-effective",
      "Rapid iteration",
    ],
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/50",
  },
  {
    id: "default" as const,
    name: "Default",
    icon: Scale,
    emoji: "⚖️",
    description: "Balanced approach",
    details: "4-8 components • Best practices",
    features: [
      "Moderate complexity",
      "Production-ready",
      "Scalable design",
      "Industry standards",
    ],
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/50",
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    icon: Building2,
    emoji: "🏢",
    description: "Full redundancy, compliance-ready",
    details: "6-15 components • Production grade",
    features: [
      "High availability",
      "Full observability",
      "Security-first",
      "Compliance ready",
    ],
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/50",
  },
] as const;

export function ModeStep({ value, onChange }: ModeStepProps) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mb-3 font-mono text-2xl font-bold text-text-primary md:text-3xl">
          Choose your default generation mode
        </h2>
        <p className="text-text-secondary">
          This determines the default complexity level for generated
          architectures
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {MODES.map((mode, index) => {
          const isSelected = value === mode.id;
          const Icon = mode.icon;

          return (
            <motion.button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={cn(
                "group relative flex flex-col rounded-xl border-2 p-6 text-left transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                isSelected
                  ? cn("bg-gradient-to-br", mode.color, mode.borderColor)
                  : "border-border-primary bg-bg-secondary hover:border-border-secondary",
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection badge */}
              {isSelected && (
                <motion.div
                  className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-5 w-5" />
                </motion.div>
              )}

              {/* Header */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-tertiary text-2xl">
                  {mode.emoji}
                </span>
                <div>
                  <h3 className="font-mono text-xl font-bold text-text-primary">
                    {mode.name}
                  </h3>
                  <p className="text-xs text-text-muted">{mode.details}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm text-text-secondary">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="mt-auto space-y-2">
                {mode.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                  >
                    <Icon className="h-3 w-3 text-brand-orange" />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Hover effect gradient */}
              <div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 transition-opacity",
                  "bg-gradient-to-br",
                  mode.color,
                  isSelected ? "opacity-100" : "group-hover:opacity-50",
                )}
                style={{ zIndex: -1 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Recommendation hint */}
      <motion.div
        className="mt-8 rounded-lg border border-dashed border-border-primary bg-bg-secondary/50 p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-text-muted">
          <span className="text-brand-orange">💡</span> Recommendation: Start
          with <strong className="text-text-secondary">Default</strong> mode for
          most projects. You can always customize individual architectures.
        </p>
      </motion.div>
    </div>
  );
}
