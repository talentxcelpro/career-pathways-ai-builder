import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionSkeletonProps {
  isMobile?: boolean;
}

export const SubscriptionSkeleton: React.FC<SubscriptionSkeletonProps> = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {/* Mobile Header Skeleton */}
        <div className="text-center space-y-3">
          <div className="h-6 bg-gray-200 rounded-full w-32 mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-32 mx-auto"></div>
        </div>

        {/* Mobile Cards Skeleton */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full animate-pulse">
      {/* Desktop Header Skeleton */}
      <div className="text-center mb-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto"></div>
        <div className="h-12 bg-gray-200 rounded w-96 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
        <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto"></div>
        
        <div className="flex justify-center items-center space-x-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Card key={i} className={`${i === 2 ? 'md:scale-110' : ''} border border-gray-200`}>
            <CardContent className="p-8">
              {/* Popular badge for middle card */}
              {i === 2 && (
                <div className="h-6 bg-gray-200 rounded-full w-32 mx-auto mb-4"></div>
              )}
              
              {/* Header */}
              <div className="text-center mb-8 space-y-4">
                <div className="w-20 h-20 bg-gray-200 rounded-3xl mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-full w-24 mx-auto"></div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div>
                </div>
                
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="h-12 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};