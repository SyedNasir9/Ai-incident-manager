"use client";

export type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationBar({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200/90 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm tabular-nums text-slate-600">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-slate-800">{from}</span>–
            <span className="font-medium text-slate-800">{to}</span> of{" "}
            <span className="font-medium text-slate-800">{total}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={disabled || page >= totalPages || total === 0}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
