import { 
  Search,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download
} from "lucide-react";

export type IncidentRootCauseSectionProps = {
  text: string;
  /** Optional phrases to draw attention to in the explanation */
  highlightPhrases?: string[];
};

export function IncidentRootCauseSection({ text, highlightPhrases }: IncidentRootCauseSectionProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "root-cause-analysis.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Root Cause Analysis</h2>
            <p className="text-sm text-slate-600">AI-generated analysis and recommendations</p>
          </div>
        </div>
        
        {text && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-ghost"
              title="Copy analysis"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDownload}
              className="btn-ghost"
              title="Download analysis"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!text ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">No analysis available</h3>
            <p className="text-sm text-slate-500 mb-4">
              Root cause analysis has not been generated for this incident yet.
            </p>
            <button className="btn-primary">
              <Brain className="h-4 w-4" />
              Generate Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Quality Indicator */}
            <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-200/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Analysis Complete</p>
                <p className="text-xs text-emerald-700">AI has processed incident data and generated insights</p>
              </div>
            </div>

            {/* Main Analysis */}
            <div className="prose prose-sm max-w-none">
              <div className="bg-white rounded-lg p-6 border border-slate-200/60">
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                  {highlightPhrases && highlightPhrases.length > 0 ? (
                    // Simple highlighting - replace this with more sophisticated highlighting if needed
                    text.split(new RegExp(`(${highlightPhrases.join('|')})`, 'gi')).map((part, index) =>
                      highlightPhrases.some(phrase => part.toLowerCase() === phrase.toLowerCase()) ? (
                        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    )
                  ) : (
                    text
                  )}
                </div>
              </div>
            </div>

            {/* Action Items (if we can extract them) */}
            {text.toLowerCase().includes('recommend') || text.toLowerCase().includes('suggest') ? (
              <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Key Recommendations</h3>
                </div>
                <p className="text-xs text-blue-700">
                  Review the analysis above for specific recommendations and action items.
                </p>
              </div>
            ) : null}

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-200/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-800">
                  <strong>AI-Generated Analysis:</strong> This root cause analysis was generated by AI based on available incident data. 
                  Please validate findings and recommendations with your engineering team before implementing changes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
