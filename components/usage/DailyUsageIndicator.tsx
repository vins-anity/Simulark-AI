"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DailyUsageSnapshot } from "@/lib/usage-status";
import { cn } from "@/lib/utils";

interface DailyUsageIndicatorProps {
  usage: DailyUsageSnapshot | null;
  loading?: boolean;
  /** @deprecated Use `variant` instead */
  compact?: boolean;
  variant?: "default" | "header" | "compact";
  className?: string;
}

function formatResetTime(resetAt: string): string {
  const target = new Date(resetAt);
  if (Number.isNaN(target.getTime())) {
    return "midnight UTC";
  }

  return target.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function barColor(percentUsed: number): string {
  if (percentUsed >= 90) {
    return "bg-red-500";
  }
  if (percentUsed >= 70) {
    return "bg-brand-orange";
  }
  return "bg-brand-green";
}

export function DailyUsageIndicator({
  usage,
  loading = false,
  compact = false,
  variant,
  className,
}: DailyUsageIndicatorProps) {
  const resolvedVariant = variant ?? (compact ? "header" : "default");
  const percentRemaining = usage
    ? Math.max(0, 100 - usage.percentUsed)
    : null;

  const label = loading
    ? "Syncing usage…"
    : usage
      ? `${usage.remaining} of ${usage.limit} AI requests left today`
      : "Usage unavailable";

  const detail = usage
    ? `Resets ${formatResetTime(usage.resetAt)} · ${usage.tier === "pro" ? "Pro" : "Flash"} tier daily cap`
    : "Daily limits help keep the free beta fair for everyone.";

  const shortLabel =
    loading || !usage
      ? "…"
      : `${usage.remaining}/${usage.limit} left`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "min-w-0 text-left rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange/50",
              resolvedVariant === "header" && "w-[108px] shrink-0",
              resolvedVariant === "compact" && "max-w-[140px]",
              resolvedVariant === "default" && "max-w-[220px] w-full",
              className,
            )}
            aria-label={label}
          >
            {resolvedVariant === "header" ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[7px] uppercase tracking-wider text-brand-charcoal/45 dark:text-text-secondary/60 truncate">
                    Daily AI
                  </span>
                  <span className="font-mono text-[7px] tabular-nums text-brand-charcoal/60 dark:text-text-secondary/70 shrink-0">
                    {shortLabel}
                  </span>
                </div>
                <div className="h-1 w-full bg-brand-charcoal/10 dark:bg-white/10 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      loading
                        ? "bg-brand-charcoal/20 animate-pulse w-1/2"
                        : barColor(usage?.percentUsed ?? 0),
                    )}
                    style={{
                      width: loading
                        ? undefined
                        : `${percentRemaining ?? 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="h-1 w-full bg-brand-charcoal/10 dark:bg-white/10 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        loading
                          ? "bg-brand-charcoal/20 animate-pulse w-1/2"
                          : barColor(usage?.percentUsed ?? 0),
                      )}
                      style={{
                        width: loading
                          ? undefined
                          : `${percentRemaining ?? 0}%`,
                      }}
                    />
                  </div>
                  {resolvedVariant === "default" && (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-[8px] uppercase tracking-wider text-brand-charcoal/45 dark:text-text-secondary/60 truncate">
                        Daily AI
                      </span>
                      <span className="font-mono text-[8px] tabular-nums text-brand-charcoal/60 dark:text-text-secondary/70 shrink-0">
                        {loading || !usage
                          ? "—"
                          : `${percentRemaining}% left`}
                      </span>
                    </div>
                  )}
                </div>
                {resolvedVariant === "compact" && (
                  <span className="font-mono text-[8px] tabular-nums text-brand-charcoal/50 dark:text-text-secondary/60 shrink-0">
                    {loading || !usage ? "…" : `${percentRemaining}%`}
                  </span>
                )}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          className="max-w-[240px] font-mono text-[10px] uppercase tracking-wide"
        >
          <p>{label}</p>
          <p className="normal-case tracking-normal text-muted-foreground mt-1">
            {detail}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
