/**
 * API response shapes aligned with backend JSON (Go `pkg/models` and handlers).
 * Dates from Go `time.Time` serialize as RFC3339 strings.
 */

export type IncidentId = string | number;

/** `models.Incident` */
export interface Incident {
  id: number;
  service: string;
  /** May be empty if not set at ingest time */
  severity?: string;
  start_time: string;
  status: string;
}

/** `GET /incidents` paginated body */
export interface PaginatedIncidentsResponse {
  incidents: Incident[];
  total: number;
  page: number;
  page_size: number;
}

/** `models.TimelineEvent` */
export interface TimelineEvent {
  timestamp: string;
  source: string;
  message: string;
}

/** Expected JSON for `GET /incidents/:id/root-cause` when implemented server-side */
export interface IncidentRootCauseResponse {
  root_cause: string;
}

/** `models.SimilarIncident` */
export interface SimilarIncident {
  incident_id: string;
  score: number;
}

/** Similar-incidents handler success body */
export interface SimilarIncidentsResponse {
  incident_id: string;
  similar_incidents: SimilarIncident[];
}
