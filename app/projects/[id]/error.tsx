"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ProjectErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectError({ error, reset }: ProjectErrorProps) {
  useEffect(() => {
    console.error("[Project Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="text-6xl">🏗️</div>
      <h2 className="text-2xl font-bold text-gray-900">Project Error</h2>
      <p className="max-w-md text-gray-600">
        Failed to load project data. The project may have been deleted or you
        don&apos;t have access.
      </p>
      <div className="flex gap-4">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
