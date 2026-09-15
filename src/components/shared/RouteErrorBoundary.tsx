import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  name?: string;       // route/feature name for debugging
  fallback?: ReactNode; // optional custom fallback
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-route error boundary. Catches errors in a specific route subtree
 * so a crash in Jobs or Network doesn't take down the entire shell.
 *
 * Usage:
 *   <RouteErrorBoundary name="Jobs">
 *     <Suspense fallback={<JobsSkeleton />}>
 *       <JobsPage />
 *     </Suspense>
 *   </RouteErrorBoundary>
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log for monitoring (replace with Sentry/DataDog in production)
    console.error(`[RouteErrorBoundary][${this.props.name ?? 'unknown'}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="text-xl font-black text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-1">
              {this.props.name
                ? `The ${this.props.name} section encountered an error.`
                : 'This section encountered an unexpected error.'}
            </p>

            {/* Error detail (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 mb-4 p-3 rounded-xl bg-red-50 text-left text-[10px] text-red-700 overflow-auto max-h-28 font-mono">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1 h-11 rounded-2xl font-bold border-slate-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={this.handleReset}
                className="flex-1 h-11 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Return to home →
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
