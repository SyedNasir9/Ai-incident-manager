import type { IncidentDetailBundle } from "@/data/incident-detail";

export type IncidentDetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "notFound" }
  | { status: "success"; data: IncidentDetailBundle };
