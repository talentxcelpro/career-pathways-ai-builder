import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TrendingContent {
  id: string;
  type: 'post' | 'job' | 'profile' | 'reel';
  engagement_score: number;
  velocity: number;
  trending_since: string;
  content: any;
}

export interface ActivityIndicator {
  user_count: number;
  action: string;
  timestamp: string;
}

export const useSocialProof = () => {
  const { user } = useAuth();

  // Fetch trending content
  const { data: trendingContent = [], isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_content')
        .select('*')
        .order('engagement_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as TrendingContent[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false
  });

  // Fetch real-time activity indicators (safely handle dropped user_activities table)
  const { data: activityIndicators = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['activity-indicators'],
    queryFn: async () => {
      // Legacy user_activities relation dropped in migration; return empty array safely
      return [] as ActivityIndicator[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false
  });

  // Get trending posts
  const getTrendingPosts = () => {
    return trendingContent.filter(item => item.type === 'post').slice(0, 10);
  };

  // Get trending jobs
  const getTrendingJobs = () => {
    return trendingContent.filter(item => item.type === 'job').slice(0, 5);
  };

  // Get most active users count
  const getActiveUsersCount = (): number => {
    return activityIndicators.reduce((sum, indicator) => sum + indicator.user_count, 0);
  };

  // Format activity message
  const formatActivityMessage = (indicator: ActivityIndicator): string => {
    const actions: Record<string, string> = {
      post_like: 'liked posts',
      post_comment: 'commented on posts',
      post_share: 'shared content',
      profile_view: 'viewed profiles',
      job_apply: 'applied to jobs',
      connection_request: 'sent connection requests'
    };

    const action = actions[indicator.action] || indicator.action;
    const count = indicator.user_count;

    if (count === 1) {
      return `1 person just ${action}`;
    } else if (count < 10) {
      return `${count} people ${action} recently`;
    } else {
      return `${count}+ people are actively ${action}`;
    }
  };

  // Check if content is trending
  const isTrending = (contentId: string): boolean => {
    return trendingContent.some(item => item.id === contentId);
  };

  // Get engagement velocity (for FOMO)
  const getEngagementVelocity = (contentId: string): number => {
    const item = trendingContent.find(item => item.id === contentId);
    return item?.velocity || 0;
  };

  return {
    trendingContent,
    activityIndicators,
    isLoading: loadingTrending || loadingActivity,
    getTrendingPosts,
    getTrendingJobs,
    getActiveUsersCount,
    formatActivityMessage,
    isTrending,
    getEngagementVelocity
  };
};
