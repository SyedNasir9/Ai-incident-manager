/**
 * Relative API paths only — base URL is configured via NEXT_PUBLIC_API_URL.
 */

import type { IncidentId } from "@/types/incident";

function segment(id: IncidentId): string {
  return encodeURIComponent(String(id));
}

export const incidentPaths = {
  list: () => "/incidents",
  detail: (id: IncidentId) => `/incidents/${segment(id)}`,
  timeline: (id: IncidentId) => `/incidents/${segment(id)}/timeline`,
  rootCause: (id: IncidentId) => `/incidents/${segment(id)}/root-cause`,
  similar: (id: IncidentId) => `/incidents/${segment(id)}/similar`,
} as const;
