import { formatDateTime } from "@/lib/format";
import { inlineEmptyBox } from "@/lib/ui-classes";

/**
 * Timeline event data structure
 */
export interface TimelineEvent {
  timestamp: string;
  source: string;
  message: string;
}

/**
 * Props for Timeline component
 */
export interface TimelineProps {
  /** Array of timeline events to display */
  events: TimelineEvent[];
  
  /** Label to show when no events are present */
  emptyLabel?: string;
  
  /** Additional CSS classes for styling */
  className?: string;
  
  /** ARIA label for accessibility */
  "aria-label"?: string;
  
  /** Whether to show source badges */
  showSource?: boolean;
}

/**
 * Sort events by timestamp in ascending order
 */
function sortByTimestampAsc(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    
    // Handle invalid dates
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0;
    }
    
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Reusable Timeline component with enterprise styling
 */
export function Timeline({
  events,
  emptyLabel = "No events to display.",
  className = "",
  "aria-label" = "Timeline",
  showSource = true,
}: TimelineProps) {
  const sortedEvents = sortByTimestampAsc(events);

  if (sortedEvents.length === 0) {
    return (
      <div className={`rounded-lg border border-slate-200/90 bg-white p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l-6 6h12l6-6z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-600">{emptyLabel}</h3>
          </div>
          <p className="text-sm text-slate-500">
            Timeline events will appear here once they are recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200/90 shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900" id="timeline-heading">
          Timeline
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Chronological view of incident events and system activities.
        </p>
      </div>

      {/* Timeline Events */}
      <div className="px-6 py-4">
        <ol 
          className={`relative space-y-6 ${sortedEvents.length > 10 ? 'border-l-2 border-slate-100' : ''}`}
          aria-label={ariaLabel}
          role="list"
        >
          {sortedEvents.map((event, index) => (
            <li 
              key={`${event.timestamp}-${index}`}
              className="relative pb-6 last:pb-0"
            >
              {/* Timeline connector line */}
              {index < sortedEvents.length - 1 && (
                <div 
                  className="absolute left-6 top-8 bottom-0 w-0.5 h-0.5 bg-slate-300 rounded-full"
                  aria-hidden="true"
                />
              )}
              
              {/* Event marker and content */}
              <div className="relative flex items-start space-x-4">
                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <time
                    className="text-xs tabular-nums text-slate-500 font-medium"
                    dateTime={event.timestamp}
                  >
                    {formatDateTime(event.timestamp)}
                  </time>
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  {/* Source badge */}
                  {showSource && event.source && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 mb-2">
                      {event.source.trim()}
                    </span>
                  )}
                  
                  {/* Message */}
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {event.message}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer with event count */}
      <div className="border-t border-slate-100 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {sortedEvents.length} 
            {sortedEvents.length === 1 ? 'event' : 'events'}
          </span>
          <span className="text-slate-400">
            {sortedEvents.length > 0 && ` • Earliest: ${formatDateTime(sortedEvents[0].timestamp)}`}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline component variants for different use cases
 */

/**
 * Compact timeline for dashboard views
 */
export function CompactTimeline({ events, className = "" }: { events: TimelineEvent[]; className?: string }) {
  return (
    <Timeline 
      events={events}
      className={className}
      showSource={false}
      emptyLabel="Recent activity"
    />
  );
}

/**
 * Timeline with loading state
 */
export function TimelineWithLoading({ 
  events, 
  isLoading, 
  className = "" 
}: { 
  events: TimelineEvent[]; 
  isLoading: boolean; 
  className?: string 
}) {
  if (isLoading) {
    return (
      <div className={`rounded-lg border border-slate-200/90 bg-white p-8 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 border-t-transparent"></div>
          <span className="ml-3 text-sm text-slate-600">Loading timeline...</span>
        </div>
      </div>
    );
  }

  return <Timeline events={events} className={className} />;
}

/**
 * Timeline with error state
 */
export function TimelineWithError({ 
  error, 
  className = "" 
}: { 
  error: string; 
  className?: string 
}) {
  return (
    <div className={`rounded-lg border border-red-200/90 bg-white p-8 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2.5L5.5 6.5l7 7h6l-6-6z"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-red-600">Timeline Error</h3>
      </div>
      <p className="text-sm text-red-600">{error}</p>
      <div className="mt-4">
        <button 
          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// Export types for external use
export type { TimelineEvent as TimelineEventType };
export type { TimelineProps as TimelineComponentProps };
