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

/** Format duration from start time to end time or current time */
export function formatDurationFromStart(startTime: string, endTime?: string): string {
  try {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Unknown duration";
    }
    
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs < 0) {
      return "Unknown duration";
    }
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "< 1m";
    }
  } catch {
    return "Unknown duration";
  }
}
