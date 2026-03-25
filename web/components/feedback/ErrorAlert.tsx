"use client";

export type ErrorAlertProps = {
  title?: string;
  message: string;
  /** Extra reassurance — not technical detail */
  hint?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorAlert({
  title = "Something went wrong",
  message,
  hint = "If this keeps happening, wait a moment and try again.",
  onRetry,
  retryLabel = "Try again",
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200/90 bg-red-50/90 px-4 py-4 text-sm text-red-900 shadow-sm"
    >
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="mt-1.5 leading-relaxed text-red-800/95">{message}</p>
      <p className="mt-2 text-xs leading-relaxed text-red-800/80">{hint}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-900 shadow-sm transition-colors hover:bg-red-50/80"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
