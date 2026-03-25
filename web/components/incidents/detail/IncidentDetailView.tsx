import { EmptyState, ErrorAlert } from "@/components/feedback";
import type { IncidentDetailBundle } from "@/data/incident-detail";
import type { IncidentDetailState } from "@/types/incident-detail-ui";
import Link from "next/link";

import { btnSecondary } from "@/lib/ui-classes";

import { IncidentDetailSkeleton } from "@/components/incidents/detail/IncidentDetailSkeleton";
import { IncidentMetricsSection } from "@/components/incidents/detail/IncidentMetricsSection";
import { IncidentRootCauseSection } from "@/components/incidents/detail/IncidentRootCauseSection";
import { IncidentSimilarSection } from "@/components/incidents/detail/IncidentSimilarSection";
import { IncidentSummaryCard } from "@/components/incidents/detail/IncidentSummaryCard";
import { IncidentTimelineSection } from "@/components/incidents/detail/IncidentTimelineSection";

export type IncidentDetailViewProps = {
  state: IncidentDetailState;
  onRetry: () => void;
};

function SuccessBody({ data }: { data: IncidentDetailBundle }) {
  // Get dashboard URL from environment variables or config
  const dashboardUrl = process.env.NEXT_PUBLIC_GRAFANA_DASHBOARD_URL;

  return (
    <div className="space-y-8">
      <IncidentSummaryCard incident={data.incident} />
      <IncidentTimelineSection events={data.timeline} />
      <IncidentRootCauseSection text={data.rootCauseText} />
      <IncidentSimilarSection data={data.similar} />
      <IncidentMetricsSection incident={data.incident} timeline={data.timeline} dashboardUrl={dashboardUrl} />
    </div>
  );
}

/**
 * Presentational shell for incident detail — no data fetching.
 */
export function IncidentDetailView({ state, onRetry }: IncidentDetailViewProps) {
  if (state.status === "loading") {
    return <IncidentDetailSkeleton />;
  }

  if (state.status === "notFound") {
    return (
      <div className="rounded-lg border border-slate-200/90 bg-white py-2 shadow-sm">
        <EmptyState
          title="Incident not found"
          description="This incident does not exist or may have been removed from the system."
        >
          <Link href="/incidents" className={`${btnSecondary} no-underline`}>
            Back to incidents
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (state.status === "error") {
    return <ErrorAlert message={state.message} onRetry={onRetry} />;
  }

  return <SuccessBody data={state.data} />;
}
