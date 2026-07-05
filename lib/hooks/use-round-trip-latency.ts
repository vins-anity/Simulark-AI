"use client";

import { useEffect, useState } from "react";

/** Measures a single HEAD request to the app origin (real RTT, not decorative). */
export function useRoundTripLatency(): number | null {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const measure = async () => {
      const start = performance.now();
      try {
        await fetch(window.location.origin, {
          method: "HEAD",
          cache: "no-store",
        });
        if (!cancelled) {
          setLatencyMs(Math.round(performance.now() - start));
        }
      } catch {
        if (!cancelled) {
          setLatencyMs(null);
        }
      }
    };

    void measure();

    return () => {
      cancelled = true;
    };
  }, []);

  return latencyMs;
}
