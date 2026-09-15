/**
 * Smart Data Prefetching
 * Intelligently prefetches data based on user behavior patterns
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { multiLevelCache } from '@/utils/multiLevelCache';

interface PrefetchRule {
  trigger: string; // Current route or action
  prefetch: string[]; // Query keys to prefetch
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
}

const PREFETCH_RULES: PrefetchRule[] = [
  // Jobs page -> Prefetch job details for top jobs
  {
    trigger: '/jobs',
    prefetch: ['featured-jobs', 'job-categories'],
    priority: 'high',
  },
  
  // Network page -> Prefetch connections and suggestions
  {
    trigger: '/network',
    prefetch: ['connections', 'connection-suggestions', 'online-users'],
    priority: 'high',
  },

  // Feed page -> Prefetch posts and notifications
  {
    trigger: '/feed',
    prefetch: ['posts', 'notifications', 'trending'],
    priority: 'high',
  },

  // Profile page -> Prefetch user data and connections
  {
    trigger: '/network/people/',
    prefetch: ['profile-connections', 'profile-posts', 'mutual-connections'],
    priority: 'medium',
  },

  // Company page -> Prefetch company jobs and reviews
  {
    trigger: '/companies/',
    prefetch: ['company-jobs', 'company-reviews', 'company-team'],
    priority: 'medium',
  },

  // Applications page -> Prefetch application status
  {
    trigger: '/applications',
    prefetch: ['job-applications', 'application-stats'],
    priority: 'high',
  },
];

interface UserBehaviorPattern {
  route: string;
  actions: string[];
  frequency: number;
  lastVisit: number;
}

class SmartPrefetcher {
  private patterns: Map<string, UserBehaviorPattern> = new Map();
  private prefetchQueue: Set<string> = new Set();
  private isProcessing = false;

  recordVisit(route: string, actions: string[] = []) {
    const existing = this.patterns.get(route);

    if (existing) {
      existing.frequency++;
      existing.lastVisit = Date.now();
      existing.actions = [...new Set([...existing.actions, ...actions])];
    } else {
      this.patterns.set(route, {
        route,
        actions,
        frequency: 1,
        lastVisit: Date.now(),
      });
    }
  }

  getPrefetchPriority(route: string): 'high' | 'medium' | 'low' {
    const pattern = this.patterns.get(route);
    if (!pattern) return 'low';

    // Frequently visited routes get higher priority
    if (pattern.frequency > 10) return 'high';
    if (pattern.frequency > 5) return 'medium';
    return 'low';
  }

  shouldPrefetch(route: string, currentRoute: string): boolean {
    // Don't prefetch same route
    if (route === currentRoute) return false;

    // Check if user frequently visits this route
    const pattern = this.patterns.get(route);
    if (pattern && pattern.frequency > 3) {
      // Check if recently visited (within last 5 minutes)
      const timeSinceVisit = Date.now() - pattern.lastVisit;
      return timeSinceVisit < 5 * 60 * 1000;
    }

    return false;
  }

  async queuePrefetch(queryKey: string, fetcher: () => Promise<any>, priority: 'high' | 'medium' | 'low') {
    const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    
    if (this.prefetchQueue.has(key)) return;
    
    this.prefetchQueue.add(key);

    // Delay based on priority
    const delays = { high: 0, medium: 1000, low: 3000 };
    
    setTimeout(async () => {
      try {
        // Check cache first
        const cached = await multiLevelCache.get(key);
        if (!cached) {
          console.log(`🎯 Prefetching: ${key}`);
          const data = await fetcher();
          await multiLevelCache.set(key, data, {
            ttl: 5 * 60 * 1000,
            priority,
          });
        }
      } catch (error) {
        console.warn('Prefetch failed:', key, error);
      } finally {
        this.prefetchQueue.delete(key);
      }
    }, delays[priority]);
  }

  getFrequentRoutes(limit: number = 5): string[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(p => p.route);
  }
}

const smartPrefetcher = new SmartPrefetcher();

export function useSmartPrefetching(currentRoute: string) {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Record visit
    smartPrefetcher.recordVisit(currentRoute);

    // Find matching prefetch rules
    const matchingRules = PREFETCH_RULES.filter(rule => {
      if (currentRoute.startsWith(rule.trigger)) {
        return !rule.condition || rule.condition();
      }
      return false;
    });

    // Execute prefetch rules
    matchingRules.forEach(rule => {
      rule.prefetch.forEach(queryKey => {
        const key = queryKey;
        
        if (!prefetchedRef.current.has(key)) {
          prefetchedRef.current.add(key);
          
          // Prefetch via React Query
          queryClient.prefetchQuery({
            queryKey: [queryKey],
            staleTime: 5 * 60 * 1000,
          });
        }
      });
    });

    // Clear prefetch tracking after route change
    return () => {
      prefetchedRef.current.clear();
    };
  }, [currentRoute, queryClient]);

  const prefetchData = useCallback(async (
    queryKey: string | string[],
    fetcher: () => Promise<any>,
    options: { priority?: 'high' | 'medium' | 'low' } = {}
  ) => {
    const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
    const priority = options.priority || smartPrefetcher.getPrefetchPriority(currentRoute);
    
    await smartPrefetcher.queuePrefetch(key, fetcher, priority);
  }, [currentRoute]);

  const getFrequentRoutes = useCallback(() => {
    return smartPrefetcher.getFrequentRoutes();
  }, []);

  return {
    prefetchData,
    getFrequentRoutes,
  };
}

export { smartPrefetcher };
