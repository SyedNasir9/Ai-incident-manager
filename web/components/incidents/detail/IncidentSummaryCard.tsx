import type { Incident } from "@/types/incident";
import { formatDateTime, formatDurationFromStart } from "@/lib/format";
import { 
  Clock, 
  Calendar, 
  Activity, 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Zap,
  TrendingUp
} from "lucide-react";

export type IncidentSummaryCardProps = {
  incident: Incident;
};

function StatusIcon({ status }: { status: string }) {
  const statusConfig = {
    investigating: { icon: AlertTriangle, className: "text-red-600" },
    mitigating: { icon: Zap, className: "text-amber-600" },
    monitoring: { icon: Eye, className: "text-blue-600" },
    resolved: { icon: CheckCircle2, className: "text-emerald-600" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    icon: Activity,
    className: "text-slate-600"
  };

  const Icon = config.icon;
  return <Icon className={`h-5 w-5 ${config.className}`} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const severityConfig = {
    critical: "badge-critical",
    high: "badge-high", 
    medium: "badge-medium",
    low: "badge-low"
  };

  const className = severityConfig[severity as keyof typeof severityConfig] || "badge-medium";

  return (
    <span className={className}>
      {severity?.charAt(0).toUpperCase() + severity?.slice(1) || 'Unknown'}
    </span>
  );
}

export function IncidentSummaryCard({ incident }: IncidentSummaryCardProps) {
  const serviceName = incident.service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const statusDisplay = incident.status.charAt(0).toUpperCase() + incident.status.slice(1);
  const duration = incident.resolved_time 
    ? formatDurationFromStart(incident.start_time, incident.resolved_time)
    : formatDurationFromStart(incident.start_time);

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {incident.title}
            </h1>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="font-medium">{serviceName}</span>
              <div className="h-1 w-1 rounded-full bg-slate-400" />
              <span>ID #{incident.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SeverityBadge severity={incident.severity} />
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200/60">
              <StatusIcon status={incident.status} />
              <span className="font-medium text-slate-900">{statusDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="metric-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="metric-label">Started</span>
            </div>
            <div className="metric-value">{formatDateTime(incident.start_time)}</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="metric-label">Duration</span>
            </div>
            <div className="metric-value">{duration}</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              <span className="metric-label">Priority</span>
            </div>
            <div className="metric-value">P{incident.priority}</div>
          </div>

          <div className="metric-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="metric-label">Impact</span>
            </div>
            <div className="metric-value">{incident.severity}</div>
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <div className="mt-8 p-4 bg-slate-50/50 rounded-lg border border-slate-200/30">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{incident.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
