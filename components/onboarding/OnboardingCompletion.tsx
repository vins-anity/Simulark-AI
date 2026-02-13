"use client";

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================================
// Template Details
// ============================================================================

const TEMPLATE_DETAILS: Record<
  string,
  { title: string; icon: string; color: string }
> = {
  "saas-starter": {
    title: "SaaS Starter Kit",
    icon: "lucide:rocket",
    color: "#FF5733",
  },
  "e-commerce": {
    title: "E-Commerce Platform",
    icon: "lucide:shopping-bag",
    color: "#33FF57",
  },
  "iot-dashboard": {
    title: "IoT Data Pipeline",
    icon: "lucide:cpu",
    color: "#3357FF",
  },
  "blog-cms": {
    title: "Headless CMS Blog",
    icon: "lucide:file-text",
    color: "#F333FF",
  },
  "chat-app": {
    title: "Real-time Chat App",
    icon: "lucide:message-circle",
    color: "#FFBD33",
  },
  "ai-rag": {
    title: "RAG AI Agent",
    icon: "lucide:brain-circuit",
    color: "#33FFF3",
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface OnboardingCompletionProps {
  templateRecommendations: { id: string; confidence: number; reason: string }[];
  onContinue: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function OnboardingCompletion({
  templateRecommendations,
  onContinue,
}: OnboardingCompletionProps) {
  const hasRecommendations = templateRecommendations.length > 0;
  const topRecommendation = templateRecommendations[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/95 backdrop-blur-sm p-4"
    >
      {/* Background celebration effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-brand-orange/30"
            initial={{
              x:
                Math.random() *
                (typeof window !== "undefined" ? window.innerWidth : 1000),
              y:
                Math.random() *
                (typeof window !== "undefined" ? window.innerHeight : 1000),
              scale: 0,
            }}
            animate={{
              y: [null, -100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative w-full max-w-2xl bg-brand-sand-light dark:bg-zinc-900 shadow-2xl overflow-hidden"
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-orange" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-orange" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-orange" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-orange" />

        {/* Success Header */}
        <div className="bg-brand-orange p-8 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Rocket className="w-10 h-10" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-poppins text-3xl font-bold mb-2"
          >
            All Set!
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 font-lora italic"
          >
            Your preferences have been saved and will improve your AI
            generations
          </motion.p>
        </div>

        {/* Content */}
        <div className="p-8">
          {hasRecommendations ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-orange" />
                <h3 className="font-poppins font-semibold text-lg text-brand-charcoal dark:text-gray-100">
                  Recommended Templates
                </h3>
              </div>

              <p className="text-sm text-brand-charcoal/60 dark:text-gray-400">
                Based on your preferences, we recommend these starter templates:
              </p>

              <div className="space-y-3">
                {templateRecommendations.slice(0, 3).map((rec, index) => {
                  const details = TEMPLATE_DETAILS[rec.id] || {
                    title: rec.id,
                    icon: "lucide:box",
                    color: "#999",
                  };

                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 border-2 border-brand-charcoal/10 hover:border-brand-orange/30 bg-white dark:bg-zinc-800 transition-colors"
                    >
                      <div
                        className="w-12 h-12 flex items-center justify-center"
                        style={{ backgroundColor: `${details.color}20` }}
                      >
                        <Icon
                          icon={details.icon}
                          className="w-6 h-6"
                          style={{ color: details.color }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-brand-charcoal dark:text-gray-200">
                            {details.title}
                          </h4>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[10px] font-bold uppercase">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-charcoal/50 dark:text-gray-500 mt-0.5">
                          {rec.reason}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-[10px] text-brand-charcoal/40 uppercase">
                          Match
                        </div>
                        <div className="font-bold text-brand-orange">
                          {Math.round(rec.confidence * 100)}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-xs text-brand-charcoal/40 dark:text-gray-500 text-center">
                You can access these templates anytime from the Templates page
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-charcoal/60 dark:text-gray-400">
                You&apos;re all set! Start creating your first architecture.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Button
              onClick={onContinue}
              className="w-full bg-brand-charcoal hover:bg-brand-orange text-white rounded-none font-mono text-sm uppercase tracking-wider py-6"
            >
              <span className="flex items-center justify-center gap-2">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
