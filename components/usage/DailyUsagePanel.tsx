"use client";

import { useCallback, useEffect, useState } from "react";
import { getUsageStatus } from "@/actions/usage";
import type { InferenceTier } from "@/lib/inference-tier";
import type { DailyUsageSnapshot } from "@/lib/usage-status";
import { DailyUsageIndicator } from "./DailyUsageIndicator";

interface DailyUsagePanelProps {
  tier?: InferenceTier;
  className?: string;
}

export function DailyUsagePanel({ tier = "flash", className }: DailyUsagePanelProps) {
  const [usage, setUsage] = useState<DailyUsageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (tierOverride?: InferenceTier) => {
    setLoading(true);
    const result = await getUsageStatus(tierOverride ?? tier);
    if (result.success) {
      setUsage(result.data);
    }
    setLoading(false);
  }, [tier]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-text-muted block mb-1">
            // DAILY_AI_USAGE
          </span>
          <p className="text-sm text-text-secondary font-lora">
            Fair-use limits reset every day at midnight UTC.
          </p>
        </div>
        <DailyUsageIndicator usage={usage} loading={loading} />
      </div>

      <div className="grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-wider">
        <div className="border border-border-primary bg-bg-primary p-3">
          <span className="text-text-muted block mb-1">Used</span>
          <span className="text-text-primary text-lg tabular-nums">
            {loading || !usage ? "—" : usage.used}
          </span>
        </div>
        <div className="border border-border-primary bg-bg-primary p-3">
          <span className="text-text-muted block mb-1">Limit</span>
          <span className="text-text-primary text-lg tabular-nums">
            {loading || !usage ? "—" : usage.limit}
          </span>
        </div>
        <div className="border border-border-primary bg-bg-primary p-3">
          <span className="text-text-muted block mb-1">Tier</span>
          <span className="text-text-primary text-lg">
            {tier === "pro" ? "Pro" : "Flash"}
          </span>
        </div>
      </div>

      <p className="mt-3 font-mono text-[9px] text-text-muted leading-relaxed">
        Flash and Pro share one daily counter. Pro has a lower daily cap.
        Burst and network limits still apply but are not shown here.
      </p>
    </div>
  );
}

export function useDailyUsage(tier: InferenceTier) {
  const [usage, setUsage] = useState<DailyUsageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (tierOverride?: InferenceTier) => {
    setLoading(true);
    const result = await getUsageStatus(tierOverride ?? tier);
    if (result.success) {
      setUsage(result.data);
    }
    setLoading(false);
  }, [tier]);

  const applySnapshot = useCallback((snapshot: DailyUsageSnapshot) => {
    setUsage(snapshot);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { usage, loading, refresh, applySnapshot };
}
