export function IncidentDetailSkeleton() {
  const bar = "animate-pulse rounded-md bg-slate-200/80";
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading incident">
      <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-sm">
        <div className={`h-3 w-16 ${bar}`} />
        <div className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className={`h-3 w-20 ${bar}`} />
              <div className={`mt-2 h-5 w-28 ${bar}`} />
            </div>
          ))}
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-slate-200/90 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className={`h-4 w-32 ${bar}`} />
          </div>
          <div className="space-y-3 px-5 py-5">
            <div className={`h-3 w-full max-w-md ${bar}`} />
            <div className={`h-3 w-full max-w-sm ${bar}`} />
            <div className={`h-3 w-full max-w-lg ${bar}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
