import { IncidentDetailSkeleton } from "@/components/incidents/detail";
import { DetailPageToolbarSkeleton } from "@/components/skeletons";

export default function IncidentDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <DetailPageToolbarSkeleton />
      <IncidentDetailSkeleton />
    </div>
  );
}
