
import React, { Suspense, lazy } from 'react';
import { useEffect, useState } from 'react';

// Lazy load heavy SEO components
const LazyJobsByLocation = lazy(() => import('@/pages/seo/JobsByLocation'));
const LazyJobsByRole = lazy(() => import('@/pages/seo/JobsByRole'));
const LazyJobsBySkill = lazy(() => import('@/pages/seo/JobsBySkill'));
const LazyCompaniesByLocation = lazy(() => import('@/pages/seo/CompaniesByLocation'));
const LazyCoursesByCategory = lazy(() => import('@/pages/seo/CoursesByCategory'));
const LazySalaryGuide = lazy(() => import('@/pages/seo/SalaryGuide'));

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

  const renderComponent = () => {
    if (!isVisible) {
      return (
        <div 
          id={`seo-component-${component}`}
          className="min-h-screen flex items-center justify-center bg-gray-50"
        >
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (component) {
      case 'jobs-location':
        return <LazyJobsByLocation />;
      case 'jobs-role':
        return <LazyJobsByRole />;
      case 'jobs-skill':
        return <LazyJobsBySkill />;
      case 'companies-location':
        return <LazyCompaniesByLocation />;
      case 'courses-category':
        return <LazyCoursesByCategory />;
      case 'salary-guide':
        return <LazySalaryGuide />;
      default:
        return null;
    }
  };

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      {renderComponent()}
    </Suspense>
  );
};
