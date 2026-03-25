import type { UseQueryResult } from "@tanstack/react-query";

import type { IncidentDetailBundle } from "@/data/incident-detail";
import { getUserFacingErrorMessage, isApiError } from "@/lib/api";
import type { IncidentDetailState } from "@/types/incident-detail-ui";

/**
 * Maps a detail `useQuery` result into the existing UI state union.
 */
export function mapIncidentDetailQueryToState(
  q: UseQueryResult<IncidentDetailBundle, unknown>,
): IncidentDetailState {
  if (q.isPending) {
    return { status: "loading" };
  }
  if (q.isError) {
    const err = q.error;
    if (isApiError(err) && err.status === 404) {
      return { status: "notFound" };
    }
    return {
      status: "error",
      message: getUserFacingErrorMessage(err),
    };
  }
  if (q.data) {
    return { status: "success", data: q.data };
  }
  return { status: "loading" };
}
