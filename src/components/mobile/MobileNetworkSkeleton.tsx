import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const MobileNetworkSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Story bubbles skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Quick post creation skeleton */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="flex-1 h-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </Card>

      {/* Posts skeleton */}
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} className="p-4 space-y-3">
          {/* Post header */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          
          {/* Post content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Post image placeholder */}
          <Skeleton className="h-48 w-full rounded-lg" />
          
          {/* Post interactions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </Card>
      ))}
    </div>
  );
};