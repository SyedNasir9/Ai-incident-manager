"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchIncidentDetail } from "@/data/incident-detail";
import { incidentKeys } from "@/lib/query-keys";
import { mapIncidentDetailQueryToState } from "@/hooks/queries/mapIncidentDetailState";

/**
 * Incident detail for one id — uses `fetchIncidentDetail` → `IncidentService`.
 * Exposes TanStack `refetch` as `reload` for the existing detail UI.
 */
export function useIncidentDetail(incidentId: string) {
  const query = useQuery({
    queryKey: incidentKeys.detail(incidentId),
    queryFn: () => fetchIncidentDetail(incidentId),
    staleTime: 60_000,
    /** Retries follow `QueryClient` defaults (`query-retry.ts`); 404 is not retried */
  });

  const state = mapIncidentDetailQueryToState(query);

  return {
    state,
    /** TanStack refetch — respects cache; use for “Try again” / manual refresh */
    reload: () => query.refetch(),
    /** True while any request for this query is in flight */
    isFetching: query.isFetching,
    /** Background refetch after initial data was loaded */
    isRefetching: query.isFetching && query.isFetched,
  };
}
