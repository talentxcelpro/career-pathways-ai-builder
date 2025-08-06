import React, { useEffect, useRef, useState, useCallback } from 'react';
import { JobCardOptimized } from './JobCardOptimized';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronUp } from 'lucide-react';
import { SocialPagination } from '@/components/ui/social-pagination';

interface JobsListOptimizedProps {
  jobs: any[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  mode: 'pagination' | 'infinite';
  onLoadMore?: () => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  savedJobs?: string[];
  onSaveJob?: (jobId: string) => void;
}

export const JobsListOptimized: React.FC<JobsListOptimizedProps> = ({
  jobs,
  totalCount,
  hasMore,
  isLoading,
  isFetchingNextPage = false,
  mode,
  onLoadMore,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  savedJobs = [],
  onSaveJob
}) => {
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll intersection observer
  const lastJobElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && mode === 'infinite') {
        console.log('🔄 Loading more jobs via intersection observer');
        onLoadMore?.();
      }
    }, {
      rootMargin: '100px' // Load more when 100px before reaching the end
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasMore, mode, onLoadMore]);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-16 w-full bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
            <div className="h-6 w-14 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading && jobs.length === 0) {
    return <LoadingSkeleton />;
  }

  if (!isLoading && jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No jobs found</div>
        <div className="text-gray-400 text-sm">Try adjusting your filters or search terms</div>
      </div>
    );
  }

  const featuredJobs = jobs.filter(job => job.is_featured);
  const regularJobs = jobs.filter(job => !job.is_featured);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Job Stats */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-600">
          Showing {jobs.length} of {totalCount.toLocaleString()} jobs
        </div>
        {mode === 'pagination' && (
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="text-yellow-500">⭐</span>
            Featured Jobs
          </div>
          <div className="space-y-4">
            {featuredJobs.map((job, index) => (
              <JobCardOptimized
                key={job.id}
                job={job}
                onSave={onSaveJob}
                isSaved={savedJobs.includes(job.id)}
                priority={index < 3 ? 'high' : 'normal'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Jobs Section */}
      {regularJobs.length > 0 && (
        <div className="space-y-4">
          {featuredJobs.length > 0 && (
            <div className="text-lg font-semibold text-gray-900">All Jobs</div>
          )}
          <div className="space-y-4">
            {regularJobs.map((job, index) => {
              // Add ref to last job for infinite scroll
              const isLastJob = mode === 'infinite' && index === regularJobs.length - 1;
              
              return (
                <div
                  key={job.id}
                  ref={isLastJob ? lastJobElementRef : undefined}
                >
                  <JobCardOptimized
                    job={job}
                    onSave={onSaveJob}
                    isSaved={savedJobs.includes(job.id)}
                    priority={index < 5 ? 'high' : 'normal'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading States */}
      {mode === 'infinite' && (isFetchingNextPage || (hasMore && !isLoading)) && (
        <div ref={loadingRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more jobs...
            </div>
          ) : hasMore ? (
            <Button 
              onClick={onLoadMore} 
              variant="outline" 
              className="bg-white hover:bg-gray-50"
            >
              Load More Jobs
            </Button>
          ) : null}
        </div>
      )}

      {/* Pagination */}
      {mode === 'pagination' && totalPages > 1 && (
        <div className="flex justify-center py-6">
          <SocialPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={onPageChange || (() => {})}
          />
        </div>
      )}

      {/* End of results message */}
      {mode === 'infinite' && !hasMore && jobs.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">You've reached the end of job listings</div>
          <div className="text-xs mt-1">
            {totalCount.toLocaleString()} jobs viewed
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90"
          size="sm"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};