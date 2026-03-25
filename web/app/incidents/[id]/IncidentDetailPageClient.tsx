"use client";

import { IncidentDetailView } from "@/components/incidents/detail";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { useIncidentDetail } from "@/hooks/useIncidentDetail";
import { btnSecondary } from "@/lib/ui-classes";

export type IncidentDetailPageClientProps = {
  incidentId: string;
};

export function IncidentDetailPageClient({ incidentId }: IncidentDetailPageClientProps) {
  const { state, reload, isRefetching, isFetching } = useIncidentDetail(incidentId);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <PageToolbar description="Review the timeline, recorded root cause, and statistically similar incidents. Use refresh to pull the latest data from the server.">
        <>
          {isRefetching ? (
            <span className="text-xs tabular-nums text-slate-500" aria-live="polite">
              Refreshing…
            </span>
          ) : null}
          <button type="button" onClick={() => void reload()} disabled={isFetching} className={btnSecondary}>
            Refresh
          </button>
        </>
      </PageToolbar>
      <IncidentDetailView state={state} onRetry={() => void reload()} />
    </div>
  );
}
