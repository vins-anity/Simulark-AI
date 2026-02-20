"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ShieldAlert, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ResourceExhaustionModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetAt?: string | null;
  limit?: number;
}

export function ResourceExhaustionModal({
  isOpen,
  onClose,
  resetAt,
  limit = 15,
}: ResourceExhaustionModalProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!resetAt || !isOpen) return;

    const targetDate = new Date(resetAt);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [resetAt, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 bg-white dark:bg-zinc-950 border-2 border-brand-charcoal dark:border-zinc-800 rounded-none shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-orange animate-pulse" />

        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-orange font-bold">
                {`// RESOURCE_LOCK_ENGAGED`}
              </span>
              <h2 className="text-2xl font-poppins font-black text-brand-charcoal dark:text-zinc-100 uppercase tracking-tight">
                Quota Exhausted
              </h2>
            </div>
            <div className="bg-brand-charcoal dark:bg-zinc-800 p-2 border border-brand-charcoal dark:border-zinc-700">
              <ShieldAlert className="w-6 h-6 text-brand-orange" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-brand-charcoal/5 dark:bg-white/5 border border-brand-charcoal/10 dark:border-white/10 p-4 font-mono text-xs">
              <div className="flex justify-between mb-2 pb-2 border-b border-brand-charcoal/10 dark:border-white/10">
                <span className="text-brand-charcoal/60 dark:text-zinc-500 uppercase">
                  IDENTIFIER
                </span>
                <span className="text-brand-charcoal dark:text-zinc-300 font-bold">
                  ERR_RATE_LIMIT_429
                </span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-brand-charcoal/10 dark:border-white/10">
                <span className="text-brand-charcoal/60 dark:text-zinc-500 uppercase">
                  DAILY_ALLOCATION
                </span>
                <span className="text-brand-charcoal dark:text-zinc-300 font-bold">
                  {limit} UNITS / DAY
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-charcoal/60 dark:text-zinc-500 uppercase">
                  CURRENT_STATUS
                </span>
                <span className="text-brand-orange font-bold uppercase animate-pulse">
                  DEPLETED
                </span>
              </div>
            </div>

            <p className="text-sm font-lora text-brand-charcoal/80 dark:text-zinc-400 leading-relaxed italic">
              You've hit the daily ceiling for the Free Command Tier. To prevent
              system degradation, further transmissions are gated until the next
              reset cycle.
            </p>

            <div className="flex flex-col items-center justify-center py-6 border-y border-dashed border-brand-charcoal/20 dark:border-zinc-800">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand-charcoal/40 dark:text-zinc-600 mb-2">
                COOLDOWN_ACTIVE: RESET_IN
              </span>
              <div className="font-mono text-4xl font-black text-brand-charcoal dark:text-zinc-200 tracking-tighter tabular-nums">
                {timeLeft || "00:00:00"}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard/billing">
                <Button className="w-full h-12 bg-brand-charcoal dark:bg-white text-white dark:text-black hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white rounded-none font-mono font-bold uppercase tracking-widest transition-all group overflow-hidden relative">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 fill-current" />
                    UPGRADE_NOW
                  </span>
                  <div className="absolute inset-0 bg-brand-orange translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-12 bg-transparent border-2 border-brand-charcoal dark:border-zinc-800 text-brand-charcoal dark:text-zinc-400 hover:bg-brand-charcoal/5 dark:hover:bg-white/5 rounded-none font-mono font-bold uppercase tracking-widest"
              >
                ACKNOWLEDGE
              </Button>
            </div>
          </div>
        </div>

        <div className="h-4 bg-brand-charcoal dark:bg-zinc-900 border-t border-brand-charcoal dark:border-zinc-800 flex items-center px-4 justify-between overflow-hidden">
          <div className="flex gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-brand-charcoal/20 dark:bg-zinc-700"
              />
            ))}
          </div>
          <span className="font-mono text-[8px] text-brand-charcoal/40 dark:text-zinc-600">
            SECURE_BOOT_v2.4.1
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
