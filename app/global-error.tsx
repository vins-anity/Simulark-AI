"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 text-6xl">💥</div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Critical Error
          </h2>
          <p className="mb-6 max-w-md text-gray-600">
            A critical error has occurred. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
