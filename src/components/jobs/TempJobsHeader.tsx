// Simple component to temporarily replace the broken sections
import React from 'react';

export const TempJobsHeader = () => {
  return (
    <div className="bg-background/80 backdrop-blur-xl border-b border-border/20 sticky top-0 z-40 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-foreground">Job Search</h1>
      </div>
    </div>
  );
};