import type { Metadata } from "next";

import { IncidentDetailPageClient } from "./IncidentDetailPageClient";

type PageProps = {
  params: { id: string };
};

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `Incident ${params.id}`,
  };
}

export default function IncidentDetailPage({ params }: PageProps) {
  return <IncidentDetailPageClient incidentId={params.id} />;
}
