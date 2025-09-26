import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    userGrowthRate: number;
  };
  engagementMetrics: {
    totalPosts: number;
    totalConnections: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  premiumMetrics: {
    premiumUsers: number;
    conversionRate: number;
    totalRevenue: number;
    churnRate: number;
  };
  networkingMetrics: {
    totalEvents: number;
    mentorshipSessions: number;
    communityEngagement: number;
    jobMatches: number;
  };
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('📊 Fetching analytics data...');

      // Mock data for now - in production, this would fetch from analytics tables
      const mockData: AnalyticsData = {
        userMetrics: {
          totalUsers: 12547,
          activeUsers: 8432,
          newUsersToday: 127,
          userGrowthRate: 12.5
        },
        engagementMetrics: {
          totalPosts: 3421,
          totalConnections: 15678,
          averageSessionTime: 24.3,
          bounceRate: 32.1
        },
        premiumMetrics: {
          premiumUsers: 1247,
          conversionRate: 9.9,
          totalRevenue: 45678.90,
          churnRate: 3.2
        },
        networkingMetrics: {
          totalEvents: 156,
          mentorshipSessions: 789,
          communityEngagement: 89.4,
          jobMatches: 2341
        }
      };

      setAnalyticsData(mockData);
      console.log('✅ Analytics data loaded successfully');

    } catch (err: any) {
      console.error('❌ Failed to fetch analytics:', err);
      setError(err.message);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const trackEvent = useCallback(async (eventName: string, properties: Record<string, any> = {}) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('user_activities').insert({
        user_id: user.id,
        activity_type: eventName,
        activity_data: properties,
        timestamp: new Date().toISOString()
      });

      if (error) throw error;
      console.log(`📈 Event tracked: ${eventName}`);

    } catch (err: any) {
      console.error('Failed to track event:', err);
    }
  }, [user]);

  const trackPageView = useCallback(async (page: string) => {
    await trackEvent('page_view', { page, timestamp: Date.now() });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback(async (feature: string, action: string) => {
    await trackEvent('feature_usage', { feature, action, timestamp: Date.now() });
  }, [trackEvent]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analyticsData,
    isLoading,
    error,
    fetchAnalytics,
    trackEvent,
    trackPageView,
    trackFeatureUsage
  };
};