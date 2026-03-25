/**
 * Incident detail data loading — HTTP calls only; no React / UI imports.
 */

import { IncidentService } from "@/services/incident.service";
import type { Incident, SimilarIncidentsResponse, TimelineEvent } from "@/types/incident";

export type IncidentDetailBundle = {
  incident: Incident;
  timeline: TimelineEvent[];
  rootCauseText: string;
  similar: SimilarIncidentsResponse | null;
};

/**
 * Loads the incident, then timeline + root cause in parallel.
 * Similar incidents are best-effort: failures (e.g. missing embedding) yield `similar: null`.
 */
export async function fetchIncidentDetail(incidentId: string): Promise<IncidentDetailBundle> {
  const incident = await IncidentService.getIncidentById(incidentId);

  const [timeline, rootCause] = await Promise.all([
    IncidentService.getIncidentTimeline(incidentId),
    IncidentService.getIncidentRootCause(incidentId),
  ]);

  const similar = await IncidentService.getSimilarIncidents(incidentId).catch((): null => null);

  return {
    incident,
    timeline,
    rootCauseText: rootCause.root_cause?.trim() ?? "",
    similar,
  };
}
