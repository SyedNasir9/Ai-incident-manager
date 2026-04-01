import type { TimelineEvent } from "@/types/incident";
import { 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Zap,
  MessageSquare,
  Settings,
  User,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { useState } from "react";

export type IncidentTimelineSectionProps = {
  events: TimelineEvent[];
};

function getEventIcon(event_type: string, description: string) {
  const desc = description.toLowerCase();
  
  if (event_type === 'status_change') {
    if (desc.includes('investigating')) return AlertTriangle;
    if (desc.includes('mitigating')) return Zap;
    if (desc.includes('monitoring')) return Eye;
    if (desc.includes('resolved')) return CheckCircle2;
  }
  
  if (event_type === 'note' || desc.includes('comment') || desc.includes('note')) {
    return MessageSquare;
  }
  
  if (desc.includes('assign') || desc.includes('escalat')) {
    return User;
  }
  
  if (desc.includes('config') || desc.includes('setting')) {
    return Settings;
  }
  
  return Activity;
}

function getEventColor(event_type: string, description: string) {
  const desc = description.toLowerCase();
  
  if (event_type === 'status_change') {
    if (desc.includes('investigating')) return 'text-red-600 bg-red-50 border-red-200';
    if (desc.includes('mitigating')) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (desc.includes('monitoring')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (desc.includes('resolved')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
  
  if (event_type === 'note') return 'text-purple-600 bg-purple-50 border-purple-200';
  
  return 'text-slate-600 bg-slate-50 border-slate-200';
}

export function IncidentTimelineSection({ events }: IncidentTimelineSectionProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<string>('all');
  
  // Sort and filter events
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const filteredEvents = filter === 'all' 
    ? sortedEvents 
    : sortedEvents.filter(event => event.event_type === filter);

  const eventTypes = [...new Set(events.map(e => e.event_type))];

  return (
    <div className="card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <p className="text-sm text-slate-600">
              {filteredEvents.length} of {events.length} events
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Events</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {sortOrder === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            {sortOrder === 'desc' ? 'Newest' : 'Oldest'} First
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">No timeline events</h3>
            <p className="text-sm text-slate-500">
              {filter === 'all' 
                ? "No events have been recorded for this incident yet."
                : `No ${filter.replace(/_/g, ' ')} events found.`
              }
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200"></div>
            
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const Icon = getEventIcon(event.event_type, event.description);
                const colorClasses = getEventColor(event.event_type, event.description);
                
                return (
                  <div key={`${event.timestamp}-${index}`} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-lg border border-slate-200/60 p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                                {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatDateTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-900 leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
