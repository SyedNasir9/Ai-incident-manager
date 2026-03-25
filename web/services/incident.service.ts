import { getApiClient } from "@/lib/api";
import type {
  Incident,
  IncidentRootCauseResponse,
  PaginatedIncidentsResponse,
  SimilarIncidentsResponse,
  TimelineEvent,
} from "@/types/incident";
import { incidentPaths } from "@/services/incident-paths";
import type { IncidentId } from "@/types/incident";

/**
 * Incident-related HTTP calls. Paths are relative to `NEXT_PUBLIC_API_URL`.
 */
export type ListIncidentsParams = {
  page?: number;
  page_size?: number;
};

export const IncidentService = {
  async getIncidents(params?: ListIncidentsParams): Promise<PaginatedIncidentsResponse> {
    const { data } = await getApiClient().get<PaginatedIncidentsResponse>(incidentPaths.list(), {
      params: params?.page != null || params?.page_size != null ? params : undefined,
    });
    return data;
  },

  async getIncidentById(id: IncidentId): Promise<Incident> {
    const { data } = await getApiClient().get<Incident>(incidentPaths.detail(id));
    return data;
  },

  async getIncidentTimeline(id: IncidentId): Promise<TimelineEvent[]> {
    const { data } = await getApiClient().get<TimelineEvent[]>(
      incidentPaths.timeline(id),
    );
    return data;
  },

  async getIncidentRootCause(id: IncidentId): Promise<IncidentRootCauseResponse> {
    const { data } = await getApiClient().get<IncidentRootCauseResponse>(
      incidentPaths.rootCause(id),
    );
    return data;
  },

  async getSimilarIncidents(id: IncidentId): Promise<SimilarIncidentsResponse> {
    const { data } = await getApiClient().get<SimilarIncidentsResponse>(
      incidentPaths.similar(id),
    );
    return data;
  },
} as const;
