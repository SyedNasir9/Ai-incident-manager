"use client";

import { 
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Zap
} from "lucide-react";
import Link from "next/link";

import { IncidentDetailView } from "@/components/incidents/detail";
import { useIncidentDetail } from "@/hooks/useIncidentDetail";

export type IncidentDetailPageClientProps = {
  incidentId: string;
};

function StatusIndicator({ status }: { status: string }) {
  const statusConfig = {
    investigating: {
      icon: AlertTriangle,
      className: "text-red-600 bg-red-50",
      label: "Investigating",
      pulse: true
    },
    mitigating: {
      icon: Zap,
      className: "text-amber-600 bg-amber-50",
      label: "Mitigating",
      pulse: true
    },
    monitoring: {
      icon: Eye,
      className: "text-blue-600 bg-blue-50",
      label: "Monitoring",
      pulse: true
    },
    resolved: {
      icon: CheckCircle2,
      className: "text-emerald-600 bg-emerald-50",
      label: "Resolved",
      pulse: false
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    icon: Clock,
    className: "text-slate-600 bg-slate-50",
    label: status,
    pulse: false
  };

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.className}`}>
      <Icon className={`h-4 w-4 ${config.pulse ? 'animate-pulse' : ''}`} />
      <span className="font-medium text-sm">{config.label}</span>
    </div>
  );
}

export function IncidentDetailPageClient({ incidentId }: IncidentDetailPageClientProps) {
  const { state, reload, isRefetching, isFetching } = useIncidentDetail(incidentId);

  const incident = state.status === 'success' ? state.data.incident : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/incidents"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
              <span>Back to Incidents</span>
            </Link>
            
            <div className="h-4 w-px bg-slate-300" />
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  Incident #{incidentId}
                </h1>
                {incident && <StatusIndicator status={incident.status} />}
              </div>
              {incident && (
                <p className="text-slate-600 mt-1">
                  {incident.service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Service
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isRefetching && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </div>
            )}
            
            <button
              onClick={() => void reload()}
              disabled={isFetching}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button className="btn-ghost">
              <ExternalLink className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {incident && !["resolved", "closed"].includes(incident.status) && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Quick Actions:</span>
              <div className="flex gap-2">
                <button className="btn-primary text-sm px-3 py-1">
                  Escalate
                </button>
                <button className="btn-secondary text-sm px-3 py-1">
                  Add Note
                </button>
                <button className="btn-secondary text-sm px-3 py-1">
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-6xl">
        <IncidentDetailView state={state} onRetry={() => void reload()} />
      </div>
    </div>
  );
}
