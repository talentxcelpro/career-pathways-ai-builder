import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Skeleton */}
      <Card className="overflow-hidden">
        <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      </Card>

      {/* Trending Carousel Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded animate-pulse" />
          <div className="w-32 h-6 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex-none w-80">
              <CardContent className="p-0">
                <div className="h-32 bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-16 h-5 bg-muted rounded animate-pulse" />
                    <div className="w-20 h-5 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="w-full h-6 bg-muted rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <Card>
        <CardHeader>
          <div className="w-48 h-6 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-10 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-20 h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 bg-muted animate-pulse" />
            <CardHeader>
              <div className="space-y-2">
                <div className="w-full h-6 bg-muted rounded animate-pulse" />
                <div className="w-3/4 h-6 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
                  <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="w-full h-4 bg-muted rounded animate-pulse" />
                <div className="w-full h-4 bg-muted rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-muted rounded animate-pulse" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-16 h-6 bg-muted rounded animate-pulse" />
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="w-12 h-8 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="w-24 h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};