"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { incidentKeys } from "@/lib/query-keys";
import { IncidentService } from "@/services/incident.service";

/**
 * Paginated incidents list — backed by `IncidentService.getIncidents`.
 * Uses `keepPreviousData` so pagination stays stable while refetching.
 */
export function useIncidentsListQuery(page: number, pageSize: number) {
  return useQuery({
    queryKey: incidentKeys.list({ page, page_size: pageSize }),
    queryFn: () => IncidentService.getIncidents({ page, page_size: pageSize }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
