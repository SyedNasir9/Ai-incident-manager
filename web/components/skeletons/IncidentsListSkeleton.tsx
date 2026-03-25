import { TableSkeleton } from "@/components/table";
import { PageToolbar } from "@/components/ui/PageToolbar";

const COLS = 4;
const ROWS = 8;

/**
 * Route-level skeleton for `/incidents` (matches list layout: toolbar + table).
 */
export function IncidentsListSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-label="Loading incidents">
      <PageToolbar>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200/90" />
        </div>
      </PageToolbar>
      <TableSkeleton rows={ROWS} columns={COLS} />
    </section>
  );
}
