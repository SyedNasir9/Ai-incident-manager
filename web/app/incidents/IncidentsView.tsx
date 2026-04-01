"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  ArrowUpRight,
  Calendar,
  Server,
  Zap,
  TrendingUp,
  Filter,
  SortDesc
} from "lucide-react";

import { ErrorAlert } from "@/components/feedback";
import { TableSkeleton } from "@/components/table";
import { useIncidentsListQuery } from "@/hooks/queries/useIncidentsListQuery";
import { getUserFacingErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Incident } from "@/types/incident";

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    investigating: {
      icon: AlertTriangle,
      className: "badge-investigating",
      label: "Investigating"
    },
    mitigating: {
      icon: Zap,
      className: "badge-mitigating", 
      label: "Mitigating"
    },
    monitoring: {
      icon: Eye,
      className: "badge-monitoring",
      label: "Monitoring"
    },
    resolved: {
      icon: CheckCircle2,
      className: "badge-resolved",
      label: "Resolved"
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    icon: Clock,
    className: "badge-medium",
    label: status.replace(/_/g, " ")
  };

  const Icon = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity?: string }) {
  if (!severity?.trim()) {
    return <span className="text-slate-400 text-sm">—</span>;
  }

  const severityConfig = {
    critical: { className: "badge-critical", label: "Critical" },
    high: { className: "badge-high", label: "High" },
    medium: { className: "badge-medium", label: "Medium" },
    low: { className: "badge-low", label: "Low" }
  };

  const config = severityConfig[severity.toLowerCase() as keyof typeof severityConfig] || {
    className: "badge-medium",
    label: severity
  };

  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
}

function ServiceIcon({ service }: { service: string }) {
  const getServiceIcon = (service: string) => {
    if (service.includes('payment')) return '💳';
    if (service.includes('auth')) return '🔐';
    if (service.includes('database')) return '🗄️';
    if (service.includes('api') || service.includes('gateway')) return '🌐';
    if (service.includes('notification')) return '📬';
    if (service.includes('kubernetes') || service.includes('cluster')) return '☸️';
    if (service.includes('load') || service.includes('balancer')) return '⚖️';
    if (service.includes('cdn') || service.includes('cache')) return '🚀';
    if (service.includes('security')) return '🛡️';
    return '⚙️';
  };

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-lg">
      {getServiceIcon(service)}
    </div>
  );
}

function IncidentCard({ incident, onClick }: { incident: Incident; onClick: (incident: Incident) => void }) {
  const isActive = !["resolved", "closed"].includes(incident.status);
  
  return (
    <div
      onClick={() => onClick(incident)}
      className={`card p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-100 bg-gradient-to-br from-white to-blue-50/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <ServiceIcon service={incident.service} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-lg">
                {incident.service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                #{incident.id}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              <Calendar className="inline h-3 w-3 mr-1" />
              {formatDateTime(incident.start_time)}
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
      </div>

      {/* Status & Severity */}
      <div className="flex items-center gap-3 mb-4">
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
      </div>

      {/* Progress Bar for Active Incidents */}
      {isActive && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Investigation Progress</span>
            <span>
              {incident.status === 'investigating' ? '25%' :
               incident.status === 'mitigating' ? '65%' :
               incident.status === 'monitoring' ? '85%' : '100%'}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                incident.status === 'investigating' ? 'bg-red-400 w-1/4' :
                incident.status === 'mitigating' ? 'bg-amber-400 w-2/3' :
                incident.status === 'monitoring' ? 'bg-blue-400 w-5/6' : 'bg-emerald-400 w-full'
              }`}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Server className="h-3 w-3" />
            <span>Service</span>
          </div>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-600 font-medium">Live</span>
            </div>
          )}
        </div>
        <div className="text-xs">
          View Details →
        </div>
      </div>
    </div>
  );
}

export function IncidentsView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const { data, isPending, isError, error, refetch, isFetching } = useIncidentsListQuery(
    page,
    PAGE_SIZE,
  );

  const onIncidentClick = useCallback(
    (incident: Incident) => {
      router.push(`/incidents/${incident.id}`);
    },
    [router],
  );

  const errorMessage = isError ? getUserFacingErrorMessage(error) : null;

  if (isPending) {
    return (
      <div className="animate-fade-in">
        <TableSkeleton rows={8} columns={4} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="animate-fade-in">
        <ErrorAlert message={errorMessage} onRetry={() => void refetch()} />
      </div>
    );
  }

  const incidents = data?.incidents ?? [];
  const activeIncidents = incidents.filter(i => !["resolved", "closed"].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ["resolved", "closed"].includes(i.status));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'cards' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Table
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Updating...
            </span>
          )}
          <button 
            onClick={() => void refetch()} 
            disabled={isFetching} 
            className="btn-secondary"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-8">
          {/* Active Incidents */}
          {activeIncidents.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Active Incidents
                  </h2>
                </div>
                <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                  {activeIncidents.length}
                </span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onClick={onIncidentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resolved Incidents */}
          {resolvedIncidents.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Recent Resolutions
                  </h2>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                  {resolvedIncidents.length}
                </span>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {resolvedIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onClick={onIncidentClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {incidents.length === 0 && (
            <div className="card p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No incidents found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                When monitoring systems detect issues, incidents will appear here for analysis and resolution.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Table View - You can implement this later if needed */
        <div className="card p-8 text-center">
          <p className="text-slate-500">Table view coming soon...</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / PAGE_SIZE)}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(page * PAGE_SIZE, data.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{data.total}</span>
                {' '}results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(data.total / PAGE_SIZE)}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
