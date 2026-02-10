"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 text-6xl">🚨</div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Something went wrong!
      </h2>
      <p className="mb-6 max-w-md text-gray-600">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
        >
          Reload Page
        </button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 max-w-2xl overflow-auto rounded-lg bg-gray-100 p-4 text-left">
          <pre className="text-xs text-red-600">{error.message}</pre>
          <pre className="mt-2 text-xs text-gray-600">{error.stack}</pre>
        </div>
      )}
    </div>
  );
}
