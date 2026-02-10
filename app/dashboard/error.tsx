"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="text-4xl">📊</div>
      <h2 className="text-xl font-bold text-red-900">Dashboard Error</h2>
      <p className="text-sm text-red-700">{error.message}</p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
