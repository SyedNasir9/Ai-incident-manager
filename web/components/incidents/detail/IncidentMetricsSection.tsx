"use client";

import { useState, useEffect } from "react";
import type { Incident, TimelineEvent } from "@/types/incident";

export type IncidentMetricsSectionProps = {
  incident: Incident;
  timeline: TimelineEvent[];
  dashboardUrl?: string;
};

export function IncidentMetricsSection({ incident, timeline, dashboardUrl }: IncidentMetricsSectionProps) {
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<{ from: Date; to: Date } | null>(null);

  useEffect(() => {
    if (!dashboardUrl) {
      setIframeUrl("");
      setIsLoading(false);
      return;
    }

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
    const url = new URL(dashboardUrl);
    url.searchParams.set('from', from.toString());
    url.searchParams.set('to', to.toString());
    url.searchParams.set('timezone', 'utc');
    url.searchParams.set('refresh', '30s'); // Auto-refresh every 30 seconds

    setIframeUrl(url.toString());
    setIsLoading(false);
  }, [incident, timeline, dashboardUrl]);

  if (!dashboardUrl) {
    return (
      <div className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Metrics & Observability</h3>
        <div className="text-center py-8 text-slate-500">
          <p className="mb-2">No Grafana dashboard configured</p>
          <p className="text-sm">Configure a dashboard URL to view metrics for this incident.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Metrics & Observability</h3>
        <p className="text-sm text-slate-600 mt-1">
          Viewing metrics for incident timeframe: {timeRange ? `${timeRange.from.toLocaleString()} - ${timeRange.to.toLocaleString()}` : new Date(incident.start_time).toLocaleString()}
        </p>
        {timeline && timeline.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Time range synchronized with incident timeline events
          </p>
        )}
      </div>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-slate-500">Loading dashboard...</div>
          </div>
        )}
        <iframe
          src={iframeUrl}
          className="w-full h-96 border-0"
          style={{ minHeight: '400px' }}
          title="Grafana Dashboard"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            console.error('Failed to load Grafana dashboard');
          }}
        />
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Dashboard filtered to incident timeframe</span>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}
