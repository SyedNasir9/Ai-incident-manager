"use client";

export type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 8, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed text-sm" aria-hidden>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-3.5 w-20 max-w-full animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri}>
              {Array.from({ length: columns }).map((_, ci) => (
                <td key={ci} className="px-4 py-3">
                  <div
                    className="h-3.5 max-w-full animate-pulse rounded bg-slate-100"
                    style={{ width: ci === 0 ? "3rem" : `${60 + (ci % 3) * 12}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
