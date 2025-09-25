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

      // Get all real data in parallel
      const [
        passportResponse, 
        profileResponse, 
        connectionsResponse,
        jobApplicationsResponse,
        postsResponse,
        achievementsResponse,
        txcBalanceResponse,
        loginTransactionsResponse
      ] = await Promise.all([
        supabase
          .from('career_passport')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('full_name, headline, location, profile_picture_url, skills')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('job_applications')
          .select('id, applied_at')
          .eq('user_id', user.id),
        supabase
          .from('posts')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('career_achievements')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('user_txc_balances')
          .select('total_earned')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('txc_transactions')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('activity_type', 'daily_login')
          .order('created_at', { ascending: false })
          .limit(30)
      ]);

      const passport = passportResponse.data;
      const profile = profileResponse.data;
      const connectionsCount = connectionsResponse.data?.length || 0;
      const jobApplicationsCount = jobApplicationsResponse.data?.length || 0;
      const postsCount = postsResponse.data?.length || 0;
      const achievementsCount = achievementsResponse.data?.length || 0;
      const totalTXCEarned = txcBalanceResponse.data?.total_earned || 0;

      // Calculate profile completion with skills
      let profileCompletion = 0;
      if (profile?.full_name) profileCompletion += 20;
      if (profile?.headline) profileCompletion += 20;
      if (profile?.location) profileCompletion += 20;
      if (profile?.profile_picture_url) profileCompletion += 20;
      if (profile?.skills && profile.skills.length > 0) profileCompletion += 20;

      // Calculate streaks from real data
      const calculateLoginStreak = (transactions: any[]) => {
        if (!transactions || transactions.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        for (let i = 0; i < 30; i++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const hasLoginForDate = transactions.some(t => 
            t.created_at.split('T')[0] === dateStr
          );
          
          if (hasLoginForDate) {
            streak++;
          } else if (i > 0) {
            break;
          }
          
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
      };

      const calculateApplicationStreak = (applications: any[]) => {
        if (!applications || applications.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        for (let i = 0; i < 30; i++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const hasApplicationForDate = applications.some(app => 
            app.applied_at && app.applied_at.split('T')[0] === dateStr
          );
          
          if (hasApplicationForDate) {
            streak++;
          } else if (i > 0) {
            break;
          }
          
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
      };

      return {
        passport,
        profile,
        metrics: {
          profileCompletion,
          jobApplications: jobApplicationsCount,
          connections: connectionsCount,
          skillsAdded: profile?.skills?.length || 0,
          coursesCompleted: passport?.tests_completed_count || 0,
          postsCreated: postsCount,
          achievementsEarned: achievementsCount,
          totalTXCEarned: totalTXCEarned,
          loginStreak: calculateLoginStreak(loginTransactionsResponse.data || []),
          applicationStreak: calculateApplicationStreak(jobApplicationsResponse.data || []),
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