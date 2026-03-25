import type { Incident } from "@/types/incident";
import { formatDateTime, formatStatus } from "@/lib/format";

export type IncidentSummaryCardProps = {
  incident: Incident;
};

export function IncidentSummaryCard({ incident }: IncidentSummaryCardProps) {
  return (
    <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-sm">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Summary</h2>
      <dl className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
        <div>
          <dt className="text-xs font-medium text-slate-500">Incident ID</dt>
          <dd className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
            {incident.id}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Status</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">{formatStatus(incident.status)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-500">Created at</dt>
          <dd className="mt-1.5 text-sm leading-relaxed text-slate-900">
            {formatDateTime(incident.start_time)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
