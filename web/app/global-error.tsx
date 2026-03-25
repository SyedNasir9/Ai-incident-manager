"use client";

import { ErrorFallback } from "@/components/errors";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ErrorFallback error={error} reset={reset} />
      </body>
    </html>
  );
}
