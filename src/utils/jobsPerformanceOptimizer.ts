/**
 * Jobs Page Performance Optimizer
 * Comprehensive optimizations for the jobs page to improve loading speed
 */

import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Critical resource preloading for jobs page
export const preloadJobsPageResources = () => {
  console.log('🚀 Preloading jobs page resources...');
  
  // Preload critical images
  const criticalImages = [
    '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png', // TalentXcel logo
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Jobs data prefetching and caching strategy
export class JobsDataOptimizer {
  private queryClient: QueryClient;
  private prefetchBatch = 3; // Prefetch 3 pages ahead

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Prefetch popular job filters
  async prefetchPopularFilters() {
    const popularFilters = [
      { search: '', location: 'Bangalore', employment_type: [], experience_level: [] },
      { search: '', location: 'Mumbai', employment_type: [], experience_level: [] },
      { search: '', location: 'Delhi', employment_type: [], experience_level: [] },
      { search: 'React', location: '', employment_type: [], experience_level: [] },
      { search: 'Python', location: '', employment_type: [], experience_level: [] },
      { search: '', location: '', employment_type: ['full-time'], experience_level: [] },
      { search: '', location: '', employment_type: [], experience_level: ['entry-level'] },
    ];

    console.log('🔄 Prefetching popular job filters...');
    
    const prefetchPromises = popularFilters.map(filters => 
      this.queryClient.prefetchQuery({
        queryKey: ['jobs-paginated-optimized', filters, 'created_at', 1],
        queryFn: async () => {
          const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
            p_page: 1,
            p_limit: 20,
            p_search: filters.search || '',
            p_location: filters.location || '',
            p_employment_types: filters.employment_type,
            p_experience_levels: filters.experience_level,
            p_min_salary: 0,
            p_max_salary: 0,
            p_is_remote: false,
            p_skills: [],
            p_sort_by: 'created_at'
          });

          if (error) throw error;
          return data;
        },
        staleTime: 60000, // 1 minute
      })
    );

    await Promise.allSettled(prefetchPromises);
    console.log('✅ Popular filters prefetched');
  }

  // Prefetch job categories and trending data
  async prefetchJobMetadata() {
    console.log('🔄 Prefetching job metadata...');
    
    const metadataPromises = [
      this.queryClient.prefetchQuery({
        queryKey: ['job-categories'],
        queryFn: async () => {
          const { data, error } = await supabase.rpc('get_job_categories_with_counts');
          if (error) throw error;
          return data;
        },
        staleTime: 300000, // 5 minutes
      }),
      
      this.queryClient.prefetchQuery({
        queryKey: ['trending-locations'],
        queryFn: async () => {
          const { data, error } = await supabase.rpc('get_trending_job_locations');
          if (error) throw error;
          return data;
        },
        staleTime: 3600000, // 1 hour
      }),

      this.queryClient.prefetchQuery({
        queryKey: ['job-stats-realtime'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('jobs')
            .select('id, is_featured, job_status, created_at, company_name')
            .eq('is_active', true)
            .limit(100); // Limit for performance

          if (error) throw error;
          
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          return {
            totalJobs: data.length,
            featuredJobs: data.filter(job => job.is_featured).length,
            openJobs: data.filter(job => job.job_status === 'open').length,
            jobsToday: data.filter(job => new Date(job.created_at) >= today).length,
          };
        },
        staleTime: 60000, // 1 minute
      })
    ];

    await Promise.allSettled(metadataPromises);
    console.log('✅ Job metadata prefetched');
  }

  // Intelligent pagination prefetching
  async prefetchNextPages(currentFilters: any, currentPage: number) {
    if (currentPage >= 10) return; // Don't prefetch too far ahead
    
    const prefetchPromises = [];
    
    for (let i = 1; i <= this.prefetchBatch; i++) {
      const nextPage = currentPage + i;
      
      prefetchPromises.push(
        this.queryClient.prefetchQuery({
          queryKey: ['jobs-paginated-optimized', currentFilters, 'created_at', nextPage],
          queryFn: async () => {
            const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
              p_page: nextPage,
              p_limit: 20,
              p_search: currentFilters.search || '',
              p_location: currentFilters.location || '',
              p_employment_types: currentFilters.employment_type || [],
              p_experience_levels: currentFilters.experience_level || [],
              p_min_salary: currentFilters.salary_min || 0,
              p_max_salary: currentFilters.salary_max || 0,
              p_is_remote: currentFilters.is_remote || false,
              p_skills: currentFilters.skills || [],
              p_sort_by: 'created_at'
            });

            if (error) throw error;
            return data;
          },
          staleTime: 60000, // 1 minute
        })
      );
    }

    await Promise.allSettled(prefetchPromises);
  }
}

// Image optimization for job listings
export const optimizeJobImages = () => {
  // Use Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load high-res image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px', // Start loading 50px before entering viewport
      threshold: 0.1
    }
  );

  // Observe all job images
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });

  return imageObserver;
};

// Bundle optimization - preload critical components
// NOTE: These components are statically imported by Jobs.tsx / MobileJobs.tsx,
// so they are already part of the main bundle. Adding dynamic imports here
// caused Vite warnings ("dynamic import will not move module into another chunk")
// and prevented proper code splitting. This is now a no-op kept for API
// compatibility with existing callers.
export const preloadJobsComponents = async () => {
  return;
};

// Memory optimization for large job lists
export class JobsMemoryManager {
  private jobsCache = new Map<string, any>();
  private maxCacheSize = 1000; // Maximum jobs to keep in memory

  cacheJob(jobId: string, jobData: any) {
    if (this.jobsCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const firstKey = this.jobsCache.keys().next().value;
      this.jobsCache.delete(firstKey);
    }
    
    this.jobsCache.set(jobId, jobData);
  }

  getCachedJob(jobId: string) {
    return this.jobsCache.get(jobId);
  }

  clearCache() {
    this.jobsCache.clear();
  }
}

// Performance monitoring for jobs page
export class JobsPerformanceMonitor {
  private metrics = {
    pageLoadTime: 0,
    jobsLoadTime: 0,
    filterApplyTime: 0,
    searchTime: 0
  };

  private startTime = 0;

  startTiming() {
    this.startTime = performance.now();
  }

  recordPageLoad() {
    this.metrics.pageLoadTime = performance.now() - this.startTime;
  }

  recordJobsLoad() {
    this.metrics.jobsLoadTime = performance.now() - this.startTime;
  }

  recordFilterApply() {
    this.metrics.filterApplyTime = performance.now() - this.startTime;
  }

  recordSearch() {
    this.metrics.searchTime = performance.now() - this.startTime;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Jobs Page Performance Metrics');
      console.log(`Page Load: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
      console.log(`Jobs Load: ${this.metrics.jobsLoadTime.toFixed(2)}ms`);
      console.log(`Filter Apply: ${this.metrics.filterApplyTime.toFixed(2)}ms`);
      console.log(`Search: ${this.metrics.searchTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  }
}

// Initialize all jobs page optimizations
export const initializeJobsOptimizations = async (queryClient: QueryClient) => {
  console.log('🚀 Initializing jobs page optimizations...');
  
  // Preload critical resources
  preloadJobsPageResources();
  
  // Create data optimizer
  const dataOptimizer = new JobsDataOptimizer(queryClient);
  
  // Preload components in parallel
  const optimizationPromises = [
    preloadJobsComponents(),
    dataOptimizer.prefetchJobMetadata(),
    dataOptimizer.prefetchPopularFilters()
  ];
  
  await Promise.allSettled(optimizationPromises);
  
  // Setup image optimization
  optimizeJobImages();
  
  console.log('✅ Jobs page optimizations complete');
  
  return {
    dataOptimizer,
    memoryManager: new JobsMemoryManager(),
    performanceMonitor: new JobsPerformanceMonitor()
  };
};