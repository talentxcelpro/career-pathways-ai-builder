import React from 'react';

/**
 * Elegant page skeleton fallback for route Suspense.
 * Maintains container height and structure to prevent Cumulative Layout Shift (CLS).
 */
export const PageFallbackSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header bar placeholder */}
      <div className="space-y-3">
        <div className="h-8 bg-muted/60 rounded-lg w-1/3 max-w-xs" />
        <div className="h-4 bg-muted/40 rounded w-2/3 max-w-md" />
      </div>

      {/* Hero / stats placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/30 border border-border/40 p-4 space-y-3">
            <div className="h-4 bg-muted/60 rounded w-1/2" />
            <div className="h-8 bg-muted/40 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 border border-border/40 p-6 space-y-3">
              <div className="h-5 bg-muted/60 rounded w-2/5" />
              <div className="h-4 bg-muted/40 rounded w-full" />
              <div className="h-4 bg-muted/30 rounded w-4/5" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-xl bg-muted/30 border border-border/40 p-6 space-y-3">
            <div className="h-5 bg-muted/60 rounded w-1/2" />
            <div className="h-4 bg-muted/40 rounded w-full" />
            <div className="h-4 bg-muted/30 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};
