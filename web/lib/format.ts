/**
 * Locale-aware display helpers for API values (e.g. RFC3339 timestamps).
 */

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

/** Human-readable label; keeps unknown values visible */
export function formatStatus(status: string): string {
  const t = status.trim();
  if (!t) return "—";
  return t.replace(/_/g, " ");
}
