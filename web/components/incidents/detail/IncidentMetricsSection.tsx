"use client";

import { useState, useEffect } from "react";
import type { Incident, TimelineEvent } from "@/types/incident";
import { 
  BarChart3,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCw,
  Settings,
  Maximize2,
  Eye
} from "lucide-react";
import { formatDateTime } from "@/lib/format";

export type IncidentMetricsSectionProps = {
  incident: Incident;
  timeline: TimelineEvent[];
  dashboardUrl?: string;
};

export function IncidentMetricsSection({ incident, timeline, dashboardUrl }: IncidentMetricsSectionProps) {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [timeRange, setTimeRange] = useState<{ from: Date; to: Date } | null>(null);

  useEffect(() => {
    if (!dashboardUrl) {
      setIframeUrl("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Extract start and end times from timeline
    let startTime = new Date(incident.start_time);
    let endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    if (timeline && timeline.length > 0) {
      // Find the earliest and latest timestamps from timeline
      const timelineTimestamps = timeline.map(event => new Date(event.timestamp));
      const earliestTime = new Date(Math.min(...timelineTimestamps.map(t => t.getTime())));
      const latestTime = new Date(Math.max(...timelineTimestamps.map(t => t.getTime())));
      
      // Use incident start time if it's earlier than timeline start
      startTime = incident.start_time < earliestTime.toISOString() ? new Date(incident.start_time) : earliestTime;
      
      // Use latest timeline event as end time, but add buffer time
      endTime = new Date(latestTime.getTime() + 30 * 60 * 1000); // Add 30 minutes buffer
    }

    // Store time range for display
    setTimeRange({ from: startTime, to: endTime });

    // Format timestamps for Grafana (Unix timestamp in milliseconds)
    const from = startTime.getTime();
    const to = endTime.getTime();

    // Build the Grafana URL with time range parameters
    try {
      const url = new URL(dashboardUrl);
      url.searchParams.set('from', from.toString());
      url.searchParams.set('to', to.toString());
      url.searchParams.set('timezone', 'utc');
      url.searchParams.set('refresh', '30s');
      url.searchParams.set('theme', 'light');

      setIframeUrl(url.toString());
    } catch (error) {
      console.error('Invalid dashboard URL:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [incident, timeline, dashboardUrl]);

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by updating src
    const iframe = document.querySelector('iframe[title="Grafana Dashboard"]') as HTMLIFrameElement;
    if (iframe && iframeUrl) {
      iframe.src = iframeUrl;
    }
  };

  if (!dashboardUrl) {
    return (
      <div className="card-elevated">
        <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <BarChart3 className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Metrics & Observability</h2>
              <p className="text-sm text-slate-600">Real-time system metrics during incident</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Dashboard not configured</h3>
            <p className="text-sm text-slate-500 mb-4">
              Configure a Grafana dashboard URL to view metrics for this incident.
            </p>
            <button className="btn-secondary">
              <Settings className="h-4 w-4" />
              Configure Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Metrics & Observability</h2>
            <p className="text-sm text-slate-600">
              {timeRange 
                ? `${formatDateTime(timeRange.from.toISOString())} - ${formatDateTime(timeRange.to.toISOString())}`
                : formatDateTime(incident.start_time)
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          
          <button
            onClick={handleReload}
            disabled={isLoading}
            className="btn-ghost"
            title="Reload dashboard"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          {iframeUrl && (
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Timeline Sync Info */}
      {timeline && timeline.length > 0 && (
        <div className="px-6 py-3 bg-blue-50/30 border-b border-blue-200/30">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Clock className="h-4 w-4" />
            <span>Dashboard synchronized with {timeline.length} timeline events</span>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="relative bg-slate-50/30">
        {hasError ? (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">Dashboard loading failed</h3>
              <p className="text-sm text-slate-500 mb-4">
                Unable to load the Grafana dashboard. Check the URL configuration.
              </p>
              <button 
                onClick={handleReload}
                className="btn-secondary"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-slate-700">Loading dashboard...</span>
                </div>
              </div>
            )}
            
            <iframe
              src={iframeUrl}
              className="w-full border-0"
              style={{ height: '500px', minHeight: '400px' }}
              title="Grafana Dashboard"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Real-time metrics</span>
            </div>
            {timeRange && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.round((timeRange.to.getTime() - timeRange.from.getTime()) / (1000 * 60))} min timespan
                </span>
              </div>
            )}
          </div>
          
          {iframeUrl && (
            <a
              href={iframeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <Maximize2 className="h-4 w-4" />
              View full dashboard
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
