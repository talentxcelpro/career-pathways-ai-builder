import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-3 animate-fade-in">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="p-4 sm:p-6 border rounded-lg space-y-4 animate-fade-in">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 animate-fade-in">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-3 sm:p-6 border rounded-lg space-y-2">
        <Skeleton className="h-4 w-16 sm:w-24" />
        <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
        <Skeleton className="h-3 w-20 sm:w-32" />
      </div>
    ))}
  </div>
);

export function MobileCareerPassportSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Mobile Header Skeleton */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Mobile Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          
          {/* Mobile Score Cards */}
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile Tabs Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex space-x-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-md flex-shrink-0" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MobileMetricCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="transition-all hover-scale">
          <CardContent className="p-3 text-center">
            <Skeleton className="w-8 h-8 rounded-full mx-auto mb-2" />
            <Skeleton className="h-6 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MobileAchievementSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MobileLeaderboardSkeleton() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
          <Skeleton className="w-6 h-6 text-center bg-muted" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}