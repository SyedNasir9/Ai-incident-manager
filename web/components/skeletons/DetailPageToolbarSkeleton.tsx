/** Matches `PageToolbar` + refresh control height on incident detail */
export function DetailPageToolbarSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      aria-hidden
    >
      <div className="h-4 w-full max-w-xl rounded-md bg-slate-200/60" />
      <div className="h-9 w-24 shrink-0 animate-pulse rounded-md bg-slate-200/80" />
    </div>
  );
}
