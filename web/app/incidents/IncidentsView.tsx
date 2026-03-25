"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorAlert } from "@/components/feedback";
import { DataTable, PaginationBar, TableSkeleton } from "@/components/table";
import type { DataTableColumn } from "@/components/table/DataTable";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { useIncidentsListQuery } from "@/hooks/queries/useIncidentsListQuery";
import { getUserFacingErrorMessage } from "@/lib/api";
import { formatDateTime, formatStatus } from "@/lib/format";
import { btnSecondary } from "@/lib/ui-classes";
import type { Incident } from "@/types/incident";

const PAGE_SIZE = 20;

const columns: DataTableColumn<Incident>[] = [
  {
    id: "id",
    header: "Incident ID",
    cellClassName: "font-mono text-xs text-slate-700",
    cell: (row) => String(row.id),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => formatStatus(row.status),
  },
  {
    id: "created",
    header: "Created at",
    cell: (row) => formatDateTime(row.start_time),
  },
  {
    id: "severity",
    header: "Severity",
    cell: (row) => {
      const s = row.severity?.trim();
      return s ? <span className="text-slate-800">{s}</span> : <span className="text-slate-400">—</span>;
    },
  },
];

export function IncidentsView() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error, refetch, isFetching } = useIncidentsListQuery(
    page,
    PAGE_SIZE,
  );

  const onRowClick = useCallback(
    (row: Incident) => {
      router.push(`/incidents/${row.id}`);
    },
    [router],
  );

  const errorMessage = isError ? getUserFacingErrorMessage(error) : null;

  return (
    <section className="space-y-6" aria-label="Incidents">
      <PageToolbar description="Open a row to view timeline, root cause, and similar incidents. List data is cached and refreshes in the background when you return to this view.">
        <>
          {isFetching ? (
            <span className="text-xs tabular-nums text-slate-500" aria-live="polite">
              Updating…
            </span>
          ) : null}
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className={btnSecondary}>
            Refresh
          </button>
        </>
      </PageToolbar>

      {errorMessage ? (
        <ErrorAlert message={errorMessage} onRetry={() => void refetch()} />
      ) : null}

      {isPending ? (
        <TableSkeleton rows={PAGE_SIZE} columns={columns.length} />
      ) : !isError ? (
        <div className="overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-sm">
          <DataTable
            embedded
            aria-label="Incidents"
            columns={columns}
            rows={data?.incidents ?? []}
            getRowKey={(row) => String(row.id)}
            onRowClick={onRowClick}
            emptyTitle="No incidents yet"
            emptyDescription="When Alertmanager delivers alerts to this system, new incidents will show up here for triage."
            emptyLabel="No incidents yet."
          />
          <PaginationBar
            page={data?.page ?? page}
            pageSize={data?.page_size ?? PAGE_SIZE}
            total={data?.total ?? 0}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </div>
      ) : null}
    </section>
  );
}
