/**
 * Stable query keys for incident APIs — use with `useQuery` / `invalidateQueries`.
 */
export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (params: { page: number; page_size: number }) =>
    [...incidentKeys.lists(), params] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
};
