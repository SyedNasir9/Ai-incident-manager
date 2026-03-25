"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { makeQueryClient } from "@/lib/query-client";

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * React Query root — wrap the client subtree that uses `useQuery` / `useMutation`.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(() => makeQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
