"use client";

import type { ReactNode } from "react";

import { EmptyState } from "@/components/feedback";

export type DataTableColumn<Row> = {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  emptyLabel?: string;
  /** When set with `emptyDescription` (or `emptyLabel` as body), renders a structured empty state */
  emptyTitle?: string;
  emptyDescription?: string;
  /** When true, omit outer card border (parent provides frame, e.g. with pagination). */
  embedded?: boolean;
  /** Visually caption the table for a11y */
  "aria-label"?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  emptyLabel = "No records found.",
  emptyTitle,
  emptyDescription,
  embedded = false,
  "aria-label": ariaLabel = "Data table",
}: DataTableProps<Row>) {
  const interactive = Boolean(onRowClick);
  const frame =
    embedded
      ? "overflow-x-auto bg-white"
      : "overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm";

  if (rows.length === 0) {
    if (emptyTitle) {
      const shell = embedded ? "bg-white" : "rounded-md border border-slate-200 bg-white shadow-sm";
      return (
        <div className={shell}>
          <EmptyState
            title={emptyTitle}
            description={emptyDescription ?? emptyLabel}
          />
        </div>
      );
    }
    return (
      <div
        className={
          embedded
            ? "bg-white px-4 py-12 text-center text-sm text-slate-500"
            : "rounded-md border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm"
        }
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={frame}>
      <table className="min-w-full border-collapse text-left text-sm" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => {
            const key = getRowKey(row);
            return (
              <tr
                key={key}
                onClick={interactive ? () => onRowClick?.(row) : undefined}
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick?.(row);
                        }
                      }
                    : undefined
                }
                tabIndex={interactive ? 0 : undefined}
                role={interactive ? "link" : undefined}
                className={
                  interactive
                    ? "cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-400"
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`whitespace-nowrap px-4 py-3 text-slate-800 ${col.cellClassName ?? ""}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
