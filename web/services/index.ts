/**
 * Centralized API service layer — use typed services with `getApiClient()` from @/lib/api.
 */

export { IncidentService, type ListIncidentsParams } from "@/services/incident.service";
export { incidentPaths } from "@/services/incident-paths";
export type { IncidentId } from "@/types/incident";
