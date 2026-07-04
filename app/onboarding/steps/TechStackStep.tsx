"use client";

import { Sparkles, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { TechPicker } from "@/components/tech/TechPicker";
import { cn } from "@/lib/utils";
import type { OnboardingData, TechStackMode } from "../types";

interface TechStackStepProps {
  data: OnboardingData["techStack"];
  techStackMode: TechStackMode;
  projectDescription?: string;
  onChange: (value: OnboardingData["techStack"]) => void;
  onModeChange: (mode: TechStackMode) => void;
  onDescriptionChange: (value: string) => void;
  projectType?: string;
}

export function TechStackStep({
  data,
  techStackMode,
  projectDescription,
  onChange,
  onModeChange,
  onDescriptionChange,
}: TechStackStepProps) {
  const isManual = techStackMode === "manual";
  const totalSelections = Object.values(data).flat().length;

  return (
    <motion.div className="w-full max-w-3xl mx-auto space-y-4">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-orange">
          CFG-01
        </span>
        <h2 className="font-poppins text-xl font-bold text-brand-charcoal md:text-2xl mt-1">
          Technology stack
        </h2>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          Choose your stack or let Simulark infer the best practical fit.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          className={cn(
            "border p-4 text-left transition-all",
            isManual
              ? "border-brand-orange bg-brand-orange/5"
              : "border-brand-charcoal/10 hover:border-brand-charcoal/25",
          )}
        >
          <Wand2 className="h-4 w-4 text-brand-orange mb-2" />
          <p className="font-mono text-xs uppercase tracking-wider font-semibold">
            Choose my stack
          </p>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            Pick cloud, languages, and frameworks you prefer.
          </p>
        </button>
        <button
          type="button"
          onClick={() => onModeChange("auto")}
          className={cn(
            "border p-4 text-left transition-all",
            !isManual
              ? "border-brand-orange bg-brand-orange/5"
              : "border-brand-charcoal/10 hover:border-brand-charcoal/25",
          )}
        >
          <Sparkles className="h-4 w-4 text-brand-orange mb-2" />
          <p className="font-mono text-xs uppercase tracking-wider font-semibold">
            Let Simulark choose
          </p>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            Not sure yet? We&apos;ll pick a practical stack from your goals.
          </p>
        </button>
      </div>

      {!isManual && (
        <div className="border border-brand-charcoal/10 p-4 space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-wider text-brand-charcoal/70">
            Describe your project (optional)
          </label>
          <textarea
            value={projectDescription || ""}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g. B2B SaaS for team task management, need auth and billing"
            className="w-full min-h-[80px] border border-brand-charcoal/15 bg-bg-secondary p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-brand-orange"
          />
        </div>
      )}

      {isManual && (
        <div className="space-y-4 border border-brand-charcoal/10 p-4">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-sky-600 mb-2">
              Cloud / Hosting
            </h3>
            <TechPicker
              group="cloud"
              selected={data.cloud}
              onChange={(cloud) => onChange({ ...data, cloud })}
            />
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-amber-600 mb-2">
              Languages
            </h3>
            <TechPicker
              group="languages"
              selected={data.languages}
              onChange={(languages) => onChange({ ...data, languages })}
            />
          </div>
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 mb-2">
              Frameworks
            </h3>
            <TechPicker
              group="frameworks"
              selected={data.frameworks}
              onChange={(frameworks) => onChange({ ...data, frameworks })}
            />
          </div>
          {totalSelections > 0 && (
            <p className="font-mono text-[10px] text-brand-orange uppercase">
              {totalSelections} selected
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
