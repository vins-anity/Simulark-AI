"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ResetOnboardingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isResetting: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  badge?: string;
}

export function ResetOnboardingModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isResetting,
  title = "Reset Onboarding?",
  description = '"This action will purge current configuration parameters and re-initialize the system onboarding sequence. All progress will be lost."',
  confirmLabel = "[ PURGE & RESET ]",
  badge = "SYS-RS_01 // RESET_PROCESS",
}: ResetOnboardingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] border-brand-charcoal/10 bg-bg-secondary p-0 gap-0 overflow-hidden rounded-none shadow-2xl">
        {/* Header - Technical Style */}
        <div className="bg-brand-charcoal py-3 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              {badge}
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-none border border-brand-orange/30 bg-brand-orange/5">
              <AlertTriangle className="h-5 w-5 text-brand-orange" />
            </div>
            <DialogTitle className="font-poppins text-lg font-bold text-brand-charcoal tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-brand-charcoal/60 leading-relaxed font-lora italic">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-6 space-y-3 font-mono text-[9px] uppercase tracking-wider text-brand-charcoal/40 border-y border-brand-charcoal/5 py-4">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-brand-orange">Awaiting Confirmation</span>
            </div>
            <div className="flex justify-between">
              <span>Target:</span>
              <span>Onboarding Data</span>
            </div>
            <div className="flex justify-between">
              <span>Impact:</span>
              <span className="text-red-500/70">Potential Data Loss</span>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              disabled={isResetting}
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-none border-brand-charcoal/10 font-mono text-[10px] uppercase tracking-widest hover:bg-bg-tertiary transition-all"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="button"
              disabled={isResetting}
              onClick={onConfirm}
              className="flex-1 rounded-none bg-brand-charcoal text-white hover:bg-black font-mono text-[10px] uppercase tracking-widest border-0 transition-all flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <div className="h-3 w-3 animate-spin border-2 border-white/30 border-t-white" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
