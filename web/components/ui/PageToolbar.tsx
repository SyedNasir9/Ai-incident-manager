import type { ReactNode } from "react";

export type PageToolbarProps = {
  description?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Secondary row under the app header: optional context copy + actions (refresh, filters, etc.).
 */
export function PageToolbar({ description, children, className = "" }: PageToolbarProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
        description ? "sm:justify-between" : "sm:justify-end"
      } ${className}`.trim()}
    >
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
      ) : (
        <span className="hidden sm:block sm:flex-1" aria-hidden />
      )}
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
