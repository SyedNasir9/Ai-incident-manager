"use client";

import Link from "next/link";
import { useEffect } from "react";

import { btnSecondary } from "@/lib/ui-classes";

type ErrorFallbackProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const USER_MESSAGE =
  "Something went wrong while showing this screen. You can try again, or return to the incidents list.";

/**
 * Shared UI for Next.js `error.tsx` / `global-error.tsx`. Does not display raw error text.
 */
export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-slate-200/90 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">We hit a snag</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{USER_MESSAGE}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className={btnSecondary}>
            Try again
          </button>
          <Link href="/incidents" className={`${btnSecondary} text-center no-underline`}>
            Go to incidents
          </Link>
        </div>
      </div>
    </div>
  );
}
