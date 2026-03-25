import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** Optional illustration — defaults to a minimal inbox-style glyph */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const defaultIcon = (
  <svg
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 13V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0010.586 3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2v-1M8 7h8m-8 4h5"
    />
  </svg>
);

export function EmptyState({
  title,
  description,
  icon = defaultIcon,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`.trim()}
      role="status"
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100/90 ring-1 ring-slate-200/60"
        aria-hidden
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
