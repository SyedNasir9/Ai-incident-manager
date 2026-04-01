import { 
  Network,
  TrendingUp,
  Eye,
  ArrowRight,
  AlertTriangle,
  Zap
} from "lucide-react";
import Link from "next/link";
import type { SimilarIncidentsResponse } from "@/types/incident";
import { formatDateTime } from "@/lib/format";

export type IncidentSimilarSectionProps = {
  data: SimilarIncidentsResponse | null;
  /** Forwarded to `SimilarIncidents` when data is present */
  variant?: "table" | "list";
};

function SimilarityBadge({ score }: { score: number }) {
  const percentage = Math.round(score * 100);
  let className = "badge-medium";
  
  if (percentage >= 80) className = "badge-critical";
  else if (percentage >= 60) className = "badge-high";
  else if (percentage >= 40) className = "badge-medium";
  else className = "badge-low";
  
  return (
    <span className={className}>
      {percentage}% similar
    </span>
  );
}

function SimilarIncidentCard({ incident, score }: { incident: any; score: number }) {
  const serviceName = incident.service.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  return (
    <Link href={`/incidents/${incident.id}`} className="block group">
      <div className="p-4 border border-slate-200/60 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white group-hover:bg-slate-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-slate-700">
              #{incident.id}
            </span>
            <SimilarityBadge score={score} />
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
        
        <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-900">
          {incident.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{serviceName}</span>
          <span>{formatDateTime(incident.start_time)}</span>
        </div>
      </div>
    </Link>
  );
}

export function IncidentSimilarSection({ data, variant = "table" }: IncidentSimilarSectionProps) {
  return (
    <div className="card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Network className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Similar Incidents</h2>
            <p className="text-sm text-slate-600">
              {data?.similar_incidents ? `${data.similar_incidents.length} similar incidents found` : 'Finding similar patterns...'}
            </p>
          </div>
        </div>
        
        {data?.similar_incidents && data.similar_incidents.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="h-4 w-4" />
            <span>AI-powered similarity</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {data == null ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Network className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Similarity analysis unavailable</h3>
            <p className="text-sm text-slate-500 mb-4">
              Similar incidents could not be loaded. This often means no embedding exists for this incident yet.
            </p>
            <button className="btn-secondary">
              <Zap className="h-4 w-4" />
              Generate Embeddings
            </button>
          </div>
        ) : data.similar_incidents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">No similar incidents</h3>
            <p className="text-sm text-slate-500">
              This appears to be a unique incident with no similar historical patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {data.similar_incidents.length}
                </div>
                <div className="text-xs text-slate-600">Similar Incidents</div>
              </div>
              <div className="text-center p-3 bg-slate-50/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {Math.round(data.similar_incidents[0]?.similarity_score * 100 || 0)}%
                </div>
                <div className="text-xs text-slate-600">Best Match</div>
              </div>
              <div className="text-center p-3 bg-slate-50/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 mb-1">
                  {Math.round((data.similar_incidents.reduce((acc, inc) => acc + inc.similarity_score, 0) / data.similar_incidents.length) * 100)}%
                </div>
                <div className="text-xs text-slate-600">Avg. Similarity</div>
              </div>
            </div>

            {/* Similar Incidents Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {data.similar_incidents.map((item) => (
                <SimilarIncidentCard
                  key={item.incident.id}
                  incident={item.incident}
                  score={item.similarity_score}
                />
              ))}
            </div>

            {/* View All Link */}
            {data.similar_incidents.length > 4 && (
              <div className="text-center pt-4 border-t border-slate-200/60">
                <Link href="/incidents?search=similar" className="btn-ghost">
                  <Eye className="h-4 w-4" />
                  View All Similar Incidents
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
