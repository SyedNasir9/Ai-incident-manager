'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug,
  ExternalLink
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Main Error Card */}
            <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-200">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-red-900">
                      Something went wrong
                    </h1>
                    <p className="text-sm text-red-700 mt-1">
                      The AI Incident Manager encountered an unexpected error
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Error Summary */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h2 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Error Details
                  </h2>
                  <p className="text-sm text-red-800 font-mono">
                    {error?.message || 'An unknown error occurred'}
                  </p>
                  {error?.stack && isDevelopment && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-medium text-red-700 hover:text-red-900">
                        Stack Trace (Development Only)
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="btn-primary flex-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="btn-secondary flex-1"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </button>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Need help?
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>Try these troubleshooting steps:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
                      <li>Clear your browser cache and cookies</li>
                      <li>Check your internet connection</li>
                      <li>Try opening the page in incognito/private mode</li>
                    </ul>
                    {isDevelopment && (
                      <div className="mt-3 pt-2 border-t border-blue-200">
                        <p className="font-medium">Development Mode:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Check the browser console for additional errors</li>
                          <li>Verify all environment variables are set correctly</li>
                          <li>Ensure backend API is running and accessible</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Component Info (Development) */}
                {isDevelopment && errorInfo && this.props.showDetails && (
                  <details className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <summary className="cursor-pointer font-medium text-slate-900 hover:text-slate-700">
                      Component Stack (Development)
                    </summary>
                    <pre className="mt-2 text-xs text-slate-600 overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600">
                  AI Incident Manager v1.0 • If this error persists, please contact support
                </p>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="mt-4 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Application error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorReportingService.captureException(error, errorInfo);
    }
  };

  return { handleError };
}

// Simple error display component
export function ErrorDisplay({ 
  message, 
  onRetry,
  showRetry = true 
}: { 
  message: string; 
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {showRetry && onRetry && (
        <button onClick={onRetry} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}