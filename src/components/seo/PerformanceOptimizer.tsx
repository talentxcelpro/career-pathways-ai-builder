
import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useLazyComponentLoader } from '@/hooks/useDynamicImports';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';

interface PerformanceOptimizerProps {
  component: 'jobs-location' | 'jobs-role' | 'jobs-skill' | 'companies-location' | 'courses-category' | 'salary-guide';
  preload?: boolean;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ 
  component, 
  preload = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (preload) {
      setIsVisible(true);
      return;
    }

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`seo-component-${component}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [component, preload]);

  // Map component types to import paths
  const getImportPath = (componentType: string): string => {
    switch (componentType) {
      case 'jobs-location':
        return '@/pages/seo/JobsByLocation';
      case 'jobs-role':
        return '@/pages/seo/JobsByRole';
      case 'jobs-skill':
        return '@/pages/seo/JobsBySkill';
      case 'companies-location':
        return '@/pages/seo/CompaniesByLocation';
      case 'courses-category':
        return '@/pages/seo/CoursesByCategory';
      case 'salary-guide':
        return '@/pages/seo/SalaryGuide';
      default:
        return '';
    }
  };

  const {
    component: LazyComponent,
    isLoading,
    error,
    observerRef
  } = useLazyComponentLoader(getImportPath(component), {
    threshold: 0.1,
    rootMargin: '200px',
    triggerOnce: true
  });

  const renderComponent = () => {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-red-600">
            Failed to load component: {error.message}
          </div>
        </div>
      );
    }

    if (isLoading || !LazyComponent) {
      return (
        <div className="min-h-screen p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      );
    }

    return <LazyComponent />;
  };

  return (
    <div 
      ref={observerRef}
      id={`seo-component-${component}`}
      className="min-h-screen"
    >
      <Suspense 
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        {renderComponent()}
      </Suspense>
    </div>
  );
};
