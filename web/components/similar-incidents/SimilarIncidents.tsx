import Link from "next/link";
import { inlineEmptyBox } from "@/lib/ui-classes";

/**
 * Similar incident item structure
 */
export type SimilarIncidentItem = {
  incident_id: string;
  score: number;
};

/**
 * Props for SimilarIncidents component
 */
export type SimilarIncidentsProps = {
  /** Array of similar incidents to display */
  items: SimilarIncidentItem[];
  
  /** `table` is most compact for many rows; `list` for a lighter layout */
  variant?: "table" | "list";
  
  /** Prefix for incident links */
  incidentHref?: (incidentId: string) => string;
  
  /** Decimal places for score (default 4) */
  scoreDecimals?: number;
  
  /** Empty state message */
  emptyLabel?: string;
  
  /** Additional CSS classes for styling */
  className?: string;
  
  /** ARIA label for accessibility */
  "aria-label"?: string;
  
  /** Whether to show similarity threshold indicator */
  showThreshold?: boolean;
  
  /** Similarity score threshold for highlighting */
  thresholdScore?: number;
};

/**
 * Sort incidents by score in descending order
 */
function sortByScoreDesc(items: SimilarIncidentItem[]): SimilarIncidentItem[] {
  return [...items].sort((a, b) => b.score - a.score);
}

/**
 * Format similarity score with color coding
 */
function formatScore(score: number, decimals: number): { text: string; className: string } {
  const scoreText = score.toFixed(decimals);
  
  if (score >= 0.8) {
    return {
      text: scoreText,
      className: "text-green-700 font-semibold"
    };
  } else if (score >= 0.6) {
    return {
      text: scoreText,
      className: "text-yellow-700 font-semibold"
    };
  } else if (score >= 0.4) {
    return {
      text: scoreText,
      className: "text-orange-700 font-semibold"
    };
  } else {
    return {
      text: scoreText,
      className: "text-slate-700 font-semibold"
    };
  }
}

/**
 * Get similarity level description
 */
function getSimilarityLevel(score: number): string {
  if (score >= 0.8) return "Very High";
  if (score >= 0.6) return "High";
  if (score >= 0.4) return "Medium";
  if (score >= 0.2) return "Low";
  return "Very Low";
}

const defaultHref = (id: string) => `/incidents/${encodeURIComponent(id)}`;

/**
 * Enhanced SimilarIncidents component with enterprise features
 */
export function SimilarIncidents({
  items,
  variant = "table",
  incidentHref = defaultHref,
  scoreDecimals = 4,
  emptyLabel = "No similar incidents found.",
  className = "",
  "aria-label" = "Similar incidents",
  showThreshold = true,
  thresholdScore = 0.4,
}: SimilarIncidentsProps) {
  const sorted = sortByScoreDesc(items);

  if (sorted.length === 0) {
    return (
      <div className={`rounded-lg border border-slate-200/90 bg-white p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.657 15a6 6 0 00-6 6 0 018 6zm0 657 5a3 3 0 00-3 3 0 006 6zm1.657 8a3 3 0 00-3 3 0 006 6zm1.657 15a6 6 0 00-6 6 0 018 6z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-600">No Similar Incidents</h3>
          </div>
          <p className="text-sm text-slate-500">
            {emptyLabel}
          </p>
        </div>
      </div>
    );
  }

  const highestScore = sorted.length > 0 ? sorted[0].score : 0;

  return (
    <div className={`bg-white rounded-lg border border-slate-200/90 shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900" id="similar-incidents-heading">
            Similar Incidents
          </h2>
          {showThreshold && (
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span>Similarity threshold: </span>
              <span className="font-mono text-slate-800">{thresholdScore.toFixed(scoreDecimals)}</span>
              <span className="text-slate-500"> (higher = more similar)</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {variant === "list" ? (
          <ListView 
            items={sorted}
            incidentHref={incidentHref}
            scoreDecimals={scoreDecimals}
            emptyLabel={emptyLabel}
            ariaLabel={ariaLabel}
          />
        ) : (
          <TableView 
            items={sorted}
            incidentHref={incidentHref}
            scoreDecimals={scoreDecimals}
            emptyLabel={emptyLabel}
            ariaLabel={ariaLabel}
          />
        )}
      </div>

      {/* Footer with statistics */}
      <div className="border-t border-slate-100 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            <span>Found {sorted.length} similar incident{sorted.length === 1 ? '' : 's'}</span>
            {highestScore > 0 && (
              <span className="text-slate-400">
                {' '} • Highest similarity: {highestScore.toFixed(scoreDecimals)}
              </span>
            )}
          </div>
          <div className="text-slate-400">
            Analysis based on embedding vector similarity
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * List view variant for similar incidents
 */
function ListView({
  items,
  incidentHref,
  scoreDecimals,
  emptyLabel,
  ariaLabel,
}: {
  items: SimilarIncidentItem[];
  incidentHref: (incidentId: string) => string;
  scoreDecimals?: number;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <ul className={`divide-y divide-slate-100 border border-slate-200/90 rounded-md ${className}`} aria-label={ariaLabel} role="list">
      {items.map((incident, index) => (
        <li key={incident.incident_id} className="p-4 hover:bg-slate-50 transition-colors">
          <Link
            href={incidentHref(incident.incident_id)}
            className="flex items-center justify-between text-sm transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.586 2.707a8 8 0 00-8 8 0 018 6zm-7.657 2.293a6 6 0 00-6 6 0 006 6z" />
                  </svg>
                </div>
                <span className="font-mono text-xs text-slate-800 truncate max-w-[100px]">
                  {incident.incident_id}
                </span>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs text-slate-500">
                  Similarity
                </div>
                <div className={formatScore(incident.score, scoreDecimals || 4).className}>
                  {formatScore(incident.score, scoreDecimals || 4).text}
                </div>
              </div>
            </div>
            <div className="ml-2">
              <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7 7" />
              </svg>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Table view variant for similar incidents
 */
function TableView({
  items,
  incidentHref,
  scoreDecimals,
  emptyLabel,
  ariaLabel,
}: {
  items: SimilarIncidentItem[];
  incidentHref: (incidentId: string) => string;
  scoreDecimals?: number;
  emptyLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-left text-sm" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="pb-2 pr-3">Incident</th>
            <th className="pb-2 text-right">Score</th>
            <th className="pb-2 text-right">Similarity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((incident) => (
            <tr key={incident.incident_id} className="group hover:bg-slate-50">
              <td className="py-1.5 pr-3">
                <Link
                  href={incidentHref(incident.incident_id)}
                  className="font-mono text-xs text-slate-800 underline decoration-slate-300/80 underline-offset-2 hover:text-slate-950"
                >
                  {incident.incident_id}
                </Link>
              </td>
              <td className="py-1.5 text-right tabular-nums">
                <span className={formatScore(incident.score, scoreDecimals || 4).className}>
                  {formatScore(incident.score, scoreDecimals || 4).text}
                </span>
              </td>
              <td className="py-1.5 text-right">
                <span className="text-xs text-slate-600">
                  {getSimilarityLevel(incident.score)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Compact variant for dashboard views
 */
export function CompactSimilarIncidents({ 
  items, 
  className = "" 
}: { 
  items: SimilarIncidentItem[]; 
  className?: string 
}) {
  return (
    <SimilarIncidents 
      items={items}
      variant="list"
      className={className}
      emptyLabel="Recent similar incidents"
      showThreshold={false}
    />
  );
}
