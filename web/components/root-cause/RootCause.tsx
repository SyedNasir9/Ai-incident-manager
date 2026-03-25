import { Fragment, type ReactNode } from "react";
import { highlightRootCauseText } from "@/components/root-cause/highlightRootCauseText";

/**
 * Props for RootCause component
 */
export interface RootCauseProps {
  /** Raw root-cause text from API (may be empty) */
  text: string;
  
  /**
   * Optional phrases to emphasize (case-insensitive). Longer phrases are matched
   * before shorter ones to reduce partial overlaps.
   */
  highlightPhrases?: string[];
  
  /** Card heading */
  title?: string;
  
  /** Short line under the title. Omit for default; pass "" to hide. */
  subtitle?: string;
  
  /** Empty state message */
  emptyLabel?: string;
  
  /** Additional CSS classes for styling */
  className?: string;
  
  /** For `aria-labelledby` on a parent section */
  headingId?: string;
  
  /** Whether to show confidence indicator */
  showConfidence?: boolean;
  
  /** Whether to show analysis metadata */
  showMetadata?: boolean;
}

const defaultSubtitle = "AI-generated analysis";

/**
 * Enhanced RootCause component with enterprise features
 */
export function RootCause({
  text,
  highlightPhrases,
  title = "Root cause",
  subtitle,
  emptyLabel = "No root cause has been recorded yet.",
  className = "",
  headingId = "root-cause-heading",
  showConfidence = true,
  showMetadata = false,
}: RootCauseProps) {
  const trimmed = text.trim();
  const hasContent = trimmed.length > 0;
  const subtitleText = subtitle === undefined ? defaultSubtitle : subtitle;
  
  // Calculate word count for metadata
  const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 WPM reading speed

  return (
    <article
      className={`rounded-lg border border-slate-200/90 bg-white shadow-sm ${className}`.trim()}
      aria-labelledby={headingId}
    >
      {/* Header */}
      <header className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 id={headingId} className="text-sm font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {showMetadata && hasContent && (
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{estimatedReadTime} min read</span>
            </div>
          )}
        </div>
        {subtitleText ? (
          <p className="mt-1 text-xs font-medium text-slate-500">{subtitleText}</p>
        ) : null}
      </header>

      {/* Content */}
      <div className="px-5 py-5">
        {hasContent ? (
          <div className="space-y-4">
            {/* Main content with highlighting */}
            <div className="max-w-prose border-l-2 border-slate-200/80 pl-4">
              <p className="whitespace-pre-wrap text-base leading-[1.65] text-slate-800">
                {highlightRootCauseText(trimmed, highlightPhrases)}
              </p>
            </div>
            
            {/* Confidence indicator */}
            {showConfidence && (
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 00-8 8 0 018 8zm3.707-3.293a1 1 0 00-1.414 1.414 0 00-.293.707L10 14.586l-3.293 3.293a1 1 0 01.414 1.414 0 00.293-.707L10 16.586l3.293 3.293a1 1 0 01.414 1.414 0 00.293.707z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">High Confidence</span>
                </div>
                <div className="text-xs text-slate-500">
                  Analysis based on incident patterns and historical data
                </div>
              </div>
            )}
            
            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition-colors">
                Copy Analysis
              </button>
              <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md transition-colors">
                Export PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2.5L5.5 6.5l7 7h6l-6-6z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-600">{emptyLabel}</h3>
            <p className="text-sm text-slate-500 mt-2">
              Root cause analysis will appear here once the incident has been processed by the AI system.
            </p>
          </div>
        )}
      </div>

      {/* Footer with timestamp */}
      {hasContent && (
        <footer className="border-t border-slate-100 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Analysis generated</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </footer>
      )}
    </article>
  );
}

/**
 * Compact RootCause variant for dashboard views
 */
export function CompactRootCause({ 
  text, 
  className = "" 
}: { 
  text: string; 
  className?: string 
}) {
  return (
    <RootCause 
      text={text}
      className={className}
      showConfidence={false}
      showMetadata={false}
      emptyLabel="Analysis pending"
    />
  );
}

/**
 * RootCause with loading state
 */
export function RootCauseWithLoading({ 
  className = "" 
}: { 
  className?: string 
}) {
  return (
    <article className={`rounded-lg border border-slate-200/90 bg-white p-8 ${className}`}>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 border-t-transparent"></div>
        <span className="ml-3 text-sm text-slate-600">Analyzing root cause...</span>
      </div>
    </article>
  );
}

/**
 * RootCause with error state
 */
export function RootCauseWithError({ 
  error, 
  className = "" 
}: { 
  error: string; 
  className?: string 
}) {
  return (
    <article className={`rounded-lg border border-red-200/90 bg-white p-8 ${className}`}>
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2.5L5.5 6.5l7 7h6l-6-6z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-red-600">Analysis Error</h3>
      </div>
      <p className="text-sm text-red-600">{error}</p>
      <div className="mt-4">
        <button 
          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry Analysis
        </button>
      </div>
    </article>
  );
}
