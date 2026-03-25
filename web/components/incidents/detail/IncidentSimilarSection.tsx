import { SimilarIncidents } from "@/components/similar-incidents";
import { inlineEmptyBox } from "@/lib/ui-classes";

import type { SimilarIncidentsResponse } from "@/types/incident";

export type IncidentSimilarSectionProps = {
  data: SimilarIncidentsResponse | null;
  /** Forwarded to `SimilarIncidents` when data is present */
  variant?: "table" | "list";
};

export function IncidentSimilarSection({ data, variant = "table" }: IncidentSimilarSectionProps) {
  return (
    <section
      className="rounded-lg border border-slate-200/90 bg-white shadow-sm"
      aria-labelledby="incident-similar-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="incident-similar-heading" className="text-sm font-semibold tracking-tight text-slate-900">
          Similar incidents
        </h2>
      </div>
      <div className="px-5 py-5">
        {data == null ? (
          <div className={inlineEmptyBox}>
            <p className="text-sm leading-relaxed text-slate-600">
              Similar incidents could not be loaded. This often means no embedding exists for this incident yet.
            </p>
          </div>
        ) : (
          <SimilarIncidents
            items={data.similar_incidents}
            variant={variant}
            emptyLabel="No similar incidents were found."
            aria-label="Similar incidents for this incident"
          />
        )}
      </div>
    </section>
  );
}
