import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  full_name: string;
  title: string | null;
  location: string | null;
  about: string | null;
  headline: string | null;
  profile_picture_url: string | null;
  cover_image_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  skills: string[] | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicCareerPassport {
  id: string;
  user_id: string;
  completion_percentage: number;
  career_readiness_score: number;
  market_competitiveness_score: number;
  resumes_count: number;
  jobs_applied_count: number;
  certifications_count: number;
  tests_completed_count: number;
  skills_verified_count: number;
  connections_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicAchievements {
  id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  verified: boolean;
  earned_at: string;
  is_public: boolean;
}

export function usePublicProfile(identifier?: string) {
  return useQuery({
    queryKey: ['public-profile', identifier],
    queryFn: async () => {
      if (!identifier) return null;
      
      // Check if identifier looks like a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(uuidRegex.test(identifier) ? 'id' : 'username', 
            uuidRegex.test(identifier) ? identifier : (identifier.startsWith('@') ? identifier.slice(1) : identifier))
        .maybeSingle();

      if (error) throw error;
      return data as PublicProfile;
    },
    enabled: !!identifier,
  });
}

export function usePublicCareerPassport(userId?: string) {
  return useQuery({
    queryKey: ['public-career-passport', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('career_passport')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as PublicCareerPassport;
    },
    enabled: !!userId,
  });
}

export function usePublicAchievements(userId?: string) {
  return useQuery({
    queryKey: ['public-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('career_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('earned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PublicAchievements[];
    },
    enabled: !!userId,
  });
}

export function usePublicProfileStats(userId?: string) {
  return useQuery({
    queryKey: ['public-profile-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get various stats for the public profile
      const [connectionsResult, postsResult, achievementsResult] = await Promise.allSettled([
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
          .eq('status', 'accepted'),
        
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
          
        supabase
          .from('career_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_public', true)
      ]);

      return {
        connections_count: connectionsResult.status === 'fulfilled' ? connectionsResult.value.count || 0 : 0,
        posts_count: postsResult.status === 'fulfilled' ? postsResult.value.count || 0 : 0,
        achievements_count: achievementsResult.status === 'fulfilled' ? achievementsResult.value.count || 0 : 0,
      };
    },
    enabled: !!userId,
  });
}