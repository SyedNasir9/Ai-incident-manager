import { 
  Loader2, 
  Activity, 
  BarChart3, 
  Database,
  Network,
  Server,
  Shield,
  Zap
} from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  progress?: number;
  showDetails?: boolean;
}

const loadingSteps = [
  { icon: Database, label: "Loading incident data", delay: 0 },
  { icon: Network, label: "Analyzing patterns", delay: 200 },
  { icon: BarChart3, label: "Processing metrics", delay: 400 },
  { icon: Shield, label: "Checking security", delay: 600 },
  { icon: Server, label: "Syncing services", delay: 800 },
  { icon: Zap, label: "Optimizing performance", delay: 1000 }
];

export function LoadingScreen({ 
  message = "Loading AI Incident Manager",
  progress,
  showDetails = false 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        {/* Main Loading Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 animate-fade-in">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-lg">
              <Activity className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              AI Incident Manager
            </h1>
            <p className="text-sm text-slate-600">{message}</p>
          </div>
          
          {/* Main Spinner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Bar */}
          {typeof progress === 'number' && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Loading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Loading Steps */}
          {showDetails && (
            <div className="space-y-3">
              {loadingSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = !progress || (progress > (index / loadingSteps.length) * 100);
                const isComplete = progress && progress > ((index + 1) / loadingSteps.length) * 100;
                
                return (
                  <div 
                    key={step.label}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                      isActive ? 'text-slate-900' : 'text-slate-400'
                    }`}
                    style={{ animationDelay: `${step.delay}ms` }}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      isComplete 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{step.label}</span>
                    {isComplete && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-scale-in" />
                    )}
                    {isActive && !isComplete && (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-slate-200/60">
            <p className="text-xs text-slate-500">
              Powered by AI • Real-time Analytics • Enterprise Ready
            </p>
          </div>
        </div>
        
        {/* Loading Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for individual components
export function ComponentSkeleton({ 
  rows = 3, 
  showHeader = true 
}: { 
  rows?: number; 
  showHeader?: boolean; 
}) {
  return (
    <div className="card animate-pulse">
      {showHeader && (
        <div className="p-6 border-b border-slate-200/60">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-slate-100 rounded w-1/3"></div>
        </div>
      )}
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg animate-shimmer"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded animate-shimmer"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3 animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Grid skeleton
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ComponentSkeleton key={i} rows={2} showHeader={false} />
      ))}
    </div>
  );
}