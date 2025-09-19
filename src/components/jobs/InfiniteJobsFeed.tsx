import React, { memo, useMemo, useCallback } from 'react';
import { VirtualizedList } from '@/components/performance/VirtualizedList';
import { JobCard } from '@/components/jobs/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Briefcase, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  experience_level: string;
  is_remote: boolean;
  is_featured: boolean;
  created_at: string;
  posted_at: string;
  skills_required?: string[];
  description?: string;
  external_url?: string;
  seo_slug?: string;
  applications_count?: number;
  views_count?: number;
  companies?: {
    id: string;
    name: string;
    logo_url?: string;
    industry?: string;
    is_verified?: boolean;
  };
}

interface InfiniteJobsFeedProps {
  jobs: Job[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isFetchingNextPage: boolean;
  onRefresh: () => void;
  onSaveJob?: (jobId: string) => void;
  savedJobs?: string[];
  className?: string;
  showHeader?: boolean;
}

const ITEM_HEIGHT = 350; // Job card height
const CONTAINER_HEIGHT = 700; // Container height

export const InfiniteJobsFeed = memo<InfiniteJobsFeedProps>(({
  jobs,
  isLoading,
  isError,
  error,
  loadMoreRef,
  isFetchingNextPage,
  onRefresh,
  onSaveJob,
  savedJobs = [],
  className,
  showHeader = true
}) => {
  const renderJob = useCallback((job: Job, index: number) => (
    <div key={job.id} className="p-3">
      <JobCard 
        job={{
          ...job,
          description: job.description || 'No description available',
          company: job.companies ? {
            id: job.companies.id,
            name: job.companies.name,
            logo_url: job.companies.logo_url,
            industry: job.companies.industry
          } : undefined
        }}
        onSave={onSaveJob ? () => onSaveJob(job.id) : undefined}
        isSaved={savedJobs.includes(job.id)}
      />
    </div>
  ), [onSaveJob, savedJobs]);

  const memoizedJobs = useMemo(() => jobs, [jobs]);

  if (isLoading && memoizedJobs.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-white">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load jobs: {error?.message || 'Unknown error'}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (memoizedJobs.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <div className="mb-4">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No jobs found</p>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
          </div>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Jobs
          </Button>
        </div>
      </div>
    );
  }

  const featuredJobs = memoizedJobs.filter(job => job.is_featured);
  const recentJobs = memoizedJobs.filter(job => {
    const postedDate = new Date(job.posted_at || job.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return postedDate >= weekAgo;
  });

  return (
    <div className={className}>
      {showHeader && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Available Jobs
              </CardTitle>
              <div className="flex gap-2">
                {featuredJobs.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    {featuredJobs.length} Featured
                  </Badge>
                )}
                {recentJobs.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {recentJobs.length} This Week
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {memoizedJobs.length} opportunities matching your criteria
            </p>
          </CardHeader>
        </Card>
      )}
      
      <VirtualizedList
        items={memoizedJobs}
        itemHeight={ITEM_HEIGHT}
        containerHeight={CONTAINER_HEIGHT}
        renderItem={renderJob}
        className="w-full"
        overscan={2}
      />
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-6 text-center">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Loading more jobs...</span>
          </div>
        )}
      </div>
    </div>
  );
});

InfiniteJobsFeed.displayName = 'InfiniteJobsFeed';