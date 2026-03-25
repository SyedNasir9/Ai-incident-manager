import { Timeline } from "@/components/timeline";
import type { TimelineEvent } from "@/types/incident";

export type IncidentTimelineSectionProps = {
  events: TimelineEvent[];
};

export function IncidentTimelineSection({ events }: IncidentTimelineSectionProps) {
  return (
    <section
      className="rounded-lg border border-slate-200/90 bg-white shadow-sm"
      aria-labelledby="incident-timeline-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="incident-timeline-heading" className="text-sm font-semibold tracking-tight text-slate-900">
          Timeline
        </h2>
      </div>
      <div className="px-5 py-5">
        <Timeline
          events={events}
          emptyLabel="No timeline events recorded for this incident."
          aria-label="Incident timeline"
        />
      </div>
    </section>
  );
}
