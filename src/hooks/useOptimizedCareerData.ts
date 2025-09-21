import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface CareerMetrics {
  profileCompletion: number;
  jobApplications: number;
  connections: number;
  skillsAdded: number;
  coursesCompleted: number;
  postsCreated: number;
  achievementsEarned: number;
  totalTXCEarned: number;
  loginStreak: number;
  applicationStreak: number;
  lastActivityDate: string;
}

interface CareerInsights {
  career_readiness_score: number;
  market_competitiveness_score: number;
  industry_percentile: number;
  strengths: string[];
  improvement_areas: string[];
  next_actions: string[];
  ai_recommendations: any[];
}

export function useOptimizedCareerData() {
  const { user } = useAuth();

  // Fetch career passport data with optimized query
  const { data: careerData, isLoading, error } = useQuery({
    queryKey: ['optimized-career-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Single query to get all career-related data
      const [passportResponse, profileResponse, connectionsResponse] = await Promise.all([
        supabase
          .from('career_passport')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, headline, location, profile_picture_url')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted')
      ]);

      const passport = passportResponse.data;
      const profile = profileResponse.data;
      const connectionsCount = connectionsResponse.data?.length || 0;

      // Calculate profile completion
      let profileCompletion = 0;
      if (profile?.full_name) profileCompletion += 25;
      if (profile?.headline) profileCompletion += 25;
      if (profile?.location) profileCompletion += 25;
      if (profile?.profile_picture_url) profileCompletion += 25;

      return {
        passport,
        profile,
        metrics: {
          profileCompletion,
          jobApplications: passport?.jobs_applied_count || 0,
          connections: connectionsCount,
          skillsAdded: 0,
          coursesCompleted: passport?.tests_completed_count || 0,
          postsCreated: 0,
          achievementsEarned: 0,
          totalTXCEarned: 0,
          loginStreak: 0,
          applicationStreak: 0,
          lastActivityDate: new Date().toISOString()
        } as CareerMetrics,
        insights: {
          career_readiness_score: passport?.career_readiness_score || profileCompletion,
          market_competitiveness_score: passport?.market_competitiveness_score || Math.min((passport?.jobs_applied_count || 0) * 10 + connectionsCount * 5, 100),
          industry_percentile: Math.min(profileCompletion + (passport?.tests_completed_count || 0) * 20, 95),
          strengths: profileCompletion > 80 ? ['Complete Profile', 'Active User'] : [],
          improvement_areas: profileCompletion < 50 ? ['Complete Profile'] : [],
          next_actions: [],
          ai_recommendations: []
        } as CareerInsights
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Memoize processed data to prevent unnecessary re-renders
  const processedData = useMemo(() => {
    if (!careerData) return { metrics: null, insights: null, profile: null };
    
    return {
      metrics: careerData.metrics,
      insights: careerData.insights,
      profile: careerData.profile
    };
  }, [careerData]);

  return {
    ...processedData,
    isLoading,
    error
  };
}