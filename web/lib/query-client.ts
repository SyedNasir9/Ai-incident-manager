import { QueryClient } from "@tanstack/react-query";

import { queryRetryDelay, queryShouldRetry } from "@/lib/query-retry";

/**
 * Factory for a per-tree QueryClient (instantiate once inside a client Provider).
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /** Served from cache while fresh; reduces duplicate network calls */
        staleTime: 30_000,
        /** Keep unused data in memory briefly for back-navigation */
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: queryShouldRetry,
        retryDelay: queryRetryDelay,
      },
    },
  });
}
